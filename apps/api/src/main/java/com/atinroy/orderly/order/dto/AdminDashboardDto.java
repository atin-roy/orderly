package com.atinroy.orderly.order.dto;

import com.atinroy.orderly.common.dto.PaginatedResponse;

public record AdminDashboardDto(
        int activeOrders,
        int activeRiders,
        int deliveredToday,
        int cancelledToday,
        int totalRestaurants,
        int totalDeliveryPartners,
        PaginatedResponse<AdminLiveOrderDto> liveOrders
) {
}
