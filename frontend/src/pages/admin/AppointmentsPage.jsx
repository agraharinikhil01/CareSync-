import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import DashboardLayout from '../../layouts/DashboardLayout';
import { Calendar, Plus, Search, Filter, Clock, Check, X, Stethoscope, User, CalendarCheck } from 'lucide-react';
import toast from 'react-hot-toast';

const STATUS_TABS = ['ALL', 'CONFIRMED', 'PENDING', 'COMPLETED', 'CANCELLED'];

const AppointmentsPage = () => {
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const [form, setForm] = useState({
    patient: '',
    doctor: '',
    date: new Date().toISOString().split('T')[0],
    time: '10:00 AM',
    reason: 'Routine Health Consultation',
  });

  useEffect(() => {
    fetchAppointments();
  }, [statusFilter]);

  useEffect(() => {
    fetchPrerequisites();
  }, []);

  const fetchPrerequisites = async () => {
    try {
      const [docRes, patRes] = await Promise.all([
        api.get('/doctors'),
        api.get('/patients'),
      ]);
      if (docRes.data.success) setDoctors(docRes.data.data);
      if (patRes.data.success) setPatients(patRes.data.data);
    } catch {
      console.log('Error fetching options');
    }
  };

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

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      const res = await api.patch(`/appointments/${id}/status`, { status: newStatus });
      if (res.data.success) {
        toast.success(`Appointment marked as ${newStatus}`);
        fetchAppointments();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status');
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.patient || !form.doctor) {
      toast.error('Please select both patient and doctor');
      return;
    }

    try {
      const res = await api.post('/appointments', form);
      if (res.data.success) {
        toast.success('Appointment scheduled successfully');
        setShowModal(false);
        setForm({
          patient: '',
          doctor: '',
          date: new Date().toISOString().split('T')[0],
          time: '10:00 AM',
          reason: 'Routine Health Consultation',
        });
        fetchAppointments();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to schedule appointment');
    }
  };

  const filteredAppointments = appointments.filter((app) => {
    if (!search) return true;
    const term = search.toLowerCase();
    const patientName = app.patient?.name?.toLowerCase() || '';
    const doctorName = app.doctor?.name?.toLowerCase() || '';
    const reason = app.reason?.toLowerCase() || '';
    return patientName.includes(term) || doctorName.includes(term) || reason.includes(term);
  });

  return (
    <DashboardLayout title="Appointments Schedule">
      <div className="space-y-6">
        {/* Header Hero */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-indigo-50 border border-indigo-200/60 text-xs text-indigo-800 font-semibold mb-2">
              <CalendarCheck className="w-3.5 h-3.5 text-indigo-600" />
              <span>Consultations Central Ledger</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Appointments & OPD Schedule
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Hospital-wide consultation schedule, status auditing, and conflict-checked booking registry.
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold rounded-xl shadow-xs shadow-sky-600/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Book Consultation</span>
          </button>
        </div>

        {/* Status Filters & Search */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="flex items-center gap-1.5 border-b md:border-b-0 border-slate-100 pb-2 md:pb-0 overflow-x-auto w-full md:w-auto">
            {STATUS_TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setStatusFilter(tab)}
                className={`px-3.5 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                  statusFilter === tab
                    ? 'bg-sky-600 text-white shadow-xs shadow-sky-600/20'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by patient, doctor or reason..."
              className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:border-sky-500 focus:ring-3 focus:ring-sky-500/15 text-slate-900"
            />
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          {loading ? (
            <div className="p-16 text-center">
              <div className="w-8 h-8 border-3 border-sky-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-xs text-slate-500">Loading appointments...</p>
            </div>
          ) : filteredAppointments.length === 0 ? (
            <div className="p-16 text-center">
              <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-700">No appointments found</p>
              <p className="text-xs text-slate-400 mt-1">No bookings match the selected status filter.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="text-slate-400 font-bold border-b border-slate-100 uppercase tracking-wider bg-slate-50/50">
                    <th className="py-3 px-4">Patient</th>
                    <th className="py-3 px-4">Attending Doctor</th>
                    <th className="py-3 px-4">Date & Time</th>
                    <th className="py-3 px-4">Reason / Notes</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Manage Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredAppointments.map((app) => (
                    <tr key={app._id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 text-sm">
                          {app.patient?.name || 'Unknown Patient'}
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono">{app.patient?.email}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-sky-700 flex items-center gap-1.5">
                          <Stethoscope className="w-3.5 h-3.5" />
                          Dr. {app.doctor?.name || 'Unassigned'}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="font-medium text-slate-900">
                          {new Date(app.date).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5 font-mono">
                          <Clock className="w-3 h-3 text-slate-400" />
                          {app.time}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 max-w-xs truncate text-slate-600">
                        {app.reason}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-full font-bold ${
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
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {app.status === 'PENDING' && (
                            <button
                              onClick={() => handleStatusUpdate(app._id, 'CONFIRMED')}
                              className="px-2.5 py-1 text-xs font-semibold bg-sky-50 text-sky-700 hover:bg-sky-100 rounded-lg border border-sky-200 cursor-pointer"
                            >
                              Confirm
                            </button>
                          )}
                          {app.status === 'CONFIRMED' && (
                            <button
                              onClick={() => handleStatusUpdate(app._id, 'COMPLETED')}
                              className="px-2.5 py-1 text-xs font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg border border-emerald-200 cursor-pointer"
                            >
                              Complete
                            </button>
                          )}
                          {app.status !== 'CANCELLED' && app.status !== 'COMPLETED' && (
                            <button
                              onClick={() => handleStatusUpdate(app._id, 'CANCELLED')}
                              className="px-2 py-1 text-xs font-semibold bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-lg border border-rose-200 cursor-pointer"
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

        {/* Modal: Schedule Consultation */}
        {showModal && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-sky-600" />
                  Schedule Clinical Consultation
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreate} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Select Patient *
                  </label>
                  <select
                    required
                    value={form.patient}
                    onChange={(e) => setForm({ ...form, patient: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-hidden focus:border-sky-500 bg-white"
                  >
                    <option value="">-- Choose Registered Patient --</option>
                    {patients.map((p) => (
                      <option key={p._id} value={p.user?._id || p.user}>
                        {p.user?.name} ({p.patientId}) - {p.user?.phone}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Attending Physician *
                  </label>
                  <select
                    required
                    value={form.doctor}
                    onChange={(e) => setForm({ ...form, doctor: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-hidden focus:border-sky-500 bg-white"
                  >
                    <option value="">-- Choose Doctor --</option>
                    {doctors.map((d) => (
                      <option key={d._id} value={d.user?._id}>
                        Dr. {d.user?.name} ({d.specialization}) - Fee: ₹{d.consultationFee}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                      Appointment Date *
                    </label>
                    <input
                      type="date"
                      required
                      value={form.date}
                      onChange={(e) => setForm({ ...form, date: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-hidden focus:border-sky-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                      Time Slot *
                    </label>
                    <select
                      value={form.time}
                      onChange={(e) => setForm({ ...form, time: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-hidden focus:border-sky-500 bg-white"
                    >
                      {[
                        '09:00 AM',
                        '09:30 AM',
                        '10:00 AM',
                        '10:30 AM',
                        '11:00 AM',
                        '11:30 AM',
                        '02:00 PM',
                        '02:30 PM',
                        '03:00 PM',
                        '03:30 PM',
                        '04:00 PM',
                        '04:30 PM',
                        '05:00 PM',
                      ].map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Clinical Reason / Symptoms
                  </label>
                  <textarea
                    rows="3"
                    value={form.reason}
                    onChange={(e) => setForm({ ...form, reason: e.target.value })}
                    placeholder="Chief complaint or purpose of checkup..."
                    className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-hidden focus:border-sky-500"
                  ></textarea>
                </div>

                <div className="pt-4 border-t border-slate-100 flex justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 border border-slate-200 text-xs text-slate-600 hover:bg-slate-50 rounded-xl font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold rounded-xl shadow-xs shadow-sky-600/20 transition-all cursor-pointer"
                  >
                    Schedule & Save
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AppointmentsPage;
