package com.asap.backend.controller;

import com.asap.backend.ResetPasswordRequest;
import com.asap.backend.dto.UpdateProfileRequest;
import com.asap.backend.model.Order;
import com.asap.backend.model.User;
import com.asap.backend.repository.UserRepository;
import com.asap.backend.service.OrderService;
import com.asap.backend.service.emailService;
import com.asap.backend.service.userService;
import com.asap.backend.utils.ChangePasswordRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/users")
public class userController {

    private final userService userService;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private BCryptPasswordEncoder passwordEncoder;
    @Autowired
    private OrderService orderService;
    @Autowired
    private emailService emailService;

    @Autowired
    public userController(userService userService) {
        this.userService = userService;
    }


    @PostMapping("/add")
    public User addUser(@RequestBody User user) {
        System.out.println("Received User Data:");
        System.out.println("Email: " + user.getEmail());
        System.out.println("Password: " + user.getPassword());
        System.out.println("Name: " + user.getName());
        System.out.println("Phone: " + user.getPhone());
        System.out.println("Role: " + user.getRole());
        return userService.saveUser(user);
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody User user) {
        System.out.println("Login API called for email: " + user.getEmail());
        String token = userService.login(user.getEmail(), user.getPassword());
        return ResponseEntity.ok(token);  // ✅ Return JWT token
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/protected")
    public String protectedApi() {
        return "You have accessed a protected API!";
    }

    @GetMapping("/email/{email}")
    public Optional<User> getUserByEmail(@PathVariable String email) {
        return userService.findByEmail(email);
    }


    @GetMapping("/profile")
    public ResponseEntity<?> getUserProfile(Authentication authentication) {
        String email = authentication.getName(); // ✅ Extract email from JWT
        Optional<User> user = userRepository.findByEmail(email);
        System.out.println(email);

        if (user.isPresent()) {
            return ResponseEntity.ok(user.get());
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
        }
    }

    @DeleteMapping("/delete-account")
    public ResponseEntity<?> deleteAccount(Authentication authentication) {
        String email = authentication.getName(); // Get the logged-in user's email
        Optional<User> userOptional = userRepository.findByEmail(email);

        if (userOptional.isPresent()) {
            userRepository.delete(userOptional.get());
            return ResponseEntity.ok("Account deleted successfully");
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
        }
    }



    @PostMapping("/set-password")
    public ResponseEntity<?> setNewPassword(@RequestBody ResetPasswordRequest request) {
        if (request.getNewPassword() == null || request.getNewPassword().trim().isEmpty()) {
            return ResponseEntity.badRequest().body("New password cannot be empty.");
        }

        String result = userService.setNewPassword(request.getEmail(), request.getNewPassword());

        if (result.equals("User not found.")) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(result);
        }

        return ResponseEntity.ok(result);
    }



    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        Optional<User> userOptional = userRepository.findByEmail(email);

        if (userOptional.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
        }

        // Generate OTP
        String otp = String.valueOf(new Random().nextInt(900000) + 100000); // 6-digit OTP
        User user = userOptional.get();
        user.setResetToken(otp);
        user.setResetTokenExpiry(LocalDateTime.now().plusMinutes(10)); // OTP valid for 10 minutes
        userRepository.save(user);

        // Send OTP via email
        emailService.sendEmail(user.getEmail(), "Your OTP Code", "Your OTP is: " + otp);

        return ResponseEntity.ok(Collections.singletonMap("message", "OTP sent to your email."));
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOtp(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String otp = request.get("otp");
        Optional<User> userOptional = userRepository.findByEmail(email);

        if (userOptional.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
        }

        User user = userOptional.get();

        if (user.getResetToken() == null || !user.getResetToken().equals(otp)) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid OTP.");
        }

        if (user.getResetTokenExpiry().isBefore(LocalDateTime.now())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("OTP has expired.");
        }

        return ResponseEntity.ok(Collections.singletonMap("message", "OTP verified. You can reset your password."));
    }

    @PutMapping("/profile")
    public ResponseEntity<?> updateUserProfile(@RequestBody UpdateProfileRequest request, Authentication authentication) {
        String email = authentication.getName(); // ✅ Extract email from JWT
        Optional<User> userOptional = userRepository.findByEmail(email);

        if (userOptional.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
        }

        User user = userOptional.get();

        // ✅ Update user details
        if (request.getName() != null) user.setName(request.getName());
        if (request.getPhone() != null) user.setPhone(request.getPhone());

        userRepository.save(user); // ✅ Save updated user

        return ResponseEntity.ok("Profile updated successfully");
    }


    @PutMapping("/change-password")
    public ResponseEntity<?> changePassword(@RequestBody ChangePasswordRequest request, Authentication authentication) {
        String email = authentication.getName(); // Get the logged-in user's email
        Optional<User> userOptional = userService.findByEmail(email);

        if (userOptional.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
        }

        User user = userOptional.get();
        System.out.println("Stored Hashed Password: " + user.getPassword());
        System.out.println("Entered Old Password: " + request.getOldPassword());
        System.out.println("Match Result: " + passwordEncoder.matches(request.getOldPassword(), user.getPassword()));

        // ✅ Check if the old password is correct
        if (!passwordEncoder.matches(request.getOldPassword(), user.getPassword())) {
            return ResponseEntity.badRequest().body("Old password is incorrect");
        }

        // ✅ Set the new password (encrypted)
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userService.saveUser(user);

        return ResponseEntity.ok(Map.of("message", "Password changed successfully"));
    }
}
