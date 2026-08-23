import api from './axios';

// Auth Endpoints
export const loginApi = (data) => api.post('/auth/login', data);
export const registerApi = (data) => api.post('/auth/register', data);
export const getMeApi = () => api.get('/auth/me');
export const updateProfileApi = (data) => api.put('/auth/profile', data);

// Admin Endpoints
export const getAdminStatsApi = () => api.get('/admin/stats');
export const getAdminDoctorsApi = () => api.get('/admin/doctors');
export const createAdminDoctorApi = (data) => api.post('/admin/doctors', data);
export const updateAdminDoctorApi = (id, data) => api.put(`/admin/doctors/${id}`, data);
export const getAdminPatientsApi = () => api.get('/admin/patients');
export const getAdminStaffApi = () => api.get('/admin/staff');
export const toggleUserStatusApi = (id) => api.patch(`/admin/users/${id}/toggle-status`);

// Doctor Endpoints
export const getDoctorsListApi = (params) => api.get('/doctors', { params });
export const getDoctorDetailsApi = (id) => api.get(`/doctors/${id}`);
export const getDoctorDashboardMetricsApi = () => api.get('/doctors/dashboard/metrics');
export const getDoctorAppointmentsApi = (params) => api.get('/doctors/dashboard/appointments', { params });
export const getDoctorPatientsApi = () => api.get('/doctors/dashboard/patients');

// Patient Endpoints
export const getPatientProfileApi = (params) => api.get('/patients/profile', { params });
export const getEmergencyProfileApi = (patientId) => api.get(`/patients/emergency/${patientId}`);
export const updatePatientProfileApi = (data) => api.put('/patients/profile', data);
export const getPatientDashboardApi = () => api.get('/patients/dashboard');
export const addMedicalRecordApi = (id, data) => api.post(`/patients/${id}/medical-records`, data);

// Appointment Endpoints
export const createAppointmentApi = (data) => api.post('/appointments', data);
export const getAppointmentsApi = (params) => api.get('/appointments', { params });
export const updateAppointmentStatusApi = (id, data) => api.patch(`/appointments/${id}/status`, data);

// Prescription Endpoints
export const createPrescriptionApi = (data) => api.post('/prescriptions', data);
export const checkDrugSafetyApi = (data) => api.post('/prescriptions/check-safety', data);
export const getPrescriptionsApi = (params) => api.get('/prescriptions', { params });
export const getPrescriptionByIdApi = (id) => api.get(`/prescriptions/${id}`);

// Billing Endpoints
export const createInvoiceApi = (data) => api.post('/billing', data);
export const getInvoicesApi = (params) => api.get('/billing', { params });
export const getInvoiceByIdApi = (id) => api.get(`/billing/${id}`);
export const getPublicInvoiceApi = (id) => api.get(`/billing/public/${id}`);
export const payPublicInvoiceApi = (id, data) => api.post(`/billing/public/${id}/pay`, data);
export const updatePaymentStatusApi = (id, data) => api.patch(`/billing/${id}/pay`, data);

// Bed Endpoints
export const getBedsApi = (params) => api.get('/beds', { params });
export const createBedApi = (data) => api.post('/beds', data);
export const allocateBedApi = (id, data) => api.patch(`/beds/${id}/allocate`, data);
export const releaseBedApi = (id) => api.patch(`/beds/${id}/release`);
export const deleteBedApi = (id) => api.delete(`/beds/${id}`);

// AI Health & Hospital Assistant Endpoints
export const askAiAssistantApi = (data) => api.post('/ai/chat', data);
export const getAiSuggestionsApi = () => api.get('/ai/suggestions');
