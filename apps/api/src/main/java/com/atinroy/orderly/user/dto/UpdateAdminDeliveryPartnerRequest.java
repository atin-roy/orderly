package com.atinroy.orderly.user.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record UpdateAdminDeliveryPartnerRequest(
        @NotBlank(message = "Full name is required")
        String fullName,

        @NotBlank(message = "Email is required")
        @Email(message = "Email must be valid")
        String email,

        @NotBlank(message = "Phone is required")
        @Pattern(regexp = "^\\+?[0-9.]{3,20}$", message = "Invalid phone format")
        String phone,

        @NotBlank(message = "City is required")
        String city,

        @NotBlank(message = "Vehicle type is required")
        String vehicleType,

        @NotBlank(message = "Preferred shift is required")
        String preferredShift,

        @NotBlank(message = "Service zones are required")
        String serviceZones,

        @NotBlank(message = "Delivery experience is required")
        String deliveryExperience
) {
}
