package com.atinroy.orderly.user.model;

import com.atinroy.orderly.common.model.BaseEntity;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;
// TODO : address snapshot in Order entity as a historical record

@Getter
@Setter
@Entity
@Table(
        name = "user_addresses",
        indexes = {
                @Index(name = "idx_address_user", columnList = "user_id"),
                @Index(name = "idx_address_coords", columnList = "latitude, longitude")
        }
)
public class UserAddress extends BaseEntity {
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @NotBlank
    @Column(nullable = false)
    private String label; // e.g., Home, Work

    @NotBlank
    @Column(nullable = false)
    private String address;

    private String buildingInfo; // Apt, Floor, etc.

    private String city;

    @NotBlank
    @Column(nullable = false)
    private String phone;

    @NotNull
    @Column(nullable = false)
    private Double latitude;

    @NotNull
    @Column(nullable = false)
    private Double longitude;

    @Column(nullable = false)
    private boolean isDefault = false;
}
