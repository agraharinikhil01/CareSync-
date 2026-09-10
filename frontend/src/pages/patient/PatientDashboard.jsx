import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import DashboardLayout from '../../layouts/DashboardLayout';
import {
  Calendar,
  FileText,
  Receipt,
  User,
  ArrowRight,
  Download,
  Clock,
  HeartPulse,
  Plus,
  Stethoscope,
  ShieldCheck,
  CreditCard,
  QrCode,
} from 'lucide-react';
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

  const getTimeGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
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
      <DashboardLayout title="My Healthcare Portal">
        <div className="space-y-6">
          <div className="h-36 bg-white rounded-2xl border border-slate-200 animate-pulse"></div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-28 bg-white rounded-2xl border border-slate-200 animate-pulse"></div>
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="My Healthcare Portal">
      <div className="space-y-6">
        {/* Patient Hero Welcome Card */}
        <div className="bg-gradient-to-br from-white via-sky-50/40 to-teal-50/30 border border-slate-200/80 rounded-2xl p-6 sm:p-8 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-sky-600 to-teal-500 text-white flex items-center justify-center font-bold text-2xl shadow-lg shadow-sky-500/20 shrink-0">
              {profile?.user?.name ? profile.user.name.charAt(0).toUpperCase() : 'P'}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-mono font-bold text-sky-700 bg-sky-100/80 px-2.5 py-0.5 rounded-full border border-sky-200">
                  {profile?.patientId}
                </span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                  Blood Group: {profile?.bloodGroup || 'O+'}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                {getTimeGreeting()}, {profile?.user?.name || 'Patient'}
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Here's your personal care overview, appointments, and prescriptions.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/patient/appointments"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold shadow-xs shadow-sky-600/20 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Book Appointment</span>
            </Link>
            <Link
              to="/patient/profile"
              className="px-3.5 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold shadow-2xs transition-colors flex items-center gap-1.5"
            >
              <QrCode className="w-4 h-4 text-slate-500" />
              <span>Health Card</span>
            </Link>
          </div>
        </div>

        {/* 3 Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Consultations
              </span>
              <h3 className="text-2xl font-extrabold text-slate-900 mt-1">
                {appointments.length}
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">Total booked appointments</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Active Prescriptions
              </span>
              <h3 className="text-2xl font-extrabold text-emerald-600 mt-1">
                {prescriptions.length}
              </h3>
              <p className="text-[11px] text-emerald-700 mt-0.5">Digitally signed clinical Rx</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Billing Invoices
              </span>
              <h3 className="text-2xl font-extrabold text-indigo-600 mt-1">{bills.length}</h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {pendingBill ? '1 Pending payment' : 'All accounts settled'}
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Receipt className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Hero Next Appointment & Latest Rx Split */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Next Appointment Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-sky-600" />
                  Your Next Appointment
                </h2>
                <Link
                  to="/patient/appointments"
                  className="text-xs font-semibold text-sky-600 hover:text-sky-700 hover:underline"
                >
                  View all
                </Link>
              </div>

              {upcomingAppointment ? (
                <div className="p-4 rounded-xl border border-sky-100 bg-sky-50/50 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-base font-bold text-slate-900">
                        Dr. {upcomingAppointment.doctor?.name || 'Physician'}
                      </h4>
                      <p className="text-xs text-slate-500">General Consultation</p>
                    </div>
                    <span
                      className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full ${
                        upcomingAppointment.status === 'CONFIRMED'
                          ? 'bg-sky-100 text-sky-800 border border-sky-200'
                          : 'bg-amber-100 text-amber-800 border border-amber-200'
                      }`}
                    >
                      ● {upcomingAppointment.status}
                    </span>
                  </div>

                  <div className="bg-white p-3 rounded-lg border border-slate-200/70 text-xs text-slate-600 space-y-1.5">
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-sky-600" />
                      <span>
                        Date: <strong>{new Date(upcomingAppointment.date).toLocaleDateString()}</strong> at{' '}
                        <strong>{upcomingAppointment.time}</strong>
                      </span>
                    </div>
                    <p className="text-slate-500">
                      Chief Complaint: <em>{upcomingAppointment.reason}</em>
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center">
                  <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-slate-700">No upcoming consultations</p>
                  <p className="text-xs text-slate-400 mt-1">Book an appointment whenever you need care.</p>
                  <Link
                    to="/patient/appointments"
                    className="inline-block mt-3 px-3.5 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold transition-colors"
                  >
                    Schedule Now
                  </Link>
                </div>
              )}
            </div>

            <Link
              to="/patient/appointments"
              className="mt-4 w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl text-center block transition-colors"
            >
              Manage Consultations
            </Link>
          </div>

          {/* Latest Prescription Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-emerald-600" />
                  Latest Medical Prescription
                </h2>
                <Link
                  to="/patient/prescriptions"
                  className="text-xs font-semibold text-sky-600 hover:text-sky-700 hover:underline"
                >
                  Rx Archive
                </Link>
              </div>

              {latestPrescription ? (
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-base font-bold text-slate-900">
                        {latestPrescription.diagnosis}
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Issued by Dr. {latestPrescription.doctor?.name} on{' '}
                        {new Date(latestPrescription.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDownloadPDF(latestPrescription._id)}
                      className="p-2 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-700 text-xs font-semibold transition-colors cursor-pointer"
                      title="Download PDF"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1.5 text-xs text-slate-600">
                    <span className="font-bold text-slate-800 block">Prescribed Medicines:</span>
                    <ul className="list-disc list-inside space-y-1">
                      {latestPrescription.medicines?.slice(0, 3).map((m, idx) => (
                        <li key={idx}>
                          <strong className="text-slate-900">{m.name}</strong> — {m.dosage} ({m.frequency})
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center">
                  <FileText className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-slate-700">No active prescriptions</p>
                  <p className="text-xs text-slate-400 mt-1">Your doctor will author digital Rx after your consultation.</p>
                </div>
              )}
            </div>

            <Link
              to="/patient/prescriptions"
              className="mt-4 w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl text-center block transition-colors"
            >
              Open Prescription Vault
            </Link>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default PatientDashboard;
