package com.atinroy.orderly.restaurant.controller;

import com.atinroy.orderly.common.dto.ApiResponse;
import com.atinroy.orderly.common.dto.PaginatedResponse;
import com.atinroy.orderly.restaurant.dto.*;
import com.atinroy.orderly.restaurant.service.RestaurantService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/restaurants")
@RequiredArgsConstructor
public class RestaurantController {
    private final RestaurantService restaurantService;

    @GetMapping
    public ResponseEntity<ApiResponse<PaginatedResponse<RestaurantDto>>> getRestaurants(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size,
            @RequestParam(required = false) String query,
            @RequestParam(required = false) String locality,
            @RequestParam(required = false) Boolean isVeg,
            @RequestParam(required = false) String sort
    ) {
        PaginatedResponse<RestaurantDto> restaurants = restaurantService.getApprovedRestaurants(
                page,
                size,
                query,
                locality,
                isVeg,
                sort
        );
        return ResponseEntity.ok(ApiResponse.success("Restaurants fetched successfully", restaurants));
    }

    @GetMapping("/localities")
    public ResponseEntity<ApiResponse<List<String>>> getLocalities(
            @RequestParam(defaultValue = "Kolkata") String city
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                "Localities fetched successfully",
                restaurantService.getLocalities(city)
        ));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<RestaurantDto>> getRestaurant(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(
                "Restaurant fetched successfully",
                restaurantService.getRestaurant(id)
        ));
    }

    @GetMapping("/{id}/menu")
    public ResponseEntity<ApiResponse<List<MenuCategoryDto>>> getMenu(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(
                "Menu fetched successfully",
                restaurantService.getRestaurantMenu(id)
        ));
    }

    @GetMapping("/{id}/menu/manage")
    public ResponseEntity<ApiResponse<List<MenuCategoryDto>>> getManagementMenu(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                "Management menu fetched successfully",
                restaurantService.getManagementMenu(id, userDetails.getUsername())
        ));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<RestaurantDto>> createRestaurant(
            @Valid @RequestBody CreateRestaurantRequest request,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        RestaurantDto restaurant = restaurantService.createRestaurant(request, userDetails.getUsername());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Restaurant created successfully", restaurant));
    }

    @PostMapping("/admin")
    public ResponseEntity<ApiResponse<RestaurantDto>> adminCreateRestaurant(
            @Valid @RequestBody AdminCreateRestaurantRequest request,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        RestaurantDto restaurant = restaurantService.adminCreateRestaurant(request, userDetails.getUsername());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Restaurant created successfully", restaurant));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<RestaurantDto>> updateRestaurant(
            @PathVariable Long id,
            @Valid @RequestBody UpdateRestaurantRequest request,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                "Restaurant updated successfully",
                restaurantService.updateRestaurant(id, request, userDetails.getUsername())
        ));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteRestaurant(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        restaurantService.deleteRestaurant(id, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Restaurant deleted successfully", null));
    }

    @GetMapping("/admin/{id}")
    public ResponseEntity<ApiResponse<RestaurantDto>> getAdminRestaurant(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                "Restaurant fetched successfully",
                restaurantService.getManageableRestaurantDetails(id, userDetails.getUsername())
        ));
    }

    @PostMapping("/{id}/menu")
    public ResponseEntity<ApiResponse<MenuItemDto>> createMenuItem(
            @PathVariable Long id,
            @Valid @RequestBody CreateMenuItemRequest request,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        MenuItemDto menuItem = restaurantService.createMenuItem(id, request, userDetails.getUsername());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Menu item created successfully", menuItem));
    }

    @PutMapping("/{id}/menu/{itemId}")
    public ResponseEntity<ApiResponse<MenuItemDto>> updateMenuItem(
            @PathVariable Long id,
            @PathVariable Long itemId,
            @Valid @RequestBody UpdateMenuItemRequest request,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                "Menu item updated successfully",
                restaurantService.updateMenuItem(id, itemId, request, userDetails.getUsername())
        ));
    }

    @DeleteMapping("/{id}/menu/{itemId}")
    public ResponseEntity<ApiResponse<Void>> deleteMenuItem(
            @PathVariable Long id,
            @PathVariable Long itemId,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        restaurantService.deleteMenuItem(id, itemId, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Menu item deleted successfully", null));
    }

    @GetMapping("/mine")
    public ResponseEntity<ApiResponse<List<RestaurantDto>>> getMyRestaurants(
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                "Owned restaurants fetched successfully",
                restaurantService.getOwnedRestaurants(userDetails.getUsername())
        ));
    }

    @GetMapping("/admin/overview")
    public ResponseEntity<ApiResponse<PaginatedResponse<AdminRestaurantSummaryDto>>> getAdminRestaurantOverview(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String query,
            @RequestParam(required = false) String status,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                "Admin restaurant overview fetched successfully",
                restaurantService.getAdminRestaurantOverview(userDetails.getUsername(), page, size, query, status)
        ));
    }
}
