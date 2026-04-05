package com.atinroy.orderly.order.mapper;

import com.atinroy.orderly.order.dto.OrderDto;
import com.atinroy.orderly.order.dto.OrderItemDto;
import com.atinroy.orderly.order.dto.OrderSummaryDto;
import com.atinroy.orderly.order.dto.OrderTimelineDto;
import com.atinroy.orderly.order.dto.DeliveryPartnerSummaryDto;
import com.atinroy.orderly.order.model.Order;
import com.atinroy.orderly.order.model.OrderItem;
import com.atinroy.orderly.order.model.OrderStatus;
import com.atinroy.orderly.order.model.OrderTimeline;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

public final class OrderMapper {
    private static final DateTimeFormatter TIME_FORMATTER = DateTimeFormatter.ofPattern("h:mm a");
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("dd MMM");

    private OrderMapper() {
    }

    public static OrderDto toDto(Order order, DeliveryPartnerSummaryDto deliveryPartner, LocalDateTime now) {
        List<OrderItemDto> items = order.getItems().stream()
                .map(OrderMapper::toItemDto)
                .toList();
        List<OrderTimelineDto> timeline = order.getTimeline().stream()
                .map(OrderMapper::toTimelineDto)
                .toList();

        return new OrderDto(
                order.getId(),
                order.getRestaurant().getId(),
                order.getRestaurant().getName(),
                order.getRestaurant().getCuisineType(),
                order.getRestaurant().getImageColor(),
                order.getStatus(),
                order.getDeliveryAddress(),
                order.getDeliveryCity(),
                order.getDeliveryPhone(),
                order.getDeliveryLatitude(),
                order.getDeliveryLongitude(),
                order.getPaymentMethod(),
                order.getPaymentProvider(),
                order.getPaymentStatus(),
                order.getGatewayOrderId(),
                order.getGatewayPaymentId(),
                order.getSubtotal(),
                order.getDeliveryFee(),
                order.getPlatformFee(),
                order.getTaxes(),
                order.getDiscount(),
                order.getCouponCode(),
                order.getTotalAmount(),
                order.getEstimatedDeliveryMinutes(),
                items.stream().mapToInt(OrderItemDto::quantity).sum(),
                buildTimeLabel(order, now),
                buildEstimatedArrival(order, now),
                buildDeliveredAt(order),
                deliveryPartner,
                order.getCreatedDate(),
                items,
                timeline
        );
    }

    public static OrderSummaryDto toSummaryDto(
            Order order,
            DeliveryPartnerSummaryDto deliveryPartner,
            LocalDateTime now
    ) {
        int itemCount = order.getItems().stream().mapToInt(OrderItem::getQuantity).sum();
        return new OrderSummaryDto(
                order.getId(),
                order.getRestaurant().getName(),
                order.getRestaurant().getCuisineType(),
                order.getStatus(),
                order.getTotalAmount(),
                itemCount,
                buildTimeLabel(order, now),
                order.getPaymentMethod(),
                order.getRestaurant().getImageColor(),
                buildEstimatedArrival(order, now),
                buildDeliveredAt(order),
                deliveryPartner
        );
    }

    public static OrderItemDto toItemDto(OrderItem item) {
        return new OrderItemDto(
                item.getMenuItemName(),
                item.getQuantity(),
                item.getMenuItemPrice(),
                item.getMenuItemPrice() * item.getQuantity()
        );
    }

    public static OrderTimelineDto toTimelineDto(OrderTimeline timeline) {
        return new OrderTimelineDto(
                timeline.getLabel(),
                timeline.getTimestamp(),
                timeline.getTimestamp().format(TIME_FORMATTER),
                true
        );
    }

    public static String statusLabel(OrderStatus status) {
        return switch (status) {
            case PLACED -> "Order placed";
            case ACCEPTED -> "Kitchen confirmed";
            case PREPARING -> "Prepared";
            case READY -> "Ready for pickup";
            case PICKED_UP -> "Picked up by rider";
            case DELIVERED -> "Delivered";
            case CANCELLED -> "Order cancelled";
        };
    }

    private static String buildTimeLabel(Order order, LocalDateTime now) {
        LocalDateTime createdDate = order.getCreatedDate();
        if (order.getStatus() == OrderStatus.DELIVERED) {
            return "Delivered on " + createdDate.format(DATE_FORMATTER);
        }
        if (order.getStatus() == OrderStatus.CANCELLED) {
            return "Cancelled on " + createdDate.format(DATE_FORMATTER);
        }
        if (createdDate.toLocalDate().isEqual(now.toLocalDate())) {
            return "Placed today at " + createdDate.format(TIME_FORMATTER);
        }
        return "Placed on " + createdDate.format(DATE_FORMATTER);
    }

    private static String buildEstimatedArrival(Order order, LocalDateTime now) {
        if (!(order.getStatus() == OrderStatus.PLACED
                || order.getStatus() == OrderStatus.ACCEPTED
                || order.getStatus() == OrderStatus.PREPARING
                || order.getStatus() == OrderStatus.READY
                || order.getStatus() == OrderStatus.PICKED_UP)) {
            return null;
        }

        LocalDateTime eta = order.getCreatedDate().plusMinutes(order.getEstimatedDeliveryMinutes());
        long remaining = Duration.between(now, eta).toMinutes();
        if (remaining <= 0) {
            return "Arriving shortly";
        }
        return "Arriving in " + remaining + " min";
    }

    private static String buildDeliveredAt(Order order) {
        if (order.getStatus() != OrderStatus.DELIVERED || order.getTimeline().isEmpty()) {
            return null;
        }
        LocalDateTime deliveredAt = order.getTimeline().get(order.getTimeline().size() - 1).getTimestamp();
        long duration = Duration.between(order.getCreatedDate(), deliveredAt).toMinutes();
        return "Delivered in " + duration + " min";
    }

}
