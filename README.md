# Felicity Event Management System

A full-stack event management platform built with the MERN stack for managing events, registrations, and participants at IIIT Hyderabad's Felicity fest.

## Live Application

Frontend: https://felicity-event-booking.vercel.app
Backend: https://felicity-event-booking.onrender.com/api
Database: MongoDB Atlas

## About This Project

This system was built to centralize event management for Felicity fest, replacing the chaos of Google Forms, spreadsheets, and WhatsApp groups. It allows clubs and organizers to create events, participants to register and track their participation, and admins to manage the entire system.

## What I Built

### Core Features (Part 1 - 70 Marks)

I implemented all the required core features:

**Authentication & Security (8 marks)**
- IIIT students can register with their college email (domain validation for @*.iiit.ac.in)
- External participants register with email verification using OTP
- Organizers get accounts created by admin with auto-generated credentials
- Admin account is provisioned via backend script
- All passwords are hashed with bcrypt
- JWT-based authentication for all protected routes
- Role-based access control throughout the application
- Sessions persist across browser restarts

**User Onboarding (3 marks)**
- After signup, participants can select their interests and follow organizers
- These preferences can be set during onboarding or skipped and configured later
- Preferences are stored and editable from the profile page
- They influence event recommendations and ordering

**User Models (2 marks)**
Created comprehensive models for Participants and Organizers with all required fields plus additional ones like interests, followed organizers, Discord webhooks, etc.

**Event Types (2 marks)**
- Normal Events: For workshops, talks, competitions with individual registration
- Merchandise Events: For selling items with variants like size and color

**Event Attributes (2 marks)**
All events have name, description, type, eligibility, dates, registration limits, fees, tags, and venue. Normal events have custom registration forms with a dynamic form builder. Merchandise events have item variants, stock tracking, and purchase limits.

**Participant Features (22 marks)**
- Navigation with Dashboard, Browse Events, Clubs, Profile, Logout
- Dashboard showing upcoming events and participation history organized by tabs
- Browse events page with search, trending section, and filters for type, eligibility, date range, and followed clubs
- Event details page with complete information and registration button with proper validation
- Registration workflow that sends tickets via email with QR codes
- Profile page with editable fields and password change
- Clubs listing page with follow/unfollow functionality
- Individual organizer pages showing their upcoming and past events

**Organizer Features (18 marks)**
- Navigation with Dashboard, Create Event, Profile, Ongoing Events, Logout
- Dashboard with events carousel and analytics for registrations, revenue, and attendance
- Event detail page showing overview, analytics, participant list with search/filter, and CSV export
- Event creation flow with Draft to Published status, dynamic form builder, and editing rules based on event status
- Profile page with Discord webhook integration for auto-posting new events

**Admin Features (6 marks)**
- Navigation with Dashboard, Manage Organizers, Password Requests, Logout
- Create new organizer accounts with auto-generated credentials
- Disable or remove organizer accounts
- View all organizers and their status

**Deployment (5 marks)**
- Frontend deployed on Vercel
- Backend deployed on Render
- MongoDB Atlas for database
- All production URLs documented in deployment.txt

### Advanced Features (Part 2 - 30 Marks)

I chose and implemented features from all three tiers to get exactly 30 marks:

**From Tier A (chose 2 out of 3) - 16 marks**

1. Merchandise Payment Approval Workflow (8 marks)
   - When participants buy merchandise, they upload payment proof
   - Order goes into "Pending Approval" state
   - Organizers see a Payment Approvals tab with all pending orders
   - They can view the uploaded payment proof and approve or reject
   - On approval: stock decreases, QR ticket is generated, confirmation email is sent
   - Rejected or pending orders don't get QR codes

2. QR Scanner & Attendance Tracking (8 marks)
   - Built-in QR scanner using device camera (html5-qrcode library)
   - Option to upload QR image instead of scanning
   - Marks attendance with timestamp when QR is scanned
   - Prevents duplicate scans
   - Live dashboard showing who's present and who's absent
   - Export attendance to CSV
   - Manual override option for exceptional cases with audit logs

**From Tier B (chose 2 out of 3) - 12 marks**

1. Real-Time Discussion Forum (6 marks)
   - Discussion forum on every event details page
   - Registered participants can post messages and ask questions
   - Organizers can moderate by deleting or pinning messages
   - Organizers can post announcements
   - Supports message threading and emoji reactions

2. Organizer Password Reset Workflow (6 marks)
   - Organizers can request password reset from the login page
   - Admin sees all requests with club name, date, and reason
   - Admin can approve or reject with comments
   - On approval, system generates a new password automatically
   - Admin gets the new credentials to share with the organizer
   - Full tracking of request status (Pending/Approved/Rejected)

**From Tier C (chose 1 out of 3) - 2 marks**

Bot Protection (2 marks)
- Google reCAPTCHA v2 on login and registration pages
- Rate limiting for failed login attempts
- Security middleware tracking suspicious activity
- Admin dashboard showing security events and blocked attempts

