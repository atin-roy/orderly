package com.atinroy.orderly.restaurant.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record UpdateMenuItemRequest(
        @NotBlank(message = "Name is required")
        String name,

        String description,

        String imageUrl,

        @NotNull(message = "Price is required")
        @Min(value = 0, message = "Price cannot be negative")
        Integer price,

        @NotBlank(message = "Category is required")
        String category,

        @NotNull(message = "Availability is required")
        Boolean isAvailable,

        @NotNull(message = "Veg flag is required")
        Boolean isVeg,

        @NotNull(message = "Sort order is required")
        Integer sortOrder
) {
}
