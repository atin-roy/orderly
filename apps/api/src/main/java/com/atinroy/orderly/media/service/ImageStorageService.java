package com.atinroy.orderly.media.service;

import com.atinroy.orderly.media.config.MediaProperties;
import jakarta.annotation.PostConstruct;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;

@Service
public class ImageStorageService {
    private static final Set<String> ALLOWED_CONTENT_TYPES = Set.of(
            MediaType.IMAGE_JPEG_VALUE,
            MediaType.IMAGE_PNG_VALUE,
            "image/webp"
    );
    private static final Set<String> ALLOWED_EXTENSIONS = Set.of("jpg", "jpeg", "png", "webp");

    private final MediaProperties mediaProperties;
    private final Path uploadRoot;

    public ImageStorageService(MediaProperties mediaProperties) {
        this.mediaProperties = mediaProperties;
        this.uploadRoot = Path.of(mediaProperties.uploadDir()).toAbsolutePath().normalize();
    }

    @PostConstruct
    void ensureUploadDirectory() throws IOException {
        Files.createDirectories(uploadRoot.resolve("images"));
    }

    public String storeImage(MultipartFile file) {
        validate(file);

        String extension = extensionOf(file.getOriginalFilename());
        String generatedName = UUID.randomUUID() + "." + extension;
        Path target = uploadRoot.resolve("images").resolve(generatedName).normalize();

        try (InputStream inputStream = file.getInputStream()) {
            Files.copy(inputStream, target, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException ex) {
            throw new IllegalStateException("Unable to store image");
        }

        return "/uploads/images/" + generatedName;
    }

    private void validate(MultipartFile file) {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("Image file is required");
        }
        if (file.getSize() > mediaProperties.maxFileSizeBytes()) {
            throw new IllegalArgumentException("Image exceeds the 5 MB limit");
        }
        if (!ALLOWED_CONTENT_TYPES.contains(file.getContentType())) {
            throw new IllegalArgumentException("Only JPG, PNG, and WebP images are allowed");
        }

        String extension = extensionOf(file.getOriginalFilename());
        if (!ALLOWED_EXTENSIONS.contains(extension)) {
            throw new IllegalArgumentException("Only JPG, PNG, and WebP images are allowed");
        }
    }

    private String extensionOf(String filename) {
        String cleanFilename = StringUtils.cleanPath(filename == null ? "" : filename);
        int extensionIndex = cleanFilename.lastIndexOf('.');
        if (extensionIndex < 0 || extensionIndex == cleanFilename.length() - 1) {
            throw new IllegalArgumentException("Image file must include an extension");
        }

        return cleanFilename.substring(extensionIndex + 1).toLowerCase(Locale.ROOT);
    }
}
