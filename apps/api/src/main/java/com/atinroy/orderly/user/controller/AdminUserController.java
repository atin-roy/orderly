package com.atinroy.orderly.user.controller;

import com.atinroy.orderly.common.dto.ApiResponse;
import com.atinroy.orderly.common.dto.PaginatedResponse;
import com.atinroy.orderly.user.dto.AdminDeliveryPartnerDto;
import com.atinroy.orderly.user.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
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
}
