package com.atinroy.orderly.user.dto;

import jakarta.validation.constraints.NotBlank;

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

        Double latitude,

        Double longitude,

        boolean isDefault
) {}
