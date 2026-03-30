package com.atinroy.orderly.user.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

/**
 * Request DTO for updating an existing user address.
 * All fields are required on update (full replacement, not patch).
 */
public record UpdateUserAddressRequest(
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
