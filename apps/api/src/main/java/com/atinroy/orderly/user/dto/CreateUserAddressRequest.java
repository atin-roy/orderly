package com.atinroy.orderly.user.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

/**
 * Request DTO for creating a new user address.
 * Validation mirrors the constraints on the UserAddress entity.
 */
public record CreateUserAddressRequest(
        @NotBlank(message = "Label is required")
        String label,

        @NotBlank(message = "Address is required")
        String address,

        String buildingInfo,

        String city,

        @NotBlank(message = "Phone is required")
        String phone,

        @NotNull(message = "Latitude is required")
        Double latitude,

        @NotNull(message = "Longitude is required")
        Double longitude,

        boolean isDefault
) {}
