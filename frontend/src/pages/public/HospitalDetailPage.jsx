import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import {
  Building2,
  ShieldCheck,
  Bed,
  HeartPulse,
  Siren,
  Phone,
  Navigation,
  Clock,
  ArrowLeft,
  Calendar,
  Stethoscope,
  Activity,
  CheckCircle2,
  Car,
  Droplet,
  Pill,
  Microscope,
  Loader2,
} from 'lucide-react';
import toast from 'react-hot-toast';

const HospitalDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [hospital, setHospital] = useState(null);
  const [loading, setLoading] = useState(true);

  // Quick appointment modal state
  const [showBookModal, setShowBookModal] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [appointmentDate, setAppointmentDate] = useState('');
  const [appointmentTime, setAppointmentTime] = useState('');
  const [bookingReason, setBookingReason] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);

  useEffect(() => {
    fetchHospital();
  }, [id]);

  const fetchHospital = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/hospitals/${id}`);
      if (res.data.success) {
        setHospital(res.data.data);
      }
    } catch (err) {
      toast.error('Unable to load hospital details');
    } finally {
      setLoading(false);
    }
  };

  const handleBookAppointment = async (e) => {
    e.preventDefault();
    setBookingLoading(true);
    try {
      const res = await api.post('/appointments', {
        doctorId: selectedDoctor || (hospital.doctors?.[0]?._id || null),
        hospitalId: hospital._id,
        date: appointmentDate,
        time: appointmentTime || '10:00 AM',
        reason: bookingReason || 'General Consultation',
      });
      if (res.data.success) {
        toast.success('Appointment request submitted successfully!');
        setShowBookModal(false);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Please log in as a Patient to book an appointment');
      if (!localStorage.getItem('token')) {
        navigate('/login');
      }
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-sky-600" />
          <p className="text-xs font-bold text-slate-500">Loading live hospital capacity...</p>
        </div>
      </div>
    );
  }

  if (!hospital) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-3xl border border-slate-200 text-center max-w-sm space-y-3">
          <Building2 className="w-12 h-12 text-slate-400 mx-auto" />
          <h3 className="font-bold text-slate-800">Hospital Not Found</h3>
          <p className="text-xs text-slate-500">The requested facility is unavailable or has been removed.</p>
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const [lng, lat] = hospital.location?.coordinates || [77.209, 28.6139];
  const generalAvail = hospital.capacitySummary?.general?.available || 0;
  const generalTotal = hospital.capacitySummary?.general?.total || 1;
  const generalPct = Math.min(100, Math.round((generalAvail / generalTotal) * 100));

  const icuAvail = hospital.capacitySummary?.icu?.available || 0;
  const icuTotal = hospital.capacitySummary?.icu?.total || 1;
  const icuPct = Math.min(100, Math.round((icuAvail / icuTotal) * 100));

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      {/* Top Bar */}
      <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Radar
          </button>
          <div className="flex items-center gap-2">
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-xl bg-sky-50 text-sky-700 hover:bg-sky-100 text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <Navigation className="w-3.5 h-3.5" /> Directions
            </a>
            {hospital.emergencyPhone && (
              <a
                href={`tel:${hospital.emergencyPhone}`}
                className="px-3.5 py-1.5 rounded-xl bg-rose-600 text-white hover:bg-rose-700 text-xs font-extrabold flex items-center gap-1.5 shadow-md shadow-rose-600/20 transition-all"
              >
                <Phone className="w-3.5 h-3.5" /> Emergency
              </a>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-8 space-y-8">
        {/* Hospital Hero Card */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-extrabold px-2.5 py-1 rounded-lg bg-sky-50 text-sky-700 border border-sky-200">
                  {hospital.hospitalType}
                </span>
                {hospital.verificationStatus === 'VERIFIED' && (
                  <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <ShieldCheck className="w-3.5 h-3.5" /> Verified Medical Facility
                  </span>
                )}
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> Updated {hospital.freshness?.label || 'Live'}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">{hospital.name}</h1>
              <p className="text-xs sm:text-sm text-slate-500">
                {hospital.address}, {hospital.city}, {hospital.state} - {hospital.pincode}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowBookModal(true)}
              className="px-5 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer shrink-0"
            >
              <Calendar className="w-4 h-4 text-sky-400" />
              <span>Book Appointment</span>
            </button>
          </div>

          {/* Real-time Capacity Progress Bars */}
          <div className="pt-6 border-t border-slate-100 space-y-4">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Live Verified Capacity Status
            </h3>

            <div className="grid md:grid-cols-3 gap-4">
              {/* General Beds */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700 flex items-center gap-1.5">
                    <Bed className="w-4 h-4 text-sky-600" /> General Beds
                  </span>
                  <span className="font-extrabold text-sky-700">
                    {generalAvail} / {generalTotal} Available
                  </span>
                </div>
                <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all rounded-full ${
                      generalAvail > 5 ? 'bg-emerald-500' : generalAvail > 0 ? 'bg-amber-500' : 'bg-rose-500'
                    }`}
                    style={{ width: `${generalPct}%` }}
                  ></div>
                </div>
              </div>

              {/* ICU Beds */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700 flex items-center gap-1.5">
                    <HeartPulse className="w-4 h-4 text-rose-600" /> ICU Beds
                  </span>
                  <span className="font-extrabold text-rose-700">
                    {icuAvail} / {icuTotal} Available
                  </span>
                </div>
                <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all rounded-full ${
                      icuAvail > 2 ? 'bg-emerald-500' : icuAvail > 0 ? 'bg-amber-500' : 'bg-rose-500'
                    }`}
                    style={{ width: `${icuPct}%` }}
                  ></div>
                </div>
              </div>

              {/* Emergency Department */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700 flex items-center gap-1.5">
                    <Siren className="w-4 h-4 text-amber-600" /> Emergency Care
                  </span>
                  <span
                    className={`font-extrabold ${
                      hospital.emergencyAvailable ? 'text-emerald-700' : 'text-rose-600'
                    }`}
                  >
                    {hospital.emergencyAvailable ? 'Open 24/7' : 'Unavailable'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">
                  {hospital.emergencyAvailable
                    ? 'Active trauma team on standby'
                    : 'Emergency wing at maximum capacity'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Available Facilities & Key Services */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900">Hospital Facilities &amp; Services</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-2xl border border-slate-100 bg-slate-50/70 flex items-center gap-2.5">
              <Car className="w-4 h-4 text-sky-600" />
              <span className="text-xs font-semibold text-slate-800">
                {hospital.ambulanceAvailable ? 'Ambulance 24/7' : 'No Ambulance'}
              </span>
            </div>
            <div className="p-3 rounded-2xl border border-slate-100 bg-slate-50/70 flex items-center gap-2.5">
              <Droplet className="w-4 h-4 text-rose-600" />
              <span className="text-xs font-semibold text-slate-800">
                {hospital.bloodBankAvailable ? 'Blood Bank Active' : 'Blood Bank N/A'}
              </span>
            </div>
            <div className="p-3 rounded-2xl border border-slate-100 bg-slate-50/70 flex items-center gap-2.5">
              <Pill className="w-4 h-4 text-teal-600" />
              <span className="text-xs font-semibold text-slate-800">24/7 Pharmacy</span>
            </div>
            <div className="p-3 rounded-2xl border border-slate-100 bg-slate-50/70 flex items-center gap-2.5">
              <Microscope className="w-4 h-4 text-purple-600" />
              <span className="text-xs font-semibold text-slate-800">Diagnostic Imaging</span>
            </div>
          </div>
        </div>

        {/* Departments & Specialties */}
        {hospital.departments && hospital.departments.length > 0 && (
          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Departments &amp; Clinical Specialties</h3>
            <div className="flex flex-wrap gap-2">
              {hospital.departments.map((dept, i) => (
                <span
                  key={i}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 font-semibold text-xs border border-slate-200/60"
                >
                  {dept}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Book Appointment Modal */}
      {showBookModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-sm text-slate-900">Book Hospital Appointment</h3>
              <button
                type="button"
                onClick={() => setShowBookModal(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleBookAppointment} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Select Date *</label>
                <input
                  type="date"
                  required
                  value={appointmentDate}
                  onChange={(e) => setAppointmentDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Select Time Slot *</label>
                <select
                  value={appointmentTime}
                  onChange={(e) => setAppointmentTime(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-500 focus:outline-none"
                >
                  <option value="09:00 AM">09:00 AM - 10:00 AM</option>
                  <option value="11:00 AM">11:00 AM - 12:00 PM</option>
                  <option value="02:00 PM">02:00 PM - 03:00 PM</option>
                  <option value="04:00 PM">04:00 PM - 05:00 PM</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Reason for Visit</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Chest pain follow up, routine checkup..."
                  value={bookingReason}
                  onChange={(e) => setBookingReason(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={bookingLoading}
                className="w-full py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold transition-all disabled:opacity-50 cursor-pointer"
              >
                {bookingLoading ? 'Confirming...' : 'Confirm Appointment'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default HospitalDetailPage;
