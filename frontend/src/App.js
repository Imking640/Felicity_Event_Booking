import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Events from './pages/Events';
import DashboardRouter from './pages/DashboardRouter';
import CreateEvent from './pages/CreateEvent';
import OrganizerEvents from './pages/OrganizerEvents';
import EventParticipants from './pages/EventParticipants';
import EventDetailOrganizer from './pages/EventDetailOrganizer';
import OrganizerProfile from './pages/OrganizerProfile';
import ManageOrganizers from './pages/ManageOrganizers';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div style={{ minHeight: '100vh', backgroundColor: '#0d0221' }}>
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/events" element={<Events />} />
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <DashboardRouter />
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
                  <ManageOrganizers />
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
      </AuthProvider>
    </Router>
  );
}

export default App;
