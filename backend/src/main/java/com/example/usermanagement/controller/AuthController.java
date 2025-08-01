package com.example.usermanagement.controller;

import com.example.usermanagement.security.JwtUtil;
import com.example.usermanagement.security.CustomUserDetailsService;
import com.example.usermanagement.model.User;
import com.example.usermanagement.service.UserService;
import com.example.usermanagement.service.PasswordMigrationService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
public class AuthController {

    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private CustomUserDetailsService userDetailsService;

    @Autowired
    private UserService userService;

    @Autowired
    private PasswordMigrationService passwordMigrationService;

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest loginRequest) {
        logger.info("Login attempt for username: {}", loginRequest.getUsername());
        
        try {
            authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getUsername(), loginRequest.getPassword())
            );
            logger.info("Authentication successful for user: {}", loginRequest.getUsername());
        } catch (BadCredentialsException e) {
            logger.warn("Authentication failed for user: {}", loginRequest.getUsername());
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Invalid credentials");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        } catch (Exception e) {
            logger.error("Authentication error for user: {}", loginRequest.getUsername(), e);
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Authentication failed: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }

        try {
            logger.info("Loading user details for: {}", loginRequest.getUsername());
            logger.info("User details loaded successfully");
            
            // Get user info for response
            logger.info("Finding user by username: {}", loginRequest.getUsername());
            User user = userService.findByUsername(loginRequest.getUsername()).orElse(null);
            
            if (user == null) {
                logger.error("User not found in database: {}", loginRequest.getUsername());
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "User not found");
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
            }
            
            logger.info("Generating JWT token with role: {}", user.getRole());
            final String jwt = jwtUtil.generateToken(user.getUsername(), user.getRole());
            logger.info("JWT token generated successfully");
            
            // Upgrade password encoding if needed (BCrypt -> Argon2id migration)
            logger.info("Checking if password upgrade is needed for user: {}", user.getUsername());
            passwordMigrationService.upgradePasswordIfNeeded(user.getUsername(), loginRequest.getPassword());
            
            logger.info("Creating user response for: {}", user.getUsername());
            UserResponse userResponse = new UserResponse(user);
            logger.info("User response created successfully");
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Login successful");
            response.put("token", jwt);
            response.put("user", userResponse);
            
            logger.info("Login completed successfully for user: {}", loginRequest.getUsername());
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            logger.error("Error after authentication for user: {}", loginRequest.getUsername(), e);
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Login processing failed: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @PostMapping("/validate")
    public ResponseEntity<?> validateToken(@RequestHeader("Authorization") String token) {
        try {
            if (token.startsWith("Bearer ")) {
                String jwtToken = token.substring(7);
                if (jwtUtil.validateToken(jwtToken)) {
                    String username = jwtUtil.extractUsername(jwtToken);
                    String role = jwtUtil.extractRole(jwtToken);
                    
                    Map<String, Object> response = new HashMap<>();
                    response.put("success", true);
                    response.put("message", "Token valid");
                    response.put("username", username);
                    response.put("role", role);
                    
                    return ResponseEntity.ok(response);
                }
            }
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Invalid token");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Token validation failed");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        }
    }

    @GetMapping("/password-stats")
    public ResponseEntity<?> getPasswordStatistics() {
        try {
            PasswordMigrationService.PasswordStatistics stats = passwordMigrationService.getPasswordStatistics();
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Password statistics retrieved");
            response.put("statistics", Map.of(
                "totalUsers", stats.totalCount,
                "argon2idCount", stats.argon2idCount,
                "bcryptCount", stats.bcryptCount,
                "unknownCount", stats.unknownCount,
                "argon2idPercentage", Math.round(stats.getArgon2idPercentage() * 100.0) / 100.0,
                "bcryptPercentage", Math.round(stats.getBcryptPercentage() * 100.0) / 100.0,
                "migrationComplete", stats.bcryptCount == 0
            ));
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Failed to retrieve password statistics: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    // Inner classes for request/response
    public static class LoginRequest {
        private String username;
        private String password;

        public String getUsername() {
            return username;
        }

        public void setUsername(String username) {
            this.username = username;
        }

        public String getPassword() {
            return password;
        }

        public void setPassword(String password) {
            this.password = password;
        }
    }

    public static class UserResponse {
        private String id;
        private String name;
        private String email;
        private String username;
        private String role;

        public UserResponse(User user) {
            this.id = user.getId();
            this.name = user.getName();
            this.email = user.getEmail();
            this.username = user.getUsername();
            this.role = user.getRole();
        }

        public String getId() {
            return id;
        }

        public String getName() {
            return name;
        }

        public String getEmail() {
            return email;
        }

        public String getUsername() {
            return username;
        }
        
        public String getRole() {
            return role;
        }
    }
}
