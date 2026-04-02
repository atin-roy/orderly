package com.atinroy.orderly.cart.repository;

import com.atinroy.orderly.cart.model.Cart;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface CartRepository extends JpaRepository<Cart, Long> {
    @Query("select c from Cart c where c.user.id = :userId")
    Optional<Cart> findByUserId(@Param("userId") Long userId);

    @EntityGraph(attributePaths = {
            "restaurant",
            "items",
            "items.menuItem",
            "items.menuItem.restaurant"
    })
    @Query("select c from Cart c where c.user.id = :userId")
    Optional<Cart> findByUserIdWithItems(@Param("userId") Long userId);
}
