package com.atinroy.orderly.user.model;

import com.atinroy.orderly.common.model.BaseEntity;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "delivery_partner_profiles")
public class DeliveryPartnerProfile extends BaseEntity {

    @OneToOne(optional = false)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(nullable = false)
    @NotBlank
    private String city;

    @Column(nullable = false)
    @NotBlank
    private String vehicleType;

    @Column(nullable = false)
    @NotBlank
    private String preferredShift;

    @Column(nullable = false, columnDefinition = "TEXT")
    @NotBlank
    private String serviceZones;

    @Column(nullable = false)
    @NotBlank
    private String deliveryExperience;
}
