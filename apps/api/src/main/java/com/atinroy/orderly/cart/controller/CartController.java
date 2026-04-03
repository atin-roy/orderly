package com.atinroy.orderly.cart.controller;

import com.atinroy.orderly.cart.dto.AddToCartRequest;
import com.atinroy.orderly.cart.dto.CartDto;
import com.atinroy.orderly.cart.dto.UpdateCartItemRequest;
import com.atinroy.orderly.cart.service.CartService;
import com.atinroy.orderly.common.dto.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/cart")
@RequiredArgsConstructor
public class CartController {
    private final CartService cartService;

    @GetMapping
    public ResponseEntity<ApiResponse<CartDto>> getCart(
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                "Cart fetched successfully",
                cartService.getCart(userDetails.getUsername())
        ));
    }

    @PostMapping("/items")
    public ResponseEntity<ApiResponse<CartDto>> addToCart(
            @Valid @RequestBody AddToCartRequest request,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                "Cart updated successfully",
                cartService.addToCart(request, userDetails.getUsername())
        ));
    }

    @PatchMapping("/items/{itemId}")
    public ResponseEntity<ApiResponse<CartDto>> updateCartItem(
            @PathVariable Long itemId,
            @Valid @RequestBody UpdateCartItemRequest request,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                "Cart updated successfully",
                cartService.updateCartItem(itemId, request, userDetails.getUsername())
        ));
    }

    @DeleteMapping("/items/{itemId}")
    public ResponseEntity<ApiResponse<CartDto>> removeCartItem(
            @PathVariable Long itemId,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                "Cart updated successfully",
                cartService.removeCartItem(itemId, userDetails.getUsername())
        ));
    }

    @DeleteMapping
    public ResponseEntity<ApiResponse<Void>> clearCart(
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        cartService.clearCart(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Cart cleared successfully", null));
    }
}
