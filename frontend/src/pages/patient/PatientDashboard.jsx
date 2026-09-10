import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import DashboardLayout from '../../layouts/DashboardLayout';
import { Calendar, FileText, Receipt, User, ArrowRight, Download, Clock, HeartPulse, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const PatientDashboard = () => {
  const [profile, setProfile] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPatientPortalData();
  }, []);

  const fetchPatientPortalData = async () => {
    setLoading(true);
    try {
      const [profRes, apptRes, rxRes, billRes] = await Promise.all([
        api.get('/patients/me/profile'),
        api.get('/appointments'),
        api.get('/prescriptions'),
        api.get('/bills'),
      ]);

      if (profRes.data.success) setProfile(profRes.data.data);
      if (apptRes.data.success) setAppointments(apptRes.data.data);
      if (rxRes.data.success) setPrescriptions(rxRes.data.data);
      if (billRes.data.success) setBills(billRes.data.data);
    } catch {
      toast.error('Failed to load patient records');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async (id) => {
    try {
      toast.loading('Downloading prescription PDF...', { id: 'pdf' });
      const res = await api.get(`/prescriptions/${id}/pdf`, { responseType: 'blob' });
      const blob = new Blob([res.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Prescription_${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Downloaded successfully', { id: 'pdf' });
    } catch {
      toast.error('Failed to download PDF', { id: 'pdf' });
    }
  };

  const upcomingAppointment = appointments.find(
    (a) => a.status === 'CONFIRMED' || a.status === 'PENDING'
  );
  const latestPrescription = prescriptions[0];
  const pendingBill = bills.find((b) => b.paymentStatus === 'PENDING');

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-12 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-[#0087be] border-t-transparent"></div>
          <p className="mt-3 text-sm text-[#50575e]">Loading personal health dashboard...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Welcome Banner */}
        <div className="bg-white border border-[#dcdcde] rounded-md p-6 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-[#006088] text-white flex items-center justify-center font-bold text-2xl shadow-xs">
              {profile?.user?.name ? profile.user.name.charAt(0) : 'P'}
            </div>
            <div>
              <span className="text-xs font-mono font-semibold text-[#0087be] bg-[#e6f4f8] px-2 py-0.5 rounded-sm">
                ID: {profile?.patientId}
              </span>
              <h1 className="text-2xl font-semibold text-[#2c3338] tracking-tight mt-1">
                Hello, {profile?.user?.name || 'Patient'}
              </h1>
              <p className="text-xs text-[#50575e] mt-0.5">
                Blood Group: <strong className="text-rose-700">{profile?.bloodGroup || 'O+'}</strong> · Gender: {profile?.gender || 'N/A'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/patient/appointments"
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#0087be] hover:bg-[#006088] text-white text-xs font-semibold rounded-sm shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" /> Book Consultation
            </Link>
            <Link
              to="/patient/profile"
              className="px-3.5 py-2 bg-[#f6f7f7] hover:bg-[#eaeaea] text-[#2c3338] border border-[#dcdcde] text-xs font-semibold rounded-sm transition-colors"
            >
              Health Profile & QR
            </Link>
          </div>
        </div>

        {/* 3 Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-md border border-[#dcdcde] shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#50575e] uppercase">My Consultations</span>
              <Calendar className="w-5 h-5 text-[#006088]" />
            </div>
            <h3 className="text-2xl font-bold text-[#2c3338] mt-2">{appointments.length}</h3>
            <span className="text-xs text-gray-400">Total appointments booked</span>
          </div>

          <div className="bg-white p-5 rounded-md border border-[#dcdcde] shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#50575e] uppercase">Active Prescriptions</span>
              <FileText className="w-5 h-5 text-emerald-600" />
            </div>
            <h3 className="text-2xl font-bold text-emerald-600 mt-2">{prescriptions.length}</h3>
            <span className="text-xs text-emerald-600">Digital Rx on record</span>
          </div>

          <div className="bg-white p-5 rounded-md border border-[#dcdcde] shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#50575e] uppercase">Hospital Invoices</span>
              <Receipt className="w-5 h-5 text-indigo-600" />
            </div>
            <h3 className="text-2xl font-bold text-indigo-600 mt-2">{bills.length}</h3>
            <span className="text-xs text-indigo-600">
              {pendingBill ? '1 Pending Payment' : 'All accounts settled'}
            </span>
          </div>
        </div>

        {/* Highlight Section: Next Appointment & Latest Rx */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Upcoming Appointment */}
          <div className="bg-white rounded-md border border-[#dcdcde] shadow-xs p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <h2 className="text-base font-semibold text-[#2c3338] flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-[#006088]" />
                  Upcoming Consultation
                </h2>
                <Link
                  to="/patient/appointments"
                  className="text-xs font-semibold text-[#0087be] hover:underline"
                >
                  View All
                </Link>
              </div>

              {upcomingAppointment ? (
                <div className="mt-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-[#2c3338] text-base">
                        Dr. {upcomingAppointment.doctor?.name || 'Physician'}
                      </h4>
                      <p className="text-xs text-[#50575e]">General Consultation</p>
                    </div>
                    <span
                      className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                        upcomingAppointment.status === 'CONFIRMED'
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      ● {upcomingAppointment.status}
                    </span>
                  </div>

                  <div className="bg-[#f6f7f7] p-3 rounded-sm text-xs text-[#50575e] space-y-1">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-[#006088]" />
                      <span>
                        Date: <strong>{new Date(upcomingAppointment.date).toLocaleDateString()}</strong> at{' '}
                        <strong>{upcomingAppointment.time}</strong>
                      </span>
                    </div>
                    <p className="pt-1 text-gray-500">
                      Reason: <em>{upcomingAppointment.reason}</em>
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center">
                  <Calendar className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm font-medium text-[#2c3338]">No upcoming consultations</p>
                  <p className="text-xs text-[#50575e] mt-1">Book an appointment whenever you need care.</p>
                  <Link
                    to="/patient/appointments"
                    className="inline-block mt-3 px-3.5 py-1.5 bg-[#0087be] hover:bg-[#006088] text-white text-xs font-semibold rounded-sm transition-colors"
                  >
                    Schedule Now
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Latest Prescription */}
          <div className="bg-white rounded-md border border-[#dcdcde] shadow-xs p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <h2 className="text-base font-semibold text-[#2c3338] flex items-center gap-2">
                  <FileText className="w-5 h-5 text-[#006088]" />
                  Latest Medical Prescription
                </h2>
                <Link
                  to="/patient/prescriptions"
                  className="text-xs font-semibold text-[#0087be] hover:underline"
                >
                  Archive
                </Link>
              </div>

              {latestPrescription ? (
                <div className="mt-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-semibold text-[#2c3338] text-base">
                        {latestPrescription.diagnosis}
                      </h4>
                      <p className="text-xs text-[#50575e] mt-0.5">
                        Issued by Dr. {latestPrescription.doctor?.name} on{' '}
                        {new Date(latestPrescription.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDownloadPDF(latestPrescription._id)}
                      className="p-1.5 text-[#0087be] hover:bg-[#e6f4f8] rounded-sm transition-colors cursor-pointer"
                      title="Download Signed PDF"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="bg-[#f6f7f7] p-3 rounded-sm space-y-1.5 text-xs text-[#50575e]">
                    <span className="font-semibold text-[#2c3338] block">Prescribed Medicines:</span>
                    <ul className="list-disc list-inside space-y-1">
                      {latestPrescription.medicines?.slice(0, 3).map((m, idx) => (
                        <li key={idx}>
                          <span className="font-medium text-[#2c3338]">{m.name}</span> — {m.dosage} ({m.frequency})
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center">
                  <FileText className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm font-medium text-[#2c3338]">No prescriptions issued yet</p>
                  <p className="text-xs text-[#50575e] mt-1">Your doctor will generate Rx after consultation.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default PatientDashboard;
