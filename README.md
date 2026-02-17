# Felicity Event Management System

**Full-Stack Event Management Platform** ✅

## 🌐 Live Deployment

- **Frontend:** https://felicity-event-booking.vercel.app
- **Backend API:** https://felicity-event-booking.onrender.com/api
- **Database:** MongoDB Atlas

## 📖 Complete Development Guide

👉 **Read `DEVELOPMENT_LOG.md`** for every command and explanation!

## 🎯 Features

### User Roles
- **Participant** - Browse events, register, view tickets
- **Organizer** - Create/manage events, track registrations, scan QR attendance
- **Admin** - Manage organizers, approve payments, system oversight

### Core Features
- JWT-based authentication with role-based access
- Event creation with custom registration forms
- QR code ticket generation
- Email notifications (registration, tickets)
- Payment approval workflow
- Attendance tracking via QR scanner

### Advanced Features
- Merchandise events with variants (size, color)
- Toggle registration open/close
- Export attendance to CSV
- Search and filter events
- Eligibility restrictions (IIIT/Non-IIIT)
- Discord auto-posting for events

## 🚀 Quick Start

### Prerequisites
- Node.js v18+
- MongoDB (local or Atlas)

### Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your values
npm run dev
```

### Frontend Setup

```bash
cd frontend
npm install
npm start
```

## 📁 Project Structure

```
Felicity_Event_Booking/
├── backend/
│   ├── controllers/     # Business logic
│   ├── middleware/      # Auth & security
│   ├── models/          # Database schemas
│   ├── routes/          # API endpoints
│   ├── utils/           # Email, QR, Discord services
│   └── server.js        # Main server
├── frontend/
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   ├── context/     # Auth context
│   │   ├── pages/       # Page components
│   │   ├── services/    # API service
│   │   └── styles/      # Theme styles
│   └── public/
├── DEVELOPMENT_LOG.md   # Detailed development history
└── README.md
```

## 🔌 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register participant |
| POST | /api/auth/login | Login |
| GET | /api/auth/me | Get current user |

### Events
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/events | List all events |
| POST | /api/events | Create event (organizer) |
| GET | /api/events/:id | Get event details |
| POST | /api/events/:id/toggle-registration | Toggle registration |

### Registrations
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/registrations | Register for event |
| GET | /api/registrations/my-tickets | Get user tickets |
| GET | /api/registrations/:eventId/export | Export CSV |

### Admin
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/admin/organizers | List organizers |
| POST | /api/admin/organizers | Create organizer |
| GET | /api/admin/payments | List pending payments |

## 📦 Tech Stack

**Backend:**
- Node.js + Express.js
- MongoDB + Mongoose
- JWT Authentication
- Brevo (Email API)
- QRCode generation

**Frontend:**
- React 18
- React Router
- Context API
- Disco theme UI

## 🔧 Environment Variables

### Backend (.env)
```
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
BREVO_API_KEY=your_brevo_api_key
EMAIL_FROM=your_email
FRONTEND_URL=your_frontend_url
DISCORD_WEBHOOK_URL=your_discord_webhook
```

### Frontend (.env)
```
REACT_APP_API_URL=your_backend_url
```

---

**Status:** Production Ready ✅
**Deployment:** Backend on Render, Frontend on Vercel