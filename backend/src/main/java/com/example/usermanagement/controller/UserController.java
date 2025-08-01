package com.example.usermanagement.controller;

import com.example.usermanagement.model.User;
import com.example.usermanagement.service.UserService;
import com.example.usermanagement.dto.PasswordResetRequest;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;

import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
public class UserController {

    private final UserService service;

    public UserController(UserService service) {
        this.service = service;
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('USER')")
    public Map<String, Object> getUsers(
            @RequestParam(required = false) String userRole,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "4") int size,
            @RequestParam(required = false) String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir) {
        
        if ("user".equals(userRole)) {
            // Normal users should only see other normal users (not admins)
            return service.getUsersByRoleWithPagination("user", page, size, sortBy, sortDir);
        } else {
            // Admin users can see all users
            return service.getAllUsersWithPagination(page, size, sortBy, sortDir);
        }
    }

    @GetMapping("/recent")
    @PreAuthorize("hasRole('ADMIN') or hasRole('USER')")
    public List<User> getRecentUsers(@RequestParam(required = false) String userRole) {
        if ("user".equals(userRole)) {
            // Get recent users with 'user' role only
            return service.getRecentUsersByRole("user", 5);
        } else if ("admin".equals(userRole)) {
            // Get recent users with 'admin' role only
            return service.getRecentUsersByRole("admin", 5);
        } else {
            // Get all recent users (default behavior for dashboard)
            return service.getRecentUsers(5);
        }
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public User createUser(@Valid @RequestBody User user) {
        return service.createUser(user);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public User updateUser(@PathVariable String id, @Valid @RequestBody User user) {
        return service.updateUser(id, user);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public void deleteUser(@PathVariable String id) {
        service.deleteUser(id);
    }
    
    @PostMapping("/reset-password")
    @PreAuthorize("hasRole('ADMIN') or hasRole('USER')")
    public ResponseEntity<String> resetPassword(@Valid @RequestBody PasswordResetRequest request) {
        try {
            service.resetPassword(request.getCurrentPassword(), request.getNewPassword());
            return ResponseEntity.ok("Password updated successfully");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}