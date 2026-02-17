# Felicity Event Management System# Felicity Event Management System



> A full-stack event management platform built for IIIT Hyderabad's Felicity fest using the MERN stack.**Full-Stack Event Management Platform** ✅



## 🌐 Live Deployment## 🌐 Live Deployment



| Component | URL |- **Frontend:** https://felicity-event-booking.vercel.app

|-----------|-----|- **Backend API:** https://felicity-event-booking.onrender.com/api

| **Frontend** | https://felicity-event-booking.vercel.app |- **Database:** MongoDB Atlas

| **Backend API** | https://felicity-event-booking.onrender.com/api |

| **Database** | MongoDB Atlas |## 📖 Complete Development Guide



---👉 **Read `DEVELOPMENT_LOG.md`** for every command and explanation!



## 📋 Assignment Requirements & Implementation## 🎯 Features



### Part 1: Core System Implementation [70 Marks]### User Roles

- **Participant** - Browse events, register, view tickets

#### Authentication & Security [8 Marks] ✅- **Organizer** - Create/manage events, track registrations, scan QR attendance

- **Admin** - Manage organizers, approve payments, system oversight

| Requirement | Implementation |

|-------------|----------------|### Core Features

| **IIIT Participant Registration** | Email domain validation (`@*.iiit.ac.in`) enforced |- JWT-based authentication with role-based access

| **Non-IIIT Registration** | Email + password with email verification (OTP via Brevo) |- Event creation with custom registration forms

| **Organizer Authentication** | Admin-provisioned accounts, no self-registration |- QR code ticket generation

| **Admin Provisioning** | Backend-only account creation via script |- Email notifications (registration, tickets)

| **Password Hashing** | bcrypt with salt rounds |- Payment approval workflow

| **JWT Authentication** | All protected routes use JWT tokens |- Attendance tracking via QR scanner

| **Role-Based Access Control** | Middleware checks for participant/organizer/admin |

| **Session Management** | Persistent sessions, proper logout with token clearing |### Advanced Features

- Merchandise events with variants (size, color)

#### User Onboarding & Preferences [3 Marks] ✅- Toggle registration open/close

- Export attendance to CSV

- Post-signup onboarding flow for participants- Search and filter events

- Areas of interest selection (multiple)- Eligibility restrictions (IIIT/Non-IIIT)

- Follow clubs/organizers functionality- Discord auto-posting for events

- Preferences stored in database and editable from Profile

- Event recommendations based on followed organizers## 🚀 Quick Start



#### User Data Models [2 Marks] ✅### Prerequisites

- Node.js v18+

**Participant Model:**- MongoDB (local or Atlas)

- First Name, Last Name, Email (unique)

- Participant Type (IIIT/Non-IIIT)### Backend Setup

- College/Organization Name

- Contact Number```bash

- Password (hashed)cd backend

- Interests, Followed Organizersnpm install

cp .env.example .env

**Organizer Model:**# Edit .env with your values

- Organizer Name, Category, Descriptionnpm run dev

- Contact Email, Login Email```

- Discord Webhook URL

- isActive status### Frontend Setup



#### Event Types [2 Marks] ✅```bash

cd frontend

| Type | Description |npm install

|------|-------------|npm start

| **Normal Event** | Individual participant registration (workshops, talks, competitions) |```

| **Merchandise** | Selling items with variants (size, color), stock management |

## 📁 Project Structure

#### Event Attributes [2 Marks] ✅

```

All events store: Name, Description, Type, Eligibility, Registration Deadline, Start/End Date, Registration Limit, Registration Fee, Organizer ID, Tags, Venue, Image URLFelicity_Event_Booking/

├── backend/

- **Normal Events:** Custom registration form (dynamic form builder)│   ├── controllers/     # Business logic

- **Merchandise:** Item variants (size, color), stock quantity, purchase limits│   ├── middleware/      # Auth & security

│   ├── models/          # Database schemas

#### Participant Features [22 Marks] ✅│   ├── routes/          # API endpoints

