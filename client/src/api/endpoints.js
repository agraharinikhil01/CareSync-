import api from './axios';

// Auth
export const loginApi       = (data)    => api.post('/auth/login', data);
export const registerApi    = (data)    => api.post('/auth/register', data);
export const getMeApi       = ()        => api.get('/auth/me');
export const changePasswordApi = (data) => api.patch('/auth/change-password', data);

// Admin
export const getAdminStats  = ()        => api.get('/admin/stats');
export const getAllUsers     = ()        => api.get('/admin/users');
export const toggleUser     = (id)      => api.patch(`/admin/users/${id}/toggle`);
export const deleteUser     = (id)      => api.delete(`/admin/users/${id}`);

// Doctors
export const getAllDoctors    = ()       => api.get('/doctors');
export const getDoctorById   = (id)     => api.get(`/doctors/${id}`);
export const getDoctorProfile= ()       => api.get('/doctors/my-profile');
export const updateDoctorProfile=(data) => api.patch('/doctors/my-profile', data);
export const getDoctorAppointments=()   => api.get('/doctors/my-appointments');
export const getDoctorPrescriptions=()  => api.get('/doctors/my-prescriptions');

// Patients
export const getAllPatients   = ()       => api.get('/patients');
export const getPatientProfile= ()      => api.get('/patients/my-profile');
export const updatePatientProfile=(d)   => api.patch('/patients/my-profile', d);
export const getPatientAppointments=()  => api.get('/patients/my-appointments');
export const getPatientPrescriptions=() => api.get('/patients/my-prescriptions');
export const getPatientBills= ()        => api.get('/patients/my-bills');

// Appointments
export const createAppointment  = (d)   => api.post('/appointments', d);
export const getAppointments    = ()    => api.get('/appointments');
export const updateAppointmentStatus=(id,d)=> api.patch(`/appointments/${id}/status`,d);
export const deleteAppointment  = (id)  => api.delete(`/appointments/${id}`);

// Prescriptions
export const createPrescription = (d)   => api.post('/prescriptions', d);
export const getPrescriptions   = ()    => api.get('/prescriptions');
export const verifyPrescription = (hash)=> api.get(`/prescriptions/verify/${hash}`);

// Beds
export const getBeds            = ()    => api.get('/beds');
export const admitPatient       = (id,d)=> api.patch(`/beds/${id}/admit`, d);
export const dischargePatient   = (id)  => api.patch(`/beds/${id}/discharge`);

// Billing
export const createBill         = (d)   => api.post('/billing', d);
export const getBills           = ()    => api.get('/billing');
export const markBillPaid       = (id,d)=> api.patch(`/billing/${id}/pay`, d);
export const getBillingStats    = ()    => api.get('/billing/stats');

// AI
export const chatWithAI         = (d)   => api.post('/ai/chat', d);
