import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import DashboardLayout from '../../layouts/DashboardLayout';
import {
  Stethoscope,
  Plus,
  Search,
  Filter,
  Trash2,
  Edit,
  Award,
  Clock,
  DollarSign,
  X,
  Phone,
  Mail,
} from 'lucide-react';
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
        toast.success(
          `Dr. ${doc.user?.name || ''} marked ${!doc.availability ? 'Available' : 'Unavailable'}`
        );
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
    <DashboardLayout title="Doctor Specialists & Faculty">
      <div className="space-y-6">
        {/* Header Hero */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-teal-50 border border-teal-200/60 text-xs text-teal-800 font-semibold mb-2">
              <Stethoscope className="w-3.5 h-3.5 text-teal-600" />
              <span>Medical Faculty Roster</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Doctor Roster & Faculty
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
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
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold rounded-xl shadow-xs shadow-sky-600/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Doctor</span>
          </button>
        </div>

        {/* Filters and Search */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row gap-4 justify-between items-center">
          <form onSubmit={handleSearch} className="flex gap-2 w-full md:w-96">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search doctor by name or email..."
                className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:border-sky-500 focus:ring-3 focus:ring-sky-500/15 text-slate-900"
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
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Dept:</span>
            <select
              value={specFilter}
              onChange={(e) => setSpecFilter(e.target.value)}
              className="px-3 py-2 text-xs font-semibold border border-slate-200 rounded-xl bg-white text-slate-700 focus:outline-hidden focus:border-sky-500"
            >
              {SPECIALIZATIONS.map((spec) => (
                <option key={spec} value={spec}>
                  {spec}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Doctor Grid */}
        {loading ? (
          <div className="p-16 text-center bg-white rounded-2xl border border-slate-200">
            <div className="w-8 h-8 border-3 border-sky-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs text-slate-500">Loading medical faculty records...</p>
          </div>
        ) : doctors.length === 0 ? (
          <div className="p-16 text-center bg-white rounded-2xl border border-slate-200">
            <Stethoscope className="w-12 h-12 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700">No physicians found</p>
            <p className="text-xs text-slate-400 mt-1">Try selecting another department or add a new doctor.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {doctors.map((doc) => (
              <div
                key={doc._id}
                className="bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow p-5 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-sky-600 to-teal-500 text-white flex items-center justify-center font-bold text-lg shadow-md shadow-sky-500/20">
                        {doc.user?.name ? doc.user.name.charAt(0).toUpperCase() : 'D'}
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 text-base leading-tight">
                          Dr. {doc.user?.name || 'Doctor'}
                        </h3>
                        <p className="text-xs text-sky-600 font-semibold mt-0.5">{doc.specialization}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleToggleAvailability(doc)}
                      title="Click to toggle availability"
                      className={`text-[10px] px-2.5 py-1 rounded-full font-bold transition-colors cursor-pointer ${
                        doc.availability
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-slate-100 text-slate-600 border border-slate-200'
                      }`}
                    >
                      {doc.availability ? '● Available' : '○ Off-Duty'}
                    </button>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 space-y-2 text-xs text-slate-600">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-slate-400">
                        <Award className="w-3.5 h-3.5" /> Qualification:
                      </span>
                      <span className="font-semibold text-slate-800">{doc.qualification || 'MBBS'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-slate-400">
                        <Clock className="w-3.5 h-3.5" /> Experience:
                      </span>
                      <span className="font-semibold text-slate-800">{doc.experience} Years</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-slate-400">
                        <DollarSign className="w-3.5 h-3.5" /> Consultation Fee:
                      </span>
                      <span className="font-bold text-emerald-700">₹{doc.consultationFee}</span>
                    </div>
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-slate-400">Email:</span>
                      <span className="font-mono text-[11px] text-slate-700 truncate max-w-[180px]">
                        {doc.user?.email}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-end gap-1.5">
                  <button
                    onClick={() => openEdit(doc)}
                    className="p-1.5 text-slate-500 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors cursor-pointer"
                    title="Edit Doctor Details"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(doc._id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                    title="Remove Doctor"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal: Add / Edit Doctor */}
        {showModal && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                  <Stethoscope className="w-5 h-5 text-sky-600" />
                  {editingDoctor ? `Edit Dr. ${editingDoctor.user?.name}` : 'Register New Doctor'}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
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

                {!editingDoctor && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="doctor@caresync.com"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-hidden focus:border-sky-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                        Initial Password
                      </label>
                      <input
                        type="password"
                        placeholder="Doctor@123"
                        value={form.password}
                        onChange={(e) => setForm({ ...form, password: e.target.value })}
                        className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-hidden focus:border-sky-500"
                      />
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                      Specialization *
                    </label>
                    <select
                      value={form.specialization}
                      onChange={(e) => setForm({ ...form, specialization: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-hidden focus:border-sky-500 bg-white text-slate-900"
                    >
                      {SPECIALIZATIONS.filter((s) => s !== 'All').map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                      Qualification *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="MBBS, MD, DM"
                      value={form.qualification}
                      onChange={(e) => setForm({ ...form, qualification: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-hidden focus:border-sky-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                      Experience (Years)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={form.experience}
                      onChange={(e) => setForm({ ...form, experience: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-hidden focus:border-sky-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                      Consultation Fee (₹)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="50"
                      value={form.consultationFee}
                      onChange={(e) => setForm({ ...form, consultationFee: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-hidden focus:border-sky-500"
                    />
                  </div>
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
