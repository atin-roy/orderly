package com.atinroy.orderly.order.dto;

import java.time.LocalDateTime;

public record OrderTimelineDto(
        String label,
        LocalDateTime timestamp,
        String time,
        boolean complete
) {
}
