package com.atinroy.orderly.cart.mapper;

import com.atinroy.orderly.cart.dto.CartChargesDto;
import com.atinroy.orderly.cart.dto.CartDto;
import com.atinroy.orderly.cart.dto.CartItemDto;
import com.atinroy.orderly.cart.model.Cart;
import com.atinroy.orderly.cart.model.CartItem;

import java.util.List;

public final class CartMapper {
    private CartMapper() {
    }

    public static CartItemDto toDto(CartItem item) {
        return new CartItemDto(
                item.getId(),
                item.getMenuItem().getId(),
                item.getMenuItem().getName(),
                item.getMenuItem().getPrice(),
                item.getQuantity(),
                item.getNote(),
                item.getMenuItem().getPrice() * item.getQuantity()
        );
    }

    public static CartDto toDto(Cart cart, List<CartItemDto> items, CartChargesDto charges) {
        if (cart.getRestaurant() == null) {
            return new CartDto(cart.getId(), null, null, null, null, null, items, charges);
        }

        return new CartDto(
                cart.getId(),
                cart.getRestaurant().getId(),
                cart.getRestaurant().getName(),
                cart.getRestaurant().getCuisineType(),
                cart.getRestaurant().getDeliveryTimeMinutes(),
                cart.getRestaurant().getImageColor(),
                items,
                charges
        );
    }
}
