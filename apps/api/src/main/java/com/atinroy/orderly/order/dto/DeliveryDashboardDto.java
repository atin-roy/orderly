package com.atinroy.orderly.order.dto;

import java.util.List;

public record DeliveryDashboardDto(
        DeliveryPartnerSummaryDto partner,
        List<DeliveryTaskDto> activeOrders,
        List<DeliveryTaskDto> recentOrders
) {
}
