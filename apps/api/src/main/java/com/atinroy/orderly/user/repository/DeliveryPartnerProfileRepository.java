package com.atinroy.orderly.user.repository;

import com.atinroy.orderly.user.model.DeliveryPartnerProfile;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Repository
public interface DeliveryPartnerProfileRepository extends JpaRepository<DeliveryPartnerProfile, Long> {
    List<DeliveryPartnerProfile> findAllByOrderByIdAsc();
    List<DeliveryPartnerProfile> findByUserIdIn(Collection<Long> userIds);
    DeliveryPartnerProfile findByUserId(Long userId);
    Optional<DeliveryPartnerProfile> findById(Long id);

    @EntityGraph(attributePaths = "user")
    @Query("""
            select profile
            from DeliveryPartnerProfile profile
            join profile.user user
            where (:query = ''
                or lower(user.name) like concat('%', :query, '%')
                or lower(user.email) like concat('%', :query, '%')
                or lower(user.phone) like concat('%', :query, '%')
                or lower(profile.vehicleType) like concat('%', :query, '%')
                or lower(profile.serviceZones) like concat('%', :query, '%'))
              and (:shift is null or lower(profile.preferredShift) = :shift)
            """)
    Page<DeliveryPartnerProfile> searchAdminProfiles(
            @Param("query") String query,
            @Param("shift") String shift,
            Pageable pageable
    );
}
