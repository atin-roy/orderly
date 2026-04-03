package com.atinroy.orderly.user.dto;

public record AdminDeliveryPartnerDto(
        Long id,
        String name,
        String email,
        String phone,
        String city,
        String vehicleType,
        String preferredShift,
        String serviceZones,
        String deliveryExperience,
        String avatarUrl,
        long activeOrders,
        boolean activeNow
) {
}
