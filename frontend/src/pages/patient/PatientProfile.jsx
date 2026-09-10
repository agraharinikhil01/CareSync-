import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import DashboardLayout from '../../layouts/DashboardLayout';
import { User, QrCode, HeartPulse, Phone, Mail, MapPin, Save, ShieldCheck } from 'lucide-react';
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
        <div className="p-12 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-[#0087be] border-t-transparent"></div>
          <p className="mt-3 text-sm text-[#50575e]">Loading personal clinical record...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-5xl">
        {/* Header */}
        <div className="border-b border-[#dcdcde] pb-4 bg-white p-6 rounded-md shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-[#006088] text-white flex items-center justify-center font-bold text-2xl shadow-xs">
              {patient?.user?.name ? patient.user.name.charAt(0) : 'P'}
            </div>
            <div>
              <span className="text-xs font-mono font-semibold text-[#0087be] bg-[#e6f4f8] px-2 py-0.5 rounded-sm">
                ID: {patient?.patientId}
              </span>
              <h1 className="text-2xl font-semibold text-[#2c3338] tracking-tight mt-1">
                {patient?.user?.name}
              </h1>
              <p className="text-xs text-[#50575e]">
                Blood Group: <strong className="text-rose-700">{patient?.bloodGroup}</strong> · {patient?.gender}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Digital QR ID Card */}
          <div className="bg-white rounded-md border border-[#dcdcde] shadow-xs p-6 text-center flex flex-col justify-between">
            <div>
              <div className="border-b border-gray-100 pb-3 mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-[#006088]">
                  CareSync Patient Health Card
                </span>
              </div>

              <div className="p-4 bg-white border border-[#dcdcde] rounded-sm inline-block shadow-inner mb-4">
                {patient?.qrCode ? (
                  <img src={patient.qrCode} alt="Patient QR" className="w-44 h-44 mx-auto" />
                ) : (
                  <div className="w-44 h-44 flex items-center justify-center text-xs text-gray-400">
                    QR Available Upon Hospital Verification
                  </div>
                )}
              </div>

              <p className="text-xs font-mono font-semibold text-[#2c3338]">{patient?.patientId}</p>
              <p className="text-[11px] text-[#50575e] mt-1">
                Present this digital QR badge at the front-desk for expedited intake & check-in.
              </p>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100 text-left text-xs space-y-1.5 text-[#50575e]">
              <div className="flex justify-between">
                <span>Contact:</span>
                <span className="font-semibold text-[#2c3338]">{patient?.user?.phone || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span>Blood Type:</span>
                <span className="font-semibold text-rose-700">{patient?.bloodGroup}</span>
              </div>
            </div>
          </div>

          {/* Clinical Profile Form */}
          <form
            onSubmit={handleUpdate}
            className="lg:col-span-2 bg-white rounded-md border border-[#dcdcde] shadow-xs p-6 space-y-6"
          >
            <div>
              <h2 className="text-base font-semibold text-[#2c3338] border-b border-gray-100 pb-3 flex items-center gap-2">
                <HeartPulse className="w-5 h-5 text-[#006088]" />
                Personal & Medical Parameters
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  Phone Number
                </label>
                <input
                  type="tel"
                  required
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
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
                Known Drug / Food Allergies (Comma separated)
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
                className="w-full px-3 py-2 text-sm border border-[#dcdcde] rounded-sm focus:outline-hidden focus:border-[#0087be]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#2c3338] uppercase mb-1">
                Chronic Health Conditions (Comma separated)
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
                className="w-full px-3 py-2 text-sm border border-[#dcdcde] rounded-sm focus:outline-hidden focus:border-[#0087be]"
              />
            </div>

            <div className="border-t border-gray-100 pt-4">
              <h3 className="text-xs font-bold text-[#2c3338] uppercase mb-3">
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
                  className="px-3 py-1.5 text-xs border border-[#dcdcde] rounded-sm"
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
                  className="px-3 py-1.5 text-xs border border-[#dcdcde] rounded-sm"
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
                  className="px-3 py-1.5 text-xs border border-[#dcdcde] rounded-sm"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-[#dcdcde] flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#0087be] hover:bg-[#006088] text-white text-sm font-semibold rounded-sm shadow-xs transition-colors cursor-pointer"
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
