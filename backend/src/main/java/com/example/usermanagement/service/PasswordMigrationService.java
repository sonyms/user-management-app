package com.example.usermanagement.service;

import com.example.usermanagement.model.User;
import com.example.usermanagement.repository.UserRepository;
import com.example.usermanagement.security.HybridPasswordEncoder;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service for handling password migration from BCrypt to Argon2id
 */
@Service
public class PasswordMigrationService {
    
    private static final Logger logger = LoggerFactory.getLogger(PasswordMigrationService.class);
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    /**
     * Check if a user's password needs to be upgraded and perform the upgrade
     * This should be called after successful authentication
     * 
     * @param username The username of the authenticated user
     * @param rawPassword The raw password that was used for authentication
     */
    @Transactional
    public void upgradePasswordIfNeeded(String username, String rawPassword) {
        try {
            User user = userRepository.findByUsername(username).orElse(null);
            if (user == null) {
                logger.warn("User not found for password upgrade: {}", username);
                return;
            }
            
            // Check if password needs upgrading
            if (passwordEncoder.upgradeEncoding(user.getPassword())) {
                logger.info("Upgrading password encoding for user: {} from {} to Argon2id", 
                    username, getPasswordAlgorithm(user.getPassword()));
                
                // Re-encode password with Argon2id
                String newEncodedPassword = passwordEncoder.encode(rawPassword);
                user.setPassword(newEncodedPassword);
                userRepository.save(user);
                
                logger.info("Password successfully upgraded for user: {}", username);
            }
        } catch (Exception e) {
            logger.error("Failed to upgrade password for user: {}", username, e);
            // Don't throw exception - password upgrade is not critical for login
        }
    }
    
    /**
     * Get statistics about password algorithms in use
     * 
     * @return Statistics object with algorithm counts
     */
    public PasswordStatistics getPasswordStatistics() {
        PasswordStatistics stats = new PasswordStatistics();
        
        for (User user : userRepository.findAll()) {
            String algorithm = getPasswordAlgorithm(user.getPassword());
            switch (algorithm) {
                case "Argon2id":
                    stats.argon2idCount++;
                    break;
                case "BCrypt":
                    stats.bcryptCount++;
                    break;
                default:
                    stats.unknownCount++;
                    break;
            }
        }
        
        return stats;
    }
    
    private String getPasswordAlgorithm(String encodedPassword) {
        if (passwordEncoder instanceof HybridPasswordEncoder) {
            return ((HybridPasswordEncoder) passwordEncoder).getAlgorithm(encodedPassword);
        }
        return "unknown";
    }
    
    /**
     * Statistics about password algorithms in use
     */
    public static class PasswordStatistics {
        public int argon2idCount = 0;
        public int bcryptCount = 0;
        public int unknownCount = 0;
        public int totalCount = 0;
        
        public void calculateTotal() {
            totalCount = argon2idCount + bcryptCount + unknownCount;
        }
        
        public double getArgon2idPercentage() {
            return totalCount > 0 ? (double) argon2idCount / totalCount * 100 : 0;
        }
        
        public double getBcryptPercentage() {
            return totalCount > 0 ? (double) bcryptCount / totalCount * 100 : 0;
        }
        
        @Override
        public String toString() {
            calculateTotal();
            return String.format("Password Statistics: Total=%d, Argon2id=%d (%.1f%%), BCrypt=%d (%.1f%%), Unknown=%d", 
                totalCount, argon2idCount, getArgon2idPercentage(), 
                bcryptCount, getBcryptPercentage(), unknownCount);
        }
    }
}
