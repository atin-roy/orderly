package com.atinroy.orderly.user.model;

import com.atinroy.orderly.common.model.BaseEntity;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "business_profiles")
public class BusinessProfile extends BaseEntity {

    @OneToOne(optional = false)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(nullable = false)
    @NotBlank
    private String businessName;

    @Column(nullable = false)
    @NotBlank
    private String city;

    @Column(nullable = false)
    @NotBlank
    private String serviceArea;

    @Column(nullable = false)
    @NotBlank
    private String businessType;

    @Column(nullable = false, columnDefinition = "TEXT")
    @NotBlank
    private String cuisineFocus;
}
