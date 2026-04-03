package com.atinroy.orderly.restaurant.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record UpdateRestaurantRequest(
        @NotBlank(message = "Name is required")
        String name,

        String description,

        @NotBlank(message = "Cuisine type is required")
        String cuisineType,

        @NotBlank(message = "City is required")
        String city,

        @NotBlank(message = "Locality is required")
        String locality,

        String imageUrl,

        @NotNull(message = "Delivery time is required")
        @Min(value = 1, message = "Delivery time must be at least 1 minute")
        Integer deliveryTimeMinutes,

        @NotNull(message = "Delivery fee is required")
        @Min(value = 0, message = "Delivery fee cannot be negative")
        Integer deliveryFee,

        Boolean isActive,

        String imageColor
) {
}
