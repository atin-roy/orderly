package com.atinroy.orderly.restaurant.repository;

import com.atinroy.orderly.restaurant.model.Restaurant;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface RestaurantRepository extends JpaRepository<Restaurant, Long> {
    @EntityGraph(attributePaths = "owner")
    Page<Restaurant> findByIsApprovedTrueAndIsActiveTrue(Pageable pageable);

    @EntityGraph(attributePaths = "owner")
    @Query("""
            select distinct r
            from Restaurant r
            left join r.menuItems mi
            where r.isApproved = true
              and r.isActive = true
              and (:query is null or :query = '' or lower(r.name) like lower(concat('%', :query, '%'))
                  or lower(r.description) like lower(concat('%', :query, '%'))
                  or lower(r.cuisineType) like lower(concat('%', :query, '%'))
                  or lower(r.locality) like lower(concat('%', :query, '%'))
                  or lower(mi.name) like lower(concat('%', :query, '%')))
              and (:locality is null or :locality = '' or lower(r.locality) = lower(:locality))
              and (:isVeg is null or exists (
                  select 1 from MenuItem vegItem
                  where vegItem.restaurant = r
                    and vegItem.isAvailable = true
                    and vegItem.isVeg = :isVeg
              ))
            """)
    Page<Restaurant> searchApprovedRestaurants(
            @Param("query") String query,
            @Param("locality") String locality,
            @Param("isVeg") Boolean isVeg,
            Pageable pageable
    );

    @EntityGraph(attributePaths = "owner")
    List<Restaurant> findByOwnerId(Long ownerId);

    @EntityGraph(attributePaths = "owner")
    Optional<Restaurant> findByIdAndIsApprovedTrue(Long id);

    boolean existsBySlug(String slug);

    Optional<Restaurant> findBySlug(String slug);

    @Query("""
            select distinct r.locality
            from Restaurant r
            where r.isApproved = true and r.isActive = true and lower(r.city) = lower(:city)
            order by r.locality asc
            """)
    List<String> findDistinctLocalitiesByCity(@Param("city") String city);
}
