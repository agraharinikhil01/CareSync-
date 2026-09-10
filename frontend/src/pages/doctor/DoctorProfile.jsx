import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import DashboardLayout from '../../layouts/DashboardLayout';
import { User, Stethoscope, Phone, Mail, Award, Clock, DollarSign, Save } from 'lucide-react';
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
        <div className="p-12 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-[#0087be] border-t-transparent"></div>
          <p className="mt-3 text-sm text-[#50575e]">Loading doctor profile...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-4xl">
        {/* Header */}
        <div className="border-b border-[#dcdcde] pb-4 bg-white p-6 rounded-md shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-full bg-[#006088] text-white flex items-center justify-center font-bold text-2xl">
              {profile?.user?.name ? profile.user.name.charAt(0) : 'D'}
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-[#2c3338] tracking-tight">
                Dr. {profile?.user?.name || 'Physician'}
              </h1>
              <p className="text-sm text-[#50575e] mt-0.5">
                {profile?.specialization} · Department of Medicine
              </p>
            </div>
          </div>
        </div>

        {/* Profile Edit Form */}
        <form onSubmit={handleUpdate} className="bg-white rounded-md border border-[#dcdcde] shadow-xs p-6 space-y-6">
          <h2 className="text-base font-semibold text-[#2c3338] border-b border-gray-100 pb-3 flex items-center gap-2">
            <Stethoscope className="w-5 h-5 text-[#006088]" />
            Physician Credentials & OPD Settings
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold text-[#2c3338] uppercase mb-1">
                Full Name
              </label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-[#dcdcde] rounded-sm focus:outline-hidden focus:border-[#0087be]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#2c3338] uppercase mb-1">
                Email Address (Permanent Login ID)
              </label>
              <input
                type="text"
                disabled
                value={profile?.user?.email || ''}
                className="w-full px-3 py-2 text-sm border border-[#dcdcde] bg-gray-50 text-gray-500 rounded-sm cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#2c3338] uppercase mb-1">
                Direct Contact Phone
              </label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-[#dcdcde] rounded-sm focus:outline-hidden focus:border-[#0087be]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#2c3338] uppercase mb-1">
                Specialization
              </label>
              <input
                type="text"
                value={form.specialization}
                onChange={(e) => setForm({ ...form, specialization: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-[#dcdcde] rounded-sm focus:outline-hidden focus:border-[#0087be]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#2c3338] uppercase mb-1">
                Qualifications & Degrees
              </label>
              <input
                type="text"
                value={form.qualification}
                onChange={(e) => setForm({ ...form, qualification: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-[#dcdcde] rounded-sm focus:outline-hidden focus:border-[#0087be]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#2c3338] uppercase mb-1">
                Experience (Years)
              </label>
              <input
                type="number"
                min="0"
                value={form.experience}
                onChange={(e) => setForm({ ...form, experience: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-[#dcdcde] rounded-sm focus:outline-hidden focus:border-[#0087be]"
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
                className="w-full px-3 py-2 text-sm border border-[#dcdcde] rounded-sm focus:outline-hidden focus:border-[#0087be]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#2c3338] uppercase mb-1">
                OPD Availability Status
              </label>
              <select
                value={form.availability ? 'true' : 'false'}
                onChange={(e) => setForm({ ...form, availability: e.target.value === 'true' })}
                className="w-full px-3 py-2 text-sm border border-[#dcdcde] rounded-sm focus:outline-hidden focus:border-[#0087be] bg-white text-[#2c3338]"
              >
                <option value="true">● Available & Accepting Patients</option>
                <option value="false">○ Off-Duty (On Leave / Surgery)</option>
              </select>
            </div>
          </div>

          <div className="pt-4 border-t border-[#dcdcde] flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#0087be] hover:bg-[#006088] text-white text-sm font-semibold rounded-sm shadow-xs transition-colors cursor-pointer"
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
