package com.atinroy.orderly.coupon.controller;

import com.atinroy.orderly.common.dto.ApiResponse;
import com.atinroy.orderly.common.dto.PaginatedResponse;
import com.atinroy.orderly.coupon.dto.AdminCouponDto;
import com.atinroy.orderly.coupon.dto.CouponDto;
import com.atinroy.orderly.coupon.dto.CreateCouponRequest;
import com.atinroy.orderly.coupon.dto.CouponValidationDto;
import com.atinroy.orderly.coupon.dto.UpdateCouponRequest;
import com.atinroy.orderly.coupon.dto.UpdateCouponStatusRequest;
import com.atinroy.orderly.coupon.dto.ValidateCouponRequest;
import com.atinroy.orderly.coupon.service.CouponService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
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

    @GetMapping("/admin")
    public ResponseEntity<ApiResponse<PaginatedResponse<AdminCouponDto>>> getAdminCoupons(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String query,
            @RequestParam(required = false) String status,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                "Admin coupons fetched successfully",
                couponService.getAdminCoupons(userDetails.getUsername(), page, size, query, status)
        ));
    }

    @PostMapping("/admin")
    public ResponseEntity<ApiResponse<AdminCouponDto>> createCoupon(
            @Valid @RequestBody CreateCouponRequest request,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(
                "Coupon created successfully",
                couponService.createCoupon(request, userDetails.getUsername())
        ));
    }

    @PutMapping("/admin/{couponId}")
    public ResponseEntity<ApiResponse<AdminCouponDto>> updateCoupon(
            @PathVariable Long couponId,
            @Valid @RequestBody UpdateCouponRequest request,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                "Coupon updated successfully",
                couponService.updateCoupon(couponId, request, userDetails.getUsername())
        ));
    }

    @PatchMapping("/admin/{couponId}/status")
    public ResponseEntity<ApiResponse<AdminCouponDto>> updateCouponStatus(
            @PathVariable Long couponId,
            @Valid @RequestBody UpdateCouponStatusRequest request,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                "Coupon status updated successfully",
                couponService.updateCouponStatus(couponId, request, userDetails.getUsername())
        ));
    }

    @DeleteMapping("/admin/{couponId}")
    public ResponseEntity<ApiResponse<Void>> deleteCoupon(
            @PathVariable Long couponId,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        couponService.deleteCoupon(couponId, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Coupon deleted successfully", null));
    }
}
