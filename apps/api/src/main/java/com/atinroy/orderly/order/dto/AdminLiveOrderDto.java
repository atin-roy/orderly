package com.atinroy.orderly.order.dto;

import com.atinroy.orderly.order.model.OrderStatus;

public record AdminLiveOrderDto(
        Long id,
        String restaurantName,
        String customerName,
        Integer total,
        OrderStatus status,
        String estimatedArrival,
        DeliveryPartnerSummaryDto deliveryPartner
) {
}
