import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import DashboardLayout from '../../layouts/DashboardLayout';
import { Calendar, Search, Filter, Clock, CheckCircle2, XCircle, FileText, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const STATUS_TABS = ['ALL', 'CONFIRMED', 'PENDING', 'COMPLETED', 'CANCELLED'];

const DoctorAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAppointments();
  }, [statusFilter]);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      let url = '/appointments?';
      if (statusFilter !== 'ALL') url += `status=${statusFilter}`;

      const res = await api.get(url);
      if (res.data.success) {
        setAppointments(res.data.data);
      }
    } catch {
      toast.error('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      const res = await api.patch(`/appointments/${id}/status`, { status });
      if (res.data.success) {
        toast.success(`Appointment status set to ${status}`);
        fetchAppointments();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Status update failed');
    }
  };

  const filteredAppointments = appointments.filter((app) => {
    if (!search) return true;
    const term = search.toLowerCase();
    const patName = app.patient?.name?.toLowerCase() || '';
    const reason = app.reason?.toLowerCase() || '';
    return patName.includes(term) || reason.includes(term);
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#dcdcde] pb-4 bg-white p-6 rounded-md shadow-xs">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 bg-[#e6f4f8] text-[#006088] rounded-md">
                <Calendar className="w-6 h-6" />
              </span>
              <h1 className="text-2xl font-semibold text-[#2c3338] tracking-tight">Doctor Consultation Schedule</h1>
            </div>
            <p className="text-sm text-[#50575e] mt-1">
              Manage your personal OPD slots, patient visits, and clinical status updates.
            </p>
          </div>
        </div>

        {/* Filter bar */}
        <div className="bg-white p-4 rounded-md border border-[#dcdcde] shadow-xs flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="flex items-center gap-1 border-b md:border-b-0 border-[#dcdcde] pb-2 md:pb-0 overflow-x-auto w-full md:w-auto">
            {STATUS_TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setStatusFilter(tab)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-sm transition-colors cursor-pointer whitespace-nowrap ${
                  statusFilter === tab
                    ? 'bg-[#006088] text-white'
                    : 'text-[#50575e] hover:bg-[#f6f7f7] hover:text-[#2c3338]'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search patient or symptoms..."
              className="w-full pl-9 pr-3 py-2 text-sm border border-[#dcdcde] rounded-sm focus:outline-hidden focus:border-[#0087be] focus:ring-1 focus:ring-[#0087be]"
            />
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-md border border-[#dcdcde] shadow-xs overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-[#0087be] border-t-transparent"></div>
              <p className="mt-3 text-sm text-[#50575e]">Loading appointments...</p>
            </div>
          ) : filteredAppointments.length === 0 ? (
            <div className="p-12 text-center">
              <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-base font-medium text-[#2c3338]">No appointments match filter</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-[#f6f7f7] text-[#50575e] font-semibold text-xs border-b border-[#dcdcde]">
                    <th className="py-3 px-4">PATIENT</th>
                    <th className="py-3 px-4">DATE & TIME</th>
                    <th className="py-3 px-4">SYMPTOMS / REASON</th>
                    <th className="py-3 px-4">STATUS</th>
                    <th className="py-3 px-4 text-right">ACTION</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#dcdcde]">
                  {filteredAppointments.map((app) => (
                    <tr key={app._id} className="hover:bg-[#fcfcfc] transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-semibold text-[#2c3338]">
                          {app.patient?.name || 'Unknown'}
                        </div>
                        <div className="text-xs text-[#50575e]">{app.patient?.phone || app.patient?.email}</div>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="font-medium text-[#2c3338]">
                          {new Date(app.date).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </div>
                        <div className="text-xs text-[#50575e] flex items-center gap-1 mt-0.5">
                          <Clock className="w-3 h-3" />
                          {app.time}
                        </div>
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
                              Mark Done
                            </button>
                          )}
                          <Link
                            to="/doctor/prescriptions"
                            className="p-1 text-gray-500 hover:text-[#0087be] hover:bg-[#f6f7f7] rounded-sm transition-colors"
                            title="Write prescription"
                          >
                            <FileText className="w-4 h-4" />
                          </Link>
                          {app.status !== 'CANCELLED' && app.status !== 'COMPLETED' && (
                            <button
                              onClick={() => handleStatusUpdate(app._id, 'CANCELLED')}
                              className="p-1 text-gray-400 hover:text-rose-600 rounded-sm cursor-pointer"
                              title="Cancel"
                            >
                              <XCircle className="w-4 h-4" />
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

export default DoctorAppointments;
