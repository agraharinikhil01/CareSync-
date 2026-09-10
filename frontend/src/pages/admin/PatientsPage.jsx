import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import DashboardLayout from '../../layouts/DashboardLayout';
import { Users, Plus, Search, Filter, Edit, Trash2, QrCode, X, Check } from 'lucide-react';
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
        setForm({ name: '', email: '', phone: '', gender: 'Male', bloodGroup: 'O+', address: '', dob: '', password: 'Patient@123' });
        fetchPatients();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add patient');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this patient and their clinical record?')) return;
    try {
      await api.delete(`/patients/${id}`);
      toast.success('Patient record deleted');
      fetchPatients();
    } catch {
      toast.error('Deletion failed');
    }
  };

  return (
    <DashboardLayout title="Patient Management">
      <div className="space-y-5">
        
        {/* Top Control Bar */}
        <div className="bg-white border border-[#dcdcde] rounded-md p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-[#101517]">Patient Records & Demographics</h2>
            <p className="text-xs text-[#646970]">Browse clinical profiles, electronic health records, and emergency data.</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-[#0087be] hover:bg-[#0073aa] text-white text-xs font-semibold px-3.5 py-2 rounded flex items-center gap-1.5 cursor-pointer shadow-sm self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" /> Add New Patient
          </button>
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-white border border-[#dcdcde] rounded-md p-3 shadow-xs flex flex-wrap items-center justify-between gap-3">
          <form onSubmit={handleSearch} className="flex items-center gap-2 flex-1 max-w-md">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 text-[#646970] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search patient by name, email or phone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs border border-[#8c8f94] focus:border-[#006088] rounded outline-none"
              />
            </div>
            <button
              type="submit"
              className="bg-[#f0f0f1] hover:bg-[#e0e0e1] text-[#2c3338] border border-[#8c8f94] px-3 py-1.5 text-xs font-medium rounded cursor-pointer"
            >
              Search
            </button>
          </form>

          <div className="flex items-center gap-2 text-xs">
            <Filter className="w-3.5 h-3.5 text-[#646970]" />
            <span className="text-[#646970]">Gender:</span>
            <select
              value={genderFilter}
              onChange={(e) => setGenderFilter(e.target.value)}
              className="border border-[#8c8f94] rounded px-2 py-1 text-xs outline-none"
            >
              <option value="">All Genders</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        {/* Patients Table */}
        <div className="bg-white border border-[#dcdcde] rounded-md shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#f0f0f1] text-[#50575e] border-b border-[#dcdcde] uppercase tracking-wider font-semibold">
                <tr>
                  <th className="px-4 py-3">Patient Name</th>
                  <th className="px-4 py-3">Contact Email</th>
                  <th className="px-4 py-3">Phone</th>
                  <th className="px-4 py-3">Gender / Blood</th>
                  <th className="px-4 py-3">Registered Date</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f0f0f1]">
                {patients.map((p) => (
                  <tr key={p._id} className="hover:bg-[#f6f7f7] transition-colors">
                    <td className="px-4 py-3 font-medium text-[#101517]">{p.user?.name || 'Unnamed Patient'}</td>
                    <td className="px-4 py-3 text-[#50575e]">{p.user?.email}</td>
                    <td className="px-4 py-3 text-[#50575e]">{p.user?.phone || '—'}</td>
                    <td className="px-4 py-3 text-[#50575e]">
                      <span className="bg-[#f0f6fc] text-[#006088] px-2 py-0.5 rounded font-medium border border-[#a0c5e8]">
                        {p.gender} · {p.bloodGroup || 'O+'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[#50575e]">
                      {new Date(p.createdAt).toLocaleDateString('en-IN')}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={async () => {
                            const res = await api.get(`/patients/${p._id}`);
                            if (res.data.success) setShowQRModal(res.data.data);
                          }}
                          className="text-xs text-[#006088] hover:underline flex items-center gap-0.5 cursor-pointer"
                        >
                          <QrCode className="w-3.5 h-3.5" /> QR ID
                        </button>
                        <span className="text-[#dcdcde]">|</span>
                        <button
                          onClick={() => handleDelete(p._id)}
                          className="text-xs text-[#d63638] hover:underline cursor-pointer"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {patients.length === 0 && !loading && (
              <div className="py-12 text-center text-[#646970] text-xs">
                No patient records match the selected query.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Patient Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-md border border-[#dcdcde] shadow-xl w-full max-w-md p-6">
            <div className="flex justify-between items-center border-b border-[#dcdcde] pb-3 mb-4">
              <h3 className="font-bold text-sm text-[#101517]">Add New Patient Profile</h3>
              <button onClick={() => setShowAddModal(false)} className="text-[#646970] hover:text-[#101517]">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Full Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Ramesh Chandra"
                  className="w-full border border-[#8c8f94] rounded px-3 py-2 outline-none focus:border-[#006088]"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold mb-1">Email Address</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="ramesh@gmail.com"
                    className="w-full border border-[#8c8f94] rounded px-3 py-2 outline-none focus:border-[#006088]"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="9876543210"
                    className="w-full border border-[#8c8f94] rounded px-3 py-2 outline-none focus:border-[#006088]"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold mb-1">Gender</label>
                  <select
                    value={form.gender}
                    onChange={(e) => setForm({ ...form, gender: e.target.value })}
                    className="w-full border border-[#8c8f94] rounded px-3 py-2 outline-none"
                  >
                    <option>Male</option>
                    <option>Female</option>
                    <option>Other</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1">Blood Group</label>
                  <select
                    value={form.bloodGroup}
                    onChange={(e) => setForm({ ...form, bloodGroup: e.target.value })}
                    className="w-full border border-[#8c8f94] rounded px-3 py-2 outline-none"
                  >
                    {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map((bg) => (
                      <option key={bg}>{bg}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block font-semibold mb-1">Address</label>
                <input
                  type="text"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  placeholder="City, State"
                  className="w-full border border-[#8c8f94] rounded px-3 py-2 outline-none focus:border-[#006088]"
                />
              </div>
              <div className="flex gap-2 pt-2 border-t border-[#dcdcde]">
                <button
                  type="submit"
                  className="flex-1 bg-[#0087be] hover:bg-[#0073aa] text-white font-semibold py-2 rounded cursor-pointer"
                >
                  Save Patient Record
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="bg-white border border-[#8c8f94] hover:bg-[#f0f0f1] text-[#2c3338] py-2 px-3 rounded cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QR Code Modal */}
      {showQRModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-md border border-[#dcdcde] shadow-xl w-full max-w-xs p-6 text-center">
            <div className="flex justify-between items-center border-b border-[#dcdcde] pb-2 mb-4">
              <h3 className="font-bold text-xs text-[#101517]">Patient ID QR Code</h3>
              <button onClick={() => setShowQRModal(null)} className="text-[#646970] hover:text-[#101517]">
                <X className="w-4 h-4" />
              </button>
            </div>
            {showQRModal.qrCode && (
              <img src={showQRModal.qrCode} alt="Patient QR ID" className="w-44 h-44 mx-auto border p-1 rounded" />
            )}
            <p className="font-bold text-xs text-[#101517] mt-3">{showQRModal.user?.name}</p>
            <p className="text-[11px] text-[#646970]">Hospital ID: #{showQRModal._id.slice(-6)}</p>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default PatientsPage;
