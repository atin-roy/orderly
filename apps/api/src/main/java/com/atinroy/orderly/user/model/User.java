package com.atinroy.orderly.user.model;

import com.atinroy.orderly.common.model.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

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

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<UserAddress> addresses = new ArrayList<>();

    // TODO: Service layer must maintain bidirectional sync:
    // 1. Set address.setUser(user) before saving. ✅
    // 2. Ensure only one address has isDefault = true per user.
    // 3. For new orders, copy address details to Order entity (Snapshot).
}
