package com.atinroy.orderly.restaurant.service;

import com.atinroy.orderly.common.dto.PaginatedResponse;
import com.atinroy.orderly.restaurant.dto.*;
import com.atinroy.orderly.restaurant.mapper.RestaurantMapper;
import com.atinroy.orderly.restaurant.model.MenuItem;
import com.atinroy.orderly.restaurant.model.Restaurant;
import com.atinroy.orderly.restaurant.repository.MenuItemRepository;
import com.atinroy.orderly.restaurant.repository.RestaurantRepository;
import com.atinroy.orderly.user.model.Role;
import com.atinroy.orderly.user.model.User;
import com.atinroy.orderly.user.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RestaurantService {
    private final RestaurantRepository restaurantRepository;
    private final MenuItemRepository menuItemRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public PaginatedResponse<RestaurantDto> getApprovedRestaurants(
            int page,
            int size,
            String query,
            String locality,
            Boolean isVeg,
            String sort
    ) {
        var pageable = PageRequest.of(Math.max(page, 0), Math.max(size, 1), buildSort(sort));
        var result = restaurantRepository.searchApprovedRestaurants(
                        normalize(query),
                        normalize(locality),
                        isVeg,
                        pageable
                )
                .map(RestaurantMapper::toDto);
        return PaginatedResponse.from(result);
    }

    @Transactional(readOnly = true)
    public List<String> getLocalities(String city) {
        return restaurantRepository.findDistinctLocalitiesByCity(normalize(city) == null ? "Kolkata" : city.trim());
    }

    @Transactional(readOnly = true)
    public RestaurantDto getRestaurant(Long id) {
        Restaurant restaurant = restaurantRepository.findByIdAndIsApprovedTrue(id)
                .filter(Restaurant::getIsActive)
                .orElseThrow(() -> new EntityNotFoundException("Restaurant not found"));
        return RestaurantMapper.toDto(restaurant);
    }

    @Transactional(readOnly = true)
    public List<MenuCategoryDto> getRestaurantMenu(Long restaurantId) {
        Restaurant restaurant = restaurantRepository.findByIdAndIsApprovedTrue(restaurantId)
                .filter(Restaurant::getIsActive)
                .orElseThrow(() -> new EntityNotFoundException("Restaurant not found"));

        List<MenuItem> items = menuItemRepository.findByRestaurantIdAndIsAvailableTrueOrderByCategoryAscSortOrderAscIdAsc(restaurant.getId());
        return groupMenuItems(items);
    }

    @Transactional
    public RestaurantDto createRestaurant(CreateRestaurantRequest request, String email) {
        User owner = getBusinessUser(email);

        Restaurant restaurant = new Restaurant();
        restaurant.setOwner(owner);
        restaurant.setName(request.name());
        restaurant.setSlug(generateUniqueSlug(request.name(), null));
        restaurant.setDescription(request.description());
        restaurant.setCuisineType(request.cuisineType());
        restaurant.setCity(request.city());
        restaurant.setLocality(request.locality());
        restaurant.setImageUrl(request.imageUrl());
        restaurant.setDeliveryTimeMinutes(request.deliveryTimeMinutes());
        restaurant.setDeliveryFee(request.deliveryFee());
        restaurant.setPriceLevel(request.priceLevel());
        restaurant.setIsApproved(true);
        restaurant.setImageColor(request.imageColor() == null || request.imageColor().isBlank()
                ? restaurant.getImageColor()
                : request.imageColor());

        return RestaurantMapper.toDto(restaurantRepository.save(restaurant));
    }

    @Transactional
    public RestaurantDto updateRestaurant(Long restaurantId, UpdateRestaurantRequest request, String email) {
        Restaurant restaurant = getOwnedRestaurant(restaurantId, email);
        restaurant.setName(request.name());
        restaurant.setSlug(generateUniqueSlug(request.name(), restaurant.getId()));
        restaurant.setDescription(request.description());
        restaurant.setCuisineType(request.cuisineType());
        restaurant.setCity(request.city());
        restaurant.setLocality(request.locality());
        restaurant.setImageUrl(request.imageUrl());
        restaurant.setDeliveryTimeMinutes(request.deliveryTimeMinutes());
        restaurant.setDeliveryFee(request.deliveryFee());
        restaurant.setPriceLevel(request.priceLevel());
        if (request.isActive() != null) {
            restaurant.setIsActive(request.isActive());
        }
        if (request.imageColor() != null && !request.imageColor().isBlank()) {
            restaurant.setImageColor(request.imageColor());
        }
        return RestaurantMapper.toDto(restaurantRepository.save(restaurant));
    }

    @Transactional
    public MenuItemDto createMenuItem(Long restaurantId, CreateMenuItemRequest request, String email) {
        Restaurant restaurant = getOwnedRestaurant(restaurantId, email);

        MenuItem menuItem = new MenuItem();
        menuItem.setRestaurant(restaurant);
        menuItem.setName(request.name());
        menuItem.setDescription(request.description());
        menuItem.setImageUrl(request.imageUrl());
        menuItem.setPrice(request.price());
        menuItem.setCategory(request.category());
        menuItem.setIsAvailable(request.isAvailable() == null || request.isAvailable());
        menuItem.setIsVeg(request.isVeg() != null && request.isVeg());
        menuItem.setSortOrder(request.sortOrder() == null ? 0 : request.sortOrder());

        return RestaurantMapper.toDto(menuItemRepository.save(menuItem));
    }

    @Transactional
    public MenuItemDto updateMenuItem(Long restaurantId, Long itemId, UpdateMenuItemRequest request, String email) {
        getOwnedRestaurant(restaurantId, email);
        MenuItem menuItem = menuItemRepository.findByIdAndRestaurantId(itemId, restaurantId)
                .orElseThrow(() -> new EntityNotFoundException("Menu item not found"));

        menuItem.setName(request.name());
        menuItem.setDescription(request.description());
        menuItem.setImageUrl(request.imageUrl());
        menuItem.setPrice(request.price());
        menuItem.setCategory(request.category());
        menuItem.setIsAvailable(request.isAvailable());
        menuItem.setIsVeg(request.isVeg());
        menuItem.setSortOrder(request.sortOrder());

        return RestaurantMapper.toDto(menuItemRepository.save(menuItem));
    }

    @Transactional
    public void deleteMenuItem(Long restaurantId, Long itemId, String email) {
        getOwnedRestaurant(restaurantId, email);
        MenuItem menuItem = menuItemRepository.findByIdAndRestaurantId(itemId, restaurantId)
                .orElseThrow(() -> new EntityNotFoundException("Menu item not found"));
        menuItemRepository.delete(menuItem);
    }

    @Transactional(readOnly = true)
    public List<RestaurantDto> getOwnedRestaurants(String email) {
        User owner = getBusinessUser(email);
        return restaurantRepository.findByOwnerId(owner.getId()).stream()
                .map(RestaurantMapper::toDto)
                .toList();
    }

    private User getBusinessUser(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));
        if (user.getRole() != Role.BUSINESS) {
            throw new AccessDeniedException("Only business owners can perform this action");
        }
        return user;
    }

    private Restaurant getOwnedRestaurant(Long restaurantId, String email) {
        User owner = getBusinessUser(email);
        Restaurant restaurant = restaurantRepository.findById(restaurantId)
                .orElseThrow(() -> new EntityNotFoundException("Restaurant not found"));
        if (!restaurant.getOwner().getId().equals(owner.getId())) {
            throw new AccessDeniedException("Restaurant not found");
        }
        return restaurant;
    }

    private List<MenuCategoryDto> groupMenuItems(List<MenuItem> items) {
        Map<String, List<MenuItemDto>> itemsByCategory = items.stream()
                .map(RestaurantMapper::toDto)
                .collect(Collectors.groupingBy(MenuItemDto::category));

        return itemsByCategory.entrySet().stream()
                .sorted(Map.Entry.comparingByKey())
                .map(entry -> new MenuCategoryDto(entry.getKey(), entry.getValue()))
                .toList();
    }

    private Sort buildSort(String sort) {
        String normalizedSort = normalize(sort);
        if (normalizedSort == null) {
            return Sort.by("name").ascending();
        }

        return switch (normalizedSort) {
            case "rating" -> Sort.by(Sort.Order.desc("rating"), Sort.Order.asc("name"));
            case "delivery-time" -> Sort.by(Sort.Order.asc("deliveryTimeMinutes"), Sort.Order.asc("name"));
            default -> Sort.by("name").ascending();
        };
    }

    private String generateUniqueSlug(String name, Long currentRestaurantId) {
        String baseSlug = normalize(name) == null
                ? "restaurant"
                : name.toLowerCase(Locale.ROOT)
                .replaceAll("[^a-z0-9]+", "-")
                .replaceAll("(^-|-$)", "");
        String candidate = baseSlug.isBlank() ? "restaurant" : baseSlug;
        int suffix = 2;

        while (restaurantRepository.existsBySlug(candidate)) {
            if (currentRestaurantId != null) {
                Restaurant existing = restaurantRepository.findBySlug(candidate).orElse(null);
                if (existing != null && existing.getId().equals(currentRestaurantId)) {
                    return candidate;
                }
            }

            candidate = baseSlug + "-" + suffix;
            suffix += 1;
        }

        return candidate;
    }

    private String normalize(String value) {
        if (value == null) {
            return null;
        }

        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
