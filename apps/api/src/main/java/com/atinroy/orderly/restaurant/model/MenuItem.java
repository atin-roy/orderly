package com.atinroy.orderly.restaurant.model;

import com.atinroy.orderly.common.model.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "menu_items", indexes = {
        @Index(name = "idx_menu_item_restaurant", columnList = "restaurant_id"),
        @Index(name = "idx_menu_item_restaurant_category", columnList = "restaurant_id, category")
})
public class MenuItem extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "restaurant_id", nullable = false)
    private Restaurant restaurant;

    @Column(nullable = false)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    private String imageUrl;

    @Column(nullable = false)
    private Integer price;

    @Column(nullable = false)
    private String category;

    @Column(nullable = false)
    private Boolean isAvailable = true;

    @Column(nullable = false)
    private Boolean isVeg = false;

    @Column(nullable = false)
    private Integer sortOrder = 0;
}
