import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import useGeolocation from '../../hooks/useGeolocation';
import api from '../../services/api';
import {
  Compass,
  MapPin,
  Bed,
  HeartPulse,
  Siren,
  ShieldCheck,
  Building2,
  Users,
  Activity,
  ArrowRight,
  Clock,
  Sparkles,
  PhoneCall,
  CheckCircle2,
  Navigation,
  LogIn,
  LogOut,
  Menu,
  X,
  Award,
  ExternalLink,
} from 'lucide-react';

const LandingPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [nearbyHospitals, setNearbyHospitals] = useState([]);
  const [loadingHospitals, setLoadingHospitals] = useState(false);

  // Live Geolocation detection
  const {
    location,
    locationName,
    locating,
    detectLocation,
    refreshLiveGps,
  } = useGeolocation();

  // Detect live GPS location on page load
  useEffect(() => {
    detectLocation();
  }, [detectLocation]);

  // Fetch real nearby hospitals when user's location is resolved
  useEffect(() => {
    if (location?.lat && location?.lng) {
      setLoadingHospitals(true);
      api
        .get('/hospitals/nearby', {
          params: {
            lat: location.lat,
            lng: location.lng,
            radius: 30,
          },
        })
        .then((res) => {
          if (res.data.success) {
            setNearbyHospitals(res.data.data || []);
          }
        })
        .catch((err) => {
          console.warn('Could not fetch nearby hospitals for landing page:', err);
        })
        .finally(() => {
          setLoadingHospitals(false);
        });
    }
  }, [location]);

  const nearestHospital = nearbyHospitals.length > 0 ? nearbyHospitals[0] : null;

  const handleFindHospitals = () => {
    navigate('/explore');
  };

  const getDashboardPath = () => {
    if (!user) return '/login';
    switch (user.role) {
      case 'ADMIN':
        return '/admin/dashboard';
      case 'HOSPITAL_ADMIN':
        return '/hospital/dashboard';
      case 'DOCTOR':
        return '/doctor/dashboard';
      case 'RECEPTIONIST':
        return '/receptionist/dashboard';
      case 'PATIENT':
      default:
        return '/patient/dashboard';
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 selection:bg-sky-100 selection:text-sky-800">
      {/* Top Navigation */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          {/* Logo & Network Status */}
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-sky-500/20">
                <Compass className="w-5 h-5 animate-spin-slow" />
              </div>
              <div>
                <span className="text-xl font-black tracking-tight text-slate-900">
                  Care<span className="text-sky-600">Sync</span>
                </span>
                <span className="hidden sm:inline-block ml-2 text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Live Network
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-7 text-sm font-semibold text-slate-600">
            <Link to="/register-hospital" className="hover:text-sky-600 transition-colors">For Hospitals</Link>
            <Link to="/explore" className="hover:text-sky-600 transition-colors">Find Hospitals</Link>
            <Link
              to="/login"
              className="text-sky-700 font-extrabold hover:text-sky-800 transition-colors flex items-center gap-1"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In / Log In</span>
            </Link>
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2.5">
            {user ? (
              <div className="flex items-center gap-2">
                {/* User Pill */}
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 text-slate-800 text-xs font-bold border border-slate-200">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="truncate max-w-[110px]">{user.name || 'User'}</span>
                  <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-sky-100 text-sky-800 border border-sky-200">
                    {user.role}
                  </span>
                </div>

                {/* Go To Dashboard */}
                <Link
                  to={getDashboardPath()}
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
                  title="Open your personal dashboard"
                >
                  <span>My Dashboard</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>

                {/* Switch / Sign In another account */}
                <Link
                  to="/login"
                  className="hidden md:inline-flex px-3 py-2 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-800 text-xs font-bold border border-sky-200 transition-colors"
                  title="Switch to another account or sign in as Doctor/Admin/Receptionist"
                >
                  Switch / Login
                </Link>

                {/* Sign Out Button */}
                <button
                  type="button"
                  onClick={() => logout()}
                  className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-700 hover:text-sky-900 text-xs font-black border border-sky-200 transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Sign In / Log In</span>
                </Link>
                <Link
                  to="/register"
                  className="hidden sm:inline-block px-4 py-2 rounded-xl text-slate-700 hover:text-slate-900 hover:bg-slate-100 text-xs font-bold transition-colors"
                >
                  Register
                </Link>
                <button
                  onClick={handleFindHospitals}
                  className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold transition-all shadow-md shadow-sky-600/25 flex items-center gap-1.5 cursor-pointer"
                >
                  <MapPin className="w-3.5 h-3.5" />
                  <span>Find Nearby</span>
                </button>
              </div>
            )}

            {/* Mobile Menu Toggle Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer ml-1"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-100 bg-white/98 backdrop-blur-xl px-4 py-4 space-y-3 shadow-xl animate-fadeIn">
            <nav className="flex flex-col space-y-2 text-sm font-semibold text-slate-700">
              <Link
                to="/explore"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-xl hover:bg-slate-50 text-sky-700 font-bold"
              >
                🏥 Find Nearby Hospitals
              </Link>
              <Link
                to="/register-hospital"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-xl hover:bg-slate-50"
              >
                For Hospitals (Register Facility)
              </Link>
            </nav>

            <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-2.5 rounded-xl bg-sky-600 text-white font-extrabold text-xs text-center shadow-md flex items-center justify-center gap-2"
              >
                <LogIn className="w-4 h-4" />
                <span>Sign In / Log In to CareSync</span>
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-2.5 rounded-xl bg-slate-100 text-slate-800 font-bold text-xs text-center border border-slate-200"
              >
                Create New Patient Account
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="relative pt-10 pb-16 sm:pb-20 overflow-hidden bg-gradient-to-b from-sky-50/60 via-white to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            {/* Left Copy */}
            <div className="lg:col-span-7 space-y-5 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-100/90 border border-sky-200 text-sky-800 text-xs font-bold shadow-2xs">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                <span>CareSync Real-Time Hospital Discovery Grid</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.12]">
                Find the Right Hospital, <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-600 to-teal-600">
                  Right Now.
                </span>
              </h1>

              <p className="text-base sm:text-lg text-slate-600 font-medium max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                Discover nearby hospitals, check real-time bed &amp; ICU availability on an interactive map,
                and get critical care faster. Never arrive at a full hospital again.
              </p>

              {/* 📍 Live Location Display Banner */}
              <div className="p-3 sm:p-3.5 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 max-w-xl mx-auto lg:mx-0">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center shrink-0">
                    <MapPin className={`w-4 h-4 ${locating ? 'animate-bounce text-emerald-600' : ''}`} />
                  </div>
                  <div className="min-w-0 text-left">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Aapki Current Live Location
                    </p>
                    <p className="text-xs font-extrabold text-slate-800 truncate">
                      {locating ? 'Detecting live GPS coordinates...' : locationName}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={refreshLiveGps}
                  className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shrink-0 shadow-2xs"
                  title="Capture your exact current device location"
                >
                  <Navigation className="w-3 h-3 text-sky-400 animate-spin-slow" />
                  <span>Update GPS</span>
                </button>
              </div>

              {/* 🏆 Nearest Hospital Highlight Banner */}
              {nearestHospital && (
                <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 text-left max-w-xl mx-auto lg:mx-0 shadow-xs flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <Award className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800">
                        Sabse Nearest Hospital
                      </span>
                    </div>
                    <p className="text-sm font-black text-slate-900 truncate mt-0.5">
                      {nearestHospital.name}
                    </p>
                    <p className="text-xs text-emerald-700 font-semibold mt-0.5">
                      📍 {nearestHospital.distanceKm !== null ? `${nearestHospital.distanceKm} km door` : 'Closest'}
                      {nearestHospital.estTravelMinutes ? ` (~${nearestHospital.estTravelMinutes} min drive)` : ''} •
                      {' '}{nearestHospital.capacitySummary?.general?.available || 0} General Beds •
                      {' '}{nearestHospital.capacitySummary?.icu?.available || 0} ICU
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleFindHospitals}
                    className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shrink-0 shadow-md shadow-emerald-600/20 flex items-center gap-1 cursor-pointer"
                  >
                    <span>View Hospital</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* CTAs: Find Hospitals & Sign In Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-2">
                <button
                  type="button"
                  onClick={handleFindHospitals}
                  className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-sky-600 hover:bg-sky-700 text-white font-extrabold text-sm shadow-xl shadow-sky-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer transform hover:-translate-y-0.5"
                >
                  <MapPin className="w-4 h-4" />
                  <span>Find Hospitals Near Me</span>
                </button>

                <Link
                  to="/login"
                  className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-white hover:bg-slate-50 text-slate-900 font-extrabold text-sm border-2 border-slate-200 shadow-md hover:border-sky-300 flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <LogIn className="w-4 h-4 text-sky-600" />
                  <span>Sign In / Log In</span>
                </Link>
              </div>

              {/* Live Trust Metrics */}
              <div className="pt-6 grid grid-cols-3 gap-4 border-t border-slate-100 max-w-md mx-auto lg:mx-0 text-left">
                <div>
                  <p className="text-2xl font-black text-slate-900">100%</p>
                  <p className="text-xs text-slate-500 font-medium">Verified Beds</p>
                </div>
                <div>
                  <p className="text-2xl font-black text-emerald-600">&lt; 5 min</p>
                  <p className="text-xs text-slate-500 font-medium">Data Freshness</p>
                </div>
                <div>
                  <p className="text-2xl font-black text-rose-600">24/7</p>
                  <p className="text-xs text-slate-500 font-medium">Emergency Triage</p>
                </div>
              </div>
            </div>

            {/* Right Interactive Radar Preview Mockup */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-3xl p-5 bg-white border border-slate-200/90 shadow-2xl shadow-slate-200/60 space-y-4">
                {/* Radar Mockup Header */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-rose-500 animate-ping"></span>
                    <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      Live CareSync Radar
                    </span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span>Live Syncing</span>
                  </span>
                </div>

                {/* Real Live Hospitals or Simulated Fallback */}
                <div className="space-y-2.5">
                  {loadingHospitals ? (
                    <div className="py-8 text-center space-y-2">
                      <div className="w-7 h-7 border-3 border-sky-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                      <p className="text-xs font-bold text-slate-500">Scanning hospitals near {locationName}...</p>
                    </div>
                  ) : nearbyHospitals.length > 0 ? (
                    <>
                      {/* Nearest Hospital Card */}
                      <div
                        onClick={handleFindHospitals}
                        className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-transparent border-2 border-emerald-400/80 text-left cursor-pointer hover:shadow-md transition-all group"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-md bg-emerald-600 text-white">
                              🏆 Nearest Hospital
                            </span>
                            <span className="text-xs font-black text-slate-900 group-hover:text-emerald-700 transition-colors truncate max-w-[150px]">
                              {nearbyHospitals[0].name}
                            </span>
                          </div>
                          <span className="text-[10px] font-black text-emerald-700 bg-white px-2 py-0.5 rounded-md border border-emerald-300">
                            🟢 {nearbyHospitals[0].capacitySummary?.general?.available || 0} Beds Avail
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 mt-1.5 font-medium">
                          <strong>{nearbyHospitals[0].distanceKm !== null ? `${nearbyHospitals[0].distanceKm} km door` : 'Nearby'}</strong>
                          {nearbyHospitals[0].estTravelMinutes ? ` • ~${nearbyHospitals[0].estTravelMinutes} min drive` : ''} •
                          {' '}{nearbyHospitals[0].capacitySummary?.icu?.available || 0} ICU Beds • 24/7 Emergency
                        </p>
                      </div>

                      {/* 2nd Hospital */}
                      {nearbyHospitals[1] && (
                        <div
                          onClick={handleFindHospitals}
                          className="p-3 rounded-2xl bg-sky-50/60 border border-sky-200 text-left cursor-pointer hover:bg-sky-50 transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <p className="text-xs font-extrabold text-slate-900 truncate max-w-[180px]">
                              {nearbyHospitals[1].name}
                            </p>
                            <span className="text-[10px] font-bold text-sky-700 bg-white px-2 py-0.5 rounded-md border border-sky-300">
                              🛏️ {nearbyHospitals[1].capacitySummary?.general?.available || 0} Beds
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-600 mt-1">
                            {nearbyHospitals[1].distanceKm !== null ? `${nearbyHospitals[1].distanceKm} km door` : 'Nearby'} •
                            {' '}{nearbyHospitals[1].capacitySummary?.icu?.available || 0} ICU • {nearbyHospitals[1].city || 'Emergency Ready'}
                          </p>
                        </div>
                      )}

                      {/* 3rd Hospital */}
                      {nearbyHospitals[2] && (
                        <div
                          onClick={handleFindHospitals}
                          className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-left cursor-pointer hover:bg-slate-100 transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <p className="text-xs font-extrabold text-slate-900 truncate max-w-[180px]">
                              {nearbyHospitals[2].name}
                            </p>
                            <span className="text-[10px] font-bold text-slate-700 bg-white px-2 py-0.5 rounded-md border border-slate-300">
                              🛏️ {nearbyHospitals[2].capacitySummary?.general?.available || 0} Beds
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-600 mt-1">
                            {nearbyHospitals[2].distanceKm !== null ? `${nearbyHospitals[2].distanceKm} km door` : 'Nearby'} •
                            {' '}{nearbyHospitals[2].capacitySummary?.icu?.available || 0} ICU Beds
                          </p>
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      <div className="p-3 rounded-2xl bg-emerald-50/60 border border-emerald-200 text-left">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-extrabold text-slate-900">Metro Super-Specialty</p>
                          <span className="text-[10px] font-bold text-emerald-700 bg-white px-2 py-0.5 rounded-md border border-emerald-300">
                            🟢 32 Beds Avail
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 mt-1">2.4 km away • 6 ICU Beds • 24/7 Emergency</p>
                      </div>

                      <div className="p-3 rounded-2xl bg-amber-50/60 border border-amber-200 text-left">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-extrabold text-slate-900">City Care Trauma Center</p>
                          <span className="text-[10px] font-bold text-amber-700 bg-white px-2 py-0.5 rounded-md border border-amber-300">
                            🟡 4 Beds Avail
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 mt-1">4.1 km away • 1 ICU Bed • Ambulance Ready</p>
                      </div>

                      <div className="p-3 rounded-2xl bg-rose-50/60 border border-rose-200 text-left">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-extrabold text-slate-900">Apex Critical Care</p>
                          <span className="text-[10px] font-bold text-rose-700 bg-white px-2 py-0.5 rounded-md border border-rose-300">
                            🔴 Beds Full
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 mt-1">5.8 km away • Triage redirecting to Metro</p>
                      </div>
                    </>
                  )}
                </div>

                {/* Mockup Map Pulse CTA */}
                <button
                  type="button"
                  onClick={handleFindHospitals}
                  className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm"
                >
                  <Navigation className="w-3.5 h-3.5 text-sky-400" />
                  <span>Launch Live Fullscreen Map &amp; Hospital List</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How CareSync Works */}
      <section id="how-it-works" className="py-20 bg-slate-50/60 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <h2 className="text-xs font-bold text-sky-600 uppercase tracking-wider">Seamless Patient Journey</h2>
            <h3 className="text-3xl font-extrabold text-slate-900">How CareSync Works</h3>
            <p className="text-slate-600 text-sm">
              Connecting patients, doctors, and hospitals into a coordinated healthcare grid.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6 mt-14">
            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-sky-100 text-sky-600 flex items-center justify-center font-black text-lg">
                1
              </div>
              <h4 className="font-bold text-base text-slate-900">Allow Location</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                CareSync identifies your position to search hospitals within your emergency radius.
              </p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-black text-lg">
                2
              </div>
              <h4 className="font-bold text-base text-slate-900">Check Live Beds</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                See green (available), yellow (limited), and red (full) capacity indicators in real time.
              </p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center font-black text-lg">
                3
              </div>
              <h4 className="font-bold text-base text-slate-900">Filter Specialties</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Filter by Cardiology, Trauma ICU, Pediatrics, Blood Bank, or 24/7 Ambulance.
              </p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center font-black text-lg">
                4
              </div>
              <h4 className="font-bold text-base text-slate-900">Direct Action</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                1-click GPS directions, phone hotline, doctor appointment, or emergency dispatch.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Emergency Mode Banner */}
      <section id="emergency" className="py-16 bg-gradient-to-r from-rose-600 to-red-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-2 max-w-2xl text-center md:text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-xs font-bold">
              <Siren className="w-4 h-4" /> Rapid Trauma &amp; Cardiac Routing
            </div>
            <h3 className="text-2xl sm:text-3xl font-black">Critical Medical Emergency?</h3>
            <p className="text-rose-100 text-sm">
              Use our instant emergency triage to alert the nearest verified hospital with an active ICU.
            </p>
          </div>
          <button
            type="button"
            onClick={handleFindHospitals}
            className="px-8 py-4 rounded-2xl bg-white text-rose-700 hover:bg-rose-50 font-black text-sm shadow-xl shadow-black/20 flex items-center gap-2 shrink-0 cursor-pointer"
          >
            <Siren className="w-5 h-5 text-rose-600" />
            <span>Open Emergency Radar</span>
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 text-slate-400 py-12 border-t border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6 text-xs">
          <div className="flex items-center gap-2">
            <Compass className="w-5 h-5 text-sky-400" />
            <span className="text-white font-bold text-sm">CareSync</span>
            <span>— Real-Time Hospital Discovery &amp; Management Platform</span>
          </div>
          <p>© {new Date().getFullYear()} CareSync Systems. Dedicated to zero patient delays.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
