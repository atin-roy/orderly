package com.atinroy.orderly.cart.dto;

public record CartChargesDto(
        Integer subtotal,
        Integer deliveryFee,
        Integer platformFee,
        Integer taxes,
        Integer discount,
        Integer total
) {
}
