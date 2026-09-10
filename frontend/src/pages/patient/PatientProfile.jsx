import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import DashboardLayout from '../../layouts/DashboardLayout';
import { User, QrCode, HeartPulse, Phone, Mail, MapPin, Save, ShieldCheck, Sparkles, Activity, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const PatientProfile = () => {
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: '',
    phone: '',
    dob: '',
    gender: 'Male',
    bloodGroup: 'O+',
    address: '',
    emergencyContact: { name: '', relation: '', phone: '' },
    medicalHistory: { allergies: '', chronicDiseases: '', previousSurgeries: '' },
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await api.get('/patients/me/profile');
      if (res.data.success) {
        const p = res.data.data;
        setPatient(p);
        setForm({
          name: p.user?.name || '',
          phone: p.user?.phone || '',
          dob: p.dob ? p.dob.split('T')[0] : '',
          gender: p.gender || 'Male',
          bloodGroup: p.bloodGroup || 'O+',
          address: p.address || '',
          emergencyContact: {
            name: p.emergencyContact?.name || '',
            relation: p.emergencyContact?.relation || '',
            phone: p.emergencyContact?.phone || '',
          },
          medicalHistory: {
            allergies: p.allergies?.join(', ') || '',
            chronicDiseases: p.chronicDiseases?.join(', ') || '',
            previousSurgeries: p.medicalHistory?.previousSurgeries?.join(', ') || '',
          },
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
    if (!patient) return;
    setSaving(true);
    try {
      const payload = {
        name: form.name,
        phone: form.phone,
        dob: form.dob,
        gender: form.gender,
        bloodGroup: form.bloodGroup,
        address: form.address,
        emergencyContact: form.emergencyContact,
        medicalHistory: {
          allergies: form.medicalHistory.allergies
            ? form.medicalHistory.allergies.split(',').map((s) => s.trim())
            : [],
          chronicDiseases: form.medicalHistory.chronicDiseases
            ? form.medicalHistory.chronicDiseases.split(',').map((s) => s.trim())
            : [],
          previousSurgeries: form.medicalHistory.previousSurgeries
            ? form.medicalHistory.previousSurgeries.split(',').map((s) => s.trim())
            : [],
        },
      };

      const res = await api.put(`/patients/${patient._id}`, payload);
      if (res.data.success) {
        toast.success('Medical profile updated successfully');
        fetchProfile();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-16 text-center">
          <div className="inline-block animate-spin rounded-full h-9 w-9 border-3 border-sky-600 border-t-transparent"></div>
          <p className="mt-3 text-xs sm:text-sm font-medium text-slate-500">Loading personal health record...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-5xl mx-auto">
        {/* Header Profile Banner */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-sky-600 to-teal-500 text-white flex items-center justify-center font-bold text-2xl shadow-md shadow-sky-500/20 shrink-0">
              {patient?.user?.name ? patient.user.name.charAt(0).toUpperCase() : 'P'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono font-semibold text-sky-700 bg-sky-50 px-2.5 py-0.5 rounded-md border border-sky-200/70">
                  ID: {patient?.patientId}
                </span>
                <span className="text-[11px] font-semibold tracking-wide uppercase px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" /> Active EMR
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mt-1">
                {patient?.user?.name}
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Blood Group: <strong className="text-rose-600">{patient?.bloodGroup}</strong> · {patient?.gender} · {patient?.user?.email}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Digital QR Health Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 text-center flex flex-col justify-between">
            <div>
              <div className="border-b border-slate-100 pb-3 mb-4">
                <span className="text-[11px] font-bold uppercase tracking-wider text-sky-700">
                  CareSync Patient Health Card
                </span>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl inline-block shadow-inner mb-4">
                {patient?.qrCode ? (
                  <img src={patient.qrCode} alt="Patient QR" className="w-44 h-44 mx-auto rounded-lg" />
                ) : (
                  <div className="w-44 h-44 flex items-center justify-center text-xs text-slate-400">
                    QR Available Upon Hospital Verification
                  </div>
                )}
              </div>

              <p className="text-xs font-mono font-bold text-slate-900">{patient?.patientId}</p>
              <p className="text-[11px] text-slate-500 mt-1 max-w-xs mx-auto">
                Present this digital QR badge at any CareSync reception counter for touchless check-in.
              </p>
            </div>

            <div className="mt-5 pt-4 border-t border-slate-100 text-left text-xs space-y-2 text-slate-600">
              <div className="flex justify-between">
                <span>Emergency Contact:</span>
                <span className="font-semibold text-slate-800">{patient?.emergencyContact?.phone || 'Not recorded'}</span>
              </div>
              <div className="flex justify-between">
                <span>Blood Type:</span>
                <span className="font-bold text-rose-600">{patient?.bloodGroup}</span>
              </div>
            </div>
          </div>

          {/* Clinical Profile Form */}
          <form
            onSubmit={handleUpdate}
            className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-6"
          >
            <div>
              <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
                <HeartPulse className="w-5 h-5 text-sky-600" />
                Personal Parameters & Medical History
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Full Legal Name
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
                  Phone Number
                </label>
                <input
                  type="tel"
                  required
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-hidden focus:border-sky-500 focus:ring-3 focus:ring-sky-500/15"
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
                Known Drug & Food Allergies (Comma separated)
              </label>
              <input
                type="text"
                placeholder="e.g. Penicillin, Sulfa, Peanuts"
                value={form.medicalHistory.allergies}
                onChange={(e) =>
                  setForm({
                    ...form,
                    medicalHistory: { ...form.medicalHistory, allergies: e.target.value },
                  })
                }
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-hidden focus:border-sky-500 focus:ring-3 focus:ring-sky-500/15 placeholder:text-slate-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Chronic Medical Conditions (Comma separated)
              </label>
              <input
                type="text"
                placeholder="e.g. Type 2 Diabetes, Hypertension, Asthma"
                value={form.medicalHistory.chronicDiseases}
                onChange={(e) =>
                  setForm({
                    ...form,
                    medicalHistory: { ...form.medicalHistory, chronicDiseases: e.target.value },
                  })
                }
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-hidden focus:border-sky-500 focus:ring-3 focus:ring-sky-500/15 placeholder:text-slate-400"
              />
            </div>

            <div className="border-t border-slate-100 pt-4">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">
                Emergency Contact Details
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input
                  type="text"
                  placeholder="Contact Person Name"
                  value={form.emergencyContact.name}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      emergencyContact: { ...form.emergencyContact, name: e.target.value },
                    })
                  }
                  className="px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-hidden focus:border-sky-500"
                />
                <input
                  type="text"
                  placeholder="Relationship (e.g. Spouse, Parent)"
                  value={form.emergencyContact.relation}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      emergencyContact: { ...form.emergencyContact, relation: e.target.value },
                    })
                  }
                  className="px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-hidden focus:border-sky-500"
                />
                <input
                  type="tel"
                  placeholder="Emergency Phone"
                  value={form.emergencyContact.phone}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      emergencyContact: { ...form.emergencyContact, phone: e.target.value },
                    })
                  }
                  className="px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-hidden focus:border-sky-500"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-sky-600 to-teal-600 hover:from-sky-700 hover:to-teal-700 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-xs transition-all cursor-pointer"
              >
                <Save className="w-4 h-4" />
                {saving ? 'Updating Record...' : 'Save Health Profile'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default PatientProfile;
