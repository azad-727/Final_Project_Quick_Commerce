package com.asap.backend;

public class ResetPasswordRequest {
    private String email;  // ✅ Add this field
    private String newPassword;

    // ✅ Getters and Setters
    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getNewPassword() {
        return newPassword;
    }

    public void setNewPassword(String newPassword) {
        this.newPassword = newPassword;
    }
}
