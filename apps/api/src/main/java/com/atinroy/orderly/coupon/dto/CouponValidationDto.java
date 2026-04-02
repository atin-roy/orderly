package com.atinroy.orderly.coupon.dto;

public record CouponValidationDto(
        boolean valid,
        String code,
        String title,
        String message,
        Integer discountAmount,
        Integer minOrderAmount
) {
}
