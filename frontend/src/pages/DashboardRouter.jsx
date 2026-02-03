import React from 'react';
import { useAuth } from '../context/AuthContext';
import OrganizerDashboard from './OrganizerDashboard';
import AdminDashboard from './AdminDashboard';
import Dashboard from './Dashboard';

const DashboardRouter = () => {
  const { user } = useAuth();

  console.log('DashboardRouter - Current user:', user);
  console.log('DashboardRouter - User role:', user?.role);
  console.log('DashboardRouter - Is admin?', user?.role === 'admin');
  console.log('DashboardRouter - Is organizer?', user?.role === 'organizer');

  if (user?.role === 'admin') {
    console.log('DashboardRouter - Rendering AdminDashboard');
    return <AdminDashboard />;
  }

  if (user?.role === 'organizer') {
    console.log('DashboardRouter - Rendering OrganizerDashboard');
    return <OrganizerDashboard />;
  }

  console.log('DashboardRouter - Rendering Participant Dashboard');
  return <Dashboard />;
};

export default DashboardRouter;
