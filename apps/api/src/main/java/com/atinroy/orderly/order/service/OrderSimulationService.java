package com.atinroy.orderly.order.service;

import com.atinroy.orderly.order.mapper.OrderMapper;
import com.atinroy.orderly.order.model.Order;
import com.atinroy.orderly.order.model.OrderStatus;
import com.atinroy.orderly.order.model.OrderTimeline;
import com.atinroy.orderly.order.repository.OrderRepository;
import com.atinroy.orderly.user.model.DeliveryPartnerProfile;
import com.atinroy.orderly.user.model.Role;
import com.atinroy.orderly.user.repository.DeliveryPartnerProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Clock;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Collection;
import java.util.List;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class OrderSimulationService {
    private static final List<OrderStatus> ACTIVE_STATUSES = List.of(
            OrderStatus.PLACED,
            OrderStatus.ACCEPTED,
            OrderStatus.PREPARING,
            OrderStatus.READY,
            OrderStatus.PICKED_UP
    );
    private static final List<OrderStatus> HISTORY_STATUSES = List.of(OrderStatus.DELIVERED, OrderStatus.CANCELLED);

    private final OrderRepository orderRepository;
    private final DeliveryPartnerProfileRepository deliveryPartnerProfileRepository;
    private final Clock clock;

    @Transactional
    public void assignDeliveryPartner(Order order) {
        if (order.getAssignedDeliveryPartner() != null) {
            return;
        }

        List<DeliveryPartnerProfile> allPartners = deliveryPartnerProfileRepository.findAllByOrderByIdAsc();
        List<DeliveryPartnerProfile> eligiblePartners = allPartners.stream()
                .filter(profile -> profile.getUser().getRole() == Role.DELIVERY_PARTNER)
                .filter(profile -> partnerMatches(profile, order))
                .toList();
        List<DeliveryPartnerProfile> partners = eligiblePartners.isEmpty() ? allPartners : eligiblePartners;
        if (partners.isEmpty()) {
            return;
        }

        int index = Math.floorMod((int) (orderRepository.count() + order.getRestaurant().getId()), partners.size());
        DeliveryPartnerProfile partner = partners.get(index);
        order.setAssignedDeliveryPartner(partner.getUser());

        LocalDateTime assignedAt = order.getCreatedDate() == null
                ? LocalDateTime.now(clock).plusMinutes(1)
                : order.getCreatedDate().plusMinutes(1);
        appendTimeline(order, "Rider assigned: " + partner.getUser().getName(), assignedAt);
    }

    @Transactional
    public void progressOrders(Collection<Order> orders) {
        if (orders.isEmpty()) {
            return;
        }

        LocalDateTime now = LocalDateTime.now(clock);
        for (Order order : orders) {
            progressOrder(order, now);
        }
    }

    public LocalDateTime now() {
        return LocalDateTime.now(clock);
    }

    public LocalDate today() {
        return LocalDate.now(clock);
    }

    public ZoneId zoneId() {
        return clock.getZone();
    }

    public List<OrderStatus> activeStatuses() {
        return ACTIVE_STATUSES;
    }

    public List<OrderStatus> historyStatuses() {
        return HISTORY_STATUSES;
    }

    private void progressOrder(Order order, LocalDateTime now) {
        if (order.getStatus() == OrderStatus.CANCELLED || order.getStatus() == OrderStatus.DELIVERED) {
            return;
        }

        List<OrderStatus> schedule = buildSchedule(order);
        OrderStatus targetStatus = order.getStatus();
        for (OrderStatus status : schedule) {
            if (!milestoneTime(order, status).isAfter(now)) {
                targetStatus = status;
            }
        }

        if (targetStatus == order.getStatus()) {
            return;
        }

        int currentIndex = schedule.indexOf(order.getStatus());
        int targetIndex = schedule.indexOf(targetStatus);
        for (int i = Math.max(currentIndex + 1, 0); i <= targetIndex; i += 1) {
            OrderStatus nextStatus = schedule.get(i);
            appendTimeline(order, OrderMapper.statusLabel(nextStatus), milestoneTime(order, nextStatus));
            order.setStatus(nextStatus);
        }
    }

    private List<OrderStatus> buildSchedule(Order order) {
        return List.of(
                OrderStatus.PLACED,
                OrderStatus.ACCEPTED,
                OrderStatus.PREPARING,
                OrderStatus.READY,
                OrderStatus.PICKED_UP,
                OrderStatus.DELIVERED
        );
    }

    private LocalDateTime milestoneTime(Order order, OrderStatus status) {
        LocalDateTime created = order.getCreatedDate() == null ? LocalDateTime.now(clock) : order.getCreatedDate();
        int eta = Math.max(order.getEstimatedDeliveryMinutes(), 18);

        return switch (status) {
            case PLACED -> created;
            case ACCEPTED -> created.plusMinutes(Math.min(2, eta));
            case PREPARING -> created.plusMinutes(Math.max(6, Math.round(eta * 0.25f)));
            case READY -> created.plusMinutes(Math.max(12, Math.round(eta * 0.55f)));
            case PICKED_UP -> created.plusMinutes(Math.max(16, Math.round(eta * 0.75f)));
            case DELIVERED -> created.plusMinutes(eta);
            case CANCELLED -> created.plusMinutes(4);
        };
    }

    private boolean partnerMatches(DeliveryPartnerProfile profile, Order order) {
        String restaurantLocality = normalize(order.getRestaurant().getLocality());
        String restaurantCity = normalize(order.getRestaurant().getCity());
        String serviceZones = normalize(profile.getServiceZones());
        String city = normalize(profile.getCity());

        return (restaurantLocality != null && serviceZones != null && serviceZones.contains(restaurantLocality))
                || (restaurantCity != null && city != null && city.equals(restaurantCity))
                || (restaurantCity != null && serviceZones != null && serviceZones.contains(restaurantCity));
    }

    private void appendTimeline(Order order, String label, LocalDateTime timestamp) {
        boolean alreadyExists = order.getTimeline().stream()
                .anyMatch(entry -> entry.getLabel().equals(label));
        if (alreadyExists) {
            return;
        }

        OrderTimeline timeline = new OrderTimeline();
        timeline.setOrder(order);
        timeline.setLabel(label);
        timeline.setTimestamp(timestamp);
        order.getTimeline().add(timeline);
    }

    private String normalize(String value) {
        if (value == null) {
            return null;
        }

        String normalized = value.trim().toLowerCase(Locale.ROOT);
        return normalized.isEmpty() ? null : normalized;
    }
}
