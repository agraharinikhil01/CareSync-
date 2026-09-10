import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import DashboardLayout from '../../layouts/DashboardLayout';
import { Stethoscope, Plus, Search, Filter, Trash2, Edit, Award, Clock, DollarSign, X } from 'lucide-react';
import toast from 'react-hot-toast';

const SPECIALIZATIONS = [
  'All',
  'Cardiology',
  'Orthopedics',
  'Pediatrics',
  'Neurology',
  'General Medicine',
  'Dermatology',
  'Oncology',
  'Emergency Medicine',
];

const DoctorsPage = () => {
  const [doctors, setDoctors] = useState([]);
  const [search, setSearch] = useState('');
  const [specFilter, setSpecFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState(null);

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: 'Doctor@123',
    specialization: 'Cardiology',
    qualification: 'MBBS, MD',
    experience: 5,
    consultationFee: 750,
  });

  useEffect(() => {
    fetchDoctors();
  }, [specFilter]);

  const fetchDoctors = async () => {
    setLoading(true);
    try {
      let url = '/doctors?';
      if (search) url += `search=${encodeURIComponent(search)}&`;
      if (specFilter !== 'All') url += `specialization=${encodeURIComponent(specFilter)}`;

      const res = await api.get(url);
      if (res.data.success) {
        setDoctors(res.data.data);
      }
    } catch {
      toast.error('Failed to load doctor directory');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchDoctors();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingDoctor) {
        const res = await api.put(`/doctors/${editingDoctor._id}`, {
          name: form.name,
          phone: form.phone,
          specialization: form.specialization,
          qualification: form.qualification,
          experience: Number(form.experience),
          consultationFee: Number(form.consultationFee),
        });
        if (res.data.success) {
          toast.success('Doctor updated successfully');
          setShowModal(false);
          setEditingDoctor(null);
          fetchDoctors();
        }
      } else {
        const res = await api.post('/doctors', {
          ...form,
          experience: Number(form.experience),
          consultationFee: Number(form.consultationFee),
        });
        if (res.data.success) {
          toast.success('Doctor registered successfully');
          setShowModal(false);
          setForm({
            name: '',
            email: '',
            phone: '',
            password: 'Doctor@123',
            specialization: 'Cardiology',
            qualification: 'MBBS, MD',
            experience: 5,
            consultationFee: 750,
          });
          fetchDoctors();
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed');
    }
  };

  const handleToggleAvailability = async (doc) => {
    try {
      const res = await api.put(`/doctors/${doc._id}`, {
        availability: !doc.availability,
      });
      if (res.data.success) {
        toast.success(`Dr. ${doc.user?.name || ''} marked ${!doc.availability ? 'Available' : 'Unavailable'}`);
        fetchDoctors();
      }
    } catch {
      toast.error('Failed to update availability');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to deactivate and remove this doctor?')) return;
    try {
      const res = await api.delete(`/doctors/${id}`);
      if (res.data.success) {
        toast.success('Doctor removed from staff');
        fetchDoctors();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to remove doctor');
    }
  };

  const openEdit = (doc) => {
    setEditingDoctor(doc);
    setForm({
      name: doc.user?.name || '',
      email: doc.user?.email || '',
      phone: doc.user?.phone || '',
      password: '',
      specialization: doc.specialization || 'Cardiology',
      qualification: doc.qualification || 'MBBS, MD',
      experience: doc.experience || 0,
      consultationFee: doc.consultationFee || 500,
    });
    setShowModal(true);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#dcdcde] pb-4 bg-white p-6 rounded-md shadow-xs">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 bg-[#e6f4f8] text-[#006088] rounded-md">
                <Stethoscope className="w-6 h-6" />
              </span>
              <h1 className="text-2xl font-semibold text-[#2c3338] tracking-tight">Doctor Roster & Faculty</h1>
            </div>
            <p className="text-sm text-[#50575e] mt-1">
              Manage attending physicians, departmental specializations, consultation fees, and real-time on-call availability.
            </p>
          </div>
          <button
            onClick={() => {
              setEditingDoctor(null);
              setForm({
                name: '',
                email: '',
                phone: '',
                password: 'Doctor@123',
                specialization: 'Cardiology',
                qualification: 'MBBS, MD',
                experience: 5,
                consultationFee: 750,
              });
              setShowModal(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#0087be] hover:bg-[#006088] text-white text-sm font-medium rounded-sm shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add Doctor
          </button>
        </div>

        {/* Filters and Search */}
        <div className="bg-white p-4 rounded-md border border-[#dcdcde] shadow-xs flex flex-col md:flex-row gap-4 justify-between items-center">
          <form onSubmit={handleSearch} className="flex gap-2 w-full md:w-96">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search physician by name or email..."
                className="w-full pl-9 pr-3 py-2 text-sm border border-[#dcdcde] rounded-sm focus:outline-hidden focus:border-[#0087be] focus:ring-1 focus:ring-[#0087be]"
              />
            </div>
            <button
              type="submit"
              className="px-3 py-2 bg-[#f6f7f7] hover:bg-[#eaeaea] text-[#2c3338] border border-[#dcdcde] rounded-sm text-sm font-medium transition-colors cursor-pointer"
            >
              Search
            </button>
          </form>

          <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
            <Filter className="w-4 h-4 text-gray-500 shrink-0" />
            <span className="text-xs font-semibold text-[#50575e] uppercase">Dept:</span>
            <select
              value={specFilter}
              onChange={(e) => setSpecFilter(e.target.value)}
              className="px-3 py-2 text-sm border border-[#dcdcde] rounded-sm focus:outline-hidden focus:border-[#0087be] bg-white text-[#2c3338]"
            >
              {SPECIALIZATIONS.map((spec) => (
                <option key={spec} value={spec}>
                  {spec}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Doctor Grid / Cards */}
        {loading ? (
          <div className="bg-white p-12 text-center rounded-md border border-[#dcdcde]">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-[#0087be] border-t-transparent"></div>
            <p className="mt-3 text-sm text-[#50575e]">Loading medical faculty records...</p>
          </div>
        ) : doctors.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-md border border-[#dcdcde]">
            <Stethoscope className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-base font-medium text-[#2c3338]">No doctors found</p>
            <p className="text-sm text-[#50575e] mt-1">Try adjusting search criteria or register a new doctor.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {doctors.map((doc) => (
              <div
                key={doc._id}
                className="bg-white rounded-md border border-[#dcdcde] shadow-xs hover:shadow-md transition-shadow p-5 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-[#006088] text-white flex items-center justify-center font-bold text-lg">
                        {doc.user?.name ? doc.user.name.charAt(0).toUpperCase() : 'D'}
                      </div>
                      <div>
                        <h3 className="font-semibold text-[#2c3338] text-base leading-tight">
                          Dr. {doc.user?.name || 'Unnamed Doctor'}
                        </h3>
                        <p className="text-xs text-[#0087be] font-medium mt-0.5">{doc.specialization}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleToggleAvailability(doc)}
                      title="Click to toggle availability"
                      className={`text-xs px-2.5 py-1 rounded-full font-medium transition-colors cursor-pointer ${
                        doc.availability ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-gray-100 text-gray-600 border border-gray-200'
                      }`}
                    >
                      {doc.availability ? '● Available' : '○ Off-Duty'}
                    </button>
                  </div>

                  <div className="mt-4 pt-4 border-t border-[#f0f0f1] space-y-2 text-xs text-[#50575e]">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Award className="w-3.5 h-3.5 text-gray-400" />
                        Qualification:
                      </span>
                      <span className="font-medium text-[#2c3338]">{doc.qualification || 'MBBS'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-gray-400" />
                        Experience:
                      </span>
                      <span className="font-medium text-[#2c3338]">{doc.experience} Years</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <DollarSign className="w-3.5 h-3.5 text-gray-400" />
                        Consultation Fee:
                      </span>
                      <span className="font-medium text-emerald-700">₹{doc.consultationFee}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Email:</span>
                      <span className="font-mono text-[11px] text-[#2c3338] truncate max-w-[180px]">{doc.user?.email}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Contact Phone:</span>
                      <span className="font-medium text-[#2c3338]">{doc.user?.phone || 'Not configured'}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-[#dcdcde] flex items-center justify-end gap-2">
                  <button
                    onClick={() => openEdit(doc)}
                    className="p-1.5 text-gray-600 hover:text-[#0087be] hover:bg-[#f6f7f7] rounded-sm transition-colors cursor-pointer"
                    title="Edit Doctor Details"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(doc._id)}
                    className="p-1.5 text-gray-600 hover:text-rose-600 hover:bg-rose-50 rounded-sm transition-colors cursor-pointer"
                    title="Remove Doctor"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add / Edit Doctor Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-md border border-[#dcdcde] shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between px-6 py-4 border-b border-[#dcdcde] bg-[#f6f7f7]">
                <h3 className="font-semibold text-[#2c3338] text-base flex items-center gap-2">
                  <Stethoscope className="w-5 h-5 text-[#006088]" />
                  {editingDoctor ? `Edit Dr. ${editingDoctor.user?.name}` : 'Register New Doctor'}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600 p-1 rounded-sm cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#2c3338] uppercase mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ramesh Kumar"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-[#dcdcde] rounded-sm focus:outline-hidden focus:border-[#0087be] focus:ring-1 focus:ring-[#0087be]"
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
                      className="w-full px-3 py-2 text-sm border border-[#dcdcde] rounded-sm focus:outline-hidden focus:border-[#0087be] focus:ring-1 focus:ring-[#0087be]"
                    />
                  </div>
                </div>

                {!editingDoctor && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#2c3338] uppercase mb-1">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="doctor@caresync.com"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        className="w-full px-3 py-2 text-sm border border-[#dcdcde] rounded-sm focus:outline-hidden focus:border-[#0087be] focus:ring-1 focus:ring-[#0087be]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#2c3338] uppercase mb-1">
                        Initial Password
                      </label>
                      <input
                        type="password"
                        placeholder="Doctor@123"
                        value={form.password}
                        onChange={(e) => setForm({ ...form, password: e.target.value })}
                        className="w-full px-3 py-2 text-sm border border-[#dcdcde] rounded-sm focus:outline-hidden focus:border-[#0087be] focus:ring-1 focus:ring-[#0087be]"
                      />
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#2c3338] uppercase mb-1">
                      Specialization *
                    </label>
                    <select
                      value={form.specialization}
                      onChange={(e) => setForm({ ...form, specialization: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-[#dcdcde] rounded-sm focus:outline-hidden focus:border-[#0087be] bg-white text-[#2c3338]"
                    >
                      {SPECIALIZATIONS.filter((s) => s !== 'All').map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#2c3338] uppercase mb-1">
                      Qualification *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="MBBS, MD, DM"
                      value={form.qualification}
                      onChange={(e) => setForm({ ...form, qualification: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-[#dcdcde] rounded-sm focus:outline-hidden focus:border-[#0087be] focus:ring-1 focus:ring-[#0087be]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#2c3338] uppercase mb-1">
                      Experience (Years)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={form.experience}
                      onChange={(e) => setForm({ ...form, experience: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-[#dcdcde] rounded-sm focus:outline-hidden focus:border-[#0087be] focus:ring-1 focus:ring-[#0087be]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#2c3338] uppercase mb-1">
                      Consultation Fee (₹)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="50"
                      value={form.consultationFee}
                      onChange={(e) => setForm({ ...form, consultationFee: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-[#dcdcde] rounded-sm focus:outline-hidden focus:border-[#0087be] focus:ring-1 focus:ring-[#0087be]"
                    />
                  </div>
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
                    {editingDoctor ? 'Save Changes' : 'Register Doctor'}
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

export default DoctorsPage;
