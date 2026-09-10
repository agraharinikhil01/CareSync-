import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import DashboardLayout from '../../layouts/DashboardLayout';
import {
  Calendar,
  Users,
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Stethoscope,
  Sparkles,
  Plus,
  User,
  HeartPulse,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const DoctorDashboard = () => {
  const [stats, setStats] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [statsRes, profileRes] = await Promise.all([
        api.get('/doctors/me/dashboard-stats'),
        api.get('/doctors/me/profile'),
      ]);
      if (statsRes.data.success) setStats(statsRes.data.data);
      if (profileRes.data.success) setProfile(profileRes.data.data);
    } catch {
      toast.error('Failed to load clinical dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      const res = await api.patch(`/appointments/${id}/status`, { status });
      if (res.data.success) {
        toast.success(`Appointment marked as ${status}`);
        fetchDashboardData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Status update failed');
    }
  };

  const getTimeGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  if (loading) {
    return (
      <DashboardLayout title="Clinical OPD Console">
        <div className="space-y-6">
          <div className="h-28 bg-white rounded-2xl border border-slate-200 animate-pulse"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-white rounded-2xl border border-slate-200 animate-pulse"></div>
            ))}
          </div>
          <div className="h-80 bg-white rounded-2xl border border-slate-200 animate-pulse"></div>
        </div>
      </DashboardLayout>
    );
  }

  const todayList = stats?.todayAppointments || [];
  const upcomingList = stats?.upcomingAppointments || [];

  return (
    <DashboardLayout title="Clinical OPD Console">
      <div className="space-y-6">
        {/* Doctor Header Banner */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-sky-600 to-teal-500 text-white flex items-center justify-center font-bold text-2xl shadow-md shadow-sky-500/20 shrink-0">
              {profile?.user?.name ? profile.user.name.charAt(0).toUpperCase() : 'D'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                  {getTimeGreeting()}, Dr. {profile?.user?.name || 'Physician'}
                </h1>
                <span
                  className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full border ${
                    profile?.availability
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-slate-100 text-slate-600 border-slate-200'
                  }`}
                >
                  {profile?.availability ? '● On-Duty & Accepting' : '○ Off-Duty'}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {profile?.specialization || 'Attending Physician'} · {profile?.qualification} ·{' '}
                <span className="text-emerald-700 font-semibold">Fee: ₹{profile?.consultationFee}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <Link
              to="/doctor/prescriptions"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold shadow-xs shadow-sky-600/20 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Write Prescription</span>
            </Link>
            <Link
              to="/doctor/profile"
              className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold shadow-2xs transition-colors"
            >
              Edit Profile
            </Link>
          </div>
        </div>

        {/* 4 Top KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Today's Schedule
              </span>
              <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
                <Calendar className="w-4 h-4" />
              </div>
            </div>
            <div>
              <h3 className="text-3xl font-extrabold text-slate-900">{todayList.length}</h3>
              <p className="text-[11px] text-slate-400 mt-1">Scheduled appointments today</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Upcoming Patients
              </span>
              <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div>
              <h3 className="text-3xl font-extrabold text-slate-900">{upcomingList.length}</h3>
              <p className="text-[11px] text-indigo-600 mt-1">Future confirmed slots</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Assigned Patients
              </span>
              <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div>
              <h3 className="text-3xl font-extrabold text-slate-900">
                {stats?.totalAssignedPatients || 0}
              </h3>
              <p className="text-[11px] text-teal-600 mt-1">Under your continuous care</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Pending Visits
              </span>
              <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <FileText className="w-4 h-4" />
              </div>
            </div>
            <div>
              <h3 className="text-3xl font-extrabold text-slate-900">
                {stats?.pendingPrescriptions || 0}
              </h3>
              <p className="text-[11px] text-amber-600 mt-1">Awaiting consultation closeout</p>
            </div>
          </div>
        </div>

        {/* Main Content Split: Today's OPD Queue (2 cols) & Upcoming Appointments (1 col) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Today's Queue */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
                <div>
                  <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-sky-600" />
                    Today's OPD Queue
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">Patient consultations scheduled for today</p>
                </div>
                <Link
                  to="/doctor/appointments"
                  className="text-xs font-semibold text-sky-600 hover:text-sky-700 hover:underline flex items-center gap-1"
                >
                  Full Schedule <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {todayList.length === 0 ? (
                <div className="p-10 text-center">
                  <Clock className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-slate-700">No consultations on today's queue</p>
                  <p className="text-xs text-slate-400 mt-1">Review upcoming consultations to prepare clinical notes.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {todayList.map((app) => (
                    <div
                      key={app._id}
                      className="p-4 rounded-xl border border-slate-200/80 hover:border-slate-300 bg-slate-50/50 hover:bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl bg-sky-600 text-white flex items-center justify-center font-bold text-sm shadow-2xs shrink-0">
                          {app.patient?.name ? app.patient.name.charAt(0).toUpperCase() : 'P'}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-bold text-slate-900">{app.patient?.name}</h4>
                            <span
                              className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                                app.status === 'CONFIRMED'
                                  ? 'bg-sky-50 text-sky-700 border border-sky-200'
                                  : app.status === 'COMPLETED'
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : 'bg-amber-50 text-amber-700 border border-amber-200'
                              }`}
                            >
                              ● {app.status}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5">
                            Slot: <strong className="text-slate-700">{app.time}</strong> · Reason: {app.reason}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {app.status === 'CONFIRMED' && (
                          <button
                            onClick={() => handleStatusUpdate(app._id, 'COMPLETED')}
                            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
                          >
                            Mark Completed
                          </button>
                        )}
                        <Link
                          to="/doctor/prescriptions"
                          className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <FileText className="w-3.5 h-3.5 text-sky-600" />
                          <span>Prescribe</span>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Upcoming Schedule Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
                <div>
                  <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-indigo-600" />
                    Upcoming Bookings
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">Next scheduled slots</p>
                </div>
              </div>

              {upcomingList.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs">No upcoming appointments</div>
              ) : (
                <div className="space-y-3">
                  {upcomingList.slice(0, 5).map((app) => (
                    <div
                      key={app._id}
                      className="p-3 rounded-xl border border-slate-100 bg-slate-50/50 flex items-center justify-between"
                    >
                      <div>
                        <p className="text-xs font-bold text-slate-900">{app.patient?.name}</p>
                        <p className="text-[10px] text-slate-500">
                          {new Date(app.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} at{' '}
                          {app.time}
                        </p>
                      </div>
                      <span className="text-[10px] font-semibold text-slate-500 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                        {app.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Link
              to="/doctor/appointments"
              className="mt-4 w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl text-center block transition-colors"
            >
              View Full OPD Calendar
            </Link>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DoctorDashboard;
