import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Activity,
  Eye,
  EyeOff,
  ArrowRight,
  Shield,
  Stethoscope,
  CalendarCheck,
  User,
  CheckCircle2,
  Lock,
  Mail,
  Sparkles,
  BedDouble,
  HeartPulse,
} from 'lucide-react';
import toast from 'react-hot-toast';

const demoRoles = [
  {
    id: 'ADMIN',
    label: 'Admin',
    icon: Shield,
    email: 'admin@caresync.com',
    password: 'Admin@123',
    desc: 'Manage hospital operations',
    badge: 'Super Admin',
  },
  {
    id: 'DOCTOR',
    label: 'Doctor',
    icon: Stethoscope,
    email: 'doctor1@caresync.com',
    password: 'Doctor@123',
    desc: 'Manage patients & consultations',
    badge: 'Cardiology OPD',
  },
  {
    id: 'RECEPTIONIST',
    label: 'Receptionist',
    icon: CalendarCheck,
    email: 'receptionist@caresync.com',
    password: 'Staff@123',
    desc: 'Appointments & bed management',
    badge: 'Front Desk',
  },
  {
    id: 'PATIENT',
    label: 'Patient',
    icon: User,
    email: 'patient1@caresync.com',
    password: 'Patient@123',
    desc: 'Appointments, prescriptions & bills',
    badge: 'Portal User',
  },
];

