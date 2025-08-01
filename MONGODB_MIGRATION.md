# MongoDB Migration Guide

The application has been successfully converted from H2 database to MongoDB. Here are the key changes and setup instructions:

## Changes Made

### 1. Dependencies Updated (pom.xml)
- Removed: `spring-boot-starter-data-jpa` and `h2` database
- Added: `spring-boot-starter-data-mongodb`

### 2. User Model Changes
- Changed ID type from `Long` to `String` (MongoDB uses ObjectId as String)
- Replaced JPA annotations with MongoDB annotations:
  - `@Entity` → `@Document(collection = "users")`
  - `@Table` → removed
  - `@Id` with `@GeneratedValue` → `@Id` (MongoDB auto-generates ObjectId)
  - `@Column` → removed (not needed in MongoDB)
  - `@CreationTimestamp` → `@CreatedDate`
  - `@UpdateTimestamp` → `@LastModifiedDate`
  - Added `@Indexed(unique = true)` for username and email

### 3. Repository Changes
- `UserRepository` now extends `MongoRepository<User, String>` instead of `JpaRepository<User, Long>`

### 4. Service and Controller Updates
- Updated method signatures to use `String id` instead of `Long id`
- Updated sorting logic to use creation date instead of ID comparison

### 5. Configuration
- Added `MongoConfig.java` to enable MongoDB auditing for `@CreatedDate` and `@LastModifiedDate`
- Updated `application.properties` for MongoDB configuration

## MongoDB Setup Instructions

### 1. Install MongoDB
Download and install MongoDB Community Server from: https://www.mongodb.com/try/download/community

### 2. Start MongoDB Service
**Windows:**
```powershell
net start MongoDB
```

**macOS/Linux:**
```bash
sudo systemctl start mongod
# or
brew services start mongodb-community
```

### 3. Verify MongoDB is Running
```bash
mongosh
# Should connect to MongoDB shell
```

### 4. Configuration
The application is configured to connect to:
- Host: `localhost`
- Port: `27017` (MongoDB default)
- Database: `usermanagement`

You can modify these settings in `application.properties`:
```properties
spring.data.mongodb.uri=mongodb://localhost:27017/usermanagement
```

### 5. Run the Application
```bash
cd backend
mvn spring-boot:run
```

## Data Migration Notes

- **New Installation**: The application will automatically create the `usermanagement` database and `users` collection
- **Existing Data**: If you have existing H2 data, you'll need to manually migrate it or recreate users through the application

## Default Admin User
The application should automatically create a default admin user with:
- Username: `admin`
- Password: `admin123`
- Role: `admin`

## MongoDB Features Enabled

1. **Automatic Indexing**: Unique indexes on username and email
2. **Auditing**: Automatic `createdAt` and `updatedAt` timestamps
3. **Flexible Schema**: MongoDB's document-based storage allows for easier schema evolution

## Verification

1. Start MongoDB service
2. Run the Spring Boot application
3. Check MongoDB collections:
   ```javascript
   use usermanagement
   show collections  // Should show 'users'
   db.users.find()   // Should show any created users
   ```

The application should now work with MongoDB instead of H2 database!
