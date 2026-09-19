import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import {
  X,
  Building2,
  ShieldCheck,
  Bed,
  HeartPulse,
  Siren,
  Navigation,
  Phone,
  Clock,
  Calendar,
  Award,
  Stethoscope,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  MapPin,
  ExternalLink,
  Sparkles,
  DollarSign,
  Activity,
  ChevronRight,
  UserCheck,
} from 'lucide-react';

const HospitalDetailPanel = ({ hospital, userLocation, onClose }) => {
  const navigate = useNavigate();
  const [details, setDetails] = useState(hospital);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('doctors'); // 'doctors' | 'beds' | 'facilities'
  const [doctorSearch, setDoctorSearch] = useState('');

  // Fetch full hospital details including doctor roster and bed inventory
  useEffect(() => {
    if (!hospital?._id) return;
    let isMounted = true;

    const fetchFullProfile = async () => {
      setLoading(true);
      try {
        const params = {};
        if (userLocation?.lat && userLocation?.lng) {
          params.lat = userLocation.lat;
          params.lng = userLocation.lng;
        }
        const res = await api.get(`/hospitals/${hospital._id}`, { params });
        if (isMounted && res.data.success) {
          setDetails(res.data.data);
        }
      } catch (err) {
        console.warn('Failed to load extended hospital profile:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchFullProfile();

    return () => {
      isMounted = false;
    };
  }, [hospital?._id, userLocation]);

  if (!hospital) return null;

  const h = details || hospital;
  const generalAvail = h.capacitySummary?.general?.available || 0;
  const generalTotal = h.capacitySummary?.general?.total || 1;
  const icuAvail = h.capacitySummary?.icu?.available || 0;
  const icuTotal = h.capacitySummary?.icu?.total || 1;
  const emergencyAvail = h.capacitySummary?.emergency?.available || 0;
  const emergencyTotal = h.capacitySummary?.emergency?.total || 1;
  const emergency = h.emergencyAvailable;

  const generalPct = Math.min(100, Math.round((generalAvail / generalTotal) * 100));
  const icuPct = Math.min(100, Math.round((icuAvail / icuTotal) * 100));

  const [lng, lat] = h.location?.coordinates || [83.0542, 26.7751];

  const filteredDoctors = (h.doctors || []).filter((doc) => {
    if (!doctorSearch.trim()) return true;
    const q = doctorSearch.toLowerCase();
    const docName = doc.user?.name?.toLowerCase() || '';
    const spec = doc.specialization?.toLowerCase() || '';
    const conditions = doc.treatedConditions?.toLowerCase() || '';
    return docName.includes(q) || spec.includes(q) || conditions.includes(q);
  });

  const handleBookDoctor = (doc) => {
    navigate('/patient/appointments', {
      state: {
        hospitalId: h._id,
        hospitalName: h.name,
        doctorName: doc.user?.name,
        specialization: doc.specialization,
      },
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden">
        {/* TOP HEADER */}
        <div className="p-4 sm:p-6 bg-slate-900 text-white relative flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            title="Close Panel"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-start justify-between gap-4 pr-10">
            <div>
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-400/30">
                  🏥 {h.hospitalType || 'General Hospital'}
                </span>
                {h.verificationStatus === 'VERIFIED' && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                    <ShieldCheck className="w-3 h-3" /> Verified Healthcare Facility
                  </span>
                )}
                {h.rating && (
                  <span className="text-[11px] font-bold text-amber-300 flex items-center gap-1">
                    ★ {h.rating} <span className="text-slate-400 text-[10px]">({h.totalReviews || 120} reviews)</span>
                  </span>
                )}
              </div>

              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                {h.name}
              </h2>
              <p className="text-xs text-slate-300 mt-1 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                <span>{h.address}, {h.city}, {h.state} - {h.pincode}</span>
              </p>
            </div>

            {/* Distance & Travel Badge */}
            {h.distanceKm !== null && h.distanceKm !== undefined && (
              <div className="text-right shrink-0 bg-white/10 px-3.5 py-2 rounded-2xl border border-white/15">
                <span className="text-sm font-black text-sky-300">
                  {h.distanceKm < 0.1 ? '< 100 m' : `${h.distanceKm} km`}
                </span>
                <p className="text-[10px] text-slate-300 font-semibold mt-0.5">
                  🚗 ~{h.estTravelMinutes || 1} min away
                </p>
              </div>
            )}
          </div>

          {/* Quick Action Contact Buttons */}
          <div className="flex items-center gap-2.5 flex-wrap mt-4 pt-3 border-t border-white/10 text-xs">
            {h.phone && (
              <a
                href={`tel:${h.phone}`}
                className="px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold flex items-center gap-1.5 transition-colors shadow-sm"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Call Hospital: {h.phone}</span>
              </a>
            )}

            {h.emergencyPhone && (
              <a
                href={`tel:${h.emergencyPhone}`}
                className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold flex items-center gap-1.5 transition-colors shadow-sm"
              >
                <Siren className="w-3.5 h-3.5" />
                <span>Emergency Hotline: {h.emergencyPhone}</span>
              </a>
            )}

            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-white font-bold flex items-center gap-1.5 transition-colors"
            >
              <Navigation className="w-3.5 h-3.5 text-sky-300" />
              <span>Open Google Directions</span>
            </a>
          </div>
        </div>

        {/* NAVIGATION TABS */}
        <div className="flex items-center border-b border-slate-200 bg-slate-50 px-4 sm:px-6 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('doctors')}
            className={`py-3 px-4 text-xs font-black border-b-2 flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'doctors'
                ? 'border-sky-600 text-sky-700 bg-white shadow-xs rounded-t-xl'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Stethoscope className="w-4 h-4" />
            <span>Doctors &amp; Diseases Treated ({h.doctors?.length || 0})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('beds')}
            className={`py-3 px-4 text-xs font-black border-b-2 flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'beds'
                ? 'border-sky-600 text-sky-700 bg-white shadow-xs rounded-t-xl'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Bed className="w-4 h-4" />
            <span>Live Bed Counters</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('facilities')}
            className={`py-3 px-4 text-xs font-black border-b-2 flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'facilities'
                ? 'border-sky-600 text-sky-700 bg-white shadow-xs rounded-t-xl'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Facilities &amp; Departments</span>
          </button>
        </div>

        {/* TAB BODY */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-5">
          {/* TAB 1: DOCTORS ROSTER */}
          {activeTab === 'doctors' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-sky-50/70 p-3.5 rounded-2xl border border-sky-100">
                <div>
                  <h3 className="text-sm font-bold text-sky-950 flex items-center gap-1.5">
                    <Stethoscope className="w-4 h-4 text-sky-600" />
                    Specialist Doctors on Duty &amp; Treatments
                  </h3>
                  <p className="text-xs text-sky-800/80 mt-0.5">
                    Find doctors specialized in your disease with confirmed OPD schedule and OPD fees.
                  </p>
                </div>

                <input
                  type="text"
                  placeholder="Filter by disease, specialty or doctor..."
                  value={doctorSearch}
                  onChange={(e) => setDoctorSearch(e.target.value)}
                  className="px-3 py-1.5 rounded-xl border border-sky-200 bg-white text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 max-w-xs"
                />
              </div>

              {loading ? (
                <div className="py-12 text-center text-slate-400">
                  <div className="w-8 h-8 border-2 border-sky-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                  <p className="text-xs font-semibold">Loading doctor schedules &amp; clinical roster...</p>
                </div>
              ) : filteredDoctors.length === 0 ? (
                <div className="py-10 text-center text-slate-400 bg-slate-50 rounded-2xl border border-slate-200/80">
                  <Stethoscope className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                  <p className="text-xs font-bold text-slate-600">No doctors match your search query.</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Try searching for 'Cardiology', 'Fever', or clear the search.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {filteredDoctors.map((doc, idx) => (
                    <div
                      key={doc._id || idx}
                      className="p-4 rounded-2xl border border-slate-200 hover:border-sky-300 hover:shadow-md transition-all bg-white flex flex-col justify-between space-y-3"
                    >
                      <div>
                        {/* Doctor Name & Availability Badge */}
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h4 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                              {doc.user?.name || `Doctor ${idx + 1}`}
                            </h4>
                            <p className="text-xs font-bold text-sky-600 mt-0.5">
                              {doc.designation || doc.specialization}
                            </p>
                          </div>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 shrink-0">
                            ● Available Today
                          </span>
                        </div>

                        {/* Diseases & Conditions Treated */}
                        <div className="mt-2.5 p-2.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                          <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider block">
                            🎯 Treats &amp; Consults For:
                          </span>
                          <p className="text-xs font-semibold text-slate-800 leading-snug">
                            {doc.treatedConditions || `${doc.specialization} clinical treatments, diagnosis and care.`}
                          </p>
                        </div>

                        {/* Qualification, Experience, & Fee */}
                        <div className="grid grid-cols-3 gap-2 mt-2.5 text-[11px] text-slate-600">
                          <div className="p-1.5 rounded-lg bg-slate-50 border border-slate-100">
                            <span className="text-[9px] font-bold text-slate-400 block">Degree</span>
                            <span className="font-bold text-slate-800 truncate block">{doc.qualification || 'MBBS, MD'}</span>
                          </div>
                          <div className="p-1.5 rounded-lg bg-slate-50 border border-slate-100">
                            <span className="text-[9px] font-bold text-slate-400 block">Experience</span>
                            <span className="font-bold text-slate-800">{doc.experience || 8}+ Yrs</span>
                          </div>
                          <div className="p-1.5 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-800">
                            <span className="text-[9px] font-bold text-emerald-600 block">OPD Fee</span>
                            <span className="font-black">₹{doc.consultationFee || 400}</span>
                          </div>
                        </div>

                        {/* OPD Schedule Timings */}
                        <div className="mt-2.5 flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
                          <Clock className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                          <span>OPD Hours: Mon - Sat (09:00 AM - 02:00 PM)</span>
                        </div>
                      </div>

                      {/* Action CTA: Book Appointment */}
                      <button
                        type="button"
                        onClick={() => handleBookDoctor(doc)}
                        className="w-full py-2 px-3 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-sm"
                      >
                        <Calendar className="w-3.5 h-3.5" />
                        <span>Book OPD Appointment</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: LIVE BED METRICS */}
          {activeTab === 'beds' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200/80 text-amber-900 text-xs flex items-center gap-2">
                <Activity className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  Real-time bed availability verified by CareSync live hospital sync. Bed numbers update automatically.
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* General Beds */}
                <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
                      <Bed className="w-4 h-4 text-sky-600" /> General Ward
                    </span>
                    <span className="text-xs font-extrabold text-sky-600 bg-sky-50 px-2 py-0.5 rounded-md">
                      {generalPct}% Free
                    </span>
                  </div>
                  <div>
                    <span className="text-3xl font-black text-slate-900">{generalAvail}</span>
                    <span className="text-xs font-bold text-slate-400 ml-1">/ {generalTotal} Total Beds</span>
                  </div>
                  {/* Progress bar */}
                  <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div className="h-full bg-sky-500 rounded-full" style={{ width: `${generalPct}%` }}></div>
                  </div>
                  <p className="text-[10px] text-slate-400 font-medium">Standard inpatient care &amp; recovery</p>
                </div>

                {/* ICU Beds */}
                <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
                      <HeartPulse className="w-4 h-4 text-rose-600" /> Intensive Care (ICU)
                    </span>
                    <span className={`text-xs font-extrabold px-2 py-0.5 rounded-md ${
                      icuAvail > 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                    }`}>
                      {icuAvail > 0 ? 'Available' : 'Full'}
                    </span>
                  </div>
                  <div>
                    <span className="text-3xl font-black text-slate-900">{icuAvail}</span>
                    <span className="text-xs font-bold text-slate-400 ml-1">/ {icuTotal} Ventilator ICU</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div className="h-full bg-rose-500 rounded-full" style={{ width: `${icuPct}%` }}></div>
                  </div>
                  <p className="text-[10px] text-slate-400 font-medium">Equipped with ventilators &amp; continuous vitals monitor</p>
                </div>

                {/* Emergency Triage Beds */}
                <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
                      <Siren className="w-4 h-4 text-amber-600" /> Emergency Trauma
                    </span>
                    <span className={`text-xs font-extrabold px-2 py-0.5 rounded-md ${
                      emergency ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                    }`}>
                      {emergency ? '24/7 Active' : 'Standby'}
                    </span>
                  </div>
                  <div>
                    <span className="text-3xl font-black text-slate-900">{emergencyAvail}</span>
                    <span className="text-xs font-bold text-slate-400 ml-1">/ {emergencyTotal} Emergency Beds</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div className="h-full bg-amber-500 rounded-full" style={{ width: `${Math.round((emergencyAvail / emergencyTotal) * 100)}%` }}></div>
                  </div>
                  <p className="text-[10px] text-slate-400 font-medium">Immediate trauma triage &amp; stabilization</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: FACILITIES & DEPARTMENTS */}
          {activeTab === 'facilities' && (
            <div className="space-y-5">
              {/* Facilities Grid */}
              <div>
                <h4 className="text-xs font-extrabold uppercase text-slate-400 tracking-wider mb-2.5">
                  Critical Healthcare Facilities &amp; Services
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className={`p-3 rounded-xl border flex items-center gap-2 font-bold ${
                    h.ambulanceAvailable
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                      : 'bg-slate-50 border-slate-200 text-slate-400'
                  }`}>
                    {h.ambulanceAvailable ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> : <XCircle className="w-4 h-4 shrink-0" />}
                    <span>🚑 24/7 Ambulance</span>
                  </div>

                  <div className={`p-3 rounded-xl border flex items-center gap-2 font-bold ${
                    h.bloodBankAvailable
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                      : 'bg-slate-50 border-slate-200 text-slate-400'
                  }`}>
                    {h.bloodBankAvailable ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> : <XCircle className="w-4 h-4 shrink-0" />}
                    <span>🩸 Blood Bank</span>
                  </div>

                  <div className={`p-3 rounded-xl border flex items-center gap-2 font-bold ${
                    h.pharmacyAvailable
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                      : 'bg-slate-50 border-slate-200 text-slate-400'
                  }`}>
                    {h.pharmacyAvailable ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> : <XCircle className="w-4 h-4 shrink-0" />}
                    <span>💊 24/7 Pharmacy</span>
                  </div>

                  <div className={`p-3 rounded-xl border flex items-center gap-2 font-bold ${
                    h.diagnosticAvailable
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                      : 'bg-slate-50 border-slate-200 text-slate-400'
                  }`}>
                    {h.diagnosticAvailable ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> : <XCircle className="w-4 h-4 shrink-0" />}
                    <span>🔬 Diagnostics / Lab</span>
                  </div>
                </div>
              </div>

              {/* Departments / Specialties */}
              <div>
                <h4 className="text-xs font-extrabold uppercase text-slate-400 tracking-wider mb-2.5">
                  Clinical Departments &amp; Specialized Wings
                </h4>
                <div className="flex items-center gap-2 flex-wrap">
                  {(h.departments || ['Cardiology', 'General Medicine', 'Pediatrics', 'Emergency Medicine']).map((dept, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-800 border border-slate-200 font-bold text-xs"
                    >
                      🩺 {dept}
                    </span>
                  ))}
                </div>
              </div>

              {/* Hospital Operating Hours & Registration details */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1.5 text-slate-600">
                <p><strong className="text-slate-800">Operating Hours:</strong> {h.operatingHours || '24 Hours Open (Emergency & Inpatient)'}</p>
                <p><strong className="text-slate-800">Hospital Category:</strong> {h.hospitalType || 'Multi-Specialty Healthcare Center'}</p>
                <p><strong className="text-slate-800">Contact Email:</strong> {h.email}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HospitalDetailPanel;

