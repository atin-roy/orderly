package com.atinroy.orderly.order.model;

import com.atinroy.orderly.common.model.BaseEntity;
import com.atinroy.orderly.restaurant.model.Restaurant;
import com.atinroy.orderly.user.model.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@Entity
@Table(name = "orders", indexes = {
        @Index(name = "idx_order_user_created", columnList = "user_id, created_date"),
        @Index(name = "idx_order_restaurant", columnList = "restaurant_id"),
        @Index(name = "idx_order_status", columnList = "status")
})
public class Order extends BaseEntity {
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "restaurant_id", nullable = false)
    private Restaurant restaurant;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_delivery_partner_id")
    private User assignedDeliveryPartner;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private OrderStatus status = OrderStatus.PLACED;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String deliveryAddress;

    @Column(nullable = false)
    private String deliveryCity;

    @Column(nullable = false)
    private String deliveryPhone;

    @Column
    private Double deliveryLatitude;

    @Column
    private Double deliveryLongitude;

    @Column(nullable = false)
    private String paymentMethod;

    private String paymentProvider = "OFFLINE";

    private String paymentStatus = "PENDING";

    private String gatewayOrderId;

    private String gatewayPaymentId;

    @Column(nullable = false)
    private Integer subtotal;

    @Column(nullable = false)
    private Integer deliveryFee;

    @Column(nullable = false)
    private Integer platformFee;

    @Column(nullable = false)
    private Integer taxes;

    @Column(nullable = false)
    private Integer discount = 0;

    private String couponCode;

    @Column(nullable = false)
    private Integer totalAmount;

    @Column(nullable = false)
    private Integer estimatedDeliveryMinutes;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<OrderItem> items = new ArrayList<>();

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("timestamp ASC")
    private List<OrderTimeline> timeline = new ArrayList<>();
}
