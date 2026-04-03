package com.atinroy.orderly.coupon.service;

import com.atinroy.orderly.cart.service.CartService;
import com.atinroy.orderly.common.dto.PaginatedResponse;
import com.atinroy.orderly.coupon.dto.AdminCouponDto;
import com.atinroy.orderly.coupon.dto.CouponDto;
import com.atinroy.orderly.coupon.dto.CreateCouponRequest;
import com.atinroy.orderly.coupon.dto.CouponValidationDto;
import com.atinroy.orderly.coupon.dto.UpdateCouponRequest;
import com.atinroy.orderly.coupon.dto.UpdateCouponStatusRequest;
import com.atinroy.orderly.coupon.model.Coupon;
import com.atinroy.orderly.coupon.repository.CouponRepository;
import com.atinroy.orderly.user.model.Role;
import com.atinroy.orderly.user.model.User;
import com.atinroy.orderly.user.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class CouponService {
    private final CartService cartService;
    private final CouponRepository couponRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<CouponDto> getCoupons(String email) {
        int subtotal = cartService.getCartSubtotalForUser(email);
        return couponRepository.findAll(Sort.by(Sort.Order.desc("enabled"), Sort.Order.asc("code"))).stream()
                .map(coupon -> new CouponDto(
                        coupon.getId(),
                        coupon.getCode(),
                        coupon.getTitle(),
                        coupon.getDescription(),
                        coupon.getDiscountAmount(),
                        coupon.getMinOrderAmount(),
                        coupon.isEnabled() && subtotal >= coupon.getMinOrderAmount()
                ))
                .toList();
    }

    @Transactional(readOnly = true)
    public PaginatedResponse<AdminCouponDto> getAdminCoupons(
            String email,
            int page,
            int size,
            String query,
            String status
    ) {
        requireAdmin(email);
        var coupons = couponRepository.searchAdminCoupons(
                        normalize(query),
                        toEnabledStatus(status),
                        PageRequest.of(
                                Math.max(page, 0),
                                Math.max(size, 1),
                                Sort.by(Sort.Order.desc("enabled"), Sort.Order.asc("code"))
                        )
                )
                .map(this::toAdminCouponDto);
        return PaginatedResponse.from(coupons);
    }

    @Transactional
    public AdminCouponDto createCoupon(CreateCouponRequest request, String email) {
        requireAdmin(email);
        if (couponRepository.existsByCodeIgnoreCase(request.code().trim())) {
            throw new IllegalArgumentException("Coupon code already exists");
        }

        Coupon coupon = new Coupon();
        applyCoupon(coupon, request.code(), request.title(), request.description(), request.discountAmount(), request.minOrderAmount());
        coupon.setEnabled(request.enabled() == null || request.enabled());
        return toAdminCouponDto(couponRepository.save(coupon));
    }

    @Transactional
    public AdminCouponDto updateCoupon(Long couponId, UpdateCouponRequest request, String email) {
        requireAdmin(email);
        Coupon coupon = getCoupon(couponId);
        String normalizedCode = request.code().trim().toUpperCase(Locale.ROOT);
        couponRepository.findByCodeIgnoreCase(normalizedCode)
                .filter(existing -> !existing.getId().equals(couponId))
                .ifPresent(existing -> {
                    throw new IllegalArgumentException("Coupon code already exists");
                });
        applyCoupon(coupon, request.code(), request.title(), request.description(), request.discountAmount(), request.minOrderAmount());
        coupon.setEnabled(request.enabled());
        return toAdminCouponDto(couponRepository.save(coupon));
    }

    @Transactional
    public AdminCouponDto updateCouponStatus(Long couponId, UpdateCouponStatusRequest request, String email) {
        requireAdmin(email);
        Coupon coupon = getCoupon(couponId);
        coupon.setEnabled(request.enabled());
        return toAdminCouponDto(couponRepository.save(coupon));
    }

    @Transactional
    public void deleteCoupon(Long couponId, String email) {
        requireAdmin(email);
        couponRepository.delete(getCoupon(couponId));
    }

    @Transactional(readOnly = true)
    public CouponValidationDto validateCoupon(String code, String email) {
        int subtotal = cartService.getCartSubtotalForUser(email);
        Coupon coupon = findCoupon(code);
        if (!coupon.isEnabled()) {
            return new CouponValidationDto(false, coupon.getCode(), coupon.getTitle(), "Coupon is not currently available", 0, coupon.getMinOrderAmount());
        }
        if (subtotal < coupon.getMinOrderAmount()) {
            return new CouponValidationDto(false, coupon.getCode(), coupon.getTitle(), "Minimum order amount not met", 0, coupon.getMinOrderAmount());
        }
        return new CouponValidationDto(true, coupon.getCode(), coupon.getTitle(), "Coupon applied successfully", coupon.getDiscountAmount(), coupon.getMinOrderAmount());
    }

    @Transactional(readOnly = true)
    public int validateCouponForSubtotal(String code, int subtotal) {
        Coupon coupon = findCoupon(code);
        if (!coupon.isEnabled()) {
            throw new IllegalArgumentException("Coupon is not currently available");
        }
        if (subtotal < coupon.getMinOrderAmount()) {
            throw new IllegalArgumentException("Minimum order amount not met for this coupon");
        }
        return coupon.getDiscountAmount();
    }

    private Coupon findCoupon(String code) {
        String normalizedCode = code.trim().toUpperCase(Locale.ROOT);
        return couponRepository.findByCodeIgnoreCase(normalizedCode)
                .orElseThrow(() -> new IllegalArgumentException("Coupon not found"));
    }

    private Coupon getCoupon(Long couponId) {
        return couponRepository.findById(couponId)
                .orElseThrow(() -> new EntityNotFoundException("Coupon not found"));
    }

    private AdminCouponDto toAdminCouponDto(Coupon coupon) {
        return new AdminCouponDto(
                coupon.getId(),
                coupon.getCode(),
                coupon.getTitle(),
                coupon.getDescription(),
                coupon.getDiscountAmount(),
                coupon.getMinOrderAmount(),
                coupon.isEnabled()
        );
    }

    private void applyCoupon(
            Coupon coupon,
            String code,
            String title,
            String description,
            Integer discountAmount,
            Integer minOrderAmount
    ) {
        coupon.setCode(code.trim().toUpperCase(Locale.ROOT));
        coupon.setTitle(title.trim());
        coupon.setDescription(description.trim());
        coupon.setDiscountAmount(discountAmount);
        coupon.setMinOrderAmount(minOrderAmount);
    }

    private User requireAdmin(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));
        if (user.getRole() != Role.ADMIN) {
            throw new AccessDeniedException("Only admins can perform this action");
        }
        return user;
    }

    private Boolean toEnabledStatus(String status) {
        String normalized = normalize(status);
        if (normalized == null || normalized.equals("all")) {
            return null;
        }
        return switch (normalized) {
            case "enabled" -> true;
            case "disabled" -> false;
            default -> null;
        };
    }

    private String normalize(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
