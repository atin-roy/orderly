package com.atinroy.orderly.auth.service;

import com.atinroy.orderly.auth.dto.*;
import com.atinroy.orderly.user.model.*;
import com.atinroy.orderly.user.repository.BusinessProfileRepository;
import com.atinroy.orderly.user.repository.DeliveryPartnerProfileRepository;
import com.atinroy.orderly.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final BusinessProfileRepository businessProfileRepository;
    private final DeliveryPartnerProfileRepository deliveryPartnerProfileRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new IllegalArgumentException("Email already registered");
        }

        User user = new User();
        user.setEmail(request.email());
        user.setPassword(passwordEncoder.encode(request.password()));
        user.setPhone(request.phone());
        user.setRole(Role.USER);
        userRepository.save(user);

        String token = jwtService.generateToken(user);
        return new AuthResponse(token, user.getEmail(), user.getRole().name());
    }

    @Transactional
    public AuthResponse registerBusiness(BusinessRegisterRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new IllegalArgumentException("Email already registered");
        }

        User user = new User();
        user.setName(request.ownerName());
        user.setEmail(request.email());
        user.setPassword(passwordEncoder.encode(request.password()));
        user.setPhone(request.phone());
        user.setRole(Role.BUSINESS);
        userRepository.save(user);

        BusinessProfile profile = new BusinessProfile();
        profile.setUser(user);
        profile.setBusinessName(request.businessName());
        profile.setCity(request.city());
        profile.setServiceArea(request.serviceArea());
        profile.setBusinessType(request.businessType());
        profile.setCuisineFocus(request.cuisineFocus());
        businessProfileRepository.save(profile);

        String token = jwtService.generateToken(user);
        return new AuthResponse(token, user.getEmail(), user.getRole().name());
    }

    @Transactional
    public AuthResponse registerDelivery(DeliveryRegisterRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new IllegalArgumentException("Email already registered");
        }

        User user = new User();
        user.setName(request.fullName());
        user.setEmail(request.email());
        user.setPassword(passwordEncoder.encode(request.password()));
        user.setPhone(request.phone());
        user.setRole(Role.DELIVERY_PARTNER);
        userRepository.save(user);

        DeliveryPartnerProfile profile = new DeliveryPartnerProfile();
        profile.setUser(user);
        profile.setCity(request.city());
        profile.setVehicleType(request.vehicleType());
        profile.setPreferredShift(request.preferredShift());
        profile.setServiceZones(request.serviceZones());
        profile.setDeliveryExperience(request.deliveryExperience());
        deliveryPartnerProfileRepository.save(profile);

        String token = jwtService.generateToken(user);
        return new AuthResponse(token, user.getEmail(), user.getRole().name());
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new BadCredentialsException("Invalid credentials"));

        if (!passwordEncoder.matches(request.password(), user.getPassword())) {
            throw new BadCredentialsException("Invalid credentials");
        }

        String token = jwtService.generateToken(user);
        return new AuthResponse(token, user.getEmail(), user.getRole().name());
    }
}
