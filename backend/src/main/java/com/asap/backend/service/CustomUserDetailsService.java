package com.asap.backend.service;

import com.asap.backend.model.User;
import com.asap.backend.repository.UserRepository;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    public CustomUserDetailsService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        Optional<User> user = userRepository.findByEmail(email);
        if (user.isEmpty()) {
            throw new UsernameNotFoundException("User not found with email: " + email);
        }

        User foundUser = user.get();
        return org.springframework.security.core.userdetails.User
                .withUsername(foundUser.getEmail())
                .password(foundUser.getPassword()) // Store encoded password
                .roles(String.valueOf(foundUser.getRole())) // Ensure roles are properly set
                .build();
    }
}
