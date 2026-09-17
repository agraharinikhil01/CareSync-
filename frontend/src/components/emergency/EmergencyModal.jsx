import React, { useState, useEffect } from 'react';
import {
  Siren,
  X,
  Phone,
  Navigation,
  HeartPulse,
  Car,
  Wind,
  Baby,
  Activity,
  AlertTriangle,
  CheckCircle2,
  Loader2,
} from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const EMERGENCY_TYPES = [
  { id: 'CARDIAC', label: 'Cardiac Arrest / Heart', icon: HeartPulse, color: 'text-rose-600 bg-rose-50 border-rose-200' },
  { id: 'ACCIDENT', label: 'Road Accident / Trauma', icon: Car, color: 'text-amber-600 bg-amber-50 border-amber-200' },
  { id: 'RESPIRATORY', label: 'Severe Breathing Trouble', icon: Wind, color: 'text-sky-600 bg-sky-50 border-sky-200' },
  { id: 'MATERNITY', label: 'Maternity Emergency', icon: Baby, color: 'text-purple-600 bg-purple-50 border-purple-200' },
  { id: 'OTHER', label: 'General Critical Emergency', icon: Activity, color: 'text-red-600 bg-red-50 border-red-200' },
];

const EmergencyModal = ({ isOpen, onClose, userLocation, nearestHospitals = [] }) => {
  const [selectedType, setSelectedType] = useState('CARDIAC');
  const [patientName, setPatientName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [dispatchedData, setDispatchedData] = useState(null);

  if (!isOpen) return null;

  // Filter hospitals with active emergency services and ICU
  const emergencyHospitals = nearestHospitals
    .filter((h) => h.emergencyAvailable)
    .sort((a, b) => (a.distanceKm || 99) - (b.distanceKm || 99))
    .slice(0, 3);

  const handleDispatch = async (e) => {
    e.preventDefault();
    if (!patientName.trim() || !contactPhone.trim()) {
      toast.error('Please enter patient name and contact phone');
      return;
    }

    setLoading(true);
    try {
      const topHosp = emergencyHospitals[0];
      const res = await api.post('/emergency', {
        patientName,
        contactPhone,
        emergencyType: selectedType,
        latitude: userLocation?.lat || 28.6139,
        longitude: userLocation?.lng || 77.2090,
        targetHospitalId: topHosp?._id,
        notes,
      });

      if (res.data.success) {
        setDispatchedData(res.data.data);
        toast.success('🚨 Emergency Alert Sent! Medical dispatch notified.');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to dispatch emergency alert');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-rose-200 overflow-hidden">
        {/* Urgent Red Header */}
        <div className="bg-gradient-to-r from-rose-600 to-red-700 p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-white/20 backdrop-blur-md animate-pulse">
              <Siren className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg tracking-tight">Rapid Emergency Mode</h3>
              <p className="text-xs text-rose-100 font-medium">Instant Triage & Closest Hospital Dispatch</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/20 transition-colors text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {dispatchedData ? (
          /* Dispatched Success State */
          <div className="p-6 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <div>
              <h4 className="text-lg font-bold text-slate-900">Hospital Alert Dispatched!</h4>
              <p className="text-xs text-slate-500 mt-1">
                {dispatchedData.targetHospital?.name} has received your live emergency notification.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-left space-y-2">
              <p className="text-xs font-bold text-slate-700">Hospital Emergency Contact:</p>
              <div className="flex items-center justify-between">
                <span className="text-sm font-extrabold text-rose-600">
                  {dispatchedData.targetHospital?.emergencyPhone || dispatchedData.targetHospital?.phone || '108'}
                </span>
                <a
                  href={`tel:${dispatchedData.targetHospital?.emergencyPhone || '108'}`}
                  className="px-3 py-1.5 rounded-xl bg-rose-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-md hover:bg-rose-700"
                >
                  <Phone className="w-3.5 h-3.5" /> Call Now
                </a>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold"
            >
              Back to Dashboard
            </button>
          </div>
        ) : (
          /* Active Form */
          <form onSubmit={handleDispatch} className="p-6 space-y-5">
            {/* Triage Category Selection */}
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
                Select Emergency Condition
              </label>
              <div className="grid grid-cols-2 gap-2">
                {EMERGENCY_TYPES.map((type) => {
                  const Icon = type.icon;
                  const isSel = selectedType === type.id;
                  return (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => setSelectedType(type.id)}
                      className={`p-2.5 rounded-xl border text-left text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                        isSel
                          ? 'bg-rose-50 border-rose-500 text-rose-800 shadow-sm ring-2 ring-rose-500/20'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      <Icon className="w-4 h-4 shrink-0 text-rose-600" />
                      <span className="truncate">{type.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Closest Active Hospitals List */}
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                Closest Emergency Facilities
              </label>
              <div className="space-y-2">
                {emergencyHospitals.length > 0 ? (
                  emergencyHospitals.map((hosp) => (
                    <div
                      key={hosp._id}
                      className="p-3 rounded-xl border border-slate-200 bg-slate-50/70 flex items-center justify-between text-xs"
                    >
                      <div>
                        <p className="font-bold text-slate-900 truncate">{hosp.name}</p>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          {hosp.distanceKm ? `${hosp.distanceKm} km away` : 'Nearby'} •{' '}
                          <span className="text-rose-600 font-semibold">
                            {hosp.capacitySummary?.icu?.available || 0} ICU beds
                          </span>
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <a
                          href={`tel:${hosp.emergencyPhone || hosp.phone}`}
                          className="p-2 rounded-lg bg-white border border-slate-200 text-rose-600 hover:bg-rose-50 font-bold"
                          title="Call Emergency Hotline"
                        >
                          <Phone className="w-3.5 h-3.5" />
                        </a>
                        <a
                          href={`https://www.google.com/maps/dir/?api=1&destination=${hosp.location?.coordinates[1]},${hosp.location?.coordinates[0]}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded-lg bg-sky-50 border border-sky-200 text-sky-700 hover:bg-sky-100 font-bold"
                          title="Navigate"
                        >
                          <Navigation className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-500 italic">Finding nearby emergency facilities...</p>
                )}
              </div>
            </div>

            {/* Patient Details */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">Patient Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Kumar"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs focus:ring-2 focus:ring-rose-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">Contact Phone *</label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. +91 98765 43210"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs focus:ring-2 focus:ring-rose-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Quick Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-rose-600 to-red-700 hover:from-rose-700 hover:to-red-800 text-white font-extrabold text-sm shadow-lg shadow-rose-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Dispatching Alert...</span>
                </>
              ) : (
                <>
                  <Siren className="w-4 h-4" />
                  <span>Alert Nearest Hospital & Dispatch</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default EmergencyModal;
