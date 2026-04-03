package com.atinroy.orderly.cart.service;

import com.atinroy.orderly.cart.dto.*;
import com.atinroy.orderly.cart.mapper.CartMapper;
import com.atinroy.orderly.cart.model.Cart;
import com.atinroy.orderly.cart.model.CartItem;
import com.atinroy.orderly.cart.repository.CartItemRepository;
import com.atinroy.orderly.cart.repository.CartRepository;
import com.atinroy.orderly.common.util.PricingUtils;
import com.atinroy.orderly.restaurant.model.MenuItem;
import com.atinroy.orderly.restaurant.model.Restaurant;
import com.atinroy.orderly.restaurant.repository.MenuItemRepository;
import com.atinroy.orderly.user.model.Role;
import com.atinroy.orderly.user.model.User;
import com.atinroy.orderly.user.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CartService {
    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final MenuItemRepository menuItemRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public CartDto getCart(String email) {
        User user = getCustomer(email);
        Cart cart = cartRepository.findByUserIdWithItems(user.getId())
                .orElseGet(() -> newCart(user));
        return toDto(cart, 0);
    }

    @Transactional
    public CartDto addToCart(AddToCartRequest request, String email) {
        User user = getCustomer(email);
        Cart cart = cartRepository.findByUserIdWithItems(user.getId())
                .orElseGet(() -> createCart(user));

        MenuItem menuItem = menuItemRepository.findById(request.menuItemId())
                .orElseThrow(() -> new EntityNotFoundException("Menu item not found"));

        if (!Boolean.TRUE.equals(menuItem.getIsAvailable()) ||
                !Boolean.TRUE.equals(menuItem.getRestaurant().getIsApproved()) ||
                !Boolean.TRUE.equals(menuItem.getRestaurant().getIsActive())) {
            throw new IllegalArgumentException("Menu item is not available");
        }

        Restaurant targetRestaurant = menuItem.getRestaurant();
        if (cart.getRestaurant() != null && !cart.getRestaurant().getId().equals(targetRestaurant.getId())) {
            clearCartInternal(cart);
        }

        cart.setRestaurant(targetRestaurant);
        CartItem cartItem = cartItemRepository.findByCartIdAndMenuItemId(cart.getId(), menuItem.getId())
                .orElseGet(() -> {
                    CartItem item = new CartItem();
                    item.setCart(cart);
                    item.setMenuItem(menuItem);
                    item.setQuantity(0);
                    return item;
                });

        cartItem.setQuantity(cartItem.getQuantity() + request.quantity());
        cartItem.setNote(request.note());
        cartItemRepository.save(cartItem);

        return toDto(reloadCart(user), 0);
    }

    @Transactional
    public CartDto updateCartItem(Long itemId, UpdateCartItemRequest request, String email) {
        User user = getCustomer(email);
        Cart cart = cartRepository.findByUserIdWithItems(user.getId())
                .orElseThrow(() -> new EntityNotFoundException("Cart not found"));

        CartItem item = cartItemRepository.findByIdAndCartId(itemId, cart.getId())
                .orElseThrow(() -> new EntityNotFoundException("Cart item not found"));

        item.setQuantity(request.quantity());
        item.setNote(request.note());
        cartItemRepository.save(item);

        return toDto(reloadCart(user), 0);
    }

    @Transactional
    public CartDto removeCartItem(Long itemId, String email) {
        User user = getCustomer(email);
        Cart cart = cartRepository.findByUserIdWithItems(user.getId())
                .orElseThrow(() -> new EntityNotFoundException("Cart not found"));

        CartItem item = cartItemRepository.findByIdAndCartId(itemId, cart.getId())
                .orElseThrow(() -> new EntityNotFoundException("Cart item not found"));
        cartItemRepository.delete(item);

        Cart refreshedCart = reloadCart(user);
        if (refreshedCart.getItems().isEmpty()) {
            refreshedCart.setRestaurant(null);
            cartRepository.save(refreshedCart);
        }

        return toDto(reloadCart(user), 0);
    }

    @Transactional
    public void clearCart(String email) {
        User user = getCustomer(email);
        Cart cart = cartRepository.findByUserId(user.getId())
                .orElseGet(() -> createCart(user));
        clearCartInternal(cart);
    }

    @Transactional(readOnly = true)
    public int getCartSubtotalForUser(String email) {
        User user = getCustomer(email);
        Cart cart = cartRepository.findByUserIdWithItems(user.getId())
                .orElseGet(() -> newCart(user));
        return calculateSubtotal(cart);
    }

    @Transactional(readOnly = true)
    public CartDto getCartWithDiscount(String email, int discount) {
        User user = getCustomer(email);
        Cart cart = cartRepository.findByUserIdWithItems(user.getId())
                .orElseGet(() -> newCart(user));
        return toDto(cart, discount);
    }

    @Transactional
    public Cart createOrGetCartForUser(String email) {
        User user = getCustomer(email);
        return cartRepository.findByUserIdWithItems(user.getId())
                .orElseGet(() -> createCart(user));
    }

    @Transactional
    public void clearCart(Cart cart) {
        clearCartInternal(cart);
    }

    private CartDto toDto(Cart cart, int discount) {
        List<CartItemDto> items = cart.getItems().stream()
                .map(CartMapper::toDto)
                .toList();
        int subtotal = items.stream().mapToInt(CartItemDto::lineTotal).sum();
        int deliveryFee = cart.getRestaurant() == null ? 0 : cart.getRestaurant().getDeliveryFee();
        int taxes = PricingUtils.calculateTaxes(subtotal);
        CartChargesDto charges = new CartChargesDto(
                subtotal,
                deliveryFee,
                PricingUtils.PLATFORM_FEE,
                taxes,
                discount,
                PricingUtils.calculateTotal(subtotal, deliveryFee, taxes, discount)
        );
        return CartMapper.toDto(cart, items, charges);
    }

    private int calculateSubtotal(Cart cart) {
        return cart.getItems().stream()
                .mapToInt(item -> item.getMenuItem().getPrice() * item.getQuantity())
                .sum();
    }

    private User getCustomer(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));
        if (user.getRole() != Role.USER) {
            throw new AccessDeniedException("Only customers can perform this action");
        }
        return user;
    }

    private Cart createCart(User user) {
        return cartRepository.save(newCart(user));
    }

    private Cart newCart(User user) {
        Cart cart = new Cart();
        cart.setUser(user);
        cart.setRestaurant(null);
        return cart;
    }

    private void clearCartInternal(Cart cart) {
        cartItemRepository.deleteByCartId(cart.getId());
        cart.getItems().clear();
        cart.setRestaurant(null);
        cartRepository.save(cart);
    }

    private Cart reloadCart(User user) {
        return cartRepository.findByUserIdWithItems(user.getId())
                .orElseThrow(() -> new EntityNotFoundException("Cart not found"));
    }
}
