package com.atinroy.orderly.order.model;

import com.atinroy.orderly.common.model.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@Entity
@Table(name = "order_timelines", indexes = {
        @Index(name = "idx_order_timeline_order", columnList = "order_id"),
        @Index(name = "idx_order_timeline_timestamp", columnList = "timestamp")
})
public class OrderTimeline extends BaseEntity {
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    @Column(nullable = false)
    private String label;

    @Column(nullable = false)
    private LocalDateTime timestamp;
}
