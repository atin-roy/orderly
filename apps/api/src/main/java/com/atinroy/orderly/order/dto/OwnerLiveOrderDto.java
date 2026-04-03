package com.atinroy.orderly.order.dto;

import com.atinroy.orderly.order.model.OrderStatus;

public record OwnerLiveOrderDto(
        Long id,
        String restaurantName,
        String customerName,
        String customerPhone,
        Integer total,
        OrderStatus status,
        String estimatedArrival,
        String timeLabel,
        DeliveryPartnerSummaryDto deliveryPartner
) {
}
