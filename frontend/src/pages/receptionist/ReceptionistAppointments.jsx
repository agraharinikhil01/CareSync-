import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import DashboardLayout from '../../layouts/DashboardLayout';
import { Calendar, Plus, Search, Filter, Clock, Check, X, Stethoscope, User } from 'lucide-react';
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
              <h1 className="text-2xl font-semibold text-[#2c3338] tracking-tight">Front-Desk Appointments Desk</h1>
            </div>
            <p className="text-sm text-[#50575e] mt-1">
              Book outpatient consultations, manage intake check-ins, and prevent double-booking conflicts.
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#0087be] hover:bg-[#006088] text-white text-sm font-medium rounded-sm shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Book Appointment
          </button>
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
              placeholder="Search patient or doctor..."
              className="w-full pl-9 pr-3 py-2 text-sm border border-[#dcdcde] rounded-sm focus:outline-hidden focus:border-[#0087be]"
            />
          </div>
        </div>

        {/* Appointments Table */}
        <div className="bg-white rounded-md border border-[#dcdcde] shadow-xs overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-[#0087be] border-t-transparent"></div>
              <p className="mt-3 text-sm text-[#50575e]">Loading appointments...</p>
            </div>
          ) : filtered.length === 0 ? (
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
                    <th className="py-3 px-4">PHYSICIAN</th>
                    <th className="py-3 px-4">SCHEDULED SLOT</th>
                    <th className="py-3 px-4">REASON</th>
                    <th className="py-3 px-4">STATUS</th>
                    <th className="py-3 px-4 text-right">ACTION</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#dcdcde]">
                  {filtered.map((a) => (
                    <tr key={a._id} className="hover:bg-[#fcfcfc] transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-semibold text-[#2c3338]">{a.patient?.name}</div>
                        <div className="text-xs text-[#50575e]">{a.patient?.phone}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-medium text-[#006088] flex items-center gap-1.5">
                          <Stethoscope className="w-3.5 h-3.5" /> Dr. {a.doctor?.name}
                        </div>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="font-medium text-[#2c3338]">
                          {new Date(a.date).toLocaleDateString()}
                        </div>
                        <div className="text-xs text-[#50575e] flex items-center gap-1 mt-0.5">
                          <Clock className="w-3 h-3" /> {a.time}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-[#50575e] max-w-xs truncate">
                        {a.reason}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium ${
                            a.status === 'CONFIRMED'
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : a.status === 'COMPLETED'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : a.status === 'CANCELLED'
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          ● {a.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {a.status === 'PENDING' && (
                            <button
                              onClick={() => handleStatusUpdate(a._id, 'CONFIRMED')}
                              className="px-2.5 py-1 text-xs font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-sm border border-blue-200 cursor-pointer"
                            >
                              Confirm
                            </button>
                          )}
                          {a.status === 'CONFIRMED' && (
                            <button
                              onClick={() => handleStatusUpdate(a._id, 'COMPLETED')}
                              className="px-2.5 py-1 text-xs font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-sm border border-emerald-200 cursor-pointer"
                            >
                              Check-In
                            </button>
                          )}
                          {a.status !== 'CANCELLED' && a.status !== 'COMPLETED' && (
                            <button
                              onClick={() => handleStatusUpdate(a._id, 'CANCELLED')}
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

        {/* Modal: Schedule Appointment */}
        {showModal && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-md border border-[#dcdcde] shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between px-6 py-4 border-b border-[#dcdcde] bg-[#f6f7f7]">
                <h3 className="font-semibold text-[#2c3338] text-base flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-[#006088]" />
                  Book Clinical Consultation
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600 p-1 rounded-sm cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreate} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#2c3338] uppercase mb-1">
                    Select Patient *
                  </label>
                  <select
                    required
                    value={form.patient}
                    onChange={(e) => setForm({ ...form, patient: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-[#dcdcde] rounded-sm focus:outline-hidden focus:border-[#0087be] bg-white text-[#2c3338]"
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
                  <label className="block text-xs font-semibold text-[#2c3338] uppercase mb-1">
                    Physician *
                  </label>
                  <select
                    required
                    value={form.doctor}
                    onChange={(e) => setForm({ ...form, doctor: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-[#dcdcde] rounded-sm focus:outline-hidden focus:border-[#0087be] bg-white text-[#2c3338]"
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
                    <label className="block text-xs font-semibold text-[#2c3338] uppercase mb-1">
                      Date *
                    </label>
                    <input
                      type="date"
                      required
                      value={form.date}
                      onChange={(e) => setForm({ ...form, date: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-[#dcdcde] rounded-sm focus:outline-hidden focus:border-[#0087be]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#2c3338] uppercase mb-1">
                      Time Slot *
                    </label>
                    <select
                      value={form.time}
                      onChange={(e) => setForm({ ...form, time: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-[#dcdcde] rounded-sm focus:outline-hidden focus:border-[#0087be] bg-white text-[#2c3338]"
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
                  <label className="block text-xs font-semibold text-[#2c3338] uppercase mb-1">
                    Symptoms / Chief Complaint
                  </label>
                  <textarea
                    rows="3"
                    value={form.reason}
                    onChange={(e) => setForm({ ...form, reason: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-[#dcdcde] rounded-sm focus:outline-hidden focus:border-[#0087be]"
                  ></textarea>
                </div>

                <div className="pt-4 border-t border-[#dcdcde] flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 border border-[#dcdcde] text-sm text-[#50575e] hover:bg-[#f6f7f7] rounded-sm font-medium cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#0087be] hover:bg-[#006088] text-white text-sm font-medium rounded-sm shadow-xs transition-colors cursor-pointer"
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
