package com.atinroy.orderly.order.dto;

import com.atinroy.orderly.order.model.OrderStatus;

public record OrderSummaryDto(
        Long id,
        String restaurantName,
        String restaurantCuisine,
        OrderStatus status,
        Integer total,
        Integer itemCount,
        String timeLabel,
        String paymentMethod,
        String imageColor,
        String estimatedArrival,
        String deliveredAt
) {
}
