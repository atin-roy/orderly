package com.atinroy.orderly.user.dto;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Response DTO for the user profile.
 * Exposes only what clients need — never the raw entity.
 */
public record UserDto(
        Long id,
        String keycloakId,
        List<UserAddressDto> addresses,
        LocalDateTime createdDate
) {}
