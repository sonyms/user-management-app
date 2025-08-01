package com.example.usermanagement.security;

import org.springframework.security.crypto.argon2.Argon2PasswordEncoder;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

/**
 * Hybrid password encoder that supports both BCrypt (legacy) and Argon2id (new).
 * This allows for gradual migration from BCrypt to Argon2id.
 * 
 * - BCrypt passwords are identified by the $2a$, $2b$, or $2y$ prefix
 * - Argon2id passwords are identified by the $argon2id$ prefix
 * - New passwords are encoded with Argon2id
 * - Existing BCrypt passwords continue to work during migration
 */
public class HybridPasswordEncoder implements PasswordEncoder {
    
    private final PasswordEncoder argon2Encoder;
    private final PasswordEncoder bcryptEncoder;
    
    public HybridPasswordEncoder() {
        // Use Argon2id with Spring Security defaults (secure configuration)
        this.argon2Encoder = Argon2PasswordEncoder.defaultsForSpringSecurity_v5_8();
        this.bcryptEncoder = new BCryptPasswordEncoder();
    }
    
    @Override
    public String encode(CharSequence rawPassword) {
        // Always encode new passwords with Argon2id
        return argon2Encoder.encode(rawPassword);
    }
    
    @Override
    public boolean matches(CharSequence rawPassword, String encodedPassword) {
        if (encodedPassword == null || rawPassword == null) {
            return false;
        }
        
        // Check if it's an Argon2id hash
        if (encodedPassword.startsWith("$argon2id$")) {
            return argon2Encoder.matches(rawPassword, encodedPassword);
        }
        
        // Check if it's a BCrypt hash (legacy support)
        if (encodedPassword.startsWith("$2a$") || 
            encodedPassword.startsWith("$2b$") || 
            encodedPassword.startsWith("$2y$")) {
            return bcryptEncoder.matches(rawPassword, encodedPassword);
        }
        
        // Unknown format - reject
        return false;
    }
    
    @Override
    public boolean upgradeEncoding(String encodedPassword) {
        // Upgrade BCrypt passwords to Argon2id when user logs in
        return encodedPassword.startsWith("$2a$") || 
               encodedPassword.startsWith("$2b$") || 
               encodedPassword.startsWith("$2y$");
    }
    
    /**
     * Get information about the password encoding algorithm used
     * @param encodedPassword The encoded password hash
     * @return Algorithm name or "unknown"
     */
    public String getAlgorithm(String encodedPassword) {
        if (encodedPassword == null) {
            return "unknown";
        }
        
        if (encodedPassword.startsWith("$argon2id$")) {
            return "Argon2id";
        }
        
        if (encodedPassword.startsWith("$2a$") || 
            encodedPassword.startsWith("$2b$") || 
            encodedPassword.startsWith("$2y$")) {
            return "BCrypt";
        }
        
        return "unknown";
    }
}
