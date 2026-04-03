package com.atinroy.orderly.order.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record PlaceOrderRequest(
        @NotNull(message = "Address is required")
        Long addressId,

        @NotBlank(message = "Payment method is required")
        String paymentMethod,

        String paymentProvider,

        String paymentStatus,

        String gatewayOrderId,

        String gatewayPaymentId,

        String couponCode
) {
}
