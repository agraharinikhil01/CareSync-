import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Heart,
  Eye,
  EyeOff,
  LogIn,
  ShieldCheck,
  Stethoscope,
  BedDouble,
  Bot,
  Receipt,
  Users,
  CheckCircle2,
  Lock,
  Mail,
  ArrowRight,
  Activity,
  Sparkles
} from 'lucide-react';

const rolesConfig = [
  {
    id: 'admin',
    label: 'Admin',
    badge: '👑 Hospital Head',
    email: 'admin@caresync.com',
    password: 'Admin@123',
    desc: 'System governance, doctor & bed analytics',
    color: 'from-amber-500/20 to-orange-500/10 border-amber-500/40 text-amber-300'
  },
  {
    id: 'doctor',
    label: 'Doctor',
    badge: '🩺 Clinical Specialist',
    email: 'doctor1@caresync.com',
    password: 'Doctor@123',
    desc: 'OPD queue, prescription writer & consultations',
    color: 'from-emerald-500/20 to-teal-500/10 border-emerald-500/40 text-emerald-300'
  },
  {
    id: 'receptionist',
    label: 'Receptionist',
    badge: '🏥 Front Desk',
    email: 'receptionist@caresync.com',
    password: 'Staff@123',
    desc: '4-Floor Bed allocation & patient check-in',
    color: 'from-cyan-500/20 to-blue-500/10 border-cyan-500/40 text-cyan-300'
  },
  {
    id: 'patient',
    label: 'Patient',
    badge: '🧑 Portal User',
    email: 'patient1@caresync.com',
    password: 'Patient@123',
    desc: 'Appointments, prescriptions, bills & AI chat',
    color: 'from-purple-500/20 to-pink-500/10 border-purple-500/40 text-purple-300'
  }
];

