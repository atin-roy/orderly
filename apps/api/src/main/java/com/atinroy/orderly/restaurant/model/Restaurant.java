package com.atinroy.orderly.restaurant.model;

import com.atinroy.orderly.common.model.BaseEntity;
import com.atinroy.orderly.user.model.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@Entity
@Table(name = "restaurants", indexes = {
        @Index(name = "idx_restaurant_owner", columnList = "owner_id"),
        @Index(name = "idx_restaurant_approval_active", columnList = "is_approved, is_active"),
        @Index(name = "idx_restaurant_city_locality", columnList = "city, locality"),
        @Index(name = "idx_restaurant_slug", columnList = "slug", unique = true)
})
public class Restaurant extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id", nullable = false)
    private User owner;

    @Column(nullable = false)
    private String name;

    @Column(unique = true)
    private String slug;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private String cuisineType;

    private String city;

    private String locality;

    private String imageUrl;

    @Column(nullable = false)
    private Double rating = 0.0;

    @Column(nullable = false)
    private Integer deliveryTimeMinutes;

    @Column(nullable = false)
    private Integer deliveryFee = 0;

    @Column(nullable = false)
    private Boolean isApproved = false;

    @Column(nullable = false)
    private Boolean isActive = true;

    @Column(nullable = false)
    private String imageColor = "bg-gradient-to-br from-orange-500 via-amber-500 to-red-700";

    @OneToMany(mappedBy = "restaurant", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("sortOrder ASC, id ASC")
    private List<MenuItem> menuItems = new ArrayList<>();
}
