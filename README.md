# 🏋️ AI Fitness System

A full-stack **AI-powered fitness platform** built with a microservice architecture. The system provides personalized fitness experiences with secure user management, JWT-based authentication, and a modern React frontend.

---

## 📐 Architecture Overview

```
┌─────────────────┐       ┌──────────────────┐       ┌──────────────────┐
│                 │       │                  │       │                  │
│    Frontend     │──────▶│   API Gateway    │──────▶│  User Service    │
│  (React + Vite) │       │   (Port 8080)    │       │  (Port 8081)     │
│                 │       │                  │       │                  │
└─────────────────┘       └──────────────────┘       └────────┬─────────┘
                                                              │
                                                     ┌────────▼─────────┐
                                                     │   MongoDB Atlas  │
                                                     │   (Cloud DB)     │
                                                     └──────────────────┘
```

---

## 🛠️ Tech Stack

| Layer         | Technology                                                        |
|---------------|-------------------------------------------------------------------|
| **Frontend**  | React 19, TypeScript, Vite 8                                      |
| **API Gateway**| Spring Cloud Gateway (WebFlux), Spring Boot 3.5                  |
| **User Service**| Spring Boot 3.5, Spring Security, JJWT 0.12                    |
| **Database**  | MongoDB Atlas (Cloud)                                             |
| **Language**   | Java 21, TypeScript                                              |
| **Build**     | Maven (Backend), npm + Vite (Frontend)                            |
| **API Docs**  | SpringDoc OpenAPI (Swagger UI)                                    |

---

## 📂 Project Structure

```
AI-Fitness-System/
│
├── Frontend/                          # React + TypeScript SPA
│   ├── src/
│   │   ├── App.tsx                    # Root application component
│   │   ├── main.tsx                   # Entry point
│   │   ├── App.css                    # Application styles
│   │   ├── index.css                  # Global styles
│   │   └── assets/                    # Static assets
│   ├── package.json
│   ├── vite.config.ts
│   └── tsconfig.json
│
├── api-gateway/                       # Spring Cloud Gateway
│   ├── src/main/java/.../
│   │   └── ApiGatewayApplication.java # Gateway entry point
│   ├── src/main/resources/
│   │   └── application.yaml          # Gateway config (port 8080)
│   └── pom.xml
│
├── user-service/                      # User Management Microservice
│   ├── src/main/java/com/aifitness/userservice/
│   │   ├── Controller/
│   │   │   ├── AuthController.java    # Auth endpoints (register/login/logout/refresh)
│   │   │   └── Controller.java        # User CRUD endpoints
│   │   ├── Service/
│   │   │   ├── AuthService.java       # Authentication business logic
│   │   │   └── Service.java           # User business logic
│   │   ├── Security/
│   │   │   ├── SecurityConfig.java    # Spring Security configuration
│   │   │   ├── CustomUserDetailService.java
│   │   │   └── JWT/
│   │   │       ├── JwtService.java    # JWT token generation & validation
│   │   │       └── AuthenticationFilter.java  # JWT request filter
│   │   ├── Entity/
│   │   │   ├── Entity.java            # User document model
│   │   │   └── RefreshToken.java      # Refresh token document model
│   │   ├── Repository/
│   │   │   ├── Repo.java              # User MongoDB repository
│   │   │   └── RefreshTokenRepository.java
│   │   ├── DTO/
│   │   │   ├── RequestDTO/
│   │   │   │   ├── LoginRequest.java
│   │   │   │   ├── RegisterRequest.java
│   │   │   │   ├── RefreshTokenRequest.java
│   │   │   │   └── UpdateProfileRequest.java
│   │   │   └── ResponseDTO/
│   │   │       ├── AuthResponse.java
│   │   │       └── UserResponse.java
│   │   ├── Enum/
│   │   │   ├── Role.java              # USER, ADMIN
│   │   │   ├── Gender.java
│   │   │   ├── Goal.java              # WEIGHT_LOSS, MUSCLE_GAIN, etc.
│   │   │   └── ActivityLevel.java
│   │   ├── Exception/
│   │   │   └── GlobalExceptionHandler.java
│   │   └── UserServiceApplication.java
│   ├── src/main/resources/
│   │   └── application.yaml           # DB config, JWT secrets, port
│   └── pom.xml
│
└── README.md
```

---

## 🔐 Authentication System

The platform uses a **dual-token authentication** strategy:

| Token          | Type     | Storage         | Lifetime    | Purpose                |
|----------------|----------|-----------------|-------------|------------------------|
| **Access Token** | JWT (HS512) | HTTP Cookie   | 15 minutes  | API request authorization |
| **Refresh Token**| Opaque UUID | MongoDB       | 7 days      | Obtain new access tokens  |

### Authentication Flow

