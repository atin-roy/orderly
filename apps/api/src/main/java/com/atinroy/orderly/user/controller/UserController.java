package com.atinroy.orderly.user.controller;

import com.atinroy.orderly.user.dto.CreateUserAddressRequest;
import com.atinroy.orderly.user.dto.UserAddressDto;
import com.atinroy.orderly.user.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/profile")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @PostMapping("/addresses")
    public ResponseEntity<UserAddressDto> createAddress(
            @Valid @RequestBody CreateUserAddressRequest request,
            @AuthenticationPrincipal Jwt jwt
    ) {
        String keycloakId = (String) jwt.getSubject();
        UserAddressDto response = userService.createAddress(request, keycloakId);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
}
