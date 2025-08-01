# User Management Application

A full-stack user management application with modern authentication, role-based access control, and MongoDB integration.

## 🚀 Features

- **Authentication & Authorization**: JWT-based login with role-based access (Admin/User)
- **User Management**: Complete CRUD operations for user accounts
- **Dashboard**: Real-time analytics and recent user activity
- **Responsive Design**: Modern UI with Tailwind CSS
- **Database**: MongoDB with automatic data initialization
- **Security**: Advanced password hashing (Argon2id) with BCrypt migration support

## 🛠 Tech Stack

### Backend
- **Spring Boot 3.1.4** - Java 17
- **Spring Security** - Authentication & Authorization  
- **MongoDB** - NoSQL Database
- **JWT** - Token-based authentication
- **Maven** - Build tool

### Frontend
- **React 19** - Modern UI framework
- **TypeScript** - Type safety
- **Vite 7** - Fast development server
- **Tailwind CSS 4** - Utility-first styling
- **Axios** - HTTP client

## 📋 Requirements

- **Java 17+**
- **Maven 3.8+**
- **Node.js 22+**
- **MongoDB 4.4+**

## 🔧 Setup & Installation

### 1. Database Setup
```bash
# Install and start MongoDB
# Windows: Download from https://www.mongodb.com/try/download/community
# macOS: brew install mongodb-community
# Linux: sudo apt-get install mongodb

# Start MongoDB service
net start MongoDB  # Windows
brew services start mongodb-community  # macOS
sudo systemctl start mongod  # Linux
```

### 2. Backend Setup
```bash
cd backend
mvn clean install
mvn spring-boot:run
```

The backend will run on `http://localhost:8080`

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

The frontend will run on `http://localhost:3000`

## 🔐 Default Credentials

**Admin User:**
- Username: `sony`
- Password: `admin123`
- Email: `sonyms@gmail.com`

**Demo Users:**
- Username: `john.doe` / Password: `password123`
- Username: `jane.smith` / Password: `password123`
- (+ 5 more demo users)

## 📊 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

### Users Management
- `GET /api/users` - Get all users (paginated)
- `GET /api/users/recent` - Get recent users
- `POST /api/users` - Create new user
- `PUT /api/users/{id}` - Update user
- `DELETE /api/users/{id}` - Delete user

## 🗂 Project Structure

```
├── backend/                 # Spring Boot backend
│   ├── src/main/java/
│   │   └── com/example/usermanagement/
│   │       ├── controller/  # REST controllers
│   │       ├── service/     # Business logic
│   │       ├── repository/  # Data access layer
│   │       ├── model/       # Entity models
│   │       ├── config/      # Configuration classes
│   │       └── security/    # Security configuration
│   └── pom.xml             # Maven dependencies
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── services/       # API services
│   │   ├── types/          # TypeScript types
│   │   └── assets/         # Static assets
│   └── package.json        # NPM dependencies
└── README.md
```

## 🔄 MongoDB Migration

This project has been converted from H2 to MongoDB. See `MONGODB_MIGRATION.md` for details.

## 🚦 Running the Application

1. Start MongoDB service
2. Run backend: `mvn spring-boot:run`
3. Run frontend: `npm run dev`
4. Access application at `http://localhost:3000`
5. Login with admin credentials

## 🎯 Features Overview

- **Dashboard**: User statistics and recent activity
- **User Management**: Add, edit, delete users with role management
- **Authentication**: Secure JWT-based login system
- **Responsive Design**: Works on desktop and mobile
- **Real-time Updates**: Automatic data refresh
- **Error Handling**: Comprehensive error messages and validation

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is open source and available under the MIT License.
