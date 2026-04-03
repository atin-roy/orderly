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
    @EntityGraph(attributePaths = {"restaurant", "assignedDeliveryPartner", "user"})
    Page<Order> findByUserIdAndStatusInOrderByCreatedDateDesc(Long userId, Collection<OrderStatus> statuses, Pageable pageable);

    @EntityGraph(attributePaths = {"restaurant", "assignedDeliveryPartner", "user"})
    Optional<Order> findByIdAndUserId(Long id, Long userId);

    @EntityGraph(attributePaths = {"restaurant", "assignedDeliveryPartner", "user"})
    List<Order> findByUserIdAndStatusInOrderByCreatedDateDesc(Long userId, Collection<OrderStatus> statuses);

    @EntityGraph(attributePaths = {"restaurant", "assignedDeliveryPartner", "user"})
    Optional<Order> findFirstByUserIdAndStatusInOrderByCreatedDateDesc(Long userId, Collection<OrderStatus> statuses);

    @EntityGraph(attributePaths = {"restaurant", "assignedDeliveryPartner", "user"})
    Optional<Order> findById(Long id);

    @EntityGraph(attributePaths = {"restaurant", "assignedDeliveryPartner", "user"})
    List<Order> findByRestaurantOwnerIdAndStatusIn(Long ownerId, Collection<OrderStatus> statuses);

    @EntityGraph(attributePaths = {"restaurant", "assignedDeliveryPartner", "user"})
    List<Order> findByAssignedDeliveryPartnerIdAndStatusInOrderByCreatedDateDesc(Long deliveryPartnerId, Collection<OrderStatus> statuses);

    @EntityGraph(attributePaths = {"restaurant", "assignedDeliveryPartner", "user"})
    List<Order> findTop12ByAssignedDeliveryPartnerIdAndStatusInOrderByCreatedDateDesc(Long deliveryPartnerId, Collection<OrderStatus> statuses);

    @EntityGraph(attributePaths = {"restaurant", "assignedDeliveryPartner", "user"})
    List<Order> findByStatusInOrderByCreatedDateDesc(Collection<OrderStatus> statuses);

    @EntityGraph(attributePaths = {"restaurant", "assignedDeliveryPartner", "user"})
    List<Order> findByAssignedDeliveryPartnerIdInAndStatusIn(Collection<Long> deliveryPartnerIds, Collection<OrderStatus> statuses);

    int countByStatusIn(Collection<OrderStatus> statuses);
    long countByRestaurantId(Long restaurantId);
    long countByRestaurantIdAndStatusIn(Long restaurantId, Collection<OrderStatus> statuses);
    long countByAssignedDeliveryPartnerId(Long deliveryPartnerId);
}
