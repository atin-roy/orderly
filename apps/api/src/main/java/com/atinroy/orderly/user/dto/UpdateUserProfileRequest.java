package com.atinroy.orderly.user.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record UpdateUserProfileRequest(
        String name,

        @NotBlank(message = "Phone number is required")
        @Pattern(regexp = "^\\+?[0-9.]{3,20}$", message = "Invalid phone format")
        String phone
) {}
