package com.atinroy.orderly.order.dto;

public record OrderItemDto(
        String name,
        Integer quantity,
        Integer price,
        Integer lineTotal
) {
}
