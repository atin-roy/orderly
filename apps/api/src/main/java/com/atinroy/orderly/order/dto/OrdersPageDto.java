package com.atinroy.orderly.order.dto;

import com.atinroy.orderly.common.dto.PaginatedResponse;

public record OrdersPageDto(
        PaginatedResponse<OrderSummaryDto> orders,
        OrderDto activeOrder
) {
}
