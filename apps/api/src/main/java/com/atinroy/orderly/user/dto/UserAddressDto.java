package com.atinroy.orderly.user.dto;

/**
 * Response DTO for a user address.
 * Strips the back-reference to User to avoid circular serialisation.
 */
public record UserAddressDto(
        Long id,
        String label,
        String address,
        String buildingInfo,
        String city,
        String phone,
        Double latitude,
        Double longitude,
        boolean isDefault
) {}