```
  ┌──────┐                    ┌──────────┐                ┌─────────┐
  │Client│                    │User Svc  │                │MongoDB  │
  └──┬───┘                    └────┬─────┘                └────┬────┘
     │  POST /api/auth/login       │                           │
     │  {email, password}          │                           │
     │────────────────────────────▶│                           │
     │                             │  Validate credentials     │
     │                             │──────────────────────────▶│
     │                             │◀──────────────────────────│
     │                             │                           │
     │                             │  Generate JWT access token │
     │                             │  Generate refresh token    │
     │                             │  Store refresh token       │
     │                             │──────────────────────────▶│
     │                             │                           │
     │  Set-Cookie: accessToken    │                           │
     │  Body: {refreshToken, user} │                           │
     │◀────────────────────────────│                           │
     │                             │                           │
     │  GET /api/users/{id}        │                           │
     │  Cookie: accessToken=xxx    │                           │
     │────────────────────────────▶│                           │
     │                             │  JWT Filter validates     │
     │  200 OK {user data}         │                           │
     │◀────────────────────────────│                           │
```

---

## 🔌 API Endpoints

### Auth Endpoints (`/api/auth`)

| Method | Endpoint            | Auth Required | Description                           |
|--------|---------------------|---------------|---------------------------------------|
| POST   | `/api/auth/register`| ❌            | Register a new user                   |
| POST   | `/api/auth/login`   | ❌            | Login with email & password           |
| POST   | `/api/auth/refresh` | ❌            | Get new access token using refresh token |
| POST   | `/api/auth/logout`  | ✅            | Logout (deletes refresh tokens)       |

### User Endpoints (`/api/users`)

| Method | Endpoint              | Auth Required | Description                     |
|--------|-----------------------|---------------|---------------------------------|
| GET    | `/api/users/all`      | ✅ ADMIN only | Get all users                   |
| GET    | `/api/users/{id}`     | ✅            | Get user by ID                  |
| GET    | `/api/users/goal/{goal}` | ✅         | Get users by fitness goal       |

### API Documentation

Swagger UI is available at: `http://localhost:8081/swagger-ui.html`

---

## 🏃 Getting Started

### Prerequisites

- **Java 21** (JDK)
- **Maven 3.8+**
- **Node.js 18+** & **npm**
- **MongoDB Atlas** account (or local MongoDB)

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/AI-Fitness-System.git
cd AI-Fitness-System
```

### 2. Start the User Service

```bash
cd user-service

# Update MongoDB connection in src/main/resources/application.yaml
# Update JWT secret key

./mvnw spring-boot:run
# Runs on http://localhost:8081
```

### 3. Start the API Gateway

```bash
cd api-gateway
./mvnw spring-boot:run
# Runs on http://localhost:8080
```

### 4. Start the Frontend

```bash
cd Frontend
npm install
npm run dev
# Runs on http://localhost:5173
```

---

## ⚙️ Configuration

### User Service (`user-service/src/main/resources/application.yaml`)

```yaml
spring:
  application:
    name: user-service
  data:
    mongodb:
      uri: mongodb+srv://<username>:<password>@<cluster>.mongodb.net/
      database: user_db

server:
  port: 8081

jwt:
  secret: <your-base64-encoded-secret-key>
  accessTokenExpiration: 900000      # 15 minutes
  refreshTokenExpiration: 604800000  # 7 days
```

> ⚠️ **Important**: Never commit real credentials. Use environment variables or a secrets manager in production.

---

## 📊 Data Models

### User Document (`users` collection)

```json
{
  "_id": "ObjectId",
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "$2a$12$...",
  "phone": "+1234567890",
  "gender": "MALE",
  "role": "USER",
  "height": 180.0,
  "weight": 75.5,
  "age": 28,
  "activityLevel": "MODERATELY_ACTIVE",
  "goal": "MUSCLE_GAIN"
}
```

### Refresh Token Document (`refresh_tokens` collection)

```json
{
  "_id": "ObjectId",
  "userId": "user-object-id",
  "token": "uuid-v4-string",
  "createdAt": "2026-07-15T10:00:00Z",
  "expiresAt": "2026-07-22T10:00:00Z"
}
```

---

## 🛡️ Security Features

- 🔑 **JWT (HS512)** signed access tokens with claims (userId, email, role)
- 🍪 **HTTP Cookie** based access token delivery (prevents XSS exposure)
- 🔄 **Refresh token rotation** — old tokens are deleted on re-login
- 🔒 **BCrypt** password hashing (strength 12)
- 🚫 **Stateless sessions** — no server-side session state
- ✅ **Role-based access control** — `USER` and `ADMIN` roles
- 📋 **Input validation** — Jakarta Bean Validation on all request DTOs

---

## 🚀 Roadmap

- [x] User registration & login (email/password)
- [x] JWT access token + refresh token authentication
- [x] Role-based authorization (USER / ADMIN)
- [x] API Gateway setup
- [x] React + TypeScript frontend scaffolding
- [ ] OAuth2 login (Google)
- [ ] AI-powered workout plan generation
- [ ] AI-powered diet plan generation
- [ ] Workout tracking & progress analytics
- [ ] Notification service
- [ ] Service discovery (Eureka)
- [ ] Docker containerization
- [ ] CI/CD pipeline

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License.
