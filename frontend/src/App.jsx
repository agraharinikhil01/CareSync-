import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import ProtectedRoute from './routes/ProtectedRoute';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import PatientsPage from './pages/admin/PatientsPage';
import DoctorsPage from './pages/admin/DoctorsPage';
import AppointmentsPage from './pages/admin/AppointmentsPage';
import BedsPage from './pages/admin/BedsPage';
import BillsPage from './pages/admin/BillsPage';

// Doctor Pages
import DoctorDashboard from './pages/doctor/DoctorDashboard';
import DoctorAppointments from './pages/doctor/DoctorAppointments';
import DoctorPatients from './pages/doctor/DoctorPatients';
import DoctorPrescriptions from './pages/doctor/DoctorPrescriptions';
import DoctorProfile from './pages/doctor/DoctorProfile';

// Receptionist Pages
import ReceptionistDashboard from './pages/receptionist/ReceptionistDashboard';
import ReceptionistAppointments from './pages/receptionist/ReceptionistAppointments';
import ReceptionistBeds from './pages/receptionist/ReceptionistBeds';
import ReceptionistPatients from './pages/receptionist/ReceptionistPatients';
import ReceptionistBills from './pages/receptionist/ReceptionistBills';

// Patient Pages
import PatientDashboard from './pages/patient/PatientDashboard';
import PatientAppointments from './pages/patient/PatientAppointments';
import PatientPrescriptions from './pages/patient/PatientPrescriptions';
import PatientBills from './pages/patient/PatientBills';
import PatientProfile from './pages/patient/PatientProfile';

const RootRedirect = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f6f7f7] flex items-center justify-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-[#0087be] border-t-transparent"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  switch (user.role) {
    case 'ADMIN':
      return <Navigate to="/admin/dashboard" replace />;
    case 'DOCTOR':
      return <Navigate to="/doctor/dashboard" replace />;
    case 'RECEPTIONIST':
      return <Navigate to="/receptionist/dashboard" replace />;
    case 'PATIENT':
      return <Navigate to="/patient/dashboard" replace />;
    default:
      return <Navigate to="/login" replace />;
  }
};

function App() {
  return (
    <Routes>
      {/* Root Redirection */}
      <Route path="/" element={<RootRedirect />} />

      {/* Public Auth Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* ADMIN ROUTES */}
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/patients"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <PatientsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/doctors"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <DoctorsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/appointments"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <AppointmentsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/beds"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <BedsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/bills"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <BillsPage />
          </ProtectedRoute>
        }
      />

      {/* DOCTOR ROUTES */}
      <Route
        path="/doctor/dashboard"
        element={
          <ProtectedRoute allowedRoles={['DOCTOR']}>
            <DoctorDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/doctor/appointments"
        element={
          <ProtectedRoute allowedRoles={['DOCTOR']}>
            <DoctorAppointments />
          </ProtectedRoute>
        }
      />
      <Route
        path="/doctor/patients"
        element={
          <ProtectedRoute allowedRoles={['DOCTOR']}>
            <DoctorPatients />
          </ProtectedRoute>
        }
      />
      <Route
        path="/doctor/prescriptions"
        element={
          <ProtectedRoute allowedRoles={['DOCTOR']}>
            <DoctorPrescriptions />
          </ProtectedRoute>
        }
      />
      <Route
        path="/doctor/profile"
        element={
          <ProtectedRoute allowedRoles={['DOCTOR']}>
            <DoctorProfile />
          </ProtectedRoute>
        }
      />

      {/* RECEPTIONIST ROUTES */}
      <Route
        path="/receptionist/dashboard"
        element={
          <ProtectedRoute allowedRoles={['RECEPTIONIST']}>
            <ReceptionistDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/receptionist/appointments"
        element={
          <ProtectedRoute allowedRoles={['RECEPTIONIST']}>
            <ReceptionistAppointments />
          </ProtectedRoute>
        }
      />
      <Route
        path="/receptionist/beds"
        element={
          <ProtectedRoute allowedRoles={['RECEPTIONIST']}>
            <ReceptionistBeds />
          </ProtectedRoute>
        }
      />
      <Route
        path="/receptionist/patients"
        element={
          <ProtectedRoute allowedRoles={['RECEPTIONIST']}>
            <ReceptionistPatients />
          </ProtectedRoute>
        }
      />
      <Route
        path="/receptionist/bills"
        element={
          <ProtectedRoute allowedRoles={['RECEPTIONIST']}>
            <ReceptionistBills />
          </ProtectedRoute>
        }
      />

      {/* PATIENT ROUTES */}
      <Route
        path="/patient/dashboard"
        element={
          <ProtectedRoute allowedRoles={['PATIENT']}>
            <PatientDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/patient/appointments"
        element={
          <ProtectedRoute allowedRoles={['PATIENT']}>
            <PatientAppointments />
          </ProtectedRoute>
        }
      />
      <Route
        path="/patient/prescriptions"
        element={
          <ProtectedRoute allowedRoles={['PATIENT']}>
            <PatientPrescriptions />
          </ProtectedRoute>
        }
      />
      <Route
        path="/patient/bills"
        element={
          <ProtectedRoute allowedRoles={['PATIENT']}>
            <PatientBills />
          </ProtectedRoute>
        }
      />
      <Route
        path="/patient/profile"
        element={
          <ProtectedRoute allowedRoles={['PATIENT']}>
            <PatientProfile />
          </ProtectedRoute>
        }
      />

      {/* Fallback to Root */}
      <Route path="*" element={<RootRedirect />} />
    </Routes>
  );
}

export default App;
