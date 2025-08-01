package com.example.usermanagement.config;

import com.example.usermanagement.model.User;
import com.example.usermanagement.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        // Check if admin user already exists
        if (userRepository.findByUsername("sony").isEmpty()) {
            // Create default admin user
            User adminUser = new User(
                "Sony M S",
                "sonyms@gmail.com", 
                "sony", 
                passwordEncoder.encode("admin123"), // Hash the password
                "admin"
            );
            
            userRepository.save(adminUser);
            System.out.println("===============================================");
            System.out.println("Default admin user created successfully!");
            System.out.println("Username: sony");
            System.out.println("Password: admin123");
            System.out.println("Email: sonyms@gmail.com");
            System.out.println("Role: admin");
            System.out.println("===============================================");
            System.out.println("IMPORTANT: Please change the password after first login!");
            System.out.println("===============================================");
        } else {
            System.out.println("Admin user already exists - skipping creation.");
        }

        // Create some demo users if they don't exist
        if (userRepository.findByUsername("john.doe").isEmpty()) {
            User demoUser1 = new User(
                "John Doe",
                "john.doe@example.com",
                "john.doe",
                passwordEncoder.encode("password123"),
                "user"
            );
            userRepository.save(demoUser1);
            System.out.println("Demo user created: john.doe / password123");
        }

        if (userRepository.findByUsername("jane.smith").isEmpty()) {
            User demoUser2 = new User(
                "Jane Smith",
                "jane.smith@example.com",
                "jane.smith",
                passwordEncoder.encode("password123"),
                "user"
            );
            userRepository.save(demoUser2);
            System.out.println("Demo user created: jane.smith / password123");
        }

        // Additional demo users for testing pagination and sorting
        if (userRepository.findByUsername("mike.johnson").isEmpty()) {
            User demoUser3 = new User(
                "Mike Johnson",
                "mike.johnson@example.com",
                "mike.johnson",
                passwordEncoder.encode("password123"),
                "user"
            );
            userRepository.save(demoUser3);
            System.out.println("Demo user created: mike.johnson / password123");
        }

        if (userRepository.findByUsername("sarah.wilson").isEmpty()) {
            User demoUser4 = new User(
                "Sarah Wilson",
                "sarah.wilson@example.com",
                "sarah.wilson",
                passwordEncoder.encode("password123"),
                "user"
            );
            userRepository.save(demoUser4);
            System.out.println("Demo user created: sarah.wilson / password123");
        }

        if (userRepository.findByUsername("david.brown").isEmpty()) {
            User demoUser5 = new User(
                "David Brown",
                "david.brown@example.com",
                "david.brown",
                passwordEncoder.encode("password123"),
                "user"
            );
            userRepository.save(demoUser5);
            System.out.println("Demo user created: david.brown / password123");
        }

        if (userRepository.findByUsername("emily.davis").isEmpty()) {
            User demoUser6 = new User(
                "Emily Davis",
                "emily.davis@example.com",
                "emily.davis",
                passwordEncoder.encode("password123"),
                "user"
            );
            userRepository.save(demoUser6);
            System.out.println("Demo user created: emily.davis / password123");
        }

        if (userRepository.findByUsername("alex.martinez").isEmpty()) {
            User demoUser7 = new User(
                "Alex Martinez",
                "alex.martinez@example.com",
                "alex.martinez",
                passwordEncoder.encode("password123"),
                "user"
            );
            userRepository.save(demoUser7);
            System.out.println("Demo user created: alex.martinez / password123");
        }

        System.out.println("===============================================");
        System.out.println("All demo users created successfully!");
        System.out.println("Total users: " + userRepository.count());
        System.out.println("===============================================");
    }
}