const Login = () => {
  const [selectedRole, setSelectedRole] = useState('ADMIN');
  const [email, setEmail] = useState('admin@caresync.com');
  const [password, setPassword] = useState('Admin@123');
  const [showPass, setShowPass] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const roleRedirects = {
    ADMIN: '/admin/dashboard',
    DOCTOR: '/doctor/dashboard',
    RECEPTIONIST: '/receptionist/dashboard',
    PATIENT: '/patient/dashboard',
  };

  const handleSelectRole = (r) => {
    setSelectedRole(r.id);
    setEmail(r.email);
    setPassword(r.password);
    toast.success(`Demo credentials loaded for ${r.label}`, {
      id: 'demo-select',
      duration: 2000,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please enter both email and password');
      return;
    }

    setLoading(true);
    const res = await login(email, password);
    setLoading(false);

    if (res?.success) {
      toast.success(`Welcome back, ${res.user.name}!`);
      navigate(roleRedirects[res.user.role] || '/');
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-slate-50 font-sans text-slate-900">
      {/* LEFT SIDE: Healthcare SaaS Brand Experience (Visible on Desktop lg+) */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-slate-950 via-slate-900 to-sky-950 text-white p-12 xl:p-16 flex-col justify-between overflow-hidden">
        {/* Subtle Ambient Background Gradients */}
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-sky-500/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 right-0 w-[30rem] h-[30rem] bg-teal-500/15 rounded-full blur-3xl pointer-events-none"></div>
        
        {/* Background Grid Accent */}
        <div
          className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
            backgroundSize: '24px 24px',
          }}
        ></div>

        {/* Top Branding */}
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 to-teal-400 flex items-center justify-center shadow-lg shadow-sky-500/25">
              <HeartPulse className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                CareSync
                <span className="text-[11px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/30">
                  Healthcare OS
                </span>
              </span>
            </div>
          </div>
        </div>

        {/* Hero Value Proposition */}
        <div className="relative z-10 my-auto py-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-xs text-sky-200 font-medium mb-6 backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-teal-300" />
            <span>Next-Generation Clinical Enterprise Platform</span>
          </div>

          <h1 className="text-4xl xl:text-5xl font-extrabold tracking-tight text-white leading-[1.15] mb-4">
            Connected care, <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-teal-300 to-emerald-400">
              simplified.
            </span>
          </h1>

          <p className="text-base text-slate-300 max-w-md leading-relaxed mb-10">
            Manage patients, appointments, prescriptions and hospital operations from one secure, intelligent platform.
          </p>

          {/* Floating Live Mockup Widget Cards */}
          <div className="space-y-3 max-w-md">
            {/* Mockup Card 1: Bed Matrix Status */}
            <div className="p-4 rounded-xl bg-slate-900/80 border border-white/10 backdrop-blur-md shadow-2xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-teal-500/20 text-teal-300 flex items-center justify-center">
                  <BedDouble className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-white">4-Floor Inpatient Bed Matrix</p>
                  <p className="text-[11px] text-slate-400">ICU & Deluxe Wards Live Triage</p>
                </div>
              </div>
              <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                ● 85% Capacity
              </span>
            </div>

            {/* Mockup Card 2: AI Clinical Assistant */}
            <div className="p-4 rounded-xl bg-slate-900/80 border border-white/10 backdrop-blur-md shadow-2xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-sky-500/20 text-sky-300 flex items-center justify-center">
                  <Activity className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-white">Gemini AI Assistant</p>
                  <p className="text-[11px] text-slate-400">Bilingual Hindi/English Clinical Copilot</p>
                </div>
              </div>
              <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/30">
                Online & Verified
              </span>
            </div>
          </div>
        </div>

        {/* Footer Trust Guarantee */}
        <div className="relative z-10 pt-6 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-400" />
            <span>HIPAA & HL7 Standards Compliant</span>
          </div>
          <span>MongoDB Atlas Enterprise</span>
        </div>
      </div>

      {/* RIGHT SIDE: Clean Modern Login Card */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-10 lg:p-14 overflow-y-auto">
        <div className="w-full max-w-md space-y-8 my-auto">
          {/* Mobile Header Branding (Visible on Mobile/Tablet) */}
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

          {/* Form Header */}
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              Welcome back
            </h2>
            <p className="text-sm text-slate-500 mt-1.5">
              Sign in to continue to your CareSync healthcare workspace
            </p>
          </div>

          {/* Quick Demo Access - Modern Role Selector */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                Quick demo access
              </span>
              <span className="text-[11px] font-medium text-sky-600 bg-sky-50 px-2 py-0.5 rounded-full border border-sky-100">
                Click to load credentials
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {demoRoles.map((role) => {
                const Icon = role.icon;
                const isSelected = selectedRole === role.id;
                return (
                  <button
                    key={role.id}
                    type="button"
                    onClick={() => handleSelectRole(role)}
                    className={`p-3 rounded-xl border text-left transition-all relative flex flex-col justify-between cursor-pointer ${
                      isSelected
                        ? 'border-sky-500 bg-sky-50/70 shadow-sm ring-1 ring-sky-400/50'
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                          isSelected ? 'bg-sky-600 text-white' : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      {isSelected && (
                        <span className="w-2 h-2 rounded-full bg-sky-600 animate-pulse"></span>
                      )}
                    </div>
                    <div>
                      <p className={`text-xs font-bold ${isSelected ? 'text-sky-950' : 'text-slate-800'}`}>
                        {role.label}
                      </p>
                      <p className="text-[10px] text-slate-500 leading-tight line-clamp-1 mt-0.5">
                        {role.desc}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  required
                  placeholder="name@hospital.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:border-sky-500 focus:ring-3 focus:ring-sky-500/15 transition-all text-slate-900 placeholder:text-slate-400"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs font-medium text-sky-600 hover:text-sky-700 hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPass ? 'text' : 'password'}
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:border-sky-500 focus:ring-3 focus:ring-sky-500/15 transition-all text-slate-900 placeholder:text-slate-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                />
                <span className="text-xs text-slate-600">Remember this device</span>
              </label>

              <span className="text-[11px] font-mono text-slate-400">v2.0 Enterprise</span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-sky-600 hover:bg-sky-700 active:bg-sky-800 text-white font-semibold text-sm shadow-md shadow-sky-600/25 transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Signing in to CareSync...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Registration Footer */}
          <div className="pt-4 border-t border-slate-200 text-center">
            <p className="text-xs text-slate-600">
              Don't have an account yet?{' '}
              <Link
                to="/register"
                className="font-semibold text-sky-600 hover:text-sky-700 hover:underline inline-flex items-center gap-1"
              >
                Create account <ArrowRight className="w-3 h-3" />
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
