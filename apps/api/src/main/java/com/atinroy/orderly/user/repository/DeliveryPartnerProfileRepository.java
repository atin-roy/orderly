package com.atinroy.orderly.user.repository;

import com.atinroy.orderly.user.model.DeliveryPartnerProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;

@Repository
public interface DeliveryPartnerProfileRepository extends JpaRepository<DeliveryPartnerProfile, Long> {
    List<DeliveryPartnerProfile> findAllByOrderByIdAsc();
    List<DeliveryPartnerProfile> findByUserIdIn(Collection<Long> userIds);
    DeliveryPartnerProfile findByUserId(Long userId);
}
