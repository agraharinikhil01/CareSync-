import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import DashboardLayout from '../../layouts/DashboardLayout';
import { Calendar, Plus, Search, Filter, Clock, Check, X, Stethoscope, User, AlertCircle, CheckCircle2, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';

const STATUS_TABS = ['ALL', 'PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'];

const ReceptionistAppointments = () => {
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
    reason: 'Front Desk Walk-In Consultation',
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
      console.log('Error loading prerequisite lists');
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

  const handleStatusUpdate = async (id, status) => {
    try {
      const res = await api.patch(`/appointments/${id}/status`, { status });
      if (res.data.success) {
        toast.success(`Appointment marked as ${status}`);
        fetchAppointments();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Status update failed');
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
        toast.success('Appointment scheduled and confirmed');
        setShowModal(false);
        setForm({
          patient: '',
          doctor: '',
          date: new Date().toISOString().split('T')[0],
          time: '10:00 AM',
          reason: 'Front Desk Walk-In Consultation',
        });
        fetchAppointments();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Conflict detected! Failed to book');
    }
  };

  const filtered = appointments.filter((a) => {
    if (!search) return true;
    const term = search.toLowerCase();
    const patName = a.patient?.name?.toLowerCase() || '';
    const docName = a.doctor?.name?.toLowerCase() || '';
    return patName.includes(term) || docName.includes(term);
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'CONFIRMED':
        return 'bg-sky-50 text-sky-700 border-sky-200/80';
      case 'COMPLETED':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200/80';
      case 'CANCELLED':
        return 'bg-rose-50 text-rose-700 border-rose-200/80';
      default:
        return 'bg-amber-50 text-amber-700 border-amber-200/80';
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Header Banner */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-sky-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-sky-500/20">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                  Front-Desk Appointments Desk
                </h1>
                <span className="text-[11px] font-semibold tracking-wide uppercase px-2.5 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-200/80">
                  Intake Ops
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Book outpatient consultations, manage intake check-ins, and prevent double-booking conflicts.
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-sky-600 to-teal-600 hover:from-sky-700 hover:to-teal-700 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-xs transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Book Appointment
          </button>
        </div>

        {/* Filter bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="flex items-center gap-1.5 p-1 bg-slate-100/80 rounded-xl overflow-x-auto w-full md:w-auto">
            {STATUS_TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setStatusFilter(tab)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                  statusFilter === tab
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
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
              placeholder="Search patient or doctor..."
              className="w-full pl-10 pr-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-hidden focus:border-sky-500 focus:ring-3 focus:ring-sky-500/15 transition-all text-slate-800 placeholder:text-slate-400"
            />
          </div>
        </div>

        {/* Appointments Table */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          {loading ? (
            <div className="p-16 text-center">
              <div className="inline-block animate-spin rounded-full h-9 w-9 border-3 border-sky-600 border-t-transparent"></div>
              <p className="mt-3 text-xs sm:text-sm font-medium text-slate-500">Loading appointments desk...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-16 text-center">
              <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-3 text-slate-400">
                <Calendar className="w-7 h-7" />
              </div>
              <p className="text-base font-semibold text-slate-800">No appointments found</p>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                No consultations match your selected filter. Click "Book Appointment" to add an entry.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="bg-slate-50/80 text-slate-500 font-semibold text-[11px] uppercase tracking-wider border-b border-slate-200/80">
                    <th className="py-3.5 px-5">Patient</th>
                    <th className="py-3.5 px-5">Attending Physician</th>
                    <th className="py-3.5 px-5">Scheduled Slot</th>
                    <th className="py-3.5 px-5">Chief Complaint</th>
                    <th className="py-3.5 px-5">Status</th>
                    <th className="py-3.5 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map((a) => (
                    <tr key={a._id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-5">
                        <div className="font-semibold text-slate-900">{a.patient?.name || 'Unknown'}</div>
                        <div className="text-[11px] text-slate-500">{a.patient?.phone}</div>
                      </td>
                      <td className="py-3.5 px-5">
                        <div className="font-medium text-sky-800 flex items-center gap-1.5">
                          <Stethoscope className="w-3.5 h-3.5 text-sky-600" /> Dr. {a.doctor?.name}
                        </div>
                      </td>
                      <td className="py-3.5 px-5 whitespace-nowrap">
                        <div className="font-medium text-slate-800">
                          {new Date(a.date).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                          <Clock className="w-3 h-3 text-sky-600" /> {a.time}
                        </div>
                      </td>
                      <td className="py-3.5 px-5 text-slate-600 max-w-xs truncate">
                        {a.reason || 'OPD Consultation'}
                      </td>
                      <td className="py-3.5 px-5">
                        <span
                          className={`inline-flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-full font-semibold border ${getStatusBadge(
                            a.status
                          )}`}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                          {a.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {a.status === 'PENDING' && (
                            <button
                              onClick={() => handleStatusUpdate(a._id, 'CONFIRMED')}
                              className="px-2.5 py-1 text-xs font-semibold bg-sky-50 text-sky-700 hover:bg-sky-100 rounded-lg border border-sky-200/80 transition-colors cursor-pointer"
                            >
                              Confirm
                            </button>
                          )}
                          {a.status === 'CONFIRMED' && (
                            <button
                              onClick={() => handleStatusUpdate(a._id, 'COMPLETED')}
                              className="px-2.5 py-1 text-xs font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg border border-emerald-200/80 transition-colors cursor-pointer"
                            >
                              Check-In
                            </button>
                          )}
                          {a.status !== 'CANCELLED' && a.status !== 'COMPLETED' && (
                            <button
                              onClick={() => handleStatusUpdate(a._id, 'CANCELLED')}
                              className="px-2.5 py-1 text-xs font-medium text-rose-700 hover:bg-rose-50 rounded-lg border border-rose-200/80 transition-colors cursor-pointer"
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

        {/* Modal: Schedule Appointment */}
        {showModal && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">Book Clinical Consultation</h3>
                    <p className="text-[11px] text-slate-500">Walk-in or phoned scheduling</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
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
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-hidden focus:border-sky-500 focus:ring-3 focus:ring-sky-500/15"
                  >
                    <option value="">-- Select Patient --</option>
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
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-hidden focus:border-sky-500 focus:ring-3 focus:ring-sky-500/15"
                  >
                    <option value="">-- Select Doctor --</option>
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
                      Consultation Date *
                    </label>
                    <input
                      type="date"
                      required
                      value={form.date}
                      onChange={(e) => setForm({ ...form, date: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-hidden focus:border-sky-500 focus:ring-3 focus:ring-sky-500/15"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                      Time Slot *
                    </label>
                    <select
                      value={form.time}
                      onChange={(e) => setForm({ ...form, time: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-hidden focus:border-sky-500 focus:ring-3 focus:ring-sky-500/15"
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
                    Symptoms / Chief Complaint
                  </label>
                  <textarea
                    rows="3"
                    value={form.reason}
                    onChange={(e) => setForm({ ...form, reason: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-hidden focus:border-sky-500 focus:ring-3 focus:ring-sky-500/15 placeholder:text-slate-400"
                  ></textarea>
                </div>

                <div className="pt-4 border-t border-slate-100 flex justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 border border-slate-200 text-xs sm:text-sm text-slate-600 hover:bg-slate-50 rounded-xl font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-gradient-to-r from-sky-600 to-teal-600 hover:from-sky-700 hover:to-teal-700 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-xs transition-all cursor-pointer"
                  >
                    Confirm & Schedule
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

export default ReceptionistAppointments;
