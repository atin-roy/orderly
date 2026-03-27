package com.atinroy.orderly.user.model;

import com.atinroy.orderly.common.model.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(
        name = "users",
        indexes = {
                @Index(name = "idx_user_keycloak_id", columnList = "keycloakId", unique = true)
        }
)
public class User extends BaseEntity {
    @Column(nullable = false, unique = true)
    private String keycloakId;
}
