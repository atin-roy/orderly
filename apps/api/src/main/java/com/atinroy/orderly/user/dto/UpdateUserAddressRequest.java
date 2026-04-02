package com.atinroy.orderly.user.dto;

import jakarta.validation.constraints.NotBlank;

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

        Double latitude,

        Double longitude,

        boolean isDefault
) {}