│   ├── utils/           # Email, QR, Discord services

| Feature | Marks | Status |│   └── server.js        # Main server

|---------|-------|--------|├── frontend/

| Navigation Menu | 1 | ✅ Dashboard, Browse Events, Clubs, Profile, Logout |│   ├── src/

| My Events Dashboard | 6 | ✅ Upcoming events, participation history with tabs |│   │   ├── components/  # Reusable UI components

| Browse Events Page | 5 | ✅ Search (fuzzy), filters (type, eligibility, date, followed), trending |│   │   ├── context/     # Auth context

| Event Details Page | 2 | ✅ Complete details, registration button with validation |│   │   ├── pages/       # Page components

| Event Registration Workflows | 5 | ✅ Form submission, email tickets, QR generation |│   │   ├── services/    # API service

| Profile Page | 2 | ✅ Editable/non-editable fields, password change |│   │   └── styles/      # Theme styles

| Clubs/Organizers Listing | 1 | ✅ All organizers with follow/unfollow |│   └── public/

| Organizer Detail Page | 1 | ✅ Info, upcoming/past events |├── DEVELOPMENT_LOG.md   # Detailed development history

└── README.md

#### Organizer Features [18 Marks] ✅```



| Feature | Marks | Status |## 🔌 API Endpoints

|---------|-------|--------|

| Navigation Menu | 1 | ✅ Dashboard, Create Event, Profile, Logout, Ongoing Events |### Authentication

| Organizer Dashboard | 3 | ✅ Events carousel, analytics (registrations, revenue, attendance) || Method | Endpoint | Description |

| Event Detail Page | 4 | ✅ Overview, analytics, participants list, search/filter, CSV export ||--------|----------|-------------|

| Event Creation & Editing | 4 | ✅ Draft → Publish flow, form builder, editing rules || POST | /api/auth/register | Register participant |

| Organizer Profile | 4 | ✅ Editable fields, Discord webhook integration || POST | /api/auth/login | Login |

| GET | /api/auth/me | Get current user |

#### Admin Features [6 Marks] ✅

### Events

| Feature | Marks | Status || Method | Endpoint | Description |

|---------|-------|--------||--------|----------|-------------|

| Navigation Menu | 1 | ✅ Dashboard, Manage Organizers, Password Requests, Logout || GET | /api/events | List all events |

| Club/Organizer Management | 5 | ✅ Add new (auto-generate credentials), remove/disable, view all || POST | /api/events | Create event (organizer) |

| GET | /api/events/:id | Get event details |

#### Deployment [5 Marks] ✅| POST | /api/events/:id/toggle-registration | Toggle registration |



- Frontend deployed to Vercel (static hosting)### Registrations

- Backend deployed to Render (Node.js hosting)| Method | Endpoint | Description |

- MongoDB Atlas for database|--------|----------|-------------|

- `deployment.txt` with production URLs| POST | /api/registrations | Register for event |

| GET | /api/registrations/my-tickets | Get user tickets |

---| GET | /api/registrations/:eventId/export | Export CSV |



### Part 2: Advanced Features [30 Marks]### Admin

| Method | Endpoint | Description |

#### Tier A: Core Advanced Features [Choose 2 — 16 Marks] ✅|--------|----------|-------------|

| GET | /api/admin/organizers | List organizers |

| # | Feature | Marks | Implemented || POST | /api/admin/organizers | Create organizer |

|---|---------|-------|-------------|| GET | /api/admin/payments | List pending payments |

| 1 | Hackathon Team Registration | 8 | ❌ |

| 2 | **Merchandise Payment Approval Workflow** | 8 | ✅ |## 📦 Tech Stack

| 3 | **QR Scanner & Attendance Tracking** | 8 | ✅ |

**Backend:**

**Merchandise Payment Approval Workflow (8 Marks):**- Node.js + Express.js

- Users upload payment proof (image) after placing order- MongoDB + Mongoose

- Order enters "Pending Approval" state- JWT Authentication

