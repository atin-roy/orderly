package com.atinroy.orderly.user.service;

import com.atinroy.orderly.common.dto.PaginatedResponse;
import com.atinroy.orderly.order.model.Order;
import com.atinroy.orderly.order.model.OrderStatus;
import com.atinroy.orderly.order.repository.OrderRepository;
import com.atinroy.orderly.user.dto.AdminDeliveryPartnerDto;
import com.atinroy.orderly.user.dto.CreateUserAddressRequest;
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

        var profiles = deliveryPartnerProfileRepository.searchAdminProfiles(
                        normalizeOptional(query),
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
                profile.getAvatarUrl(),
                activeOrders,
                activeOrders > 0
        );
    }
}
