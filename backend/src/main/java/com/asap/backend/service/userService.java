package com.asap.backend.service;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

import com.asap.backend.model.Role;
import com.asap.backend.model.User;
import com.asap.backend.repository.UserRepository;
import com.asap.backend.utils.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
@Service
public class userService  {

@Autowired
    private UserRepository userRepository;
@Autowired
private BCryptPasswordEncoder passwordEncoder;
@Autowired
private JavaMailSender mailSender;
@Autowired
private JwtUtil jwtUtil;

    // ✅ Save User with Encrypted Password
    public User saveUser(User user) {
        if (!user.getPassword().startsWith("$2a$")) {  // "$2a$" is a bcrypt identifier
            user.setPassword(passwordEncoder.encode(user.getPassword()));
        }

        System.out.println("Final Hashed Password Before Saving: " + user.getPassword());  // Debugging

        if (user.getRole() == null) {
            user.setRole(Role.USER);
        }

        return userRepository.save(user);
    }
    public String forgotPassword(String email) {
        Optional<User> userOptional = userRepository.findByEmail(email);
        if (userOptional.isEmpty()) {
            return "User not found";
        }

        User user = userOptional.get();
        String resetToken = UUID.randomUUID().toString(); // Generate unique token
        user.setResetToken(resetToken);
        user.setResetTokenExpiry(LocalDateTime.now().plusMinutes(30)); // Token valid for 30 mins
        userRepository.save(user);

        // ✅ Send email with reset link
        String resetLink = "http://127.0.0.1:5500/Reset.html?token=" + resetToken;
        sendResetEmail(user.getEmail(), resetLink);

        return "Reset password link sent to email";
    }
    private void sendResetEmail(String email, String resetLink) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(email);
        message.setSubject("Password Reset Request");
        message.setText("Click the link to reset your password: " + resetLink);
        mailSender.send(message);
    }
    public String setNewPassword(String email, String newPassword) {

            if (newPassword == null || newPassword.trim().isEmpty()) {
                return "New password cannot be empty.";
            }

            Optional<User> userOptional = userRepository.findByEmail(email);
            if (userOptional.isEmpty()) {
                return "User not found.";
            }

            User user = userOptional.get();
            user.setPassword(passwordEncoder.encode(newPassword));
            userRepository.save(user);

            return "Password successfully updated.";
        }






    // ✅ Find User by Email
    public Optional<User> findByEmail(String email) {

        return userRepository.findByEmail(email);
    }

    // ✅ Login Method with Debugging
    public String login(String email, String password) {
        Optional<User> user = userRepository.findByEmail(email);

        if (user.isEmpty()) {
            throw new RuntimeException("User not found");
        }

        // Debugging - Print Passwords
        System.out.println("Stored Hashed Password: " + user.get().getPassword());
        System.out.println("Entered Raw Password: " + password);

        // Validate Password
        if (!passwordEncoder.matches(password, user.get().getPassword())) {
            throw new RuntimeException("Invalid credentials");
        }

        return jwtUtil.generateToken(email);
    }
}