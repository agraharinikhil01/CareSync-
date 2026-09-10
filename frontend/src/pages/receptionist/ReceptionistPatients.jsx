import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import DashboardLayout from '../../layouts/DashboardLayout';
import { Users, Plus, Search, QrCode, X, Phone, Mail, Calendar, HeartPulse, Sparkles, UserPlus } from 'lucide-react';
import toast from 'react-hot-toast';

const ReceptionistPatients = () => {
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(null);

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    gender: 'Male',
    bloodGroup: 'O+',
    address: '',
    dob: '',
    password: 'Patient@123',
  });

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    setLoading(true);
    try {
      let url = '/patients?';
      if (search) url += `search=${encodeURIComponent(search)}`;
      const res = await api.get(url);
      if (res.data.success) {
        setPatients(res.data.data);
      }
    } catch {
      toast.error('Failed to load patient records');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchPatients();
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/patients', form);
      if (res.data.success) {
        toast.success('Patient registered at front-desk');
        setShowAddModal(false);
        setForm({
          name: '',
          email: '',
          phone: '',
          gender: 'Male',
          bloodGroup: 'O+',
          address: '',
          dob: '',
          password: 'Patient@123',
        });
        fetchPatients();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Header Banner */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-sky-600 to-teal-500 text-white flex items-center justify-center shadow-md shadow-sky-500/20">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                  Front-Desk Patient Registration
                </h1>
                <span className="text-[11px] font-semibold tracking-wide uppercase px-2.5 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-200/80">
                  Walk-In Intake
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Register walk-in patients, manage electronic charts, and generate instant digital QR health identity cards.
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-sky-600 to-teal-600 hover:from-sky-700 hover:to-teal-700 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-xs transition-all cursor-pointer"
          >
            <UserPlus className="w-4 h-4" /> Register Patient
          </button>
        </div>

        {/* Search Bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between gap-4">
          <form onSubmit={handleSearch} className="flex gap-2.5 w-full max-w-md">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search patient by name, ID or phone..."
                className="w-full pl-10 pr-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-hidden focus:border-sky-500 focus:ring-3 focus:ring-sky-500/15 transition-all text-slate-800 placeholder:text-slate-400"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
            >
              Search
            </button>
          </form>
          <span className="text-xs text-slate-500 font-medium hidden sm:inline">
            Total Patients: <strong className="text-slate-800">{patients.length}</strong>
          </span>
        </div>

        {/* Patients Table */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          {loading ? (
            <div className="p-16 text-center">
              <div className="inline-block animate-spin rounded-full h-9 w-9 border-3 border-sky-600 border-t-transparent"></div>
              <p className="mt-3 text-xs sm:text-sm font-medium text-slate-500">Loading patient registry...</p>
            </div>
          ) : patients.length === 0 ? (
            <div className="p-16 text-center">
              <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-3 text-slate-400">
                <Users className="w-7 h-7" />
              </div>
              <p className="text-base font-semibold text-slate-800">No registered patients found</p>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                No patient entries match your search criteria. Click "Register Patient" to add a new record.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="bg-slate-50/80 text-slate-500 font-semibold text-[11px] uppercase tracking-wider border-b border-slate-200/80">
                    <th className="py-3.5 px-5">Patient ID</th>
                    <th className="py-3.5 px-5">Full Name</th>
                    <th className="py-3.5 px-5">Contact Details</th>
                    <th className="py-3.5 px-5">Blood Group</th>
                    <th className="py-3.5 px-5">Registered Date</th>
                    <th className="py-3.5 px-5 text-center">QR Card</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {patients.map((p) => (
                    <tr key={p._id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-5 font-mono font-semibold text-xs text-sky-700">
                        <span className="px-2.5 py-1 rounded-lg bg-sky-50 border border-sky-200/70">
                          {p.patientId}
                        </span>
                      </td>
                      <td className="py-3.5 px-5">
                        <div className="font-semibold text-slate-900">{p.user?.name || 'Unnamed'}</div>
                        <div className="text-[11px] text-slate-500">{p.gender}</div>
                      </td>
                      <td className="py-3.5 px-5">
                        <div className="font-medium text-slate-800">{p.user?.phone || 'No phone'}</div>
                        <div className="text-[11px] text-slate-400">{p.user?.email}</div>
                      </td>
                      <td className="py-3.5 px-5">
                        <span className="font-bold text-xs px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200/80">
                          {p.bloodGroup}
                        </span>
                      </td>
                      <td className="py-3.5 px-5 text-xs text-slate-500 whitespace-nowrap">
                        {new Date(p.createdAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="py-3.5 px-5 text-center">
                        <button
                          onClick={() => setShowQRModal(p)}
                          className="p-1.5 text-slate-500 hover:text-sky-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer inline-flex items-center justify-center"
                          title="View Digital QR ID Card"
                        >
                          <QrCode className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modal: Register Patient */}
        {showAddModal && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center">
                    <UserPlus className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">Register Walk-In Patient</h3>
                    <p className="text-[11px] text-slate-500">Create digital health chart & credentials</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleRegister} className="p-6 space-y-4 max-h-[78vh] overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                      Patient Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Priya Sharma"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-hidden focus:border-sky-500 focus:ring-3 focus:ring-sky-500/15 placeholder:text-slate-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="+91 9876543210"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-hidden focus:border-sky-500 focus:ring-3 focus:ring-sky-500/15 placeholder:text-slate-400"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="patient@email.com"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-hidden focus:border-sky-500 focus:ring-3 focus:ring-sky-500/15 placeholder:text-slate-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                      Date of Birth
                    </label>
                    <input
                      type="date"
                      value={form.dob}
                      onChange={(e) => setForm({ ...form, dob: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-hidden focus:border-sky-500 focus:ring-3 focus:ring-sky-500/15"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                      Gender
                    </label>
                    <select
                      value={form.gender}
                      onChange={(e) => setForm({ ...form, gender: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-hidden focus:border-sky-500 focus:ring-3 focus:ring-sky-500/15"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                      Blood Group
                    </label>
                    <select
                      value={form.bloodGroup}
                      onChange={(e) => setForm({ ...form, bloodGroup: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-hidden focus:border-sky-500 focus:ring-3 focus:ring-sky-500/15"
                    >
                      {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((bg) => (
                        <option key={bg} value={bg}>
                          {bg}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Residential Address
                  </label>
                  <textarea
                    rows="2"
                    value={form.address}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                    placeholder="City, State, Postal Code"
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-hidden focus:border-sky-500 focus:ring-3 focus:ring-sky-500/15 placeholder:text-slate-400"
                  ></textarea>
                </div>

                <div className="pt-4 border-t border-slate-100 flex justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 border border-slate-200 text-xs sm:text-sm text-slate-600 hover:bg-slate-50 rounded-xl font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-gradient-to-r from-sky-600 to-teal-600 hover:from-sky-700 hover:to-teal-700 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-xs transition-all cursor-pointer"
                  >
                    Register Patient
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* QR Code Inspection Modal */}
        {showQRModal && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xl w-full max-w-sm p-6 text-center animate-in zoom-in-95 duration-150">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-sky-600 to-teal-600 text-white flex items-center justify-center font-bold text-xl mx-auto mb-3 shadow-md shadow-sky-500/20">
                {showQRModal.user?.name ? showQRModal.user.name.charAt(0).toUpperCase() : 'P'}
              </div>
              <h3 className="font-bold text-slate-900 text-base">{showQRModal.user?.name}</h3>
              <p className="text-xs font-mono font-medium text-sky-700 mt-0.5">ID: {showQRModal.patientId}</p>

              <div className="mt-4 p-4 bg-white border border-slate-200 rounded-xl inline-block shadow-xs">
                {showQRModal.qrCode ? (
                  <img src={showQRModal.qrCode} alt="Patient QR" className="w-44 h-44 mx-auto" />
                ) : (
                  <div className="w-44 h-44 flex items-center justify-center text-xs text-slate-400">
                    QR Not Generated
                  </div>
                )}
              </div>

              <div className="mt-4 text-xs text-slate-600 space-y-1.5 text-left bg-slate-50/80 p-3.5 rounded-xl border border-slate-100">
                <div className="flex justify-between">
                  <span>Blood Group:</span>
                  <strong className="text-rose-600">{showQRModal.bloodGroup}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Contact:</span>
                  <strong className="text-slate-800">{showQRModal.user?.phone || 'N/A'}</strong>
                </div>
              </div>

              <button
                onClick={() => setShowQRModal(null)}
                className="mt-5 w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs sm:text-sm font-semibold rounded-xl transition-colors cursor-pointer"
              >
                Close Window
              </button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ReceptionistPatients;
