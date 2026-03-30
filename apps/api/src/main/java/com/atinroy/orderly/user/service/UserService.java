package com.atinroy.orderly.user.service;

import com.atinroy.orderly.user.model.User;
import com.atinroy.orderly.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;
    @Transactional
    public User createUser(String keycloakId) {
        User user = new User();
        user.setKeycloakId(keycloakId);
        user = userRepository.save(user);

        return user;
    }
}
