package com.example.usermanagement.service;

import com.example.usermanagement.model.User;
import com.example.usermanagement.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.Map;
import java.util.HashMap;

@Service
public class UserService {

    private final UserRepository repository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;

    public UserService(UserRepository repository) {
        this.repository = repository;
    }

    public List<User> getAllUsers() {
        return repository.findAll();
    }

    public User createUser(User user) {
        // Hash password before saving
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        return repository.save(user);
    }

    public Optional<User> getUserById(String id) {
        return repository.findById(id);
    }

    public User updateUser(String id, User user) {
        user.setId(id);
        // Only hash password if it's being changed
        Optional<User> existingUser = repository.findById(id);
        if (existingUser.isPresent()) {
            String existingPassword = existingUser.get().getPassword();
            if (!user.getPassword().equals(existingPassword)) {
                // Password is being changed, hash it
                user.setPassword(passwordEncoder.encode(user.getPassword()));
            }
        }
        return repository.save(user);
    }

    public void deleteUser(String id) {
        repository.deleteById(id);
    }

    public User authenticateUser(String username, String password) {
        Optional<User> userOpt = repository.findByUsername(username);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            // Use BCrypt to verify password
            if (passwordEncoder.matches(password, user.getPassword())) {
                return user;
            }
        }
        return null;
    }

    public Optional<User> findByUsername(String username) {
        return repository.findByUsername(username);
    }

    public List<User> getUsersByRole(String role) {
        return repository.findByRole(role);
    }
    
    public void resetPassword(String currentPassword, String newPassword) {
        // In a real application, you would get the current user from security context
        // For this demo, we'll find by current password (not recommended for production)
        List<User> allUsers = repository.findAll();
        User currentUser = null;
        
        for (User user : allUsers) {
            if (currentPassword.equals(user.getPassword())) {
                currentUser = user;
                break;
            }
        }
        
        if (currentUser == null) {
            throw new IllegalArgumentException("Current password is incorrect");
        }
        
        // Validate new password
        if (newPassword == null || newPassword.trim().isEmpty()) {
            throw new IllegalArgumentException("New password cannot be empty");
        }
        
        if (newPassword.length() < 6) {
            throw new IllegalArgumentException("New password must be at least 6 characters long");
        }
        
        if (currentPassword.equals(newPassword)) {
            throw new IllegalArgumentException("New password must be different from current password");
        }
        
        // Update password
        currentUser.setPassword(newPassword);
        repository.save(currentUser);
    }
    
    // Get all users with pagination and optional sorting
    public Map<String, Object> getAllUsersWithPagination(int page, int size, String sortBy, String sortDir) {
        List<User> allUsers = repository.findAll();
        return paginateAndSortUsers(allUsers, page, size, sortBy, sortDir);
    }
    
    // Backward compatibility - without sorting
    public Map<String, Object> getAllUsersWithPagination(int page, int size) {
        return getAllUsersWithPagination(page, size, null, "asc");
    }
    
    // Get users by role with pagination and optional sorting
    public Map<String, Object> getUsersByRoleWithPagination(String role, int page, int size, String sortBy, String sortDir) {
        List<User> roleUsers = repository.findByRole(role);
        return paginateAndSortUsers(roleUsers, page, size, sortBy, sortDir);
    }
    
    // Backward compatibility - without sorting
    public Map<String, Object> getUsersByRoleWithPagination(String role, int page, int size) {
        return getUsersByRoleWithPagination(role, page, size, null, "asc");
    }
    
    // Helper method to paginate and sort users
    private Map<String, Object> paginateAndSortUsers(List<User> users, int page, int size, String sortBy, String sortDir) {
        // Sort users if sortBy is provided
        if (sortBy != null && !sortBy.isEmpty()) {
            users.sort((u1, u2) -> {
                Object field1 = getFieldValue(u1, sortBy);
                Object field2 = getFieldValue(u2, sortBy);
                
                if (field1 == null && field2 == null) return 0;
                if (field1 == null) return 1;
                if (field2 == null) return -1;
                
                int comparison = 0;
                if (field1 instanceof Comparable && field2 instanceof Comparable) {
                    @SuppressWarnings("unchecked")
                    Comparable<Object> comp1 = (Comparable<Object>) field1;
                    comparison = comp1.compareTo(field2);
                }
                
                return "desc".equalsIgnoreCase(sortDir) ? -comparison : comparison;
            });
        }
        
        return paginateUsers(users, page, size);
    }
    
    // Helper method to get field value for sorting
    private Object getFieldValue(User user, String fieldName) {
        try {
            switch (fieldName.toLowerCase()) {
                case "id":
                    return user.getId();
                case "name":
                    return user.getName();
                case "email":
                    return user.getEmail();
                case "role":
                    return user.getRole();
                case "createdat":
                case "created_at":
                    return user.getCreatedAt();
                case "updatedat":
                case "updated_at":
                    return user.getUpdatedAt();
                default:
                    return null;
            }
        } catch (Exception e) {
            return null;
        }
    }
    
    // Helper method to paginate users
    private Map<String, Object> paginateUsers(List<User> users, int page, int size) {
        int totalUsers = users.size();
        int totalPages = (int) Math.ceil((double) totalUsers / size);
        
        // Calculate start and end indices
        int startIndex = (page - 1) * size;
        int endIndex = Math.min(startIndex + size, totalUsers);
        
        // Get users for current page
        List<User> pageUsers = users.subList(startIndex, endIndex);
        
        // Create response map
        Map<String, Object> response = new HashMap<>();
        response.put("users", pageUsers);
        response.put("currentPage", page);
        response.put("totalPages", totalPages);
        response.put("totalUsers", totalUsers);
        response.put("pageSize", size);
        
        return response;
    }
    
    // Get recent users (last N users by creation date)
    public List<User> getRecentUsers(int limit) {
        List<User> allUsers = repository.findAll();
        // Sort by creation date descending to get most recent users first
        // Handle null createdAt values by putting them at the end
        allUsers.sort((u1, u2) -> {
            if (u1.getCreatedAt() == null && u2.getCreatedAt() == null) return 0;
            if (u1.getCreatedAt() == null) return 1;
            if (u2.getCreatedAt() == null) return -1;
            return u2.getCreatedAt().compareTo(u1.getCreatedAt());
        });
        // Return only the requested number of users
        return allUsers.stream().limit(limit).collect(java.util.stream.Collectors.toList());
    }
    
    // Get recent users by role (last N users by creation date)
    public List<User> getRecentUsersByRole(String role, int limit) {
        List<User> roleUsers = repository.findByRole(role);
        // Sort by creation date descending to get most recent users first
        // Handle null createdAt values by putting them at the end
        roleUsers.sort((u1, u2) -> {
            if (u1.getCreatedAt() == null && u2.getCreatedAt() == null) return 0;
            if (u1.getCreatedAt() == null) return 1;
            if (u2.getCreatedAt() == null) return -1;
            return u2.getCreatedAt().compareTo(u1.getCreatedAt());
        });
        // Return only the requested number of users
        return roleUsers.stream().limit(limit).collect(java.util.stream.Collectors.toList());
    }
}