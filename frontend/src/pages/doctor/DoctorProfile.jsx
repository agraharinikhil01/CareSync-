import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import DashboardLayout from '../../layouts/DashboardLayout';
import { User, Stethoscope, Phone, Mail, Award, Clock, DollarSign, Save, CheckCircle2, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';

const DoctorProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: '',
    phone: '',
    specialization: '',
    qualification: '',
    experience: 0,
    consultationFee: 0,
    availability: true,
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await api.get('/doctors/me/profile');
      if (res.data.success) {
        const doc = res.data.data;
        setProfile(doc);
        setForm({
          name: doc.user?.name || '',
          phone: doc.user?.phone || '',
          specialization: doc.specialization || '',
          qualification: doc.qualification || '',
          experience: doc.experience || 0,
          consultationFee: doc.consultationFee || 0,
          availability: doc.availability ?? true,
        });
      }
    } catch {
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!profile) return;
    setSaving(true);
    try {
      const res = await api.put(`/doctors/${profile._id}`, {
        name: form.name,
        phone: form.phone,
        specialization: form.specialization,
        qualification: form.qualification,
        experience: Number(form.experience),
        consultationFee: Number(form.consultationFee),
        availability: form.availability,
      });

      if (res.data.success) {
        toast.success('Clinical profile updated successfully');
        fetchProfile();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-16 text-center">
          <div className="inline-block animate-spin rounded-full h-9 w-9 border-3 border-sky-600 border-t-transparent"></div>
          <p className="mt-3 text-xs sm:text-sm font-medium text-slate-500">Loading doctor profile...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-4xl mx-auto">
        {/* Header Profile Card */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-sky-600 to-indigo-600 text-white flex items-center justify-center font-bold text-2xl shadow-md shadow-sky-500/20 shrink-0">
              {profile?.user?.name ? profile.user.name.charAt(0).toUpperCase() : 'D'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                  Dr. {profile?.user?.name || 'Physician'}
                </h1>
                <span className="text-[11px] font-semibold tracking-wide uppercase px-2.5 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-200/80 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-sky-600" /> Verified
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                {profile?.specialization || 'General Physician'} · Department of Clinical Medicine
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 self-start sm:self-auto">
            <span
              className={`w-2 h-2 rounded-full ${
                form.availability ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'
              }`}
            ></span>
            <span>{form.availability ? 'Accepting Patients' : 'Currently Off-Duty'}</span>
          </div>
        </div>

        {/* Profile Edit Form */}
        <form onSubmit={handleUpdate} className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Stethoscope className="w-5 h-5 text-sky-600" />
              Physician Credentials & Consultation Parameters
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Keep your contact details, OPD consultation fee, and active duty availability up to date.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-hidden focus:border-sky-500 focus:ring-3 focus:ring-sky-500/15"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Email Address (Permanent Login ID)
              </label>
              <input
                type="text"
                disabled
                value={profile?.user?.email || ''}
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-100/70 text-slate-500 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Direct Contact Phone
              </label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-hidden focus:border-sky-500 focus:ring-3 focus:ring-sky-500/15"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Specialization
              </label>
              <input
                type="text"
                value={form.specialization}
                onChange={(e) => setForm({ ...form, specialization: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-hidden focus:border-sky-500 focus:ring-3 focus:ring-sky-500/15"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Qualifications & Medical Degrees
              </label>
              <input
                type="text"
                value={form.qualification}
                onChange={(e) => setForm({ ...form, qualification: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-hidden focus:border-sky-500 focus:ring-3 focus:ring-sky-500/15"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Experience (Years)
              </label>
              <input
                type="number"
                min="0"
                value={form.experience}
                onChange={(e) => setForm({ ...form, experience: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-hidden focus:border-sky-500 focus:ring-3 focus:ring-sky-500/15"
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
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-hidden focus:border-sky-500 focus:ring-3 focus:ring-sky-500/15"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                OPD Availability Status
              </label>
              <select
                value={form.availability ? 'true' : 'false'}
                onChange={(e) => setForm({ ...form, availability: e.target.value === 'true' })}
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-hidden focus:border-sky-500 focus:ring-3 focus:ring-sky-500/15"
              >
                <option value="true">● On-Duty & Accepting Patients</option>
                <option value="false">○ Off-Duty (On Leave / In Surgery)</option>
              </select>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-sky-600 to-teal-600 hover:from-sky-700 hover:to-teal-700 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-xs transition-all cursor-pointer"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving Profile...' : 'Save Profile Changes'}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default DoctorProfile;
