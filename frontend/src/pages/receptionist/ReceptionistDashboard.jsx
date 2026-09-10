import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import DashboardLayout from '../../layouts/DashboardLayout';
import { Calendar, Bed, Users, Receipt, Plus, Clock, ArrowRight, CheckCircle2, XCircle } from 'lucide-react';
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

  const todayStr = new Date().toISOString().split('T')[0];
  const todayAppointments = appointments.filter((a) => a.date?.startsWith(todayStr));
  const pendingAppointments = appointments.filter((a) => a.status === 'PENDING');

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#dcdcde] pb-4 bg-white p-6 rounded-md shadow-xs">
          <div>
            <h1 className="text-2xl font-semibold text-[#2c3338] tracking-tight">
              Reception & Front-Desk Dispatch
            </h1>
            <p className="text-sm text-[#50575e] mt-1">
              Patient check-ins, OPD queue management, bed allocation, and cashier billing operations.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/receptionist/appointments"
              className="inline-flex items-center gap-2 px-3.5 py-2 bg-[#0087be] hover:bg-[#006088] text-white text-xs font-semibold rounded-sm shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" /> Book Appointment
            </Link>
            <Link
              to="/receptionist/beds"
              className="inline-flex items-center gap-2 px-3.5 py-2 bg-[#f6f7f7] hover:bg-[#eaeaea] text-[#2c3338] border border-[#dcdcde] text-xs font-semibold rounded-sm transition-colors"
            >
              <Bed className="w-4 h-4 text-[#006088]" /> Ward Beds
            </Link>
          </div>
        </div>

        {/* 4 Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-md border border-[#dcdcde] shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#50575e] uppercase">Today's OPD Queue</span>
              <Calendar className="w-5 h-5 text-[#006088]" />
            </div>
            <h3 className="text-2xl font-bold text-[#2c3338] mt-2">{todayAppointments.length}</h3>
            <span className="text-xs text-gray-400">Scheduled for today</span>
          </div>

          <div className="bg-white p-5 rounded-md border border-[#dcdcde] shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#50575e] uppercase">Awaiting Confirmation</span>
              <Clock className="w-5 h-5 text-amber-600" />
            </div>
            <h3 className="text-2xl font-bold text-amber-600 mt-2">{pendingAppointments.length}</h3>
            <span className="text-xs text-amber-600">Pending intake check-in</span>
          </div>

          <div className="bg-white p-5 rounded-md border border-[#dcdcde] shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#50575e] uppercase">Bed Occupancy</span>
              <Bed className="w-5 h-5 text-indigo-600" />
            </div>
            <h3 className="text-2xl font-bold text-[#2c3338] mt-2">
              {bedStats?.occupancyRate || 0}%
            </h3>
            <span className="text-xs text-indigo-600">
              {bedStats?.occupied || 0} / {bedStats?.total || 0} beds occupied
            </span>
          </div>

          <div className="bg-white p-5 rounded-md border border-[#dcdcde] shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#50575e] uppercase">Available Beds</span>
              <Users className="w-5 h-5 text-emerald-600" />
            </div>
            <h3 className="text-2xl font-bold text-emerald-600 mt-2">
              {bedStats?.available || 0}
            </h3>
            <span className="text-xs text-emerald-600">Ready for admission</span>
          </div>
        </div>

        {/* Quick OPD Queue */}
        <div className="bg-white rounded-md border border-[#dcdcde] shadow-xs overflow-hidden">
          <div className="px-6 py-4 border-b border-[#dcdcde] flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-[#2c3338]">Today's Appointments Queue</h2>
              <p className="text-xs text-[#50575e] mt-0.5">Quick patient check-in & status validation</p>
            </div>
            <Link
              to="/receptionist/appointments"
              className="text-xs font-semibold text-[#0087be] hover:underline flex items-center gap-1"
            >
              Full Ledger <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {loading ? (
            <div className="p-12 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-[#0087be] border-t-transparent"></div>
              <p className="mt-3 text-sm text-[#50575e]">Loading appointments queue...</p>
            </div>
          ) : todayAppointments.length === 0 ? (
            <div className="p-8 text-center">
              <Calendar className="w-10 h-10 text-gray-300 mx-auto mb-2" />
              <p className="text-sm font-medium text-[#2c3338]">No consultations scheduled for today</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-[#f6f7f7] text-[#50575e] font-semibold text-xs border-b border-[#dcdcde]">
                    <th className="py-3 px-4">PATIENT</th>
                    <th className="py-3 px-4">DOCTOR</th>
                    <th className="py-3 px-4">TIME SLOT</th>
                    <th className="py-3 px-4">STATUS</th>
                    <th className="py-3 px-4 text-right">ACTION</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#dcdcde]">
                  {todayAppointments.map((app) => (
                    <tr key={app._id} className="hover:bg-[#fcfcfc] transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-semibold text-[#2c3338]">{app.patient?.name}</div>
                        <div className="text-xs text-[#50575e]">{app.patient?.phone}</div>
                      </td>
                      <td className="py-3 px-4 text-[#006088] font-medium">
                        Dr. {app.doctor?.name}
                      </td>
                      <td className="py-3 px-4 font-mono text-xs">{app.time}</td>
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
                        <div className="flex items-center justify-end gap-1.5">
                          {app.status === 'PENDING' && (
                            <button
                              onClick={() => handleStatusUpdate(app._id, 'CONFIRMED')}
                              className="px-2.5 py-1 text-xs font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-sm border border-blue-200 cursor-pointer"
                            >
                              Confirm
                            </button>
                          )}
                          {app.status === 'CONFIRMED' && (
                            <button
                              onClick={() => handleStatusUpdate(app._id, 'COMPLETED')}
                              className="px-2.5 py-1 text-xs font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-sm border border-emerald-200 cursor-pointer"
                            >
                              Check-In / Done
                            </button>
                          )}
                          {app.status !== 'CANCELLED' && app.status !== 'COMPLETED' && (
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

export default ReceptionistDashboard;
