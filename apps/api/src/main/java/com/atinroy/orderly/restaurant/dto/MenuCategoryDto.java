package com.atinroy.orderly.restaurant.dto;

import java.util.List;

public record MenuCategoryDto(
        String category,
        List<MenuItemDto> items
) {
}
