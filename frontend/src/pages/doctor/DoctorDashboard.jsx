import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import DashboardLayout from '../../layouts/DashboardLayout';
import { Calendar, Users, FileText, Clock, CheckCircle2, XCircle, ArrowRight, Stethoscope } from 'lucide-react';
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

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-12 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-[#0087be] border-t-transparent"></div>
          <p className="mt-3 text-sm text-[#50575e]">Loading OPD clinical dashboard...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Top Banner */}
        <div className="bg-white border border-[#dcdcde] rounded-md p-6 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-[#006088] text-white flex items-center justify-center font-bold text-xl">
                {profile?.user?.name ? profile.user.name.charAt(0) : 'D'}
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-[#2c3338] tracking-tight">
                  Welcome back, Dr. {profile?.user?.name || 'Doctor'}
                </h1>
                <p className="text-sm text-[#50575e] mt-0.5">
                  {profile?.specialization || 'Clinical Specialist'} · {profile?.qualification}
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span
              className={`text-xs px-3 py-1.5 rounded-full font-semibold ${
                profile?.availability
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-gray-100 text-gray-600 border border-gray-200'
              }`}
            >
              {profile?.availability ? '● On-Duty & Accepting Patients' : '○ Currently Off-Duty'}
            </span>
            <Link
              to="/doctor/prescriptions"
              className="px-3.5 py-2 bg-[#0087be] hover:bg-[#006088] text-white text-xs font-semibold rounded-sm shadow-xs transition-colors"
            >
              Write Prescription
            </Link>
          </div>
        </div>

        {/* 4 Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-md border border-[#dcdcde] shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#50575e] uppercase">Today's Queue</span>
              <Calendar className="w-5 h-5 text-[#006088]" />
            </div>
            <h3 className="text-2xl font-bold text-[#2c3338] mt-2">
              {stats?.todayAppointments?.length || 0}
            </h3>
            <span className="text-xs text-gray-400">Scheduled for today</span>
          </div>

          <div className="bg-white p-5 rounded-md border border-[#dcdcde] shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#50575e] uppercase">Upcoming OPD</span>
              <Clock className="w-5 h-5 text-indigo-600" />
            </div>
            <h3 className="text-2xl font-bold text-[#2c3338] mt-2">
              {stats?.upcomingAppointments?.length || 0}
            </h3>
            <span className="text-xs text-indigo-600">Future scheduled slots</span>
          </div>

          <div className="bg-white p-5 rounded-md border border-[#dcdcde] shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#50575e] uppercase">Total Patients</span>
              <Users className="w-5 h-5 text-emerald-600" />
            </div>
            <h3 className="text-2xl font-bold text-[#2c3338] mt-2">
              {stats?.totalAssignedPatients || 0}
            </h3>
            <span className="text-xs text-emerald-600">Under clinical care</span>
          </div>

          <div className="bg-white p-5 rounded-md border border-[#dcdcde] shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#50575e] uppercase">Pending Visits</span>
              <FileText className="w-5 h-5 text-amber-600" />
            </div>
            <h3 className="text-2xl font-bold text-[#2c3338] mt-2">
              {stats?.pendingPrescriptions || 0}
            </h3>
            <span className="text-xs text-amber-600">Awaiting consultation</span>
          </div>
        </div>

        {/* Today's Queue Table */}
        <div className="bg-white rounded-md border border-[#dcdcde] shadow-xs overflow-hidden">
          <div className="px-6 py-4 border-b border-[#dcdcde] flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-[#2c3338]">Today's Patient Queue</h2>
              <p className="text-xs text-[#50575e] mt-0.5">Appointments scheduled for today</p>
            </div>
            <Link
              to="/doctor/appointments"
              className="text-xs font-semibold text-[#0087be] hover:underline flex items-center gap-1"
            >
              View Full Schedule <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {(!stats?.todayAppointments || stats.todayAppointments.length === 0) ? (
            <div className="p-8 text-center">
              <Clock className="w-10 h-10 text-gray-300 mx-auto mb-2" />
              <p className="text-sm font-medium text-[#2c3338]">No consultations scheduled for today</p>
              <p className="text-xs text-[#50575e] mt-0.5">Check upcoming appointments to prepare in advance.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-[#f6f7f7] text-[#50575e] font-semibold text-xs border-b border-[#dcdcde]">
                    <th className="py-3 px-4">PATIENT NAME</th>
                    <th className="py-3 px-4">SLOT</th>
                    <th className="py-3 px-4">CHIEF COMPLAINT</th>
                    <th className="py-3 px-4">STATUS</th>
                    <th className="py-3 px-4 text-right">ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#dcdcde]">
                  {stats.todayAppointments.map((app) => (
                    <tr key={app._id} className="hover:bg-[#fcfcfc] transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-semibold text-[#2c3338]">{app.patient?.name}</div>
                        <div className="text-xs text-[#50575e]">{app.patient?.phone}</div>
                      </td>
                      <td className="py-3 px-4 font-medium text-[#006088] whitespace-nowrap">
                        {app.time}
                      </td>
                      <td className="py-3 px-4 text-[#50575e] max-w-xs truncate">
                        {app.reason}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium ${
                            app.status === 'CONFIRMED'
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
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
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {app.status === 'CONFIRMED' && (
                            <button
                              onClick={() => handleStatusUpdate(app._id, 'COMPLETED')}
                              className="px-2.5 py-1 text-xs font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-sm border border-emerald-200 cursor-pointer"
                            >
                              Complete
                            </button>
                          )}
                          {app.status !== 'COMPLETED' && app.status !== 'CANCELLED' && (
                            <button
                              onClick={() => handleStatusUpdate(app._id, 'CANCELLED')}
                              className="px-2 py-1 text-xs font-medium bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-sm border border-rose-200 cursor-pointer"
                            >
                              Cancel
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

export default DoctorDashboard;
