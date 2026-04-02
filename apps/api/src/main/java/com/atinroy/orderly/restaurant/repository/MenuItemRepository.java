package com.atinroy.orderly.restaurant.repository;

import com.atinroy.orderly.restaurant.model.MenuItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface MenuItemRepository extends JpaRepository<MenuItem, Long> {
    List<MenuItem> findByRestaurantIdAndIsAvailableTrueOrderByCategoryAscSortOrderAscIdAsc(Long restaurantId);

    List<MenuItem> findByRestaurantIdOrderByCategoryAscSortOrderAscIdAsc(Long restaurantId);

    Optional<MenuItem> findByIdAndRestaurantId(Long id, Long restaurantId);
}
