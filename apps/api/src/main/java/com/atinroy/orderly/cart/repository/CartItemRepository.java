package com.atinroy.orderly.cart.repository;

import com.atinroy.orderly.cart.model.CartItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CartItemRepository extends JpaRepository<CartItem, Long> {
    List<CartItem> findByCartId(Long cartId);

    Optional<CartItem> findByCartIdAndMenuItemId(Long cartId, Long menuItemId);

    Optional<CartItem> findByIdAndCartId(Long id, Long cartId);

    void deleteByCartId(Long cartId);
}
