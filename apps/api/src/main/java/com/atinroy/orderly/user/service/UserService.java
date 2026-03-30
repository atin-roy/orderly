package com.atinroy.orderly.user.service;

import com.atinroy.orderly.user.dto.CreateUserAddressRequest;
import com.atinroy.orderly.user.dto.UserAddressDto;
import com.atinroy.orderly.user.mapper.UserMapper;
import com.atinroy.orderly.user.model.User;
import com.atinroy.orderly.user.model.UserAddress;
import com.atinroy.orderly.user.repository.UserAddressRepository;
import com.atinroy.orderly.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;
    private final UserAddressRepository userAddressRepository;
    private final UserMapper userMapper;
    @Transactional
    User createUser(String keycloakId) {
        User user = new User();
        user.setKeycloakId(keycloakId);
        user = userRepository.save(user);

        return user;
    }

    @Transactional
    public UserAddressDto createAddress(
            CreateUserAddressRequest request,
            String keycloakId
    ) {
        User user = userRepository.findByKeycloakId(keycloakId)
                .orElse(createUser(keycloakId));



        UserAddress address = userMapper.toEntity(request);
        address.setUser(user);
        user.getAddresses().add(address);

        Optional<UserAddress> defaultAddress = userAddressRepository.findByUserIdAndIsDefaultTrue(user.getId());

        if (defaultAddress.isPresent() && address.isDefault()) {
            UserAddress oldDefault = defaultAddress.get();
            oldDefault.setDefault(false);
            userAddressRepository.save(oldDefault);
        } else {
            address.setDefault(true);
        }

        UserAddress savedAddress = userAddressRepository.save(address);

        return userMapper.toDto(savedAddress);
    }
}