const Login = () => {
  const [selectedRole, setSelectedRole] = useState('admin');
  const [email, setEmail] = useState('admin@caresync.com');
  const [password, setPassword] = useState('Admin@123');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const roleRedirects = {
    admin: '/admin',
    doctor: '/doctor',
    receptionist: '/receptionist',
    patient: '/patient'
  };

  const handleRoleSelect = (role) => {
    setSelectedRole(role.id);
    setEmail(role.email);
    setPassword(role.password);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const res = await login(email, password);
    setLoading(false);
    if (res.success) {
      navigate(roleRedirects[res.user.role] || '/');
    } else {
      setError(res.message);
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-950 text-slate-100 flex flex-col lg:flex-row relative overflow-x-hidden font-sans">
      {/* Background Ambient Glow Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-blue-600/15 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-indigo-600/15 blur-[120px] pointer-events-none" />
      <div className="absolute top-[40%] right-[30%] w-[350px] h-[350px] rounded-full bg-teal-500/10 blur-[100px] pointer-events-none" />

      {/* LEFT SHOWCASE PANEL (Hero Showcase) */}
      <div className="lg:w-[58%] xl:w-[60%] flex flex-col justify-between p-8 sm:p-12 lg:p-16 relative z-10 border-b lg:border-b-0 lg:border-r border-slate-800/80 bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950/40">
        
        {/* Brand Header */}
        <div>
          <div className="flex items-center gap-3.5 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-500/25 ring-2 ring-white/20">
              <Heart className="w-6 h-6 text-white animate-pulse" fill="currentColor" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black tracking-tight text-white">CareSync<span className="text-cyan-400">HMS</span></h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wide uppercase bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  v2.5 Cloud
                </span>
              </div>
              <p className="text-xs text-slate-400">Intelligent Healthcare Infrastructure</p>
            </div>
          </div>

          {/* Hero Content */}
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-300 text-xs font-semibold mb-6">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Next-Gen Enterprise Hospital Operating System</span>
            </div>

            <h2 className="text-3xl sm:text-4xl xl:text-5xl font-extrabold text-white tracking-tight leading-[1.15] mb-4">
              Unified Clinical Care, <br />
              <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-teal-300 bg-clip-text text-transparent">
                Accelerated by Real-Time Intelligence.
              </span>
            </h2>

            <p className="text-sm sm:text-base text-slate-400 leading-relaxed mb-8">
              Empowering administrators, doctors, and staff with interactive 4-floor ward telemetry, automated OPD queues, cryptographic prescriptions, and round-the-clock AI medical support.
            </p>

            {/* 4 Core Features Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
              <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800/80 backdrop-blur-md hover:border-blue-500/40 transition-all group">
                <div className="w-8 h-8 rounded-lg bg-blue-500/15 flex items-center justify-center text-blue-400 mb-2.5 group-hover:bg-blue-500/25 transition-colors">
                  <BedDouble className="w-4 h-4" />
                </div>
                <h4 className="text-sm font-semibold text-white">4-Floor Ward Matrix</h4>
                <p className="text-xs text-slate-400 mt-1">Real-time General, ICU & Private bed occupancy telemetry.</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800/80 backdrop-blur-md hover:border-emerald-500/40 transition-all group">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/15 flex items-center justify-center text-emerald-400 mb-2.5 group-hover:bg-emerald-500/25 transition-colors">
                  <Stethoscope className="w-4 h-4" />
                </div>
                <h4 className="text-sm font-semibold text-white">Doctor Clinical Desk</h4>
                <p className="text-xs text-slate-400 mt-1">Instant digital prescription generation and patient vitals.</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800/80 backdrop-blur-md hover:border-purple-500/40 transition-all group">
                <div className="w-8 h-8 rounded-lg bg-purple-500/15 flex items-center justify-center text-purple-400 mb-2.5 group-hover:bg-purple-500/25 transition-colors">
                  <Bot className="w-4 h-4" />
                </div>
                <h4 className="text-sm font-semibold text-white">24/7 AI Health Assistant</h4>
                <p className="text-xs text-slate-400 mt-1">Live DB integration for instant queries in Hindi & English.</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800/80 backdrop-blur-md hover:border-amber-500/40 transition-all group">
                <div className="w-8 h-8 rounded-lg bg-amber-500/15 flex items-center justify-center text-amber-400 mb-2.5 group-hover:bg-amber-500/25 transition-colors">
                  <Receipt className="w-4 h-4" />
                </div>
                <h4 className="text-sm font-semibold text-white">Automated Billing Ledger</h4>
                <p className="text-xs text-slate-400 mt-1">Multi-item invoice generation with instant mark-paid flow.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Live Telemetry Badges */}
        <div className="pt-8 mt-8 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-6 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping inline-block" />
              <span className="font-semibold text-slate-200">Database: Active (Atlas)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-cyan-400" />
              <span>40 Wards Monitored</span>
            </div>
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-indigo-400" />
              <span>HIPAA Compliant RBAC</span>
            </div>
          </div>
          <p className="text-slate-500">© 2026 CareSync Systems</p>
        </div>
      </div>

      {/* RIGHT AUTHENTICATION PANEL */}
      <div className="lg:w-[42%] xl:w-[40%] flex items-center justify-center p-6 sm:p-10 lg:p-12 relative z-10 bg-slate-950/70">
        <div className="w-full max-w-md">
          
          {/* Card Container */}
          <div className="bg-slate-900/90 border border-slate-800/90 rounded-3xl p-7 sm:p-9 shadow-2xl shadow-blue-950/40 backdrop-blur-2xl relative">
            
            {/* Form Header */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-1.5">
                <h3 className="text-2xl font-bold text-white tracking-tight">Portal Access</h3>
                <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Live
                </span>
              </div>
              <p className="text-xs text-slate-400">Select a role for one-click demo login, or enter credentials.</p>
            </div>

            {/* Quick Demo Role Selector Chips */}
            <div className="mb-6">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2.5">
                Select Your Role
              </label>
              <div className="grid grid-cols-2 gap-2">
                {rolesConfig.map((r) => {
                  const isSelected = selectedRole === r.id;
                  return (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => handleRoleSelect(r)}
                      className={`p-2.5 rounded-xl border text-left transition-all relative ${
                        isSelected
                          ? `bg-gradient-to-r ${r.color} ring-1 ring-blue-400/50 shadow-md`
                          : 'bg-slate-800/50 border-slate-700/60 hover:bg-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-white">{r.label}</span>
                        {isSelected && <span className="w-2 h-2 rounded-full bg-blue-400" />}
                      </div>
                      <p className="text-[10px] text-slate-400 line-clamp-1 leading-tight">{r.desc}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-5 p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-start gap-2.5">
                <span className="text-base leading-none">⚠️</span>
                <span>{error}</span>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Official Email</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter email address"
                    className="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    required
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-medium text-slate-300">Password</label>
                  <span className="text-[11px] text-blue-400 cursor-pointer hover:underline">Forgot?</span>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    className="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl pl-10 pr-11 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-semibold text-sm shadow-lg shadow-blue-600/30 hover:shadow-blue-500/50 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group cursor-pointer"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Sign In to Dashboard</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </>
                )}
              </button>
            </form>

            {/* Footer Links */}
            <div className="mt-6 pt-5 border-t border-slate-800/80 text-center text-xs text-slate-400">
              <span>New patient to hospital? </span>
              <Link to="/register" className="text-cyan-400 font-semibold hover:underline">
                Register as Patient →
              </Link>
            </div>
          </div>

          <p className="text-center text-slate-500 text-[11px] mt-5">
            CareSync HMS v2.5 · Secured by 256-Bit SSL Encryption
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
