import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import DashboardLayout from '../../layouts/DashboardLayout';
import { Users, Plus, Search, Filter, Trash2, QrCode, X, Phone, Mail, Calendar, UserPlus } from 'lucide-react';
import toast from 'react-hot-toast';

const PatientsPage = () => {
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState('');
  const [genderFilter, setGenderFilter] = useState('');
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
  }, [genderFilter]);

  const fetchPatients = async () => {
    setLoading(true);
    try {
      let url = '/patients?';
      if (search) url += `search=${encodeURIComponent(search)}&`;
      if (genderFilter) url += `gender=${encodeURIComponent(genderFilter)}`;

      const res = await api.get(url);
      if (res.data.success) {
        setPatients(res.data.data);
      }
    } catch {
      toast.error('Failed to load patient directory');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchPatients();
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/patients', form);
      if (res.data.success) {
        toast.success('Patient registered successfully');
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
      toast.error(err.response?.data?.message || 'Failed to add patient');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this patient and their clinical record?')) return;
    try {
      const res = await api.delete(`/patients/${id}`);
      if (res.data.success) {
        toast.success('Patient record deleted');
        fetchPatients();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete patient');
    }
  };

  return (
    <DashboardLayout title="Patient Directory">
      <div className="space-y-6">
        {/* Header Hero */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-sky-50 border border-sky-200/60 text-xs text-sky-800 font-semibold mb-2">
              <Users className="w-3.5 h-3.5 text-sky-600" />
              <span>Electronic Medical Records Index</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Hospital Patient Directory
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Comprehensive patient charts, contact registries, blood groups, and QR identity badges.
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold rounded-xl shadow-xs shadow-sky-600/20 transition-all cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Register New Patient</span>
          </button>
        </div>

        {/* Search & Filters */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row gap-4 justify-between items-center">
          <form onSubmit={handleSearch} className="flex gap-2 w-full md:w-96">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search patient by name, email or ID..."
                className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:border-sky-500 focus:ring-3 focus:ring-sky-500/15 transition-all text-slate-900"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition-colors cursor-pointer"
            >
              Search
            </button>
          </form>

          <div className="flex items-center gap-2.5 w-full md:w-auto">
            <Filter className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Gender:</span>
            <select
              value={genderFilter}
              onChange={(e) => setGenderFilter(e.target.value)}
              className="px-3 py-2 text-xs font-semibold border border-slate-200 rounded-xl bg-white text-slate-700 focus:outline-hidden focus:border-sky-500"
            >
              <option value="">All Genders</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        {/* Patients Table */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          {loading ? (
            <div className="p-16 text-center">
              <div className="w-8 h-8 border-3 border-sky-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-xs text-slate-500">Loading patient directory...</p>
            </div>
          ) : patients.length === 0 ? (
            <div className="p-16 text-center">
              <Users className="w-12 h-12 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-700">No patients found</p>
              <p className="text-xs text-slate-400 mt-1">Try adjusting your search criteria or register a patient.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="text-slate-400 font-bold border-b border-slate-100 uppercase tracking-wider bg-slate-50/50">
                    <th className="py-3 px-4">Patient ID</th>
                    <th className="py-3 px-4">Full Name</th>
                    <th className="py-3 px-4">Phone & Email</th>
                    <th className="py-3 px-4">Blood Group</th>
                    <th className="py-3 px-4">Registered Date</th>
                    <th className="py-3 px-4 text-center">QR Card</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {patients.map((p) => (
                    <tr key={p._id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-sky-700">
                        {p.patientId}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 text-sm">{p.user?.name}</div>
                        <div className="text-[11px] text-slate-500">{p.gender}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-slate-700">{p.user?.phone || 'N/A'}</div>
                        <div className="text-[11px] text-slate-400 font-mono">{p.user?.email}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-bold px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-200">
                          {p.bloodGroup}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                        {new Date(p.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => setShowQRModal(p)}
                          className="p-1.5 text-slate-500 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors cursor-pointer"
                          title="View Digital QR ID"
                        >
                          <QrCode className="w-4 h-4 mx-auto" />
                        </button>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => handleDelete(p._id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Delete Record"
                        >
                          <Trash2 className="w-4 h-4" />
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
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                  <UserPlus className="w-5 h-5 text-sky-600" />
                  Register New Patient
                </h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreate} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ramesh Kumar"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-hidden focus:border-sky-500"
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
                      className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-hidden focus:border-sky-500"
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
                      className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-hidden focus:border-sky-500"
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
                      className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-hidden focus:border-sky-500"
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
                      className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-hidden focus:border-sky-500 bg-white"
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
                      className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-hidden focus:border-sky-500 bg-white"
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
                    placeholder="Street, City, Postal Code"
                    className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-hidden focus:border-sky-500"
                  ></textarea>
                </div>

                <div className="pt-4 border-t border-slate-100 flex justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 border border-slate-200 text-xs text-slate-600 hover:bg-slate-50 rounded-xl font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold rounded-xl shadow-xs shadow-sky-600/20 transition-all cursor-pointer"
                  >
                    Register Patient
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: QR Code */}
        {showQRModal && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xl w-full max-w-sm p-6 text-center animate-in fade-in zoom-in-95 duration-150">
              <div className="w-12 h-12 rounded-2xl bg-sky-600 text-white flex items-center justify-center font-bold text-lg mx-auto mb-2 shadow-md shadow-sky-600/20">
                {showQRModal.user?.name ? showQRModal.user.name.charAt(0).toUpperCase() : 'P'}
              </div>
              <h3 className="font-bold text-slate-900 text-base">{showQRModal.user?.name}</h3>
              <p className="text-xs text-sky-600 font-mono mt-0.5">{showQRModal.patientId}</p>

              <div className="mt-4 p-4 bg-white border border-slate-200 rounded-xl inline-block shadow-xs">
                {showQRModal.qrCode ? (
                  <img src={showQRModal.qrCode} alt="Patient QR" className="w-44 h-44 mx-auto" />
                ) : (
                  <div className="w-44 h-44 flex items-center justify-center text-xs text-slate-400">
                    QR Available on verification
                  </div>
                )}
              </div>

              <div className="mt-4 text-xs text-slate-600 space-y-1 text-left bg-slate-50 p-3 rounded-xl">
                <p>
                  <strong>Blood Group:</strong> {showQRModal.bloodGroup}
                </p>
                <p>
                  <strong>Contact:</strong> {showQRModal.user?.phone || 'N/A'}
                </p>
              </div>

              <button
                onClick={() => setShowQRModal(null)}
                className="mt-4 w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl cursor-pointer"
              >
                Close Badge
              </button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default PatientsPage;
