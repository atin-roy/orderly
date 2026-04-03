package com.atinroy.orderly.media.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.media")
public record MediaProperties(
        String uploadDir,
        long maxFileSizeBytes
) {
}
