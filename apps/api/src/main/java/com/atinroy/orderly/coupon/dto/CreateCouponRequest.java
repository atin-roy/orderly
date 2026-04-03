package com.atinroy.orderly.coupon.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record CreateCouponRequest(
        @NotBlank(message = "Coupon code is required")
        String code,
        @NotBlank(message = "Coupon title is required")
        String title,
        @NotBlank(message = "Coupon description is required")
        String description,
        @NotNull(message = "Discount amount is required")
        @Min(value = 1, message = "Discount amount must be at least 1")
        Integer discountAmount,
        @NotNull(message = "Minimum order amount is required")
        @Min(value = 0, message = "Minimum order amount cannot be negative")
        Integer minOrderAmount,
        Boolean enabled
) {
}
