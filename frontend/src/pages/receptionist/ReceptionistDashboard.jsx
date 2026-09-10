import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import DashboardLayout from '../../layouts/DashboardLayout';
import {
  Calendar,
  Bed,
  Users,
  Receipt,
  Plus,
  Clock,
  ArrowRight,
  CheckCircle2,
  XCircle,
  CalendarCheck,
  UserPlus,
  BedDouble,
  Search,
  Check,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const ReceptionistDashboard = () => {
  const [appointments, setAppointments] = useState([]);
  const [bedStats, setBedStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [apptRes, bedRes] = await Promise.all([
        api.get('/appointments'),
        api.get('/beds/stats'),
      ]);
      if (apptRes.data.success) setAppointments(apptRes.data.data);
      if (bedRes.data.success) setBedStats(bedRes.data.data);
    } catch {
      toast.error('Failed to load front-desk metrics');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      const res = await api.patch(`/appointments/${id}/status`, { status });
      if (res.data.success) {
        toast.success(`Appointment set to ${status}`);
        fetchData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    }
  };

  const getTimeGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const todayStr = new Date().toISOString().split('T')[0];
  const todayAppointments = appointments.filter((a) => a.date?.startsWith(todayStr));
  const pendingAppointments = appointments.filter((a) => a.status === 'PENDING');

  if (loading) {
    return (
      <DashboardLayout title="Front-Desk Dispatch">
        <div className="space-y-6">
          <div className="h-28 bg-white rounded-2xl border border-slate-200 animate-pulse"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-white rounded-2xl border border-slate-200 animate-pulse"></div>
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Front-Desk Dispatch">
      <div className="space-y-6">
        {/* Header Hero */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-teal-50 border border-teal-200/60 text-xs text-teal-800 font-semibold mb-2">
              <CalendarCheck className="w-3.5 h-3.5 text-teal-600" />
              <span>Reception & Triage Center</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              {getTimeGreeting()}, Front Desk
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Manage today's front-desk intake, patient check-ins, and ward bed triage.
            </p>
          </div>

          {/* Quick Action Buttons (High Visibility) */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <Link
              to="/receptionist/appointments"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold shadow-xs shadow-sky-600/20 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Book Appointment</span>
            </Link>
            <Link
              to="/receptionist/beds"
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold shadow-xs shadow-teal-600/20 transition-all cursor-pointer"
            >
              <BedDouble className="w-4 h-4" />
              <span>Assign Bed</span>
            </Link>
            <Link
              to="/receptionist/patients"
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold shadow-2xs transition-colors"
            >
              <UserPlus className="w-4 h-4 text-slate-500" />
              <span>Register Patient</span>
            </Link>
            <Link
              to="/receptionist/bills"
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold shadow-2xs transition-colors"
            >
              <Receipt className="w-4 h-4 text-slate-500" />
              <span>Create Bill</span>
            </Link>
          </div>
        </div>

        {/* 4 KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Today's OPD Queue
              </span>
              <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
                <Calendar className="w-4 h-4" />
              </div>
            </div>
            <div>
              <h3 className="text-3xl font-extrabold text-slate-900">{todayAppointments.length}</h3>
              <p className="text-[11px] text-slate-400 mt-1">Total appointments scheduled today</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Pending Intake
              </span>
              <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div>
              <h3 className="text-3xl font-extrabold text-amber-600">{pendingAppointments.length}</h3>
              <p className="text-[11px] text-amber-700 mt-1">Awaiting confirmation or arrival</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Available Beds
              </span>
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Bed className="w-4 h-4" />
              </div>
            </div>
            <div>
              <h3 className="text-3xl font-extrabold text-emerald-600">{bedStats?.available || 0}</h3>
              <p className="text-[11px] text-emerald-700 mt-1">Ready for patient admission</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Occupied Beds
              </span>
              <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                <BedDouble className="w-4 h-4" />
              </div>
            </div>
            <div>
              <h3 className="text-3xl font-extrabold text-rose-600">{bedStats?.occupied || 0}</h3>
              <p className="text-[11px] text-slate-400 mt-1">
                {bedStats?.occupancyRate || 0}% overall ward occupancy
              </p>
            </div>
          </div>
        </div>

        {/* Today's Intake Queue Table */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 overflow-hidden">
          <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <CalendarCheck className="w-4 h-4 text-sky-600" />
                Today's Patient Queue & Check-In
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">Quick patient arrival confirmation</p>
            </div>
            <Link
              to="/receptionist/appointments"
              className="text-xs font-semibold text-sky-600 hover:text-sky-700 hover:underline flex items-center gap-1"
            >
              Full Ledger <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {todayAppointments.length === 0 ? (
            <div className="p-10 text-center text-slate-400 text-xs">
              No appointments scheduled for today
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="text-slate-400 font-bold border-b border-slate-100 uppercase tracking-wider">
                    <th className="py-2.5 px-3">Patient</th>
                    <th className="py-2.5 px-3">Attending Physician</th>
                    <th className="py-2.5 px-3">Slot</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {todayAppointments.map((app) => (
                    <tr key={app._id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-3">
                        <p className="font-bold text-slate-900">{app.patient?.name}</p>
                        <p className="text-[10px] text-slate-500 font-mono">{app.patient?.phone}</p>
                      </td>
                      <td className="py-3 px-3 text-slate-700 font-medium">
                        Dr. {app.doctor?.name}
                      </td>
                      <td className="py-3 px-3 font-mono text-slate-600">{app.time}</td>
                      <td className="py-3 px-3">
                        <span
                          className={`inline-flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-full font-semibold ${
                            app.status === 'CONFIRMED'
                              ? 'bg-sky-50 text-sky-700 border border-sky-200'
                              : app.status === 'COMPLETED'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : app.status === 'CANCELLED'
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          ● {app.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {app.status === 'PENDING' && (
                            <button
                              onClick={() => handleStatusUpdate(app._id, 'CONFIRMED')}
                              className="px-2.5 py-1 text-xs font-semibold bg-sky-50 text-sky-700 hover:bg-sky-100 rounded-lg border border-sky-200 transition-colors cursor-pointer"
                            >
                              Confirm
                            </button>
                          )}
                          {app.status === 'CONFIRMED' && (
                            <button
                              onClick={() => handleStatusUpdate(app._id, 'COMPLETED')}
                              className="px-2.5 py-1 text-xs font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg border border-emerald-200 transition-colors cursor-pointer"
                            >
                              Check-In
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ReceptionistDashboard;
