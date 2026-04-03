package com.atinroy.orderly.coupon.repository;

import com.atinroy.orderly.coupon.model.Coupon;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface CouponRepository extends JpaRepository<Coupon, Long> {
    Optional<Coupon> findByCodeIgnoreCase(String code);

    boolean existsByCodeIgnoreCase(String code);

    @Query("""
            select c
            from Coupon c
            where (:query is null
                or lower(c.code) like lower(concat('%', :query, '%'))
                or lower(c.title) like lower(concat('%', :query, '%'))
                or lower(c.description) like lower(concat('%', :query, '%')))
              and (:enabled is null or c.enabled = :enabled)
            """)
    Page<Coupon> searchAdminCoupons(
            @Param("query") String query,
            @Param("enabled") Boolean enabled,
            Pageable pageable
    );
}
