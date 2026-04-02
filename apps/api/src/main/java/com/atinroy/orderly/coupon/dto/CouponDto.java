package com.atinroy.orderly.coupon.dto;

public record CouponDto(
        String id,
        String code,
        String title,
        String description,
        Integer discountAmount,
        Integer minOrderAmount,
        boolean available
) {
}
