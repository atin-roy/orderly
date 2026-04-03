package com.atinroy.orderly.order.dto;

import java.util.List;

public record AdminDashboardDto(
        int activeOrders,
        int activeRiders,
        int deliveredToday,
        int cancelledToday,
        int totalRestaurants,
        int totalDeliveryPartners,
        List<AdminLiveOrderDto> liveOrders
) {
}
