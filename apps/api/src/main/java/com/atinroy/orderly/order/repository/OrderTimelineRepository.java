package com.atinroy.orderly.order.repository;

import com.atinroy.orderly.order.model.OrderTimeline;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface OrderTimelineRepository extends JpaRepository<OrderTimeline, Long> {
    List<OrderTimeline> findByOrderIdOrderByTimestampAsc(Long orderId);
}
