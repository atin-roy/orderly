package com.atinroy.orderly.order.dto;

import com.atinroy.orderly.order.model.OrderStatus;

import java.time.LocalDateTime;
import java.util.List;

public record OrderDto(
        Long id,
        Long restaurantId,
        String restaurantName,
        String restaurantCuisine,
        String imageColor,
        OrderStatus status,
        String deliveryAddress,
        String deliveryCity,
        String deliveryPhone,
        Double deliveryLatitude,
        Double deliveryLongitude,
        String paymentMethod,
        String paymentProvider,
        String paymentStatus,
        String gatewayOrderId,
        String gatewayPaymentId,
        Integer subtotal,
        Integer deliveryFee,
        Integer platformFee,
        Integer taxes,
        Integer discount,
        String couponCode,
        Integer total,
        Integer estimatedDeliveryMinutes,
        Integer itemCount,
        String timeLabel,
        String estimatedArrival,
        String deliveredAt,
        LocalDateTime createdDate,
        List<OrderItemDto> items,
        List<OrderTimelineDto> timeline
) {
}
