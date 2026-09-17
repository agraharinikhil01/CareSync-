import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import {
  Building2,
  MapPin,
  Phone,
  Mail,
  ShieldCheck,
  Bed,
  HeartPulse,
  Siren,
  CheckCircle2,
  ArrowLeft,
  Loader2,
} from 'lucide-react';
import toast from 'react-hot-toast';

const HospitalRegisterPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    emergencyPhone: '',
    address: '',
    city: 'New Delhi',
    state: 'Delhi',
    pincode: '',
    latitude: '28.6139',
    longitude: '77.2090',
    hospitalType: 'Multi-Specialty',
    licenseNumber: '',
    emergencyAvailable: true,
    ambulanceAvailable: true,
    departments: 'Cardiology, Emergency Medicine, Orthopedics, General Surgery',
    generalBeds: 50,
    icuBeds: 10,
    emergencyBeds: 8,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await api.post('/hospitals', {
        ...formData,
        generalBeds: parseInt(formData.generalBeds, 10),
        icuBeds: parseInt(formData.icuBeds, 10),
        emergencyBeds: parseInt(formData.emergencyBeds, 10),
        latitude: parseFloat(formData.latitude),
        longitude: parseFloat(formData.longitude),
      });

      if (res.data.success) {
        setSubmitted(true);
        toast.success('Hospital registered successfully! Pending admin verification.');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to register hospital');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-slate-200/80">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link
            to="/"
            className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft className="w-4 h-4" /> Home
          </Link>
          <span className="text-xs font-extrabold text-sky-700 bg-sky-50 border border-sky-200 px-3 py-1 rounded-xl">
            Hospital Onboarding
          </span>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-10">
        {submitted ? (
          <div className="bg-white rounded-3xl border border-emerald-200 p-8 sm:p-12 text-center space-y-4 shadow-sm">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-black text-slate-900">Application Submitted for Verification</h2>
            <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
              Your hospital registration has been received. Our System Admin network team reviews credentials
              and bed verification before listing your facility on the public HospitalRadar map.
            </p>
            <div className="pt-4 flex justify-center gap-3">
              <Link
                to="/"
                className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all"
              >
                Return to Home
              </Link>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
            <div className="p-6 sm:p-8 bg-gradient-to-r from-sky-600 to-teal-600 text-white space-y-1">
              <h1 className="text-2xl font-black tracking-tight">Register Your Healthcare Facility</h1>
              <p className="text-xs text-sky-100">
                Join the live HospitalRadar grid to provide patients with transparent real-time bed capacity.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6 text-xs">
              {/* Section 1: Basic Info */}
              <div className="space-y-3">
                <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-sky-600" /> Facility Information
                </h3>
                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-slate-600 block mb-1">Hospital Name *</label>
                    <input
                      type="text"
                      name="name"
                      required
                      placeholder="e.g. City Care Super-Specialty Hospital"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-600 block mb-1">Hospital Type *</label>
                    <select
                      name="hospitalType"
                      value={formData.hospitalType}
                      onChange={handleChange}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-500 focus:outline-none"
                    >
                      <option value="Multi-Specialty">Multi-Specialty</option>
                      <option value="Super-Specialty">Super-Specialty</option>
                      <option value="Government">Government / Public</option>
                      <option value="Trauma Center">Trauma Center</option>
                      <option value="Private Clinic">Private Clinic</option>
                    </select>
                  </div>
                </div>

                <div className="grid sm:grid-cols-3 gap-3">
                  <div>
                    <label className="font-semibold text-slate-600 block mb-1">Official Email *</label>
                    <input
                      type="email"
                      name="email"
                      required
                      placeholder="admissions@hospital.org"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-600 block mb-1">General Reception Phone *</label>
                    <input
                      type="tel"
                      name="phone"
                      required
                      placeholder="+91 11 2345 6789"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-600 block mb-1">24/7 Emergency Hotline *</label>
                    <input
                      type="tel"
                      name="emergencyPhone"
                      required
                      placeholder="+91 11 2345 9999"
                      value={formData.emergencyPhone}
                      onChange={handleChange}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Address & Location */}
              <div className="space-y-3 pt-4 border-t border-slate-100">
                <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-emerald-600" /> Location &amp; Geocoding
                </h3>
                <div>
                  <label className="font-semibold text-slate-600 block mb-1">Street Address *</label>
                  <input
                    type="text"
                    name="address"
                    required
                    placeholder="Block B, Outer Ring Road"
                    value={formData.address}
                    onChange={handleChange}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  />
                </div>

                <div className="grid sm:grid-cols-4 gap-3">
                  <div>
                    <label className="font-semibold text-slate-600 block mb-1">City *</label>
                    <input
                      type="text"
                      name="city"
                      required
                      value={formData.city}
                      onChange={handleChange}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-600 block mb-1">State *</label>
                    <input
                      type="text"
                      name="state"
                      required
                      value={formData.state}
                      onChange={handleChange}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-600 block mb-1">Pincode *</label>
                    <input
                      type="text"
                      name="pincode"
                      required
                      placeholder="110001"
                      value={formData.pincode}
                      onChange={handleChange}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-600 block mb-1">License Identifier</label>
                    <input
                      type="text"
                      name="licenseNumber"
                      placeholder="MOH-DL-2024-89"
                      value={formData.licenseNumber}
                      onChange={handleChange}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-200/80">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Latitude Coordinate *</label>
                    <input
                      type="text"
                      name="latitude"
                      required
                      value={formData.latitude}
                      onChange={handleChange}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-sky-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Longitude Coordinate *</label>
                    <input
                      type="text"
                      name="longitude"
                      required
                      value={formData.longitude}
                      onChange={handleChange}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-sky-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Section 3: Initial Capacity Setup */}
              <div className="space-y-3 pt-4 border-t border-slate-100">
                <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <Bed className="w-4 h-4 text-purple-600" /> Initial Capacity Setup
                </h3>
                <div className="grid sm:grid-cols-3 gap-3">
                  <div>
                    <label className="font-semibold text-slate-600 block mb-1">Total General Beds *</label>
                    <input
                      type="number"
                      name="generalBeds"
                      min={0}
                      required
                      value={formData.generalBeds}
                      onChange={handleChange}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-600 block mb-1">Total ICU Beds *</label>
                    <input
                      type="number"
                      name="icuBeds"
                      min={0}
                      required
                      value={formData.icuBeds}
                      onChange={handleChange}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-600 block mb-1">Emergency Beds *</label>
                    <input
                      type="number"
                      name="emergencyBeds"
                      min={0}
                      required
                      value={formData.emergencyBeds}
                      onChange={handleChange}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-6 pt-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      name="emergencyAvailable"
                      checked={formData.emergencyAvailable}
                      onChange={handleChange}
                      className="w-4 h-4 rounded text-sky-600 focus:ring-sky-500"
                    />
                    <span className="font-semibold text-slate-700">24/7 Emergency Care Active</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      name="ambulanceAvailable"
                      checked={formData.ambulanceAvailable}
                      onChange={handleChange}
                      className="w-4 h-4 rounded text-sky-600 focus:ring-sky-500"
                    />
                    <span className="font-semibold text-slate-700">Ambulance Service Available</span>
                  </label>
                </div>
              </div>

              {/* Submit */}
              <div className="pt-6 border-t border-slate-100">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-2xl bg-sky-600 hover:bg-sky-700 text-white font-extrabold text-sm shadow-md shadow-sky-600/25 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Registering Facility...</span>
                    </>
                  ) : (
                    <span>Submit Hospital Registration</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default HospitalRegisterPage;
