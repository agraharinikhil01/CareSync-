import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getEmergencyProfileApi } from '../../api/endpoints';
import {
  Activity,
  PhoneCall,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  HeartPulse,
  MapPin,
  Clock,
  User,
  CheckCircle2,
  Phone,
  Building2,
} from 'lucide-react';

const EmergencyProfile = () => {
  const { patientId } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchEmergencyData();
  }, [patientId]);

  const fetchEmergencyData = async () => {
    try {
      setLoading(true);
      const res = await getEmergencyProfileApi(patientId);
      if (res.data.success) {
        setProfile(res.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Emergency record not found. Please verify the QR link.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white p-4">
        <Activity className="w-12 h-12 text-rose-500 animate-spin mb-4" />
        <p className="font-bold text-lg text-slate-200">Decrypting Emergency Health Record...</p>
        <p className="text-xs text-slate-500 mt-1">Connecting to CareSync Trauma Central Database</p>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white p-4 text-center">
        <div className="w-16 h-16 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center mb-4 border border-rose-500/30">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-black text-white">Emergency Record Not Found</h2>
        <p className="text-sm text-slate-400 max-w-md mt-2 mb-6">{error}</p>
        <a
          href="tel:+15550109999"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm shadow-xl shadow-rose-600/40"
        >
          <PhoneCall className="w-4 h-4" /> Call Hospital Trauma Desk: +1 (555) 010-9999
        </a>
      </div>
    );
  }

  const hasAllergies = profile.allergies && profile.allergies.length > 0;
  const hasHistory = profile.chronicConditions && profile.chronicConditions.length > 0;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-12">
      {/* Top Flashing Emergency Alert Header */}
      <div className="bg-rose-600 text-white px-4 py-3 shadow-lg shadow-rose-600/30">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-white animate-ping"></span>
            <span className="font-black tracking-wider text-xs uppercase sm:text-sm">
              🚨 OFFICIAL EMERGENCY MEDICAL RECORD
            </span>
          </div>
          <span className="text-[11px] font-bold bg-black/20 px-2.5 py-0.5 rounded-full">
            FOR FIRST RESPONDERS & ER
          </span>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 mt-6 space-y-6">
        {/* Hospital Brand & Timestamp */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/80 p-4 rounded-2xl border border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-600 flex items-center justify-center text-white shadow-md">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-bold text-white text-base">CareSync Multi-Specialty Hospital</h1>
              <p className="text-xs text-slate-400">Trauma & Emergency Response System</p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Identity Verified
            </span>
            <span className="text-[10px] text-slate-500">{new Date(profile.verifiedAt).toLocaleString()}</span>
          </div>
        </div>

        {/* Hero Emergency Vitals Card */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-sky-950 p-6 sm:p-8 rounded-3xl border-2 border-rose-500/40 shadow-2xl shadow-rose-950/40 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Patient Full Name</span>
              <h2 className="text-2xl sm:text-3xl font-black text-white mt-0.5">{profile.name}</h2>
              <div className="flex items-center gap-3 mt-2 text-xs text-slate-300 font-medium">
                <span>Age: <strong className="text-white">{profile.age ? `${profile.age} Years` : 'N/A'}</strong></span>
                <span>•</span>
                <span>Gender: <strong className="text-white">{profile.gender || 'N/A'}</strong></span>
              </div>
            </div>

            {/* Giant Blood Group Badge */}
            <div className="bg-gradient-to-br from-rose-600 to-rose-800 px-6 py-4 rounded-2xl text-center shadow-xl shadow-rose-600/40 border border-rose-400/50">
              <span className="text-[10px] font-black uppercase tracking-widest text-rose-200 block">
                BLOOD GROUP
              </span>
              <span className="text-3xl sm:text-4xl font-black text-white tracking-tight block mt-0.5">
                {profile.bloodGroup}
              </span>
            </div>
          </div>

          {/* Critical Allergy Section */}
          <div className="space-y-2.5">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-rose-400" />
              <h3 className="text-sm font-black uppercase tracking-wider text-rose-300">
                CRITICAL DRUG ALLERGIES & ADVERSE REACTIONS:
              </h3>
            </div>

            {hasAllergies ? (
              <div className="bg-rose-950/60 border-2 border-rose-500/60 rounded-2xl p-4 space-y-2">
                <div className="flex flex-wrap gap-2">
                  {profile.allergies.map((allergy, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 rounded-xl bg-rose-600 text-white font-black text-sm tracking-wide shadow-md shadow-rose-900/60 flex items-center gap-1.5"
                    >
                      <AlertTriangle className="w-4 h-4 text-rose-200" />
                      {allergy.toUpperCase()}
                    </span>
                  ))}
                </div>
                <p className="text-xs text-rose-300 font-semibold pt-1">
                  ⚠️ <strong>CLINICAL WARNING:</strong> Do not administer medications belonging to the above allergen classes. High risk of anaphylaxis.
                </p>
              </div>
            ) : (
              <div className="bg-emerald-950/40 border border-emerald-500/40 rounded-2xl p-3.5 flex items-center gap-2 text-emerald-300 text-xs font-bold">
                <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>No Known Drug Allergies (NKDA) recorded on hospital EHR.</span>
              </div>
            )}
          </div>

          {/* Pre-Existing Medical History */}
          <div className="space-y-2.5">
            <div className="flex items-center gap-2">
              <HeartPulse className="w-5 h-5 text-sky-400" />
              <h3 className="text-sm font-black uppercase tracking-wider text-sky-300">
                CHRONIC ILLNESSES & MEDICAL HISTORY:
              </h3>
            </div>

            {hasHistory ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {profile.chronicConditions.map((cond, i) => (
                  <div key={i} className="bg-slate-800/80 p-3.5 rounded-xl border border-slate-700 space-y-1">
                    <p className="font-bold text-white text-xs">{cond.condition}</p>
                    {cond.notes && <p className="text-[11px] text-slate-400">{cond.notes}</p>}
                    {cond.treatedBy && <p className="text-[10px] text-sky-400 font-semibold">{cond.treatedBy}</p>}
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700 text-xs text-slate-400 italic">
                No active chronic medical conditions logged.
              </div>
            )}
          </div>
        </div>

        {/* Immediate 1-Tap Emergency Call Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Primary Kin Emergency Contact */}
          <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">
                Primary Kin Contact
              </span>
              <span className="text-xs font-bold text-sky-400 bg-sky-950/60 px-2.5 py-0.5 rounded-full border border-sky-800">
                {profile.emergencyContact?.relationship || 'Family'}
              </span>
            </div>

            <div>
              <h4 className="text-base font-bold text-white">{profile.emergencyContact?.name || 'Emergency Contact'}</h4>
              <p className="text-xs text-slate-400 mt-0.5">{profile.emergencyContact?.phone || 'No phone'}</p>
            </div>

            <a
              href={`tel:${profile.emergencyContact?.phone}`}
              className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-lg shadow-emerald-950/50 transition-all"
            >
              <Phone className="w-4 h-4" /> Tap to Call Family Member
            </a>
          </div>

          {/* Hospital Emergency Room / Ambulance */}
          <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">
                Hospital Trauma Desk
              </span>
              <span className="text-xs font-bold text-rose-400 bg-rose-950/60 px-2.5 py-0.5 rounded-full border border-rose-800">
                24/7 Dispatch
              </span>
            </div>

            <div>
              <h4 className="text-base font-bold text-white">CareSync Emergency Ward</h4>
              <p className="text-xs text-slate-400 mt-0.5">{profile.hospitalHelpline}</p>
            </div>

            <a
              href={`tel:${profile.hospitalHelpline}`}
              className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-lg shadow-rose-950/50 transition-all"
            >
              <PhoneCall className="w-4 h-4" /> Call ER Trauma Team
            </a>
          </div>
        </div>

        {/* Hospital Address & Footer */}
        <div className="text-center pt-4 text-xs text-slate-500 space-y-1">
          <p>CareSync Multi-Specialty Hospital • 100 Healthcare Avenue, NY 10001</p>
          <p className="text-[10px] text-slate-600">Secure Emergency Health Gateway • HIPAA Compliant</p>
        </div>
      </div>
    </div>
  );
};

export default EmergencyProfile;
