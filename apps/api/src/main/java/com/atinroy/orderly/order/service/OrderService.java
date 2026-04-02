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
import com.atinroy.orderly.user.model.Role;
import com.atinroy.orderly.user.model.User;
import com.atinroy.orderly.user.model.UserAddress;
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

@Service
@RequiredArgsConstructor
public class OrderService {
    private static final List<OrderStatus> ACTIVE_STATUSES = List.of(
            OrderStatus.PLACED,
            OrderStatus.ACCEPTED,
            OrderStatus.PREPARING,
            OrderStatus.READY,
            OrderStatus.PICKED_UP
    );
    private static final List<OrderStatus> HISTORY_STATUSES = List.of(
            OrderStatus.DELIVERED,
            OrderStatus.CANCELLED
    );

    private final OrderRepository orderRepository;
    private final OrderTimelineRepository orderTimelineRepository;
    private final UserRepository userRepository;
    private final UserAddressRepository userAddressRepository;
    private final CartService cartService;
    private final CouponService couponService;

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

        Order savedOrder = orderRepository.save(order);
        cartService.clearCart(cart);
        return OrderMapper.toDto(savedOrder);
    }

    @Transactional(readOnly = true)
    public OrdersPageDto getOrders(String email, int page, int size) {
        User user = getUser(email);
        var pageable = PageRequest.of(Math.max(page, 0), Math.max(size, 1), Sort.by("createdDate").descending());
        var history = orderRepository.findByUserIdAndStatusInOrderByCreatedDateDesc(user.getId(), HISTORY_STATUSES, pageable)
                .map(OrderMapper::toSummaryDto);
        OrderDto activeOrder = orderRepository.findFirstByUserIdAndStatusInOrderByCreatedDateDesc(user.getId(), ACTIVE_STATUSES)
                .map(OrderMapper::toDto)
                .orElse(null);

        return new OrdersPageDto(PaginatedResponse.from(history), activeOrder);
    }

    @Transactional(readOnly = true)
    public OrderDto getOrder(Long orderId, String email) {
        User user = getUser(email);
        Order order = orderRepository.findByIdAndUserId(orderId, user.getId())
                .orElseThrow(() -> new EntityNotFoundException("Order not found"));
        return OrderMapper.toDto(order);
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
        return OrderMapper.toDto(savedOrder);
    }

    private User getUser(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));
        if (user.getRole() != Role.USER) {
            throw new AccessDeniedException("Only customers can perform this action");
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
}
