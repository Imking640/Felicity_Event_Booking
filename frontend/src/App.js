import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { useGlobalDiscussionNotifications } from './services/discussionNotificationService';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Onboarding from './pages/Onboarding';
import Profile from './pages/Profile';
import EditProfile from './pages/EditProfile';
import Events from './pages/Events';
import EventRegistration from './pages/EventRegistration';
import DashboardRouter from './pages/DashboardRouter';
import CreateEvent from './pages/CreateEvent';
import EditEvent from './pages/EditEvent';
import OrganizerEvents from './pages/OrganizerEvents';
import EventParticipants from './pages/EventParticipants';
import EventDetailOrganizer from './pages/EventDetailOrganizer';
import OrganizerProfile from './pages/OrganizerProfile';
import OngoingEvents from './pages/OngoingEvents';
import ManageOrganizers from './pages/ManageOrganizers';
import PasswordResetRequests from './pages/PasswordResetRequests';
import Tickets from './pages/Tickets';
import OrganizersList from './pages/OrganizersList';
import OrganizerView from './pages/OrganizerView';
import PaymentApprovals from './pages/PaymentApprovals';
import AttendanceScanner from './pages/AttendanceScanner';

const HomeOrDashboard = () => {
  const { isAuthenticated, user } = useAuth();
  if (!isAuthenticated) return <Home />;
  if (user?.role === 'admin') return <Navigate to="/dashboard" replace />;
  if (user?.role === 'organizer') return <Navigate to="/dashboard" replace />;
  return <Navigate to="/dashboard" replace />;
};

const LoginGuard = () => {
  const { isAuthenticated } = useAuth();
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return <Login />;
};

const RegisterGuard = () => {
  const { isAuthenticated } = useAuth();
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return <Register />;
};

// AppContent component to use hooks inside AuthProvider
const AppContent = () => {
  // Enable global discussion notifications
  useGlobalDiscussionNotifications();

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0d0221' }}>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomeOrDashboard />} />
        <Route path="/login" element={<LoginGuard />} />
        <Route path="/register" element={<RegisterGuard />} />
        <Route path="/events" element={<Events />} />
        <Route 
          path="/onboarding" 
          element={
            <ProtectedRoute>
              <Onboarding />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/profile" 
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/profile/edit" 
          element={
            <ProtectedRoute>
              <EditProfile />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/tickets" 
          element={
            <ProtectedRoute>
              <Tickets />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <DashboardRouter />
            </ProtectedRoute>
          } 
        />

        {/* Admin Dashboard - redirects /admin to dashboard router */}
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <DashboardRouter />
            </ProtectedRoute>
          } 
        />

        {/* Organizer Dashboard */}
        <Route 
          path="/organizer/dashboard" 
          element={
            <ProtectedRoute allowedRoles={["organizer"]}>
              <DashboardRouter />
            </ProtectedRoute>
          } 
        />
        <Route path="/organizers" element={<OrganizersList />} />
        <Route path="/organizers/:id" element={<OrganizerView />} />

        <Route
          path="/events/:id/register"
          element={
            <ProtectedRoute allowedRoles={["participant"]}>
              <EventRegistration />
            </ProtectedRoute>
          }
        />

        <Route
          path="/create-event"
          element={
            <ProtectedRoute allowedRoles={["organizer"]}>
              <CreateEvent />
            </ProtectedRoute>
          }
        />

        <Route
          path="/organizer/events/:id/edit"
          element={
            <ProtectedRoute allowedRoles={["organizer"]}>
              <EditEvent />
            </ProtectedRoute>
          }
        />

        <Route
          path="/organizer/events"
          element={
            <ProtectedRoute allowedRoles={["organizer"]}>
              <OrganizerEvents />
            </ProtectedRoute>
          }
        />

        <Route
          path="/events/:id/participants"
          element={
            <ProtectedRoute allowedRoles={["organizer"]}>
              <EventParticipants />
            </ProtectedRoute>
          }
        />

        <Route
          path="/organizer/event/:id"
          element={
            <ProtectedRoute allowedRoles={["organizer"]}>
              <EventDetailOrganizer />
            </ProtectedRoute>
          }
        />

        <Route
          path="/organizer/profile"
          element={
            <ProtectedRoute allowedRoles={["organizer"]}>
              <OrganizerProfile />
            </ProtectedRoute>
          }
        />

        <Route
          path="/organizer/ongoing-events"
          element={
            <ProtectedRoute allowedRoles={["organizer"]}>
              <OngoingEvents />
            </ProtectedRoute>
          }
        />

        <Route
          path="/organizer/payment-approvals"
          element={
            <ProtectedRoute allowedRoles={["organizer"]}>
              <PaymentApprovals />
            </ProtectedRoute>
          }
        />

        <Route
          path="/events/:eventId/attendance"
          element={
            <ProtectedRoute allowedRoles={["organizer"]}>
              <AttendanceScanner />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/manage-organizers"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <ManageOrganizers />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/password-resets"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <PasswordResetRequests />
            </ProtectedRoute>
          }
        />
        
        <Route 
          path="/unauthorized" 
          element={
            <div style={{ textAlign: 'center', padding: '3rem', color: '#c33' }}>
              <h1>Unauthorized</h1>
              <p>You don't have permission to access this page.</p>
            </div>
          } 
        />
      </Routes>
    </div>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}export default App;
