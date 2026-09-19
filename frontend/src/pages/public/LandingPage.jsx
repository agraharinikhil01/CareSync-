import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
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
} from 'lucide-react';

const LandingPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleFindHospitals = () => {
    navigate('/explore');
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 selection:bg-sky-100 selection:text-sky-800">
      {/* Top Navigation */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          <div className="flex items-center gap-3">
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
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
            <a href="#how-it-works" className="hover:text-sky-600 transition-colors">How It Works</a>
            <a href="#live-network" className="hover:text-sky-600 transition-colors">Live Network</a>
            <a href="#emergency" className="hover:text-sky-600 transition-colors">Emergency Mode</a>
            <Link to="/register-hospital" className="hover:text-sky-600 transition-colors">For Hospitals</Link>
          </nav>

          <div className="flex items-center gap-3">
            {user ? (
              <Link
                to={
                  user.role === 'ADMIN'
                    ? '/admin/dashboard'
                    : user.role === 'HOSPITAL_ADMIN'
                    ? '/hospital/dashboard'
                    : user.role === 'DOCTOR'
                    ? '/doctor/dashboard'
                    : user.role === 'RECEPTIONIST'
                    ? '/receptionist/dashboard'
                    : '/patient/dashboard'
                }
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
              >
                <span>My Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-xl text-slate-700 hover:text-slate-900 hover:bg-slate-100 text-xs font-bold transition-colors"
                >
                  Sign In
                </Link>
                <button
                  onClick={handleFindHospitals}
                  className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold transition-all shadow-md shadow-sky-600/25 flex items-center gap-1.5 cursor-pointer"
                >
                  <MapPin className="w-3.5 h-3.5" />
                  <span>Find Nearby</span>
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-12 pb-20 overflow-hidden bg-gradient-to-b from-sky-50/60 via-white to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            {/* Left Copy */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-100/80 border border-sky-200 text-sky-800 text-xs font-bold">
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

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-2">
                <button
                  type="button"
                  onClick={handleFindHospitals}
                  className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-sky-600 hover:bg-sky-700 text-white font-extrabold text-sm shadow-xl shadow-sky-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer transform hover:-translate-y-0.5"
                >
                  <MapPin className="w-4 h-4" />
                  <span>Find Hospitals Near Me</span>
                </button>
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
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Live Syncing
                  </span>
                </div>

                {/* Simulated Hospital Cards */}
                <div className="space-y-2.5">
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
                </div>

                {/* Mockup Map Pulse CTA */}
                <button
                  type="button"
                  onClick={handleFindHospitals}
                  className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <Navigation className="w-3.5 h-3.5 text-sky-400" />
                  <span>Launch Live Fullscreen Map</span>
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
