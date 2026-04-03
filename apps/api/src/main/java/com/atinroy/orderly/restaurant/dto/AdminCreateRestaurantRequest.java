package com.atinroy.orderly.restaurant.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record AdminCreateRestaurantRequest(
        @NotBlank(message = "Owner name is required")
        String ownerName,

        @NotBlank(message = "Business name is required")
        String businessName,

        @NotBlank(message = "Email is required")
        @Email(message = "Email must be valid")
        String email,

        @NotBlank(message = "Password is required")
        @Size(min = 8, message = "Password must be at least 8 characters")
        String password,

        @NotBlank(message = "Phone is required")
        @Pattern(regexp = "^\\+?[0-9.]{3,20}$", message = "Invalid phone format")
        String phone,

        @NotBlank(message = "City is required")
        String city,

        @NotBlank(message = "Service area is required")
        String serviceArea,

        @NotBlank(message = "Business type is required")
        String businessType,

        @NotBlank(message = "Cuisine focus is required")
        String cuisineFocus,

        @NotBlank(message = "Restaurant name is required")
        String name,

        String description,

        @NotBlank(message = "Cuisine type is required")
        String cuisineType,

        @NotBlank(message = "Restaurant city is required")
        String restaurantCity,

        @NotBlank(message = "Locality is required")
        String locality,

        String imageUrl,

        @Min(value = 1, message = "Delivery time must be at least 1 minute")
        Integer deliveryTimeMinutes,

        @Min(value = 0, message = "Delivery fee cannot be negative")
        Integer deliveryFee,

        String imageColor
) {
}
