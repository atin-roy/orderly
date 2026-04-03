package com.atinroy.orderly.order.service;

import com.atinroy.orderly.cart.model.Cart;
import com.atinroy.orderly.cart.model.CartItem;
import com.atinroy.orderly.cart.service.CartService;
import com.atinroy.orderly.common.dto.PaginatedResponse;
import com.atinroy.orderly.common.util.PricingUtils;
import com.atinroy.orderly.coupon.service.CouponService;
import com.atinroy.orderly.order.dto.*;
import com.atinroy.orderly.order.mapper.OrderMapper;
import com.atinroy.orderly.order.model.Order;
import com.atinroy.orderly.order.model.OrderItem;
import com.atinroy.orderly.order.model.OrderStatus;
import com.atinroy.orderly.order.model.OrderTimeline;
import com.atinroy.orderly.order.repository.OrderRepository;
import com.atinroy.orderly.order.repository.OrderTimelineRepository;
import com.atinroy.orderly.restaurant.repository.RestaurantRepository;
import com.atinroy.orderly.user.model.Role;
import com.atinroy.orderly.user.model.User;
import com.atinroy.orderly.user.model.UserAddress;
import com.atinroy.orderly.user.repository.DeliveryPartnerProfileRepository;
import com.atinroy.orderly.user.repository.UserAddressRepository;
import com.atinroy.orderly.user.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderService {
    private final OrderRepository orderRepository;
    private final OrderTimelineRepository orderTimelineRepository;
    private final UserRepository userRepository;
    private final UserAddressRepository userAddressRepository;
    private final DeliveryPartnerProfileRepository deliveryPartnerProfileRepository;
    private final RestaurantRepository restaurantRepository;
    private final CartService cartService;
    private final CouponService couponService;
    private final OrderSimulationService orderSimulationService;

    @Transactional
    public OrderDto placeOrder(PlaceOrderRequest request, String email) {
        User user = getUser(email);
        Cart cart = cartService.createOrGetCartForUser(email);
        if (cart.getRestaurant() == null || cart.getItems().isEmpty()) {
            throw new IllegalArgumentException("Cart is empty");
        }

        UserAddress address = userAddressRepository.findById(request.addressId())
                .orElseThrow(() -> new EntityNotFoundException("Address not found"));
        if (!address.getUser().getId().equals(user.getId())) {
            throw new EntityNotFoundException("Address not found");
        }

        int subtotal = cart.getItems().stream()
                .mapToInt(item -> item.getMenuItem().getPrice() * item.getQuantity())
                .sum();
        int deliveryFee = cart.getRestaurant().getDeliveryFee();
        int taxes = PricingUtils.calculateTaxes(subtotal);
        int discount = request.couponCode() == null || request.couponCode().isBlank()
                ? 0
                : couponService.validateCouponForSubtotal(request.couponCode(), subtotal);

        Order order = new Order();
        order.setUser(user);
        order.setRestaurant(cart.getRestaurant());
        order.setStatus(OrderStatus.PLACED);
        order.setDeliveryAddress(composeAddress(address));
        order.setDeliveryCity(address.getCity() == null ? "" : address.getCity());
        order.setDeliveryPhone(address.getPhone());
        order.setDeliveryLatitude(address.getLatitude());
        order.setDeliveryLongitude(address.getLongitude());
        order.setPaymentMethod(request.paymentMethod());
        order.setPaymentProvider(blankToDefault(request.paymentProvider(), "OFFLINE"));
        order.setPaymentStatus(blankToDefault(request.paymentStatus(), "PENDING"));
        order.setGatewayOrderId(blankToNull(request.gatewayOrderId()));
        order.setGatewayPaymentId(blankToNull(request.gatewayPaymentId()));
        order.setSubtotal(subtotal);
        order.setDeliveryFee(deliveryFee);
        order.setPlatformFee(PricingUtils.PLATFORM_FEE);
        order.setTaxes(taxes);
        order.setDiscount(discount);
        order.setCouponCode(blankToNull(request.couponCode()));
        order.setTotalAmount(PricingUtils.calculateTotal(subtotal, deliveryFee, taxes, discount));
        order.setEstimatedDeliveryMinutes(cart.getRestaurant().getDeliveryTimeMinutes());

        for (CartItem cartItem : cart.getItems()) {
            OrderItem item = new OrderItem();
            item.setOrder(order);
            item.setMenuItemName(cartItem.getMenuItem().getName());
            item.setMenuItemPrice(cartItem.getMenuItem().getPrice());
            item.setQuantity(cartItem.getQuantity());
            order.getItems().add(item);
        }

        OrderTimeline timeline = new OrderTimeline();
        timeline.setOrder(order);
        timeline.setLabel(OrderMapper.statusLabel(OrderStatus.PLACED));
        timeline.setTimestamp(LocalDateTime.now());
        order.getTimeline().add(timeline);

        orderSimulationService.assignDeliveryPartner(order);

        Order savedOrder = orderRepository.save(order);
        cartService.clearCart(cart);
        return toOrderDto(savedOrder);
    }

    @Transactional
    public OrdersPageDto getOrders(String email, int page, int size) {
        User user = getUser(email);
        var pageable = PageRequest.of(Math.max(page, 0), Math.max(size, 1), Sort.by("createdDate").descending());
        List<Order> activeOrders = orderRepository.findByUserIdAndStatusInOrderByCreatedDateDesc(
                user.getId(),
                orderSimulationService.activeStatuses()
        );
        orderSimulationService.progressOrders(activeOrders);

        var history = orderRepository.findByUserIdAndStatusInOrderByCreatedDateDesc(
                        user.getId(),
                        orderSimulationService.historyStatuses(),
                        pageable
                )
                .map(order -> {
                    Long partnerId = order.getAssignedDeliveryPartner() == null
                            ? null
                            : order.getAssignedDeliveryPartner().getId();
                    return OrderMapper.toSummaryDto(
                            order,
                            partnerId == null ? null : deliveryPartnerMap(List.of(order)).get(partnerId),
                            orderSimulationService.now()
                    );
                });

        return new OrdersPageDto(
                PaginatedResponse.from(history),
                activeOrders.stream().map(this::toOrderDto).toList()
        );
    }

    @Transactional
    public OrderDto getOrder(Long orderId, String email) {
        User user = getUser(email);
        Order order = orderRepository.findByIdAndUserId(orderId, user.getId())
                .orElseThrow(() -> new EntityNotFoundException("Order not found"));
        orderSimulationService.progressOrders(List.of(order));
        return toOrderDto(order);
    }

    @Transactional
    public OrderDto updateOrderStatus(Long orderId, UpdateOrderStatusRequest request, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));
        if (!(user.getRole() == Role.BUSINESS || user.getRole() == Role.ADMIN)) {
            throw new AccessDeniedException("You are not allowed to update orders");
        }

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new EntityNotFoundException("Order not found"));

        if (user.getRole() == Role.BUSINESS && !order.getRestaurant().getOwner().getId().equals(user.getId())) {
            throw new AccessDeniedException("You are not allowed to update this order");
        }

        order.setStatus(request.status());
        OrderTimeline timeline = new OrderTimeline();
        timeline.setOrder(order);
        timeline.setLabel(OrderMapper.statusLabel(request.status()));
        timeline.setTimestamp(LocalDateTime.now());
        order.getTimeline().add(timeline);

        Order savedOrder = orderRepository.save(order);
        orderTimelineRepository.save(timeline);
        return toOrderDto(savedOrder);
    }

    @Transactional
    public DeliveryDashboardDto getDeliveryDashboard(String email) {
        User partner = getUserByRole(email, Role.DELIVERY_PARTNER);
        List<Order> activeOrders = orderRepository.findByAssignedDeliveryPartnerIdAndStatusInOrderByCreatedDateDesc(
                partner.getId(),
                orderSimulationService.activeStatuses()
        );
        orderSimulationService.progressOrders(activeOrders);
        List<Order> recentOrders = orderRepository.findTop12ByAssignedDeliveryPartnerIdAndStatusInOrderByCreatedDateDesc(
                partner.getId(),
                orderSimulationService.historyStatuses()
        );
        DeliveryPartnerSummaryDto partnerSummary = toDeliveryPartnerSummary(
                deliveryPartnerProfileRepository.findByUserId(partner.getId())
        );

        return new DeliveryDashboardDto(
                partnerSummary,
                activeOrders.stream().map(this::toDeliveryTaskDto).toList(),
                recentOrders.stream().map(this::toDeliveryTaskDto).toList()
        );
    }

    @Transactional
    public OwnerDashboardDto getOwnerDashboard(String email) {
        User owner = getUserByRole(email, Role.BUSINESS);
        List<Order> activeOrders = orderRepository.findByRestaurantOwnerIdAndStatusIn(
                owner.getId(),
                orderSimulationService.activeStatuses()
        );
        orderSimulationService.progressOrders(activeOrders);

        return new OwnerDashboardDto(
                activeOrders.size(),
                activeOrders.stream().map(this::toOwnerLiveOrderDto).toList()
        );
    }

    @Transactional
    public AdminDashboardDto getAdminDashboard(String email) {
        getUserByRole(email, Role.ADMIN);
        List<Order> liveOrders = orderRepository.findByStatusInOrderByCreatedDateDesc(orderSimulationService.activeStatuses());
        orderSimulationService.progressOrders(liveOrders);

        int activeRiders = (int) liveOrders.stream()
                .map(Order::getAssignedDeliveryPartner)
                .filter(java.util.Objects::nonNull)
                .map(User::getId)
                .distinct()
                .count();
        int deliveredToday = (int) orderRepository.findByStatusInOrderByCreatedDateDesc(List.of(OrderStatus.DELIVERED)).stream()
                .filter(order -> order.getCreatedDate().toLocalDate().isEqual(orderSimulationService.today()))
                .count();
        int cancelledToday = (int) orderRepository.findByStatusInOrderByCreatedDateDesc(List.of(OrderStatus.CANCELLED)).stream()
                .filter(order -> order.getCreatedDate().toLocalDate().isEqual(orderSimulationService.today()))
                .count();

        return new AdminDashboardDto(
                liveOrders.size(),
                activeRiders,
                deliveredToday,
                cancelledToday,
                (int) restaurantRepository.count(),
                (int) deliveryPartnerProfileRepository.count(),
                liveOrders.stream().limit(12).map(this::toAdminLiveOrderDto).toList()
        );
    }

    private User getUser(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));
        if (user.getRole() != Role.USER) {
            throw new AccessDeniedException("Only customers can perform this action");
        }
        return user;
    }

    private User getUserByRole(String email, Role role) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));
        if (user.getRole() != role) {
            throw new AccessDeniedException("You are not allowed to perform this action");
        }
        return user;
    }

    private String composeAddress(UserAddress address) {
        StringBuilder builder = new StringBuilder(address.getAddress());
        if (address.getBuildingInfo() != null && !address.getBuildingInfo().isBlank()) {
            builder.append(", ").append(address.getBuildingInfo());
        }
        if (address.getCity() != null && !address.getCity().isBlank()) {
            builder.append(", ").append(address.getCity());
        }
        return builder.toString();
    }

    private String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }

    private String blankToDefault(String value, String fallback) {
        String normalized = blankToNull(value);
        return normalized == null ? fallback : normalized;
    }

    private OrderDto toOrderDto(Order order) {
        LocalDateTime now = orderSimulationService.now();
        Long partnerId = order.getAssignedDeliveryPartner() == null
                ? null
                : order.getAssignedDeliveryPartner().getId();
        DeliveryPartnerSummaryDto deliveryPartner = partnerId == null
                ? null
                : deliveryPartnerMap(List.of(order)).get(partnerId);
        return OrderMapper.toDto(order, deliveryPartner, now);
    }

    private DeliveryTaskDto toDeliveryTaskDto(Order order) {
        return new DeliveryTaskDto(
                order.getId(),
                order.getRestaurant().getName(),
                order.getRestaurant().getCuisineType(),
                order.getUser().getName() == null ? "Demo customer" : order.getUser().getName(),
                order.getDeliveryPhone(),
                order.getDeliveryAddress(),
                order.getDeliveryCity(),
                order.getTotalAmount(),
                order.getStatus(),
                OrderMapper.toDto(order, null, orderSimulationService.now()).estimatedArrival(),
                OrderMapper.toDto(order, null, orderSimulationService.now()).timeLabel(),
                order.getRestaurant().getImageColor()
        );
    }

    private OwnerLiveOrderDto toOwnerLiveOrderDto(Order order) {
        OrderDto dto = toOrderDto(order);
        return new OwnerLiveOrderDto(
                order.getId(),
                order.getRestaurant().getName(),
                order.getUser().getName() == null ? "Demo customer" : order.getUser().getName(),
                order.getDeliveryPhone(),
                order.getTotalAmount(),
                order.getStatus(),
                dto.estimatedArrival(),
                dto.timeLabel(),
                dto.deliveryPartner()
        );
    }

    private AdminLiveOrderDto toAdminLiveOrderDto(Order order) {
        OrderDto dto = toOrderDto(order);
        return new AdminLiveOrderDto(
                order.getId(),
                order.getRestaurant().getName(),
                order.getUser().getName() == null ? "Demo customer" : order.getUser().getName(),
                order.getTotalAmount(),
                order.getStatus(),
                dto.estimatedArrival(),
                dto.deliveryPartner()
        );
    }

    private Map<Long, DeliveryPartnerSummaryDto> deliveryPartnerMap(List<Order> orders) {
        Set<Long> userIds = orders.stream()
                .map(Order::getAssignedDeliveryPartner)
                .filter(java.util.Objects::nonNull)
                .map(User::getId)
                .collect(Collectors.toSet());
        if (userIds.isEmpty()) {
            return Map.of();
        }

        return deliveryPartnerProfileRepository.findByUserIdIn(userIds).stream()
                .collect(Collectors.toMap(
                        profile -> profile.getUser().getId(),
                        this::toDeliveryPartnerSummary
                ));
    }

    private DeliveryPartnerSummaryDto toDeliveryPartnerSummary(
            com.atinroy.orderly.user.model.DeliveryPartnerProfile profile
    ) {
        if (profile == null) {
            return null;
        }

        return new DeliveryPartnerSummaryDto(
                profile.getUser().getId(),
                profile.getUser().getName(),
                profile.getUser().getPhone(),
                profile.getVehicleType(),
                profile.getPreferredShift(),
                profile.getServiceZones(),
                profile.getAvatarUrl()
        );
    }
}
