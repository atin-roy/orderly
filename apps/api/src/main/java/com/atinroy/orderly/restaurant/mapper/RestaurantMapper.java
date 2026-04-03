package com.atinroy.orderly.restaurant.mapper;

import com.atinroy.orderly.restaurant.dto.MenuItemDto;
import com.atinroy.orderly.restaurant.dto.RestaurantDto;
import com.atinroy.orderly.restaurant.model.MenuItem;
import com.atinroy.orderly.restaurant.model.Restaurant;

public final class RestaurantMapper {
    private RestaurantMapper() {
    }

    public static RestaurantDto toDto(Restaurant restaurant) {
        return new RestaurantDto(
                restaurant.getId(),
                restaurant.getOwner().getId(),
                restaurant.getOwner().getName(),
                restaurant.getName(),
                restaurant.getSlug(),
                restaurant.getDescription(),
                restaurant.getCuisineType(),
                restaurant.getCity(),
                restaurant.getLocality(),
                restaurant.getImageUrl(),
                restaurant.getRating(),
                restaurant.getDeliveryTimeMinutes(),
                restaurant.getDeliveryFee(),
                restaurant.getIsApproved(),
                restaurant.getIsActive(),
                restaurant.getImageColor()
        );
    }

    public static MenuItemDto toDto(MenuItem menuItem) {
        return new MenuItemDto(
                menuItem.getId(),
                menuItem.getRestaurant().getId(),
                menuItem.getName(),
                menuItem.getDescription(),
                menuItem.getImageUrl(),
                menuItem.getPrice(),
                menuItem.getCategory(),
                menuItem.getIsAvailable(),
                menuItem.getIsVeg(),
                menuItem.getSortOrder()
        );
    }
}
