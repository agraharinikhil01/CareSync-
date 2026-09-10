import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import DashboardLayout from '../../layouts/DashboardLayout';
import { Calendar, Plus, Clock, Stethoscope, X, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const PatientAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const [form, setForm] = useState({
    doctor: '',
    date: new Date().toISOString().split('T')[0],
    time: '10:00 AM',
    reason: '',
  });

  useEffect(() => {
    fetchAppointments();
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      const res = await api.get('/doctors');
      if (res.data.success) setDoctors(res.data.data);
    } catch {
      console.log('Error loading doctors');
    }
  };

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const res = await api.get('/appointments');
      if (res.data.success) setAppointments(res.data.data);
    } catch {
      toast.error('Failed to load your appointments');
    } finally {
      setLoading(false);
    }
  };

  const handleBook = async (e) => {
    e.preventDefault();
    if (!form.doctor) {
      toast.error('Please choose a doctor');
      return;
    }

    try {
      const res = await api.post('/appointments', form);
      if (res.data.success) {
        toast.success('Appointment booked successfully!');
        setShowModal(false);
        setForm({
          doctor: '',
          date: new Date().toISOString().split('T')[0],
          time: '10:00 AM',
          reason: '',
        });
        fetchAppointments();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Conflict! Please pick another slot');
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this consultation?')) return;
    try {
      const res = await api.patch(`/appointments/${id}/status`, { status: 'CANCELLED' });
      if (res.data.success) {
        toast.success('Appointment cancelled');
        fetchAppointments();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel');
    }
  };

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
              <h1 className="text-2xl font-semibold text-[#2c3338] tracking-tight">My Health Consultations</h1>
            </div>
            <p className="text-sm text-[#50575e] mt-1">
              Book consultations with hospital specialists, review visit history, and manage schedules.
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#0087be] hover:bg-[#006088] text-white text-sm font-medium rounded-sm shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Book Appointment
          </button>
        </div>

        {/* List of Appointments */}
        <div className="bg-white rounded-md border border-[#dcdcde] shadow-xs overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-[#0087be] border-t-transparent"></div>
              <p className="mt-3 text-sm text-[#50575e]">Loading consultations...</p>
            </div>
          ) : appointments.length === 0 ? (
            <div className="p-12 text-center">
              <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-base font-medium text-[#2c3338]">No consultations scheduled</p>
              <p className="text-sm text-[#50575e] mt-1">Schedule your first appointment with one of our physicians.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-[#f6f7f7] text-[#50575e] font-semibold text-xs border-b border-[#dcdcde]">
                    <th className="py-3 px-4">PHYSICIAN</th>
                    <th className="py-3 px-4">DATE & TIME</th>
                    <th className="py-3 px-4">REASON FOR VISIT</th>
                    <th className="py-3 px-4">STATUS</th>
                    <th className="py-3 px-4 text-right">ACTION</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#dcdcde]">
                  {appointments.map((a) => (
                    <tr key={a._id} className="hover:bg-[#fcfcfc] transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-semibold text-[#2c3338] flex items-center gap-1.5">
                          <Stethoscope className="w-3.5 h-3.5 text-[#006088]" />
                          Dr. {a.doctor?.name}
                        </div>
                        <div className="text-xs text-[#50575e]">{a.doctor?.email}</div>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="font-medium text-[#2c3338]">
                          {new Date(a.date).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
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
                        {a.status !== 'CANCELLED' && a.status !== 'COMPLETED' && (
                          <button
                            onClick={() => handleCancel(a._id)}
                            className="px-2 py-1 text-xs font-medium text-rose-700 hover:bg-rose-50 rounded-sm border border-rose-200 transition-colors cursor-pointer"
                          >
                            Cancel
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modal: Book Consultation */}
        {showModal && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-md border border-[#dcdcde] shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between px-6 py-4 border-b border-[#dcdcde] bg-[#f6f7f7]">
                <h3 className="font-semibold text-[#2c3338] text-base flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-[#006088]" />
                  Book Doctor Consultation
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600 p-1 rounded-sm cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleBook} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#2c3338] uppercase mb-1">
                    Select Specialist Physician *
                  </label>
                  <select
                    required
                    value={form.doctor}
                    onChange={(e) => setForm({ ...form, doctor: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-[#dcdcde] rounded-sm focus:outline-hidden focus:border-[#0087be] bg-white text-[#2c3338]"
                  >
                    <option value="">-- Choose Doctor --</option>
                    {doctors.map((d) => (
                      <option key={d._id} value={d.user?._id}>
                        Dr. {d.user?.name} ({d.specialization}) — Fee: ₹{d.consultationFee}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#2c3338] uppercase mb-1">
                      Preferred Date *
                    </label>
                    <input
                      type="date"
                      required
                      min={new Date().toISOString().split('T')[0]}
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
                    Describe Symptoms / Purpose of Consultation
                  </label>
                  <textarea
                    rows="3"
                    required
                    placeholder="Briefly describe what symptoms you are experiencing..."
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
                    Confirm Booking
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

export default PatientAppointments;
