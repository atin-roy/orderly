package com.atinroy.orderly.user.service;

import com.atinroy.orderly.user.dto.CreateUserAddressRequest;
import com.atinroy.orderly.user.dto.UpdateUserProfileRequest;
import com.atinroy.orderly.user.dto.UserDto;
import com.atinroy.orderly.user.dto.UserAddressDto;
import com.atinroy.orderly.user.mapper.UserMapper;
import com.atinroy.orderly.user.model.User;
import com.atinroy.orderly.user.model.UserAddress;
import com.atinroy.orderly.user.repository.UserAddressRepository;
import com.atinroy.orderly.user.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;
    private final UserAddressRepository userAddressRepository;
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

    private String normalizeOptional(String value) {
        if (value == null) {
            return null;
        }

        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
