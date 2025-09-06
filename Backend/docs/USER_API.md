# User API Documentation

## Base URL
```
http://localhost:9705/user
```

## Authentication
Most endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

## Endpoints

### Public Endpoints

#### 1. Register User
- **POST** `/register`
- **Description**: Register a new user
- **Body**:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "Password123",
  "phone": "1234567890",
  "location": "New York"
}
```
- **Response**:
```json
{
  "success": true,
  "message": "User registered successfully",
  "user": {
    "id": "userId",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "location": "New York",
    "phone": "1234567890",
    "ecoPoints": 0,
    "quizScore": 0,
    "status": "active"
  }
}
```

#### 2. Login User
- **POST** `/login`
- **Description**: Authenticate user and get JWT token
- **Body**:
```json
{
  "email": "john@example.com",
  "password": "Password123"
}
```
- **Response**:
```json
{
  "success": true,
  "message": "Login successful",
  "token": "jwt_token_here",
  "user": {
    "id": "userId",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user"
  }
}
```

### Protected Endpoints (Require Authentication)

#### 3. Get Current User Profile
- **GET** `/profile/me`
- **Description**: Get current logged-in user's profile
- **Headers**: `Authorization: Bearer <token>`
- **Response**:
```json
{
  "success": true,
  "user": {
    "id": "userId",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "ecoPoints": 150,
    "quizScore": 80
  }
}
```

#### 4. Get User by ID
- **GET** `/:id`
- **Description**: Get specific user by ID
- **Headers**: `Authorization: Bearer <token>`
- **Response**:
```json
{
  "id": "userId",
  "name": "John Doe",
  "email": "john@example.com",
  "role": "user",
  "location": "New York",
  "phone": "1234567890",
  "ecoPoints": 150,
  "status": "active"
}
```

#### 5. Update User Profile
- **PUT** `/:id`
- **Description**: Update user profile
- **Headers**: `Authorization: Bearer <token>`
- **Body**:
```json
{
  "name": "John Smith",
  "phone": "9876543210",
  "location": "California"
}
```
- **Response**:
```json
{
  "message": "User updated",
  "user": {
    "id": "userId",
    "name": "John Smith",
    "email": "john@example.com",
    "location": "California",
    "phone": "9876543210"
  }
}
```

#### 6. Change Password
- **PUT** `/:id/password`
- **Description**: Change user password
- **Headers**: `Authorization: Bearer <token>`
- **Body**:
```json
{
  "currentPassword": "oldPassword123",
  "newPassword": "newPassword123"
}
```
- **Response**:
```json
{
  "success": true,
  "message": "Password updated successfully"
}
```

### Admin-Only Endpoints

#### 7. Get All Users
- **GET** `/`
- **Description**: Get all users (Admin only)
- **Headers**: `Authorization: Bearer <admin_token>`
- **Response**:
```json
[
  {
    "id": "userId1",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "status": "active"
  },
  {
    "id": "userId2",
    "name": "Jane Smith",
    "email": "jane@example.com",
    "role": "admin",
    "status": "active"
  }
]
```

#### 8. Search Users
- **GET** `/search/users?query=john&page=1&limit=10`
- **Description**: Search users by name or email (Admin only)
- **Headers**: `Authorization: Bearer <admin_token>`
- **Query Parameters**:
  - `query` (required): Search term
  - `page` (optional): Page number (default: 1)
  - `limit` (optional): Results per page (default: 10)
- **Response**:
```json
{
  "success": true,
  "users": [
    {
      "id": "userId",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "user"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 1,
    "pages": 1
  }
}
```

#### 9. Get Users by Role
- **GET** `/role/:role`
- **Description**: Get users by specific role (Admin only)
- **Headers**: `Authorization: Bearer <admin_token>`
- **Parameters**: `role` - user role ("user" or "admin")
- **Response**:
```json
[
  {
    "id": "userId",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "status": "active"
  }
]
```

#### 10. Toggle User Status
- **PATCH** `/:id/status`
- **Description**: Toggle user active/inactive status (Admin only)
- **Headers**: `Authorization: Bearer <admin_token>`
- **Response**:
```json
{
  "message": "Status toggled",
  "status": "inactive"
}
```

#### 11. Delete User
- **DELETE** `/:id`
- **Description**: Delete user (Admin only)
- **Headers**: `Authorization: Bearer <admin_token>`
- **Response**:
```json
{
  "message": "User deleted"
}
```

## Error Responses

### Validation Error (400)
```json
{
  "success": false,
  "message": "Validation errors",
  "errors": [
    {
      "field": "email",
      "message": "Please enter a valid email address",
      "value": "invalid-email"
    }
  ]
}
```

### Authentication Error (401)
```json
{
  "success": false,
  "message": "Access denied. No valid token provided."
}
```

### Authorization Error (403)
```json
{
  "success": false,
  "message": "Access denied. Admin privileges required."
}
```

### Not Found Error (404)
```json
{
  "success": false,
  "message": "User not found"
}
```

### Server Error (500)
```json
{
  "success": false,
  "message": "Server error",
  "error": "Error details"
}
```

## Validation Rules

### Registration
- **name**: 2-50 characters, letters and spaces only
- **email**: Valid email format
- **password**: Min 6 characters, must contain uppercase, lowercase, and number
- **phone**: Exactly 10 digits (optional)
- **location**: Max 100 characters (optional)

### Login
- **email**: Valid email format
- **password**: Required

### Update Profile
- **name**: 2-50 characters, letters and spaces only (optional)
- **phone**: Exactly 10 digits (optional)
- **location**: Max 100 characters (optional)
- **profileImage**: Valid URL (optional)

### Password Change
- **currentPassword**: Required
- **newPassword**: Min 6 characters, must contain uppercase, lowercase, and number

## Available Endpoints Summary

### Public Routes (No Authentication Required)
- `POST /register` - Register new user
- `POST /login` - User login

### Protected Routes (Authentication Required)
- `GET /profile/me` - Get current user profile
- `GET /:id` - Get user by ID
- `PUT /:id` - Update user profile
- `PUT /:id/password` - Change password

### Admin Routes (Admin Authentication Required)
- `GET /` - Get all users
- `GET /search/users` - Search users
- `GET /role/:role` - Get users by role
- `PATCH /:id/status` - Toggle user status
- `DELETE /:id` - Delete user

## Notes
- All responses include appropriate HTTP status codes
- Password hashing is handled automatically by the pre-save hook
- JWT tokens expire after 7 days
- Admin routes require both authentication and admin role verification
- All timestamps are in ISO 8601 format
