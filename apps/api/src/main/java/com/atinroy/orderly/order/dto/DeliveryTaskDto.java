package com.atinroy.orderly.order.dto;

import com.atinroy.orderly.order.model.OrderStatus;

public record DeliveryTaskDto(
        Long id,
        String restaurantName,
        String restaurantCuisine,
        String customerName,
        String customerPhone,
        String deliveryAddress,
        String deliveryCity,
        Integer total,
        OrderStatus status,
        String estimatedArrival,
        String timeLabel,
        String imageColor
) {
}
