package com.atinroy.orderly.restaurant.service;

import com.atinroy.orderly.common.dto.PaginatedResponse;
import com.atinroy.orderly.order.repository.OrderRepository;
import com.atinroy.orderly.restaurant.dto.*;
import com.atinroy.orderly.restaurant.mapper.RestaurantMapper;
import com.atinroy.orderly.restaurant.model.MenuItem;
import com.atinroy.orderly.restaurant.model.Restaurant;
import com.atinroy.orderly.restaurant.repository.MenuItemRepository;
import com.atinroy.orderly.restaurant.repository.RestaurantRepository;
import com.atinroy.orderly.user.model.BusinessProfile;
import com.atinroy.orderly.user.model.Role;
import com.atinroy.orderly.user.model.User;
import com.atinroy.orderly.user.repository.BusinessProfileRepository;
import com.atinroy.orderly.user.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
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
    private final BusinessProfileRepository businessProfileRepository;
    private final OrderRepository orderRepository;
    private final PasswordEncoder passwordEncoder;

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

    @Transactional(readOnly = true)
    public List<MenuCategoryDto> getManagementMenu(Long restaurantId, String email) {
        Restaurant restaurant = getManageableRestaurant(restaurantId, email);
        List<MenuItem> items = menuItemRepository.findByRestaurantIdOrderByCategoryAscSortOrderAscIdAsc(restaurant.getId());
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
        restaurant.setIsApproved(true);
        restaurant.setImageColor(request.imageColor() == null || request.imageColor().isBlank()
                ? restaurant.getImageColor()
                : request.imageColor());

        return RestaurantMapper.toDto(restaurantRepository.save(restaurant));
    }

    @Transactional
    public RestaurantDto updateRestaurant(Long restaurantId, UpdateRestaurantRequest request, String email) {
        Restaurant restaurant = getManageableRestaurant(restaurantId, email);
        restaurant.setName(request.name());
        restaurant.setSlug(generateUniqueSlug(request.name(), restaurant.getId()));
        restaurant.setDescription(request.description());
        restaurant.setCuisineType(request.cuisineType());
        restaurant.setCity(request.city());
        restaurant.setLocality(request.locality());
        restaurant.setImageUrl(request.imageUrl());
        restaurant.setDeliveryTimeMinutes(request.deliveryTimeMinutes());
        restaurant.setDeliveryFee(request.deliveryFee());
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
        Restaurant restaurant = getManageableRestaurant(restaurantId, email);

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
        getManageableRestaurant(restaurantId, email);
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
        getManageableRestaurant(restaurantId, email);
        MenuItem menuItem = menuItemRepository.findByIdAndRestaurantId(itemId, restaurantId)
                .orElseThrow(() -> new EntityNotFoundException("Menu item not found"));
        menuItemRepository.delete(menuItem);
    }

    @Transactional
    public RestaurantDto adminCreateRestaurant(AdminCreateRestaurantRequest request, String email) {
        getAdminUser(email);
        if (userRepository.existsByEmail(request.email())) {
            throw new IllegalArgumentException("Email already registered");
        }

        User owner = new User();
        owner.setName(request.ownerName().trim());
        owner.setEmail(request.email().trim());
        owner.setPassword(passwordEncoder.encode(request.password()));
        owner.setPhone(request.phone().trim());
        owner.setRole(Role.BUSINESS);
        userRepository.save(owner);

        BusinessProfile profile = new BusinessProfile();
        profile.setUser(owner);
        profile.setBusinessName(request.businessName().trim());
        profile.setCity(request.city().trim());
        profile.setServiceArea(request.serviceArea().trim());
        profile.setBusinessType(request.businessType().trim());
        profile.setCuisineFocus(request.cuisineFocus().trim());
        businessProfileRepository.save(profile);

        Restaurant restaurant = new Restaurant();
        restaurant.setOwner(owner);
        restaurant.setName(request.name().trim());
        restaurant.setSlug(generateUniqueSlug(request.name(), null));
        restaurant.setDescription(request.description());
        restaurant.setCuisineType(request.cuisineType().trim());
        restaurant.setCity(request.restaurantCity().trim());
        restaurant.setLocality(request.locality().trim());
        restaurant.setImageUrl(request.imageUrl());
        restaurant.setDeliveryTimeMinutes(request.deliveryTimeMinutes());
        restaurant.setDeliveryFee(request.deliveryFee());
        restaurant.setIsApproved(true);
        restaurant.setIsActive(true);
        restaurant.setImageColor(request.imageColor() == null || request.imageColor().isBlank()
                ? restaurant.getImageColor()
                : request.imageColor());

        return RestaurantMapper.toDto(restaurantRepository.save(restaurant));
    }

    @Transactional(readOnly = true)
    public RestaurantDto getManageableRestaurantDetails(Long restaurantId, String email) {
        return RestaurantMapper.toDto(getManageableRestaurant(restaurantId, email));
    }

    @Transactional(readOnly = true)
    public List<RestaurantDto> getOwnedRestaurants(String email) {
        User owner = getBusinessUser(email);
        return restaurantRepository.findByOwnerId(owner.getId()).stream()
                .map(RestaurantMapper::toDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<AdminRestaurantSummaryDto> getAdminRestaurantOverview(String email) {
        getAdminUser(email);

        return restaurantRepository.findAll().stream()
                .map(restaurant -> new AdminRestaurantSummaryDto(
                        restaurant.getId(),
                        restaurant.getName(),
                        restaurant.getOwner() == null ? null : restaurant.getOwner().getName(),
                        restaurant.getLocality(),
                        restaurant.getCity(),
                        restaurant.getCuisineType(),
                        restaurant.getIsActive(),
                        orderRepository.countByRestaurantIdAndStatusIn(
                                restaurant.getId(),
                                List.of(
                                        com.atinroy.orderly.order.model.OrderStatus.PLACED,
                                        com.atinroy.orderly.order.model.OrderStatus.ACCEPTED,
                                        com.atinroy.orderly.order.model.OrderStatus.PREPARING,
                                        com.atinroy.orderly.order.model.OrderStatus.READY,
                                        com.atinroy.orderly.order.model.OrderStatus.PICKED_UP
                                )
                        ),
                        orderRepository.countByRestaurantId(restaurant.getId())
                ))
                .sorted((left, right) -> Long.compare(right.totalOrders(), left.totalOrders()))
                .toList();
    }

    private User getAdminUser(String email) {
        User admin = userRepository.findByEmail(email)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));
        if (admin.getRole() != Role.ADMIN) {
            throw new AccessDeniedException("Only admins can perform this action");
        }
        return admin;
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

    private Restaurant getManageableRestaurant(Long restaurantId, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));
        Restaurant restaurant = restaurantRepository.findById(restaurantId)
                .orElseThrow(() -> new EntityNotFoundException("Restaurant not found"));

        if (user.getRole() == Role.ADMIN) {
            return restaurant;
        }
        if (user.getRole() == Role.BUSINESS && restaurant.getOwner().getId().equals(user.getId())) {
            return restaurant;
        }

        throw new AccessDeniedException("Restaurant not found");
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
