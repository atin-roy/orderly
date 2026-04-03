package com.atinroy.orderly.auth.controller;

import com.atinroy.orderly.auth.dto.*;
import com.atinroy.orderly.auth.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(authService.register(request));
    }

    @PostMapping("/register/business")
    public ResponseEntity<AuthResponse> registerBusiness(@Valid @RequestBody BusinessRegisterRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(authService.registerBusiness(request));
    }

    @PostMapping("/register/delivery")
    public ResponseEntity<AuthResponse> registerDelivery(@Valid @RequestBody DeliveryRegisterRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(authService.registerDelivery(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }
}
