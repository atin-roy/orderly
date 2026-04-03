package com.atinroy.orderly.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record RegisterRequest(
        @NotBlank @Email
        String email,

        @NotBlank @Size(min = 8, message = "Password must be at least 8 characters")
        String password,

        @NotBlank(message = "Phone is required")
        @Pattern(regexp = "^\\+?[0-9.]{3,20}$", message = "Invalid phone format")
        String phone
) {}
