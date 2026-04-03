package com.atinroy.orderly.order.dto;

import java.util.List;

public record OwnerDashboardDto(
        int activeOrders,
        List<OwnerLiveOrderDto> liveOrders
) {
}
