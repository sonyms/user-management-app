package com.example.usermanagement.dto;

public class PasswordResetRequest {
    private String currentPassword;
    private String newPassword;
    
    // Default constructor
    public PasswordResetRequest() {}
    
    // Constructor with parameters
    public PasswordResetRequest(String currentPassword, String newPassword) {
        this.currentPassword = currentPassword;
        this.newPassword = newPassword;
    }
    
    // Getters and setters
    public String getCurrentPassword() {
        return currentPassword;
    }
    
    public void setCurrentPassword(String currentPassword) {
        this.currentPassword = currentPassword;
    }
    
    public String getNewPassword() {
        return newPassword;
    }
    
    public void setNewPassword(String newPassword) {
        this.newPassword = newPassword;
    }
}
