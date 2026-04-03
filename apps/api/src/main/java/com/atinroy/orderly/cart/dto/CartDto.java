package com.atinroy.orderly.cart.dto;

import java.util.List;

public record CartDto(
        Long cartId,
        Long restaurantId,
        String restaurantName,
        String restaurantCuisine,
        Integer deliveryTimeMinutes,
        String imageColor,
        List<CartItemDto> items,
        CartChargesDto charges
) {
}
