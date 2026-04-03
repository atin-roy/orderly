package com.atinroy.orderly.restaurant.dto;

public record MenuItemDto(
        Long id,
        Long restaurantId,
        String name,
        String description,
        String imageUrl,
        Integer price,
        String category,
        Boolean isAvailable,
        Boolean isVeg,
        Integer sortOrder
) {
}
