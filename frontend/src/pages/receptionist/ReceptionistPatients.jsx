import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import DashboardLayout from '../../layouts/DashboardLayout';
import { Users, Plus, Search, QrCode, X, Phone, Mail, Calendar, HeartPulse } from 'lucide-react';
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
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#dcdcde] pb-4 bg-white p-6 rounded-md shadow-xs">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 bg-[#e6f4f8] text-[#006088] rounded-md">
                <Users className="w-6 h-6" />
              </span>
              <h1 className="text-2xl font-semibold text-[#2c3338] tracking-tight">Front-Desk Patient Registration</h1>
            </div>
            <p className="text-sm text-[#50575e] mt-1">
              Walk-in patient registration, electronic health records indexing, and instant QR badge generation.
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#0087be] hover:bg-[#006088] text-white text-sm font-medium rounded-sm shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Register Patient
          </button>
        </div>

        {/* Search */}
        <div className="bg-white p-4 rounded-md border border-[#dcdcde] shadow-xs flex items-center justify-between">
          <form onSubmit={handleSearch} className="flex gap-2 w-full max-w-md">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search patient by name, ID or phone..."
                className="w-full pl-9 pr-3 py-2 text-sm border border-[#dcdcde] rounded-sm focus:outline-hidden focus:border-[#0087be]"
              />
            </div>
            <button
              type="submit"
              className="px-3 py-2 bg-[#f6f7f7] hover:bg-[#eaeaea] text-[#2c3338] border border-[#dcdcde] rounded-sm text-sm font-medium transition-colors cursor-pointer"
            >
              Search
            </button>
          </form>
          <span className="text-xs text-[#50575e] font-medium hidden sm:inline">
            Total Patients: {patients.length}
          </span>
        </div>

        {/* Patients Table */}
        <div className="bg-white rounded-md border border-[#dcdcde] shadow-xs overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-[#0087be] border-t-transparent"></div>
              <p className="mt-3 text-sm text-[#50575e]">Loading patient registry...</p>
            </div>
          ) : patients.length === 0 ? (
            <div className="p-12 text-center">
              <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-base font-medium text-[#2c3338]">No registered patients found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-[#f6f7f7] text-[#50575e] font-semibold text-xs border-b border-[#dcdcde]">
                    <th className="py-3 px-4">PATIENT ID</th>
                    <th className="py-3 px-4">FULL NAME</th>
                    <th className="py-3 px-4">PHONE & CONTACT</th>
                    <th className="py-3 px-4">BLOOD GROUP</th>
                    <th className="py-3 px-4">REGISTERED DATE</th>
                    <th className="py-3 px-4 text-center">QR IDENTITY</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#dcdcde]">
                  {patients.map((p) => (
                    <tr key={p._id} className="hover:bg-[#fcfcfc] transition-colors">
                      <td className="py-3 px-4 font-mono font-semibold text-xs text-[#006088]">
                        {p.patientId}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-[#2c3338]">{p.user?.name}</div>
                        <div className="text-xs text-[#50575e]">{p.gender}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-xs font-medium text-[#2c3338]">{p.user?.phone || 'N/A'}</div>
                        <div className="text-xs text-gray-400">{p.user?.email}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-bold text-xs px-2 py-0.5 rounded-sm bg-rose-50 text-rose-700 border border-rose-200">
                          {p.bloodGroup}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-xs text-[#50575e] whitespace-nowrap">
                        {new Date(p.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => setShowQRModal(p)}
                          className="p-1.5 text-gray-600 hover:text-[#0087be] hover:bg-[#f6f7f7] rounded-sm transition-colors cursor-pointer"
                          title="View Digital QR ID Card"
                        >
                          <QrCode className="w-5 h-5 mx-auto" />
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
          <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-md border border-[#dcdcde] shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between px-6 py-4 border-b border-[#dcdcde] bg-[#f6f7f7]">
                <h3 className="font-semibold text-[#2c3338] text-base flex items-center gap-2">
                  <Users className="w-5 h-5 text-[#006088]" />
                  Register Walk-In Patient
                </h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-gray-400 hover:text-gray-600 p-1 rounded-sm cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleRegister} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#2c3338] uppercase mb-1">
                      Patient Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Priya Sharma"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-[#dcdcde] rounded-sm focus:outline-hidden focus:border-[#0087be]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#2c3338] uppercase mb-1">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="+91 9876543210"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-[#dcdcde] rounded-sm focus:outline-hidden focus:border-[#0087be]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#2c3338] uppercase mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="patient@email.com"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-[#dcdcde] rounded-sm focus:outline-hidden focus:border-[#0087be]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#2c3338] uppercase mb-1">
                      Date of Birth
                    </label>
                    <input
                      type="date"
                      value={form.dob}
                      onChange={(e) => setForm({ ...form, dob: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-[#dcdcde] rounded-sm focus:outline-hidden focus:border-[#0087be]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#2c3338] uppercase mb-1">
                      Gender
                    </label>
                    <select
                      value={form.gender}
                      onChange={(e) => setForm({ ...form, gender: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-[#dcdcde] rounded-sm focus:outline-hidden focus:border-[#0087be] bg-white text-[#2c3338]"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#2c3338] uppercase mb-1">
                      Blood Group
                    </label>
                    <select
                      value={form.bloodGroup}
                      onChange={(e) => setForm({ ...form, bloodGroup: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-[#dcdcde] rounded-sm focus:outline-hidden focus:border-[#0087be] bg-white text-[#2c3338]"
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
                  <label className="block text-xs font-semibold text-[#2c3338] uppercase mb-1">
                    Residential Address
                  </label>
                  <textarea
                    rows="2"
                    value={form.address}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                    placeholder="City, State, Postal Code"
                    className="w-full px-3 py-2 text-sm border border-[#dcdcde] rounded-sm focus:outline-hidden focus:border-[#0087be]"
                  ></textarea>
                </div>

                <div className="pt-4 border-t border-[#dcdcde] flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 border border-[#dcdcde] text-sm text-[#50575e] hover:bg-[#f6f7f7] rounded-sm font-medium cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#0087be] hover:bg-[#006088] text-white text-sm font-medium rounded-sm shadow-xs transition-colors cursor-pointer"
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
          <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-md border border-[#dcdcde] shadow-xl w-full max-w-sm p-6 text-center animate-in fade-in zoom-in-95 duration-150">
              <div className="w-12 h-12 rounded-full bg-[#006088] text-white flex items-center justify-center font-bold text-lg mx-auto mb-2">
                {showQRModal.user?.name ? showQRModal.user.name.charAt(0) : 'P'}
              </div>
              <h3 className="font-semibold text-[#2c3338] text-base">{showQRModal.user?.name}</h3>
              <p className="text-xs text-[#0087be] font-mono mt-0.5">ID: {showQRModal.patientId}</p>

              <div className="mt-4 p-4 bg-white border border-[#dcdcde] rounded-sm inline-block shadow-xs">
                {showQRModal.qrCode ? (
                  <img src={showQRModal.qrCode} alt="Patient QR" className="w-44 h-44 mx-auto" />
                ) : (
                  <div className="w-44 h-44 flex items-center justify-center text-xs text-gray-400">
                    QR Not Generated
                  </div>
                )}
              </div>

              <div className="mt-4 text-xs text-[#50575e] space-y-1 text-left bg-[#f6f7f7] p-3 rounded-sm">
                <p>
                  <strong>Blood Group:</strong> {showQRModal.bloodGroup}
                </p>
                <p>
                  <strong>Contact:</strong> {showQRModal.user?.phone || 'N/A'}
                </p>
              </div>

              <button
                onClick={() => setShowQRModal(null)}
                className="mt-4 w-full py-2 bg-[#f6f7f7] hover:bg-[#eaeaea] text-[#2c3338] border border-[#dcdcde] text-sm font-medium rounded-sm cursor-pointer"
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
