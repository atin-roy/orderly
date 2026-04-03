package com.atinroy.orderly.coupon.dto;

public record AdminCouponDto(
        Long id,
        String code,
        String title,
        String description,
        Integer discountAmount,
        Integer minOrderAmount,
        boolean enabled
) {
}
