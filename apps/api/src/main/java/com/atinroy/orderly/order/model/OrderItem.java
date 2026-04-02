package com.atinroy.orderly.order.model;

import com.atinroy.orderly.common.model.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "order_items", indexes = {
        @Index(name = "idx_order_item_order", columnList = "order_id")
})
public class OrderItem extends BaseEntity {
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    @Column(nullable = false)
    private String menuItemName;

    @Column(nullable = false)
    private Integer menuItemPrice;

    @Column(nullable = false)
    private Integer quantity;
}
