# API Testing Guide

This document shows how to test all the authentication endpoints.

## Prerequisites

- Server running on `http://localhost:5000`
- MongoDB running
- curl or Postman installed

## Authentication Endpoints

### 1. Register IIIT Participant

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student@iiit.ac.in",
    "password": "password123",
    "firstName": "John",
    "lastName": "Doe",
    "participantType": "IIIT",
    "contactNumber": "9876543210"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Registration successful",
  "token": "eyJhbGci...",
  "user": { ... }
}
```

### 2. Register Non-IIIT Participant

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "external@gmail.com",
    "password": "password123",
    "firstName": "Jane",
    "lastName": "Smith",
    "participantType": "Non-IIIT",
    "college": "MIT",
    "contactNumber": "9876543211"
  }'
```

### 3. Login

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student@iiit.ac.in",
    "password": "password123"
  }'
```

**Save the token from response for next requests**

### 4. Get Current User (Protected)

```bash
# Replace YOUR_TOKEN with actual token from login/register
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 5. Update Profile (Protected)

```bash
curl -X PUT http://localhost:5000/api/auth/profile \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "contactNumber": "9999999999",
    "interests": ["Coding", "Music", "Sports"]
  }'
```

### 6. Logout (Protected)

```bash
curl -X POST http://localhost:5000/api/auth/logout \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Testing Validation

### Invalid IIIT Email
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "wrongdomain@gmail.com",
    "password": "password123",
    "firstName": "Test",
    "lastName": "User",
    "participantType": "IIIT"
  }'
```

**Expected:** Error - "IIIT participants must use IIIT email address"

### Wrong Password
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student@iiit.ac.in",
    "password": "wrongpassword"
  }'
```

**Expected:** Error - "Invalid credentials"

### Access Without Token
```bash
curl -X GET http://localhost:5000/api/auth/me
```

**Expected:** Error - "Not authorized. Please login."

### Duplicate Email
```bash
# Try registering with same email twice
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student@iiit.ac.in",
    "password": "password123",
    "firstName": "Another",
    "lastName": "User",
    "participantType": "IIIT"
  }'
```

**Expected:** Error - "Email already registered"

## Using Postman

1. Create a new collection "Felicity API"
2. Add requests for each endpoint
3. In Authorization tab, select "Bearer Token"
4. Use {{token}} variable to store token from login
5. Set up a test script to save token:
   ```javascript
   if (pm.response.code === 200 || pm.response.code === 201) {
       var jsonData = pm.response.json();
       pm.environment.set("token", jsonData.token);
   }
   ```

## HTTP Status Codes

- `200` - OK (Success)
- `201` - Created (Registration success)
- `400` - Bad Request (Validation error)
- `401` - Unauthorized (Not logged in or invalid token)
- `403` - Forbidden (Wrong role)
- `404` - Not Found (Route doesn't exist)
- `500` - Internal Server Error (Server problem)

## Response Format

All responses follow this format:

**Success:**
```json
{
  "success": true,
  "message": "...",
  "data": { ... }
}
```

**Error:**
```json
{
  "success": false,
  "message": "Error message",
  "error": "Detailed error (dev only)"
}
```

## Security Notes

1. **Never commit tokens** - They're like passwords
2. **Tokens expire** - After 7 days by default
3. **HTTPS in production** - Always use encrypted connection
4. **Passwords are hashed** - Never stored as plain text
5. **CORS configured** - Only allowed origins can access

---

For more details, see `DEVELOPMENT_LOG.md`
