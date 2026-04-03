package com.atinroy.orderly.coupon.service;

import com.atinroy.orderly.cart.service.CartService;
import com.atinroy.orderly.coupon.dto.CouponDto;
import com.atinroy.orderly.coupon.dto.CouponValidationDto;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class CouponService {
    private final CartService cartService;

    private static final List<CouponDto> COUPONS = List.of(
            new CouponDto(
                    "coupon-cravings150",
                    "CRAVINGS150",
                    "Flat 150 off",
                    "Valid on orders above 499 from select restaurants.",
                    150,
                    499,
                    true
            ),
            new CouponDto(
                    "coupon-feast120",
                    "FEAST120",
                    "Save 120 tonight",
                    "Works on comfort meals and family combinations above 699.",
                    120,
                    699,
                    true
            ),
            new CouponDto(
                    "coupon-dessert200",
                    "DESSERT200",
                    "Dessert run reward",
                    "Spend 999 to unlock 200 off on larger evening orders.",
                    200,
                    999,
                    false
            ),
            new CouponDto(
                    "coupon-latenight90",
                    "LATENIGHT90",
                    "Late night 90 off",
                    "Available after 11 PM on orders above 399.",
                    90,
                    399,
                    false
            )
    );

    @Transactional(readOnly = true)
    public List<CouponDto> getCoupons(String email) {
        int subtotal = cartService.getCartSubtotalForUser(email);
        return COUPONS.stream()
                .map(coupon -> new CouponDto(
                        coupon.id(),
                        coupon.code(),
                        coupon.title(),
                        coupon.description(),
                        coupon.discountAmount(),
                        coupon.minOrderAmount(),
                        coupon.available() && subtotal >= coupon.minOrderAmount()
                ))
                .toList();
    }

    @Transactional(readOnly = true)
    public CouponValidationDto validateCoupon(String code, String email) {
        int subtotal = cartService.getCartSubtotalForUser(email);
        CouponDto coupon = findCoupon(code);
        if (!coupon.available()) {
            return new CouponValidationDto(false, coupon.code(), coupon.title(), "Coupon is not currently available", 0, coupon.minOrderAmount());
        }
        if (subtotal < coupon.minOrderAmount()) {
            return new CouponValidationDto(false, coupon.code(), coupon.title(), "Minimum order amount not met", 0, coupon.minOrderAmount());
        }
        return new CouponValidationDto(true, coupon.code(), coupon.title(), "Coupon applied successfully", coupon.discountAmount(), coupon.minOrderAmount());
    }

    @Transactional(readOnly = true)
    public int validateCouponForSubtotal(String code, int subtotal) {
        CouponDto coupon = findCoupon(code);
        if (!coupon.available()) {
            throw new IllegalArgumentException("Coupon is not currently available");
        }
        if (subtotal < coupon.minOrderAmount()) {
            throw new IllegalArgumentException("Minimum order amount not met for this coupon");
        }
        return coupon.discountAmount();
    }

    private CouponDto findCoupon(String code) {
        String normalizedCode = code.trim().toUpperCase(Locale.ROOT);
        return COUPONS.stream()
                .filter(coupon -> coupon.code().equalsIgnoreCase(normalizedCode))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Coupon not found"));
    }
}
