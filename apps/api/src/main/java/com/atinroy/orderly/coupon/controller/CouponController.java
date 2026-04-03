package com.atinroy.orderly.coupon.controller;

import com.atinroy.orderly.common.dto.ApiResponse;
import com.atinroy.orderly.coupon.dto.CouponDto;
import com.atinroy.orderly.coupon.dto.CouponValidationDto;
import com.atinroy.orderly.coupon.dto.ValidateCouponRequest;
import com.atinroy.orderly.coupon.service.CouponService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/coupons")
@RequiredArgsConstructor
public class CouponController {
    private final CouponService couponService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<CouponDto>>> getCoupons(
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                "Coupons fetched successfully",
                couponService.getCoupons(userDetails.getUsername())
        ));
    }

    @PostMapping("/validate")
    public ResponseEntity<ApiResponse<CouponValidationDto>> validateCoupon(
            @Valid @RequestBody ValidateCouponRequest request,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                "Coupon validation completed",
                couponService.validateCoupon(request.code(), userDetails.getUsername())
        ));
    }
}
