import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  HeartPulse,
  User,
  Stethoscope,
  CalendarCheck,
  Mail,
  Lock,
  Phone,
  ArrowRight,
  Shield,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import toast from 'react-hot-toast';

const Register = () => {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    role: 'PATIENT',
  });
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const roleRedirects = {
    PATIENT: '/patient/dashboard',
    DOCTOR: '/doctor/dashboard',
    RECEPTIONIST: '/receptionist/dashboard',
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.password !== form.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (form.password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    if (form.role === 'ADMIN') {
      toast.error('Public Admin registration is disabled for security');
      return;
    }

    setLoading(true);
    const res = await register({
      name: form.name,
      email: form.email,
      password: form.password,
      phone: form.phone,
      role: form.role,
    });
    setLoading(false);

    if (res?.success) {
      toast.success('Account created successfully!');
      navigate(roleRedirects[res.user.role] || '/login');
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-slate-50 font-sans text-slate-900">
      {/* LEFT SIDE: Healthcare SaaS Brand Experience */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-slate-950 via-slate-900 to-sky-950 text-white p-12 xl:p-16 flex-col justify-between overflow-hidden">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-sky-500/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 right-0 w-[30rem] h-[30rem] bg-teal-500/15 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 to-teal-400 flex items-center justify-center shadow-lg shadow-sky-500/25">
              <HeartPulse className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              CareSync
              <span className="text-[11px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/30">
                Healthcare OS
              </span>
            </span>
          </div>
        </div>

        <div className="relative z-10 my-auto py-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-xs text-sky-200 font-medium mb-6 backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-teal-300" />
            <span>Instant Patient & Clinical Onboarding</span>
          </div>

          <h1 className="text-4xl xl:text-5xl font-extrabold tracking-tight text-white leading-[1.15] mb-4">
            Join the future of <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-teal-300 to-emerald-400">
              healthcare delivery.
            </span>
          </h1>

          <p className="text-base text-slate-300 max-w-md leading-relaxed mb-8">
            Access world-class clinical records, schedule consultations, view prescriptions, and communicate with attending physicians.
          </p>

          <div className="space-y-3 max-w-md">
            <div className="flex items-center gap-3 text-sm text-slate-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Direct access to specialist doctors & live OPD slots</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-slate-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Instant QR health ID card generation & verification</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-slate-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Digitally signed PDF prescriptions and invoices</span>
            </div>
          </div>
        </div>

        <div className="relative z-10 pt-6 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-400" />
            <span>Enterprise 256-bit AES Encryption</span>
          </div>
          <span>ISO 27001 Security Standard</span>
        </div>
      </div>

      {/* RIGHT SIDE: Clean Modern Register Card */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-10 lg:p-14 overflow-y-auto">
        <div className="w-full max-w-md space-y-6 my-auto">
          <div className="lg:hidden flex items-center gap-2.5 pb-2">
            <div className="w-8 h-8 rounded-lg bg-sky-600 text-white flex items-center justify-center shadow-md">
              <HeartPulse className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-lg text-slate-900">CareSync</span>
              <span className="ml-2 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-sky-100 text-sky-800">
                Healthcare OS
              </span>
            </div>
          </div>

          <div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              Create an account
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Select your role and start your modern healthcare journey
            </p>
          </div>

          {/* Role Selection Tabs */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Select Account Role
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'PATIENT', label: 'Patient', icon: User },
                { id: 'DOCTOR', label: 'Doctor', icon: Stethoscope },
                { id: 'RECEPTIONIST', label: 'Staff', icon: CalendarCheck },
              ].map((r) => {
                const Icon = r.icon;
                const isSelected = form.role === r.id;
                return (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setForm({ ...form, role: r.id })}
                    className={`py-2.5 px-3 rounded-xl border text-center transition-all flex flex-col items-center gap-1.5 cursor-pointer ${
                      isSelected
                        ? 'border-sky-500 bg-sky-50/70 text-sky-950 font-bold shadow-xs ring-1 ring-sky-400/50'
                        : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-xs">{r.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Full Name *
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  name="name"
                  required
                  placeholder="e.g. Ramesh Kumar"
                  value={form.name}
                  onChange={handleChange}
                  className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:border-sky-500 focus:ring-3 focus:ring-sky-500/15 transition-all text-slate-900"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Email *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    name="email"
                    required
                    placeholder="name@email.com"
                    value={form.email}
                    onChange={handleChange}
                    className="w-full pl-9 pr-3 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:border-sky-500 focus:ring-3 focus:ring-sky-500/15 text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Phone *
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="tel"
                    name="phone"
                    required
                    placeholder="+91 9876543210"
                    value={form.phone}
                    onChange={handleChange}
                    className="w-full pl-9 pr-3 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:border-sky-500 focus:ring-3 focus:ring-sky-500/15 text-slate-900"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Password *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="password"
                    name="password"
                    required
                    placeholder="Min 6 characters"
                    value={form.password}
                    onChange={handleChange}
                    className="w-full pl-9 pr-3 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:border-sky-500 focus:ring-3 focus:ring-sky-500/15 text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Confirm *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="password"
                    name="confirmPassword"
                    required
                    placeholder="Match password"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    className="w-full pl-9 pr-3 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:border-sky-500 focus:ring-3 focus:ring-sky-500/15 text-slate-900"
                  />
                </div>
              </div>
            </div>

            <p className="text-[11px] text-slate-500 pt-1">
              By creating an account, you agree to CareSync's{' '}
              <span className="text-sky-600 font-medium">Terms of Clinical Service</span> and{' '}
              <span className="text-sky-600 font-medium">Privacy Policy</span>.
            </p>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-sky-600 hover:bg-sky-700 active:bg-sky-800 text-white font-semibold text-sm shadow-md shadow-sky-600/25 transition-all flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Creating Account...</span>
                </>
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="pt-3 border-t border-slate-200 text-center">
            <p className="text-xs text-slate-600">
              Already have an account?{' '}
              <Link
                to="/login"
                className="font-semibold text-sky-600 hover:text-sky-700 hover:underline"
              >
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