## Technology Stack

Backend:
- Node.js with Express.js for the REST API
- MongoDB with Mongoose for database
- JWT for authentication
- bcrypt for password hashing
- Multer for file uploads (payment proofs, images)
- Brevo API for sending emails
- qrcode library for generating QR codes

Frontend:
- React 18
- React Router for navigation
- Context API for state management
- html5-qrcode for QR scanning
- Custom disco theme styling

Security:
- Google reCAPTCHA v2
- Rate limiting middleware
- JWT token verification
- Role-based access control

Deployment:
- Frontend on Vercel
- Backend on Render
- Database on MongoDB Atlas

## How to Run Locally

### Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your MongoDB URI, JWT secret, Brevo API key, etc.
npm run dev
```

### Frontend Setup

```bash
cd frontend
npm install
# Edit .env if needed for API URL and reCAPTCHA key
npm start
```

### Environment Variables

Backend needs:
- MONGODB_URI
- JWT_SECRET
- BREVO_API_KEY
- EMAIL_FROM
- FRONTEND_URL
- DISCORD_WEBHOOK_URL (optional)
- RECAPTCHA_SECRET_KEY

Frontend needs:
- REACT_APP_API_URL
- REACT_APP_RECAPTCHA_SITE_KEY

## Project Structure

```
backend/
  controllers/    - Business logic for auth, events, registrations, admin
  middleware/     - Authentication and security middleware
  models/         - Database schemas (User, Event, Registration, Discussion, etc.)
  routes/         - API route definitions
  utils/          - Helper functions (email, QR generation, Discord integration)
  scripts/        - Admin account creation script
  server.js       - Main Express app

frontend/
  src/
    components/   - Reusable components (Navbar, ProtectedRoute, DiscussionForum)
    context/      - AuthContext for user state
    pages/        - All page components
    services/     - API calling functions
    styles/       - CSS files
  public/         - Static assets
```

## Key Features Explained

### For Participants
- Register with IIIT email or external email with verification
- Browse and search all events with multiple filters
- See trending events in the last 24 hours
- Follow your favorite clubs and organizers
- Register for events with custom forms
- Get QR code tickets via email
- View all your registrations in one place
- Participate in event discussion forums
- Buy merchandise with payment approval flow

### For Organizers
- Create events with custom registration forms
- Choose between Normal and Merchandise event types
- Build dynamic forms with different field types
- Track registrations and analytics
- Approve merchandise payment proofs
- Scan QR codes to mark attendance
- Export participant data to CSV
- Moderate discussion forums
- Auto-post events to Discord
- Edit events based on their current status

### For Admins
- Create organizer accounts with auto-generated credentials
- Manage all organizers in the system
- Handle password reset requests from organizers
- View system-wide statistics
- Monitor security events

## API Endpoints

All endpoints are under /api prefix

Auth routes (/api/auth):
- POST /register - Register new participant
- POST /login - Login for all user types
- GET /me - Get current user info
- PUT /profile - Update user profile
- POST /send-verification - Send email OTP
- POST /verify-email - Verify email with OTP

Event routes (/api/events):
- GET / - List all events with search and filters
- POST / - Create new event (organizer only)
- GET /:id - Get event details
- PUT /:id - Update event (organizer only)
- POST /:id/toggle-registration - Open/close registrations

Registration routes (/api/registrations):
- POST / - Register for an event
- GET /my-tickets - Get user's tickets
- GET /:eventId/participants - Get event participants (organizer)
- GET /:eventId/export - Export participants CSV (organizer)
- POST /:id/mark-attendance - Mark attendance (organizer)

Admin routes (/api/admin):
- GET /organizers - List all organizers
- POST /organizers - Create new organizer
- DELETE /organizers/:id - Disable organizer
- GET /password-requests - View reset requests
- PUT /password-requests/:id - Approve/reject request

Discussion routes (/api/discussions):
- GET /:eventId - Get forum messages
- POST /:eventId/messages - Post new message
- PUT /:eventId/messages/:id - Edit message
- DELETE /:eventId/messages/:id - Delete message

## Development Notes

The entire codebase was built from scratch following the MERN stack architecture. I used MVC pattern for the backend to keep controllers, routes, and models separate. The frontend uses React's Context API for global state management instead of Redux to keep things simpler.

For email functionality, I switched from Nodemailer to Brevo's HTTP API because it's more reliable for transactional emails and doesn't require SMTP configuration.

The QR code system generates unique ticket IDs and encodes participant and event information. The scanner validates these QR codes and prevents duplicate scans.

The discussion forum stores messages with threading support, allowing replies to specific messages. Organizers have moderation powers to keep discussions on track.

For deployment, I chose Vercel for the frontend because it's optimized for React apps, and Render for the backend because it has good Node.js support. MongoDB Atlas provides the cloud database with automatic backups.

## Complete Development History

See DEVELOPMENT_LOG.md for a detailed, step-by-step account of how this project was built, including every command run, every decision made, and explanations of why things were done a certain way.
