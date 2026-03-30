package com.atinroy.orderly.auth.dto;

public record AuthResponse(
        String token,
        String email,
        String role
) {}
