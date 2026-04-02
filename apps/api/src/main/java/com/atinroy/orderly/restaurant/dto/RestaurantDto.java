package com.atinroy.orderly.restaurant.dto;

public record RestaurantDto(
        Long id,
        Long ownerId,
        String ownerName,
        String name,
        String slug,
        String description,
        String cuisineType,
        String city,
        String locality,
        String imageUrl,
        Double rating,
        Integer deliveryTimeMinutes,
        Integer deliveryFee,
        String priceLevel,
        Boolean isApproved,
        Boolean isActive,
        String imageColor
) {
}
