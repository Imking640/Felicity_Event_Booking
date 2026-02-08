# Felicity Event Management System

**Backend Development - Task 1 Complete** ✅

## 📖 Complete Development Guide

👉 **Read `DEVELOPMENT_LOG.md`** for every command and explanation!

That file shows you:
- Every command run (with explanations)
- Why each step was needed
- What each file does
- How to explain it in evaluations

## 🚀 Quick Start

### Prerequisites
- Node.js installed
- MongoDB installed and running

### Setup

```bash
# 1. Navigate to backend
cd backend

# 2. Install dependencies (already done)
npm install

# 3. Copy environment template
cp .env.example .env

# 4. Edit .env with your values
# (MongoDB URI, JWT secret, email credentials, etc.)

# 5. Start development server
npm run dev
```

### Test
Open browser to: `http://localhost:5000/api/health`

Expected response:
```json
{
  "status": "ok",
  "message": "Felicity Event Management API is running",
  "timestamp": "2026-02-01T..."
}
```

## 📁 Project Structure

```
Felicity_Event_Booking/
├── backend/
│   ├── models/          # Database schemas (coming next)
│   ├── routes/          # API endpoints (coming next)
│   ├── controllers/     # Business logic (coming next)
│   ├── middleware/      # Auth & validation (coming next)
│   ├── utils/           # Helper functions (coming next)
│   ├── server.js        # ✅ Main server file
│   ├── package.json     # ✅ Dependencies
│   ├── .env             # ✅ Configuration (not in git)
│   ├── .env.example     # ✅ Template
│   └── .gitignore       # ✅ Git ignore rules
├── frontend/            # (Coming in later tasks)
├── DEVELOPMENT_LOG.md   # 📘 Complete step-by-step guide
└── README.md            # This file
```

## 🎯 What's Complete

✅ **Task 1: Backend Setup**
- Backend project initialized
- All dependencies installed  
- Express server configured
- MongoDB connection setup
- Middleware pipeline configured
- Environment variables configured
- Health check endpoint working
- Error handling implemented
- Auto-restart with nodemon

✅ **Task 2: User Models & Authentication**
- User model with Mongoose discriminators
- Participant, Organizer, Admin schemas
- Password hashing with bcrypt
- JWT token generation & verification
- Auth middleware (verifyToken, role checks)
- Registration endpoint (IIIT/Non-IIIT)
- Login endpoint
- Protected routes (getMe, updateProfile, logout)
- Email validation
- Role-based access control

### API Endpoints Ready:
```
POST   /api/auth/register   - Register new participant
POST   /api/auth/login      - Login (all roles)
GET    /api/auth/me         - Get current user (protected)
PUT    /api/auth/profile    - Update profile (protected)
POST   /api/auth/logout     - Logout (protected)
```

## 📦 Dependencies Installed

**Production:**
- express - Web framework
- mongoose - MongoDB ODM
- bcryptjs - Password hashing
- jsonwebtoken - JWT authentication
- dotenv - Environment variables
- cors - Cross-origin requests
- validator - Data validation
- nodemailer - Email service
- qrcode - QR code generation
- multer - File upload handling

**Development:**
- nodemon - Auto-restart server

## 🎓 Key Concepts

### 1. Express.js
Web framework that simplifies building REST APIs with routing and middleware support.

### 2. Middleware
Functions that process requests before reaching route handlers. Like airport security checkpoints.

### 3. MVC Pattern
- **Models**: Data structure (what data looks like)
- **Routes**: API endpoints (how to access)
- **Controllers**: Business logic (what to do)

### 4. Environment Variables
Secure way to store configuration outside code. Keeps secrets safe.

### 5. MongoDB
NoSQL database that stores JSON-like documents. Perfect for JavaScript applications.

## 🔧 Available Scripts

```bash
npm start      # Production: Start server with node
npm run dev    # Development: Start with nodemon (auto-restart)
```

## 📝 Next Steps

**Task 2:** User Models & Authentication
- Create User, Participant, Organizer, Admin schemas
- Implement JWT authentication
- Build registration & login APIs
- Add password hashing

---

**Assignment Deadline:** February 12, 2026  
**Current Progress:** Task 1 Complete (5%)

For detailed explanations, see `DEVELOPMENT_LOG.md` 📘



Backend URL - https://felicity-event-booking.onrender.com/api
frontend URL - https://felicity-event-booking.vercel.app