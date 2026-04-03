package com.atinroy.orderly.restaurant.dto;

public record AdminRestaurantSummaryDto(
        Long id,
        String name,
        String ownerName,
        String locality,
        String city,
        String cuisineType,
        boolean isActive,
        long activeOrders,
        long totalOrders
) {
}
