package com.atinroy.orderly.order.repository;

import com.atinroy.orderly.order.model.Order;
import com.atinroy.orderly.order.model.OrderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface OrderRepository extends JpaRepository<Order, Long> {
    @EntityGraph(attributePaths = {"restaurant"})
    Page<Order> findByUserIdAndStatusInOrderByCreatedDateDesc(Long userId, Collection<OrderStatus> statuses, Pageable pageable);

    @EntityGraph(attributePaths = {"restaurant"})
    Optional<Order> findByIdAndUserId(Long id, Long userId);

    @EntityGraph(attributePaths = {"restaurant"})
    Optional<Order> findFirstByUserIdAndStatusInOrderByCreatedDateDesc(Long userId, Collection<OrderStatus> statuses);

    @EntityGraph(attributePaths = {"restaurant"})
    Optional<Order> findById(Long id);

    @EntityGraph(attributePaths = {"restaurant"})
    List<Order> findByRestaurantOwnerIdAndStatusIn(Long ownerId, Collection<OrderStatus> statuses);
}
