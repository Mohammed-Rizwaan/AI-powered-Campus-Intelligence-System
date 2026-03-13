import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import DashboardLayout from './components/layout/DashboardLayout';
import AdminDashboard from './pages/AdminDashboard';
import CounsellorDashboard from './pages/CounsellorDashboard';
import StudentDashboard from './pages/StudentDashboard';
import WardenDashboard from './pages/WardenDashboard';
import { getToken } from './api';
import { DemoProvider } from './context/DemoContext';
import DemoToggle from './components/DemoToggle';
import { AnimatePresence, motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';

const PageTransition = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    transition={{ duration: 0.3 }}
  >
    {children}
  </motion.div>
);

const ProtectedRoute = ({ children, allowedRoles }) => {
  const token = getToken();
  if (!token) return <Navigate to="/login" replace />;
  // For this skeleton, we assume token is enough to allow route. Proper role checking happens in API anyway.
  return children;
};

export default function App() {
  return (
    <DemoProvider>
      <AppRoutes />
      <DemoToggle />
    </DemoProvider>
  );
}

function AppRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/login" element={<PageTransition><Login /></PageTransition>} />
        
        {/* Admin Routes */}
        <Route path="/admin/*" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <DashboardLayout title="Admin Overview" />
          </ProtectedRoute>
        }>
          <Route index element={<AdminDashboard />} />
          <Route path="alerts" element={<AdminDashboard />} />
          <Route path="resources" element={<AdminDashboard />} />
        </Route>

        {/* Counsellor Routes */}
        <Route path="/counsellor/*" element={
          <ProtectedRoute allowedRoles={['counsellor']}>
            <DashboardLayout title="Counsellor Dashboard" />
          </ProtectedRoute>
        }>
          <Route index element={<CounsellorDashboard />} />
          <Route path="alerts" element={<CounsellorDashboard />} />
        </Route>

        {/* Warden Routes */}
        <Route path="/warden/*" element={
          <ProtectedRoute allowedRoles={['warden']}>
            <DashboardLayout title="Operational Hub" />
          </ProtectedRoute>
        }>
          <Route index element={<WardenDashboard />} />
          <Route path="resources" element={<WardenDashboard />} />
        </Route>

        {/* Student Routes */}
        <Route path="/student/*" element={
          <ProtectedRoute allowedRoles={['student']}>
            <DashboardLayout title="Your Hub" />
          </ProtectedRoute>
        }>
          <Route index element={<StudentDashboard />} />
        </Route>

        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </AnimatePresence>
  );
}
