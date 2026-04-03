package com.atinroy.orderly.order.controller;

import com.atinroy.orderly.common.dto.ApiResponse;
import com.atinroy.orderly.order.dto.OrderDto;
import com.atinroy.orderly.order.dto.OrdersPageDto;
import com.atinroy.orderly.order.dto.PlaceOrderRequest;
import com.atinroy.orderly.order.dto.UpdateOrderStatusRequest;
import com.atinroy.orderly.order.dto.DeliveryDashboardDto;
import com.atinroy.orderly.order.dto.OwnerDashboardDto;
import com.atinroy.orderly.order.dto.AdminDashboardDto;
import com.atinroy.orderly.order.service.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/orders")
@RequiredArgsConstructor
public class OrderController {
    private final OrderService orderService;

    @PostMapping
    public ResponseEntity<ApiResponse<OrderDto>> placeOrder(
            @Valid @RequestBody PlaceOrderRequest request,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(
                        "Order placed successfully",
                        orderService.placeOrder(request, userDetails.getUsername())
                ));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<OrdersPageDto>> getOrders(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "4") int size,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                "Orders fetched successfully",
                orderService.getOrders(userDetails.getUsername(), page, size)
        ));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<OrderDto>> getOrder(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                "Order fetched successfully",
                orderService.getOrder(id, userDetails.getUsername())
        ));
    }

    @GetMapping("/delivery/dashboard")
    public ResponseEntity<ApiResponse<DeliveryDashboardDto>> getDeliveryDashboard(
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                "Delivery dashboard fetched successfully",
                orderService.getDeliveryDashboard(userDetails.getUsername())
        ));
    }

    @GetMapping("/owner/dashboard")
    public ResponseEntity<ApiResponse<OwnerDashboardDto>> getOwnerDashboard(
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                "Owner dashboard fetched successfully",
                orderService.getOwnerDashboard(userDetails.getUsername())
        ));
    }

    @GetMapping("/admin/dashboard")
    public ResponseEntity<ApiResponse<AdminDashboardDto>> getAdminDashboard(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "6") int size,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                "Admin dashboard fetched successfully",
                orderService.getAdminDashboard(userDetails.getUsername(), page, size)
        ));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<OrderDto>> updateStatus(
            @PathVariable Long id,
            @Valid @RequestBody UpdateOrderStatusRequest request,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                "Order status updated successfully",
                orderService.updateOrderStatus(id, request, userDetails.getUsername())
        ));
    }
}
