package com.asap.backend.controller;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/admin")
public class AdminController {

    @GetMapping("/dashboard")
    @PreAuthorize("hasRole('ADMIN')")  // ✅ Only ADMIN can access this
    public String adminDashboard() {
        return "Welcome to the Admin Dashboard!";
    }
}