- Organizers see dedicated Payment Approvals tab- Brevo (Email API)

- View uploaded proofs with approve/reject actions- QRCode generation

- On approval: stock decremented, QR ticket generated, confirmation email sent

- No QR generated for pending/rejected orders**Frontend:**

- React 18

**QR Scanner & Attendance Tracking (8 Marks):**- React Router

- Built-in QR scanner using device camera (html5-qrcode library)- Context API

- File upload option for QR images- Disco theme UI

- Real-time attendance marking with timestamp

- Duplicate scan detection and rejection## 🔧 Environment Variables

- Live attendance dashboard (Present/Absent counts)

- Export attendance reports as CSV### Backend (.env)

- Manual attendance override with audit logging```

MONGODB_URI=your_mongodb_uri

#### Tier B: Real-time & Communication Features [Choose 2 — 12 Marks] ✅JWT_SECRET=your_jwt_secret

BREVO_API_KEY=your_brevo_api_key

| # | Feature | Marks | Implemented |EMAIL_FROM=your_email

|---|---------|-------|-------------|FRONTEND_URL=your_frontend_url

| 1 | **Real-Time Discussion Forum** | 6 | ✅ |DISCORD_WEBHOOK_URL=your_discord_webhook

| 2 | **Organizer Password Reset Workflow** | 6 | ✅ |```

| 3 | Team Chat | 6 | ❌ (requires Team Registration) |

### Frontend (.env)

**Real-Time Discussion Forum (6 Marks):**```

- Discussion forum on Event Details pageREACT_APP_API_URL=https://felicity-event-booking.vercel.app/

- Registered participants can post messages and questions```
- Organizers can moderate (delete/pin messages)
- Organizers can post announcements
- Message threading support
- Emoji reactions on messages

**Organizer Password Reset Workflow (6 Marks):**
- Organizers can request password reset from login page
- Admin views all requests with details (club name, date, reason)
- Admin can approve/reject with comments
- Auto-generates new password on approval
- Admin receives credentials to share with organizer
- Request status tracking (Pending/Approved/Rejected)

#### Tier C: Integration & Enhancement Features [Choose 1 — 2 Marks] ✅

| # | Feature | Marks | Implemented |
|---|---------|-------|-------------|
| 1 | Anonymous Feedback System | 2 | ❌ |
| 2 | Add to Calendar Integration | 2 | ❌ |
| 3 | **Bot Protection** | 2 | ✅ |

**Bot Protection (2 Marks):**
- Google reCAPTCHA v2 on login and registration pages
- Rate limiting for failed authentication attempts
- Security middleware for IP-based request tracking
- Admin security dashboard showing blocked attempts and suspicious activity

---

### Advanced Features Summary

| Tier | Required | Implemented | Marks |
|------|----------|-------------|-------|
| **Tier A** | 2 features | Merchandise Payment + QR Scanner | 16/16 |
| **Tier B** | 2 features | Discussion Forum + Password Reset | 12/12 |
| **Tier C** | 1 feature | Bot Protection | 2/2 |
| **Total** | 5 features | 5 features | **30/30** |

---

## 🛠️ Technology Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 18, React Router, Context API |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB with Mongoose ODM |
| **Authentication** | JWT (jsonwebtoken), bcryptjs |
| **Email Service** | Brevo (Sendinblue) HTTP API |
| **QR Codes** | qrcode (generation), html5-qrcode (scanning) |
| **File Uploads** | Multer |
| **Bot Protection** | Google reCAPTCHA v2 |
| **Deployment** | Vercel (frontend), Render (backend), MongoDB Atlas |

---

## 🚀 Local Development Setup

### Prerequisites
- Node.js v18+
- MongoDB (local or Atlas connection)

### Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Configure environment variables
npm run dev
```

### Frontend Setup

```bash
cd frontend
npm install
npm start
```

### Environment Variables

**Backend (.env):**
```env
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your_secret_key
BREVO_API_KEY=your_brevo_api_key
EMAIL_FROM=noreply@felicity.com
FRONTEND_URL=http://localhost:3000
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/...
RECAPTCHA_SECRET_KEY=your_recaptcha_secret
```

**Frontend (.env):**
```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_RECAPTCHA_SITE_KEY=your_recaptcha_site_key
```

---

## 📁 Project Structure

```
Felicity_Event_Booking/
├── backend/
│   ├── controllers/        # Business logic (auth, events, registrations, admin)
│   ├── middleware/         # Auth & security middleware
│   ├── models/             # Mongoose schemas (User, Event, Registration, etc.)
│   ├── routes/             # API route definitions
│   ├── utils/              # Email, QR, Discord services
│   ├── scripts/            # Admin creation script
│   └── server.js           # Express server entry point
├── frontend/
│   ├── src/
│   │   ├── components/     # Reusable UI (Navbar, ProtectedRoute, DiscussionForum)
│   │   ├── context/        # AuthContext for state management
│   │   ├── pages/          # All page components
│   │   ├── services/       # API service layer
│   │   └── styles/         # Disco theme CSS
│   └── public/
├── DEVELOPMENT_LOG.md      # Detailed development history
├── deployment.txt          # Production URLs
└── README.md               # This file
```

---

## 🔌 API Endpoints

### Authentication
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/auth/register` | Public | Register participant |
| POST | `/api/auth/login` | Public | Login (all roles) |
| GET | `/api/auth/me` | Protected | Get current user |
| PUT | `/api/auth/profile` | Protected | Update profile |
| POST | `/api/auth/send-verification` | Public | Send email OTP |
| POST | `/api/auth/verify-email` | Public | Verify email OTP |

### Events
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/events` | Public | List events (with search/filter) |
| POST | `/api/events` | Organizer | Create event |
| GET | `/api/events/:id` | Public | Get event details |
| PUT | `/api/events/:id` | Organizer | Update event |
| POST | `/api/events/:id/toggle-registration` | Organizer | Open/close registration |

### Registrations
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/registrations` | Participant | Register for event |
| GET | `/api/registrations/my-tickets` | Participant | Get user's tickets |
| GET | `/api/registrations/:eventId/participants` | Organizer | Get participants |
| GET | `/api/registrations/:eventId/export` | Organizer | Export CSV |
| POST | `/api/registrations/:id/mark-attendance` | Organizer | Mark attendance |

### Admin
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/admin/organizers` | Admin | List all organizers |
| POST | `/api/admin/organizers` | Admin | Create organizer |
| DELETE | `/api/admin/organizers/:id` | Admin | Disable organizer |
| GET | `/api/admin/password-requests` | Admin | View reset requests |
| PUT | `/api/admin/password-requests/:id` | Admin | Approve/reject request |

### Discussions
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/discussions/:eventId` | Public | Get forum messages |
| POST | `/api/discussions/:eventId/messages` | Participant | Post message |
| PUT | `/api/discussions/:eventId/messages/:id` | Author | Edit message |
| DELETE | `/api/discussions/:eventId/messages/:id` | Author/Organizer | Delete message |

---

## 👥 User Roles & Capabilities

### Participant
- Register/login with IIIT or external email
- Browse and search events
- Register for events (Normal/Merchandise)
- View tickets with QR codes
- Follow organizers
- Participate in event discussions
- Manage profile and preferences

### Organizer
- Login with admin-provided credentials
- Create and manage events
- Build custom registration forms
- View registrations and analytics
- Approve/reject merchandise payments
- Scan QR codes for attendance
- Export participant data
- Moderate discussion forums
- Configure Discord webhook

### Admin
- Manage organizer accounts (create/disable)
- Handle password reset requests
- View system-wide statistics
- Monitor security events

---

## 📝 Development Log

For a complete step-by-step development history with explanations, see `DEVELOPMENT_LOG.md`.

---

## 📄 License

This project was developed as an assignment for the Design & Analysis of Software Systems course at IIIT Hyderabad.

---

**Submission:** February 2026
