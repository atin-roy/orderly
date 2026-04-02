package com.atinroy.orderly.common.util;

public final class PricingUtils {
    public static final int PLATFORM_FEE = 12;

    private PricingUtils() {
    }

    public static int calculateTaxes(int subtotal) {
        return (int) Math.round(subtotal * 0.10d);
    }

    public static int calculateTotal(int subtotal, int deliveryFee, int taxes, int discount) {
        return subtotal + deliveryFee + PLATFORM_FEE + taxes - discount;
    }
}
