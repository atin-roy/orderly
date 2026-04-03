package com.atinroy.orderly.coupon.model;

import com.atinroy.orderly.common.model.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(
        name = "coupons",
        indexes = {
                @Index(name = "idx_coupon_code", columnList = "code", unique = true)
        }
)
public class Coupon extends BaseEntity {
    @Column(nullable = false, unique = true)
    @NotBlank
    private String code;

    @Column(nullable = false)
    @NotBlank
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    @NotBlank
    private String description;

    @Column(nullable = false)
    @Min(1)
    private Integer discountAmount;

    @Column(nullable = false)
    @Min(0)
    private Integer minOrderAmount;

    @Column(nullable = false)
    private boolean enabled = true;
}
