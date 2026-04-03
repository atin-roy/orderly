package com.atinroy.orderly.order.dto;

public record DeliveryPartnerSummaryDto(
        Long id,
        String name,
        String phone,
        String vehicleType,
        String preferredShift,
        String serviceZones,
        String avatarUrl
) {
}
