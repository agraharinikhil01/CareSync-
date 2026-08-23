import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import AdminDashboard from './pages/admin/AdminDashboard';
import DoctorDashboard from './pages/doctor/DoctorDashboard';
import PatientDashboard from './pages/patient/PatientDashboard';
import ReceptionistDashboard from './pages/receptionist/ReceptionistDashboard';
import EmergencyProfile from './pages/public/EmergencyProfile';
import MobileCheckout from './pages/public/MobileCheckout';
import AIAssistantWidget from './components/AIAssistantWidget';

// Home router helper
const HomeRedirect = () => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-10 h-10 border-4 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  const roleRoutes = {
    admin: '/admin',
    doctor: '/doctor',
    patient: '/patient',
    receptionist: '/receptionist',
  };

  return <Navigate to={roleRoutes[user.role] || '/login'} replace />;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Root Redirect */}
          <Route path="/" element={<HomeRedirect />} />

          {/* Public Auth, Emergency & Mobile QR Payment Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/emergency/:patientId" element={<EmergencyProfile />} />
          <Route path="/pay/:invoiceId" element={<MobileCheckout />} />

          {/* Admin Protected Routes */}
          <Route
            path="/admin/*"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* Doctor Protected Routes */}
          <Route
            path="/doctor/*"
            element={
              <ProtectedRoute allowedRoles={['doctor']}>
                <DoctorDashboard />
              </ProtectedRoute>
            }
          />

          {/* Patient Protected Routes */}
          <Route
            path="/patient/*"
            element={
              <ProtectedRoute allowedRoles={['patient']}>
                <PatientDashboard />
              </ProtectedRoute>
            }
          />

          {/* Receptionist Protected Routes */}
          <Route
            path="/receptionist/*"
            element={
              <ProtectedRoute allowedRoles={['receptionist', 'admin']}>
                <ReceptionistDashboard />
              </ProtectedRoute>
            }
          />

          {/* Catch All Redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <AIAssistantWidget />
      </AuthProvider>
    </Router>
  );
}

export default App;
