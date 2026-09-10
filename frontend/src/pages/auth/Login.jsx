import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Heart, Eye, EyeOff, ArrowRight, ShieldCheck } from 'lucide-react';

const demoRoles = [
  { id: 'ADMIN', label: 'Admin', email: 'admin@caresync.com', password: 'Admin@123', desc: 'Hospital Governance' },
  { id: 'DOCTOR', label: 'Doctor', email: 'doctor1@caresync.com', password: 'Doctor@123', desc: 'Clinical OPD' },
  { id: 'RECEPTIONIST', label: 'Receptionist', email: 'receptionist@caresync.com', password: 'Staff@123', desc: 'Front Desk & Beds' },
  { id: 'PATIENT', label: 'Patient', email: 'patient1@caresync.com', password: 'Patient@123', desc: 'Patient Portal' },
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
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const res = await login(email, password);
    setLoading(false);

    if (res?.success) {
      navigate(roleRedirects[res.user.role] || '/');
    }
  };

  return (
    <div className="min-h-screen bg-[#f6f7f7] text-[#101517] flex flex-col justify-between font-sans">
      
      {/* Top Header Bar */}
      <header className="bg-[#006088] text-white px-6 py-3.5 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center ring-1 ring-white/20">
            <Heart className="w-4 h-4 text-white" fill="currentColor" />
          </div>
          <span className="font-bold text-lg tracking-tight">CareSync.com</span>
          <span className="hidden sm:inline-block text-xs bg-white/15 px-2 py-0.5 rounded text-blue-100 font-medium ml-1">
            Healthcare OS
          </span>
        </div>
        <Link to="/register" className="text-sm font-medium text-white hover:text-cyan-200 transition-colors">
          Sign Up
        </Link>
      </header>

      {/* Main Form Area */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-[450px]">
          
          <h1 className="text-2xl sm:text-[28px] font-normal text-center text-[#101517] mb-6 tracking-tight">
            Log in to your account.
          </h1>

          <div className="bg-white border border-[#dcdcde] rounded-md shadow-sm p-6 sm:p-8">
            
            {/* Quick Role Fill Tabs */}
            <div className="mb-5">
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-semibold text-[#646970] uppercase tracking-wider">
                  Quick Demo Login
                </label>
                <span className="text-[10px] bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded border border-emerald-200 font-medium">
                  Seeded Credentials
                </span>
              </div>
              <div className="grid grid-cols-4 gap-1.5 p-1 bg-[#f0f0f1] rounded border border-[#dcdcde]">
                {demoRoles.map((r) => {
                  const isActive = selectedRole === r.id;
                  return (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => handleSelectRole(r)}
                      className={`py-1.5 text-xs font-medium rounded transition-all text-center cursor-pointer ${
                        isActive
                          ? 'bg-white text-[#006088] shadow-sm font-semibold'
                          : 'text-[#50575e] hover:text-[#101517]'
                      }`}
                    >
                      {r.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#101517] mb-1.5">
                  Email Address or Username
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white border border-[#8c8f94] focus:border-[#006088] focus:ring-1 focus:ring-[#006088] rounded px-3.5 py-2.5 text-sm text-[#101517] outline-none transition-all"
                  placeholder="name@caresync.com"
                  required
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-sm font-medium text-[#101517]">Password</label>
                  <Link to="/forgot-password" className="text-xs text-[#006088] hover:underline">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-white border border-[#8c8f94] focus:border-[#006088] focus:ring-1 focus:ring-[#006088] rounded px-3.5 py-2.5 text-sm text-[#101517] outline-none pr-10 transition-all"
                    placeholder="Enter password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#646970] hover:text-[#101517]"
                  >
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-[#646970] pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-[#8c8f94] text-[#006088] focus:ring-0"
                  />
                  <span>Remember my credentials</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#0087be] hover:bg-[#0073aa] text-white font-semibold py-2.5 px-4 rounded text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm disabled:opacity-50"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <span>Sign In</span>
                )}
              </button>

              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[#dcdcde]" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-[#646970]">OR</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleSubmit}
                className="w-full bg-white border border-[#8c8f94] hover:bg-[#f6f7f7] text-[#2c3338] font-medium py-2 px-4 rounded text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Log in as {selectedRole}</span>
                <ArrowRight className="w-4 h-4 text-[#50575e]" />
              </button>
            </form>
          </div>

          <div className="mt-5 text-center text-sm space-y-2">
            <p className="text-xs text-[#646970]">
              Don't have an account?{' '}
              <Link to="/register" className="text-[#006088] font-semibold hover:underline">
                Register here
              </Link>
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-5 text-center text-xs text-[#646970] border-t border-[#dcdcde] bg-white">
        <p className="flex items-center justify-center gap-1.5">
          <span>Powered by</span>
          <span className="font-bold text-[#006088] flex items-center gap-1">
            <Heart className="w-3.5 h-3.5 text-[#006088]" fill="currentColor" /> CareSync Health
          </span>
        </p>
      </footer>
    </div>
  );
};

export default Login;
