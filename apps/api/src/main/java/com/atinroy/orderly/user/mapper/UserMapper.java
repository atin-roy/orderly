package com.atinroy.orderly.user.mapper;

import com.atinroy.orderly.user.dto.CreateUserAddressRequest;
import com.atinroy.orderly.user.dto.UpdateUserAddressRequest;
import com.atinroy.orderly.user.dto.UserAddressDto;
import com.atinroy.orderly.user.dto.UserDto;
import com.atinroy.orderly.user.model.User;
import com.atinroy.orderly.user.model.UserAddress;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Maps between User/UserAddress entities and their DTOs.
 * Kept as a plain Spring component — if the project grows,
 * consider switching to MapStruct for compile-time safety.
 */
@Component
public class UserMapper {

    public UserDto toDto(User user) {
        List<UserAddressDto> addressDtos = user.getAddresses() == null
                ? List.of()
                : user.getAddresses().stream()
                        .map(this::toDto)
                        .toList();

        return new UserDto(
                user.getId(),
                user.getEmail(),
                user.getRole().name(),
                user.getPhone(),
                addressDtos,
                user.getCreatedDate()
        );
    }

    public UserAddressDto toDto(UserAddress address) {
        return new UserAddressDto(
                address.getId(),
                address.getLabel(),
                address.getAddress(),
                address.getBuildingInfo(),
                address.getCity(),
                address.getPhone(),
                address.getLatitude(),
                address.getLongitude(),
                address.isDefault()
        );
    }

    public UserAddress toEntity(CreateUserAddressRequest request) {
        UserAddress address = new UserAddress();
        address.setLabel(request.label());
        address.setAddress(request.address());
        address.setBuildingInfo(request.buildingInfo());
        address.setCity(request.city());
        address.setPhone(request.phone());
        address.setLatitude(request.latitude());
        address.setLongitude(request.longitude());
        address.setDefault(request.isDefault());
        return address;
    }

    public void updateEntity(UserAddress address, UpdateUserAddressRequest request) {
        address.setLabel(request.label());
        address.setAddress(request.address());
        address.setBuildingInfo(request.buildingInfo());
        address.setCity(request.city());
        address.setPhone(request.phone());
        address.setLatitude(request.latitude());
        address.setLongitude(request.longitude());
        address.setDefault(request.isDefault());
    }
}
