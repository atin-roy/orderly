package com.atinroy.orderly.coupon.dto;

import jakarta.validation.constraints.NotNull;

public record UpdateCouponStatusRequest(
        @NotNull(message = "Coupon status is required")
        Boolean enabled
) {
}
