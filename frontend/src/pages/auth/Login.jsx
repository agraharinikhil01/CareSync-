import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import CareSyncMascot from '../../components/auth/CareSyncMascot';
import {
  Eye,
  EyeOff,
  User,
  Shield,
  Stethoscope,
  CalendarCheck,
  HeartPulse,
  X,
  CheckCircle2,
  Building2,
} from 'lucide-react';
import toast from 'react-hot-toast';

const demoRoles = [
  {
    id: 'ADMIN',
    label: 'Admin',
    icon: Shield,
    email: 'admin@caresync.com',
    password: 'Admin@123',
  },
  {
    id: 'HOSPITAL_ADMIN',
    label: 'Hospital',
    icon: Building2,
    email: 'hospital@caresync.com',
    password: 'Hospital@123',
  },
  {
    id: 'DOCTOR',
    label: 'Doctor',
    icon: Stethoscope,
    email: 'doctor1@caresync.com',
    password: 'Doctor@123',
  },
  {
    id: 'RECEPTIONIST',
    label: 'Reception',
    icon: CalendarCheck,
    email: 'receptionist@caresync.com',
    password: 'Staff@123',
  },
  {
    id: 'PATIENT',
    label: 'Patient',
    icon: User,
    email: 'patient1@caresync.com',
    password: 'Patient@123',
  },
];

