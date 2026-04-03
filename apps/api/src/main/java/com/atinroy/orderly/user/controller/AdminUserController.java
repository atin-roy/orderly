package com.atinroy.orderly.user.controller;

import com.atinroy.orderly.common.dto.ApiResponse;
import com.atinroy.orderly.common.dto.PaginatedResponse;
import com.atinroy.orderly.user.dto.AdminDeliveryPartnerDto;
import com.atinroy.orderly.user.dto.CreateAdminDeliveryPartnerRequest;
import com.atinroy.orderly.user.dto.UpdateAdminDeliveryPartnerRequest;
import com.atinroy.orderly.user.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/admin")
@RequiredArgsConstructor
public class AdminUserController {
    private final UserService userService;

    @GetMapping("/delivery-partners")
    public ResponseEntity<ApiResponse<PaginatedResponse<AdminDeliveryPartnerDto>>> getDeliveryPartners(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String query,
            @RequestParam(required = false) String shift,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                "Delivery partners fetched successfully",
                userService.getAdminDeliveryPartners(userDetails.getUsername(), page, size, query, shift)
        ));
    }

    @PostMapping("/delivery-partners")
    public ResponseEntity<ApiResponse<AdminDeliveryPartnerDto>> createDeliveryPartner(
            @Valid @RequestBody CreateAdminDeliveryPartnerRequest request,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(
                "Delivery partner created successfully",
                userService.createAdminDeliveryPartner(userDetails.getUsername(), request)
        ));
    }

    @PutMapping("/delivery-partners/{partnerId}")
    public ResponseEntity<ApiResponse<AdminDeliveryPartnerDto>> updateDeliveryPartner(
            @PathVariable Long partnerId,
            @Valid @RequestBody UpdateAdminDeliveryPartnerRequest request,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                "Delivery partner updated successfully",
                userService.updateAdminDeliveryPartner(userDetails.getUsername(), partnerId, request)
        ));
    }

    @DeleteMapping("/delivery-partners/{partnerId}")
    public ResponseEntity<ApiResponse<Void>> deleteDeliveryPartner(
            @PathVariable Long partnerId,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        userService.deleteAdminDeliveryPartner(userDetails.getUsername(), partnerId);
        return ResponseEntity.ok(ApiResponse.success("Delivery partner deleted successfully", null));
    }
}
