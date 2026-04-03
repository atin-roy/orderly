package com.atinroy.orderly.media.controller;

import com.atinroy.orderly.common.dto.ApiResponse;
import com.atinroy.orderly.common.dto.ImageUploadDto;
import com.atinroy.orderly.media.service.ImageStorageService;
import com.atinroy.orderly.user.model.Role;
import com.atinroy.orderly.user.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/uploads")
@RequiredArgsConstructor
public class UploadController {
    private final ImageStorageService imageStorageService;
    private final UserRepository userRepository;

    @PostMapping("/images")
    public ResponseEntity<ApiResponse<ImageUploadDto>> uploadImage(
            @RequestParam("file") MultipartFile file,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        var user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new EntityNotFoundException("User not found"));
        if (!(user.getRole() == Role.ADMIN || user.getRole() == Role.BUSINESS)) {
            throw new org.springframework.security.access.AccessDeniedException("Only admins and business owners can upload images");
        }

        String url = imageStorageService.storeImage(file);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Image uploaded successfully", new ImageUploadDto(url)));
    }
}
