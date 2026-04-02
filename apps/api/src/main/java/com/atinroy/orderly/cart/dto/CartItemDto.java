package com.atinroy.orderly.cart.dto;

public record CartItemDto(
        Long id,
        Long menuItemId,
        String menuItemName,
        Integer price,
        Integer quantity,
        String note,
        Integer lineTotal
) {
}