const Login = () => {
  const [selectedRole, setSelectedRole] = useState('ADMIN');
  const [email, setEmail] = useState('admin@caresync.com');
  const [password, setPassword] = useState('Admin@123');
  const [showPass, setShowPass] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);

  // Mascot animation state hooks
  const [focusedField, setFocusedField] = useState(null); // 'email' | 'password' | null
  const [isHoveringSubmit, setIsHoveringSubmit] = useState(false);

  // Google SSO Modal states
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [googleEmail, setGoogleEmail] = useState('');
  const [googleName, setGoogleName] = useState('');
  const [googleLoading, setGoogleLoading] = useState(false);

  const { login, googleLogin } = useAuth();
  const navigate = useNavigate();

  const roleRedirects = {
    ADMIN: '/admin/dashboard',
    HOSPITAL_ADMIN: '/hospital/dashboard',
    DOCTOR: '/doctor/dashboard',
    RECEPTIONIST: '/receptionist/dashboard',
    PATIENT: '/patient/dashboard',
  };

  const handleSelectRole = (r) => {
    setSelectedRole(r.id);
    setEmail(r.email);
    setPassword(r.password);
    toast.success(`Demo credentials loaded: ${r.label}`, {
      id: 'demo-select',
      duration: 1800,
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

  // Google Sign-In Handler
  const handleGoogleSignIn = () => {
    const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

    // If official Google Client ID exists, attempt Google One Tap / GIS
    if (googleClientId && window.google?.accounts?.id) {
      try {
        window.google.accounts.id.initialize({
          client_id: googleClientId,
          callback: async (response) => {
            if (response?.credential) {
              setLoading(true);
              // Decode basic payload or pass to backend
              const payload = parseJwt(response.credential);
              const res = await googleLogin({
                email: payload.email,
                name: payload.name,
                picture: payload.picture,
                googleId: payload.sub,
              });
              setLoading(false);
              if (res?.success) {
                navigate(roleRedirects[res.user.role] || '/patient/dashboard');
              }
            }
          },
        });
        window.google.accounts.id.prompt();
        return;
      } catch (err) {
        console.warn('GIS prompt error, opening Google SSO dialog:', err);
      }
    }

    // Default seamless Google SSO dialog
    setShowGoogleModal(true);
  };

  const handleGoogleSubmit = async (e) => {
    e.preventDefault();
    if (!googleEmail) {
      toast.error('Please enter your Google account email');
      return;
    }

    setGoogleLoading(true);
    const inferredName = googleName.trim() || googleEmail.split('@')[0];
    const res = await googleLogin({
      email: googleEmail.trim().toLowerCase(),
      name: inferredName,
      googleId: `google_${Date.now()}`,
    });
    setGoogleLoading(false);

    if (res?.success) {
      setShowGoogleModal(false);
      navigate(roleRedirects[res.user.role] || '/patient/dashboard');
    }
  };

  const handleQuickGoogleAccount = async (acctEmail, acctName) => {
    setGoogleLoading(true);
    const res = await googleLogin({
      email: acctEmail,
      name: acctName,
      googleId: `google_${Date.now()}`,
    });
    setGoogleLoading(false);
    if (res?.success) {
      setShowGoogleModal(false);
      navigate(roleRedirects[res.user.role] || '/patient/dashboard');
    }
  };

  // Helper to parse Google JWT if GIS credential returned
  const parseJwt = (token) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch {
      return {};
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 lg:p-10 bg-slate-950/95 relative overflow-hidden font-sans select-none">
      {/* Ambient background glows */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-sky-600/15 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 bg-teal-500/10 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Main Floating Split Card Modal (Matching Reference Mockup) */}
      <div className="w-full max-w-4xl bg-white rounded-[32px] overflow-hidden shadow-[0_25px_80px_-15px_rgba(0,0,0,0.6)] flex flex-col md:flex-row border border-slate-800/20 relative z-10">
        
        {/* LEFT PANEL: Dark Animated Mascot Arena */}
        <div className="w-full md:w-1/2 bg-[#070b14] relative flex flex-col justify-between p-8 sm:p-10 text-white min-h-[360px] md:min-h-[580px] overflow-hidden">
          {/* Subtle grid accent on dark backdrop */}
          <div
            className="absolute inset-0 opacity-[0.04] pointer-events-none"
            style={{
              backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
              backgroundSize: '20px 20px',
            }}
          ></div>

          {/* Top Branding Tag */}
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-sky-500 to-teal-400 flex items-center justify-center shadow-lg shadow-sky-500/25">
                <HeartPulse className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-base tracking-tight text-white flex items-center gap-2">
                CareSync
                <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/30">
                  OS
                </span>
              </span>
            </div>

            <span className="text-[11px] text-slate-400 font-mono tracking-wide">
              Healthcare AI
            </span>
          </div>

          {/* Interactive Animated Mascot in Center */}
          <div className="relative z-10 my-auto flex items-center justify-center">
            <CareSyncMascot
              focusedField={focusedField}
              showPassword={showPass}
              isHoveringSubmit={isHoveringSubmit}
              isLoading={loading || googleLoading}
            />
          </div>

          {/* Footer Security Note */}
          <div className="relative z-10 flex items-center justify-between text-[11px] text-slate-400 border-t border-white/5 pt-3">
            <span>HIPAA Compliant</span>
            <span>256-bit Encrypted</span>
          </div>
        </div>

        {/* RIGHT PANEL: Clean White Modern Login Interface (Exact Mockup Match) */}
        <div className="w-full md:w-1/2 bg-white p-8 sm:p-10 lg:p-12 flex flex-col justify-center">
          
          {/* Top Circular User Avatar Icon */}
          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3 text-slate-500 shadow-inner">
            <User className="w-5 h-5 text-slate-600" />
          </div>

          {/* Headline & Subtitle */}
          <div className="text-center mb-6">
            <h1 className="text-2xl sm:text-[28px] font-extrabold text-slate-900 tracking-tight">
              Welcome back!
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Enter your login details
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => setFocusedField('email')}
                onBlur={() => setFocusedField(null)}
                placeholder="name@hospital.com"
                className="w-full px-4 py-3 rounded-xl bg-[#f0f2f5] border border-transparent focus:border-slate-300 focus:bg-white text-slate-900 text-sm placeholder:text-slate-400 transition-all outline-hidden focus:ring-3 focus:ring-sky-500/15 shadow-[inset_0_1px_3px_rgba(0,0,0,0.03)]"
              />
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                  placeholder="••••••••••••"
                  className="w-full pl-4 pr-11 py-3 rounded-xl bg-[#f0f2f5] border border-transparent focus:border-slate-300 focus:bg-white text-slate-900 text-sm placeholder:text-slate-400 transition-all outline-hidden focus:ring-3 focus:ring-sky-500/15 shadow-[inset_0_1px_3px_rgba(0,0,0,0.03)]"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1 cursor-pointer"
                  aria-label="Toggle password visibility"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password Row */}
            <div className="flex items-center justify-between text-xs pt-0.5">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900 cursor-pointer accent-slate-900"
                />
                <span className="text-slate-700 font-medium">Remember me</span>
              </label>

              <Link
                to="/forgot-password"
                className="text-slate-600 hover:text-sky-600 font-medium transition-colors hover:underline"
              >
                Forgot password?
              </Link>
            </div>

            {/* Pill-shaped Log In Button */}
            <button
              type="submit"
              disabled={loading}
              onMouseEnter={() => setIsHoveringSubmit(true)}
              onMouseLeave={() => setIsHoveringSubmit(false)}
              className="w-full py-3 px-6 rounded-full bg-slate-950 hover:bg-black active:scale-[0.99] text-white font-medium text-sm shadow-md shadow-slate-950/20 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed mt-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Logging in...</span>
                </>
              ) : (
                <span>Log in</span>
              )}
            </button>
          </form>

          {/* "OR" Divider */}
          <div className="relative my-5 flex items-center justify-center">
            <div className="border-t border-slate-200 w-full"></div>
            <span className="bg-white px-3 text-[11px] text-slate-400 font-medium uppercase tracking-wider absolute">
              OR
            </span>
          </div>

          {/* Clean, Full-width Google Sign-In Button (Apple and Twitter removed as requested) */}
          <div>
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={googleLoading}
              className="w-full flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 active:bg-slate-100 transition-all text-xs sm:text-sm font-semibold text-slate-700 shadow-xs cursor-pointer active:scale-[0.99]"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>
          </div>

          {/* Quick Demo Role Switcher Chips */}
          <div className="mt-4 pt-3 border-t border-slate-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Quick Demo Access
              </span>
              <span className="text-[10px] font-medium text-sky-600 bg-sky-50 px-2 py-0.5 rounded-full">
                1-Click Select
              </span>
            </div>

            <div className="grid grid-cols-4 gap-1.5">
              {demoRoles.map((role) => {
                const isSelected = selectedRole === role.id;
                const Icon = role.icon;
                return (
                  <button
                    key={role.id}
                    type="button"
                    onClick={() => handleSelectRole(role)}
                    className={`py-1.5 px-2 rounded-lg border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-0.5 ${
                      isSelected
                        ? 'border-sky-500 bg-sky-50/80 text-sky-700 font-semibold ring-1 ring-sky-400/50'
                        : 'border-slate-200 bg-white hover:border-slate-300 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span className="text-[11px] leading-tight">{role.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Bottom Sign Up Link */}
          <p className="text-center text-xs text-slate-600 mt-5">
            Don't have an account?{' '}
            <Link
              to="/register"
              className="font-semibold text-slate-900 hover:text-sky-600 transition-colors hover:underline"
            >
              Sign Up
            </Link>
          </p>
        </div>
      </div>

      {/* Direct Google Account SSO Modal */}
      {showGoogleModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 sm:p-7 shadow-2xl border border-slate-100 relative">
            {/* Close Button */}
            <button
              onClick={() => setShowGoogleModal(false)}
              className="absolute right-4 top-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Google Header */}
            <div className="text-center mb-5">
              <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center mx-auto mb-3 shadow-xs">
                <svg className="w-6 h-6" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-slate-900">Sign in with Google</h3>
              <p className="text-xs text-slate-500 mt-1">
                Choose an account or enter your Google email to continue to CareSync Healthcare OS
              </p>
            </div>

            {/* Quick 1-Click Google Accounts */}
            <div className="space-y-2 mb-4">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Choose account
              </span>
              <button
                type="button"
                onClick={() => handleQuickGoogleAccount('nikhil.patient@gmail.com', 'Nikhil Agrahari')}
                disabled={googleLoading}
                className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:border-sky-400 hover:bg-sky-50/50 transition-all text-left cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-sky-600 text-white font-bold flex items-center justify-center text-xs">
                    N
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-800 group-hover:text-sky-950">
                      Nikhil Agrahari
                    </p>
                    <p className="text-[11px] text-slate-500">nikhil.patient@gmail.com</p>
                  </div>
                </div>
                <CheckCircle2 className="w-4 h-4 text-sky-600 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>

              <button
                type="button"
                onClick={() => handleQuickGoogleAccount('caresync.user@gmail.com', 'CareSync User')}
                disabled={googleLoading}
                className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:border-sky-400 hover:bg-sky-50/50 transition-all text-left cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-xs">
                    C
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-800 group-hover:text-sky-950">
                      CareSync Patient
                    </p>
                    <p className="text-[11px] text-slate-500">caresync.user@gmail.com</p>
                  </div>
                </div>
                <CheckCircle2 className="w-4 h-4 text-sky-600 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            </div>

            {/* Custom Google Email Input Form */}
            <form onSubmit={handleGoogleSubmit} className="pt-3 border-t border-slate-100 space-y-3">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Or enter another Google account
              </span>

              <div>
                <input
                  type="email"
                  required
                  value={googleEmail}
                  onChange={(e) => setGoogleEmail(e.target.value)}
                  placeholder="your.name@gmail.com"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 text-xs placeholder:text-slate-400 outline-hidden focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
                />
              </div>

              <div>
                <input
                  type="text"
                  value={googleName}
                  onChange={(e) => setGoogleName(e.target.value)}
                  placeholder="Your Full Name (Optional)"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 text-xs placeholder:text-slate-400 outline-hidden focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
                />
              </div>

              <button
                type="submit"
                disabled={googleLoading}
                className="w-full py-2.5 px-4 rounded-xl bg-sky-600 hover:bg-sky-700 active:bg-sky-800 text-white font-semibold text-xs shadow-sm shadow-sky-600/25 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {googleLoading ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Signing in to Google...</span>
                  </>
                ) : (
                  <span>Sign In with this Google Account</span>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
