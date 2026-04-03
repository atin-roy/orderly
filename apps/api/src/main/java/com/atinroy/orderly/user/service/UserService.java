package com.atinroy.orderly.user.service;

import com.atinroy.orderly.common.dto.PaginatedResponse;
import com.atinroy.orderly.order.model.Order;
import com.atinroy.orderly.order.model.OrderStatus;
import com.atinroy.orderly.order.repository.OrderRepository;
import com.atinroy.orderly.user.dto.AdminDeliveryPartnerDto;
import com.atinroy.orderly.user.dto.CreateAdminDeliveryPartnerRequest;
import com.atinroy.orderly.user.dto.CreateUserAddressRequest;
import com.atinroy.orderly.user.dto.UpdateAdminDeliveryPartnerRequest;
import com.atinroy.orderly.user.dto.UpdateUserProfileRequest;
import com.atinroy.orderly.user.dto.UserDto;
import com.atinroy.orderly.user.dto.UserAddressDto;
import com.atinroy.orderly.user.mapper.UserMapper;
import com.atinroy.orderly.user.model.DeliveryPartnerProfile;
import com.atinroy.orderly.user.model.Role;
import com.atinroy.orderly.user.model.User;
import com.atinroy.orderly.user.model.UserAddress;
import com.atinroy.orderly.user.repository.DeliveryPartnerProfileRepository;
import com.atinroy.orderly.user.repository.UserAddressRepository;
import com.atinroy.orderly.user.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;
    private final UserAddressRepository userAddressRepository;
    private final DeliveryPartnerProfileRepository deliveryPartnerProfileRepository;
    private final OrderRepository orderRepository;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;

    @Transactional(readOnly = true)
    public UserDto getProfile(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        return userMapper.toDto(user);
    }

    @Transactional
    public UserDto updateProfile(UpdateUserProfileRequest request, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        user.setName(normalizeOptional(request.name()));
        user.setPhone(request.phone().trim());

        User savedUser = userRepository.save(user);
        return userMapper.toDto(savedUser);
    }

    @Transactional
    public UserAddressDto createAddress(CreateUserAddressRequest request, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        UserAddress address = userMapper.toEntity(request);
        address.setUser(user);
        user.getAddresses().add(address);

        Optional<UserAddress> defaultAddress = userAddressRepository.findByUserIdAndIsDefaultTrue(user.getId());

        if (defaultAddress.isPresent() && address.isDefault()) {
            UserAddress oldDefault = defaultAddress.get();
            oldDefault.setDefault(false);
            userAddressRepository.save(oldDefault);
        } else if (defaultAddress.isEmpty()) {
            address.setDefault(true);
        } else {
            address.setDefault(false);
        }

        UserAddress savedAddress = userAddressRepository.save(address);

        return userMapper.toDto(savedAddress);
    }

    @Transactional
    public UserAddressDto setDefaultAddress(Long addressId, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        UserAddress address = userAddressRepository.findById(addressId)
                .orElseThrow(() -> new EntityNotFoundException("Address not found"));

        if (!address.getUser().getId().equals(user.getId())) {
            throw new EntityNotFoundException("Address not found");
        }

        userAddressRepository.findByUserIdAndIsDefaultTrue(user.getId())
                .filter(existingDefault -> !existingDefault.getId().equals(address.getId()))
                .ifPresent(existingDefault -> {
                    existingDefault.setDefault(false);
                    userAddressRepository.save(existingDefault);
                });

        address.setDefault(true);
        UserAddress savedAddress = userAddressRepository.save(address);

        return userMapper.toDto(savedAddress);
    }

    @Transactional
    public void deleteAddress(Long addressId, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        UserAddress address = userAddressRepository.findById(addressId)
                .orElseThrow(() -> new EntityNotFoundException("Address not found"));

        if (!address.getUser().getId().equals(user.getId())) {
            throw new EntityNotFoundException("Address not found");
        }

        boolean wasDefault = address.isDefault();

        user.getAddresses().removeIf(userAddress -> userAddress.getId().equals(address.getId()));
        userRepository.save(user);

        if (wasDefault) {
            user.getAddresses().stream()
                    .min(Comparator.comparing(UserAddress::getId))
                    .ifPresent(nextDefault -> nextDefault.setDefault(true));
        }
    }

    @Transactional(readOnly = true)
    public PaginatedResponse<AdminDeliveryPartnerDto> getAdminDeliveryPartners(
            String email,
            int page,
            int size,
            String query,
            String shift
    ) {
        requireAdmin(email);
        String normalizedQuery = normalizeOptional(query);

        var profiles = deliveryPartnerProfileRepository.searchAdminProfiles(
                        normalizedQuery == null ? "" : normalizedQuery,
                        normalizeOptional(shift),
                        PageRequest.of(Math.max(page, 0), Math.max(size, 1), Sort.by("id").ascending())
                );

        List<Long> userIds = profiles.getContent().stream()
                .map(profile -> profile.getUser().getId())
                .toList();
        Map<Long, Long> activeOrderCounts = userIds.isEmpty()
                ? Map.of()
                : orderRepository.findByAssignedDeliveryPartnerIdInAndStatusIn(
                                userIds,
                                List.of(
                                        OrderStatus.PLACED,
                                        OrderStatus.ACCEPTED,
                                        OrderStatus.PREPARING,
                                        OrderStatus.READY,
                                        OrderStatus.PICKED_UP
                                )
                        ).stream()
                        .map(Order::getAssignedDeliveryPartner)
                        .filter(java.util.Objects::nonNull)
                        .collect(Collectors.groupingBy(User::getId, Collectors.counting()));

        return PaginatedResponse.from(profiles.map(profile -> toAdminDeliveryPartnerDto(
                profile,
                activeOrderCounts.getOrDefault(profile.getUser().getId(), 0L)
        )));
    }

    @Transactional
    public AdminDeliveryPartnerDto createAdminDeliveryPartner(
            String email,
            CreateAdminDeliveryPartnerRequest request
    ) {
        requireAdmin(email);
        if (userRepository.existsByEmail(request.email().trim())) {
            throw new IllegalArgumentException("Email already registered");
        }

        User user = new User();
        user.setName(request.fullName().trim());
        user.setEmail(request.email().trim());
        user.setPassword(passwordEncoder.encode(request.password()));
        user.setPhone(request.phone().trim());
        user.setRole(Role.DELIVERY_PARTNER);
        userRepository.save(user);

        DeliveryPartnerProfile profile = new DeliveryPartnerProfile();
        profile.setUser(user);
        profile.setCity(request.city().trim());
        profile.setVehicleType(request.vehicleType().trim());
        profile.setPreferredShift(request.preferredShift().trim());
        profile.setServiceZones(request.serviceZones().trim());
        profile.setDeliveryExperience(request.deliveryExperience().trim());
        profile.setAvatarUrl(defaultDeliveryAvatarUrl(request.vehicleType()));

        return toAdminDeliveryPartnerDto(deliveryPartnerProfileRepository.save(profile), 0L);
    }

    @Transactional
    public AdminDeliveryPartnerDto updateAdminDeliveryPartner(
            String email,
            Long partnerId,
            UpdateAdminDeliveryPartnerRequest request
    ) {
        requireAdmin(email);
        DeliveryPartnerProfile profile = deliveryPartnerProfileRepository.findById(partnerId)
                .orElseThrow(() -> new EntityNotFoundException("Delivery partner not found"));
        User user = profile.getUser();

        String normalizedEmail = request.email().trim();
        userRepository.findByEmail(normalizedEmail)
                .filter(existing -> !existing.getId().equals(user.getId()))
                .ifPresent(existing -> {
                    throw new IllegalArgumentException("Email already registered");
                });

        user.setName(request.fullName().trim());
        user.setEmail(normalizedEmail);
        user.setPhone(request.phone().trim());

        profile.setCity(request.city().trim());
        profile.setVehicleType(request.vehicleType().trim());
        profile.setPreferredShift(request.preferredShift().trim());
        profile.setServiceZones(request.serviceZones().trim());
        profile.setDeliveryExperience(request.deliveryExperience().trim());
        profile.setAvatarUrl(defaultDeliveryAvatarUrl(request.vehicleType()));

        userRepository.save(user);
        DeliveryPartnerProfile savedProfile = deliveryPartnerProfileRepository.save(profile);
        long activeOrders = orderRepository.findByAssignedDeliveryPartnerIdInAndStatusIn(
                        List.of(user.getId()),
                        List.of(
                                OrderStatus.PLACED,
                                OrderStatus.ACCEPTED,
                                OrderStatus.PREPARING,
                                OrderStatus.READY,
                                OrderStatus.PICKED_UP
                        )
                ).size();
        return toAdminDeliveryPartnerDto(savedProfile, activeOrders);
    }

    @Transactional
    public void deleteAdminDeliveryPartner(String email, Long partnerId) {
        requireAdmin(email);
        DeliveryPartnerProfile profile = deliveryPartnerProfileRepository.findById(partnerId)
                .orElseThrow(() -> new EntityNotFoundException("Delivery partner not found"));

        if (orderRepository.countByAssignedDeliveryPartnerId(profile.getUser().getId()) > 0) {
            throw new IllegalStateException(
                    "This delivery partner already has order history and cannot be deleted."
            );
        }

        deliveryPartnerProfileRepository.delete(profile);
        userRepository.delete(profile.getUser());
    }

    private String normalizeOptional(String value) {
        if (value == null) {
            return null;
        }

        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private User requireAdmin(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));
        if (user.getRole() != Role.ADMIN) {
            throw new AccessDeniedException("Only admins can perform this action");
        }
        return user;
    }

    private AdminDeliveryPartnerDto toAdminDeliveryPartnerDto(DeliveryPartnerProfile profile, long activeOrders) {
        return new AdminDeliveryPartnerDto(
                profile.getId(),
                profile.getUser().getName(),
                profile.getUser().getEmail(),
                profile.getUser().getPhone(),
                profile.getCity(),
                profile.getVehicleType(),
                profile.getPreferredShift(),
                profile.getServiceZones(),
                profile.getDeliveryExperience(),
                profile.getAvatarUrl(),
                activeOrders,
                activeOrders > 0
        );
    }

    private String defaultDeliveryAvatarUrl(String vehicleType) {
        if (vehicleType == null) {
            return "/demo/partners/rider-bike-a.svg";
        }

        String normalized = vehicleType.trim().toLowerCase();
        if (normalized.contains("scooter")) {
            return "/demo/partners/rider-scooter-a.svg";
        }

        return "/demo/partners/rider-bike-a.svg";
    }
}
