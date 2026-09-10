import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Heart, Eye, EyeOff, ShieldCheck, ArrowRight } from 'lucide-react';

const roles = [
  { id: 'admin', label: 'Admin', email: 'admin@caresync.com', password: 'Admin@123', badge: '👑 Admin' },
  { id: 'doctor', label: 'Doctor', email: 'doctor1@caresync.com', password: 'Doctor@123', badge: '🩺 Doctor' },
  { id: 'receptionist', label: 'Receptionist', email: 'receptionist@caresync.com', password: 'Staff@123', badge: '🏥 Reception' },
  { id: 'patient', label: 'Patient', email: 'patient1@caresync.com', password: 'Patient@123', badge: '🧑 Patient' },
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
    patient: '/patient',
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
    <div className="min-h-screen bg-[#f6f7f7] text-[#101517] flex flex-col justify-between font-sans">
      
      {/* Top Brand Bar (WordPress Style) */}
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
        <div>
          <Link
            to="/register"
            className="text-sm font-medium text-white hover:text-cyan-200 transition-colors"
          >
            Sign Up
          </Link>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-[440px]">
          
          {/* Page Heading */}
          <h1 className="text-2xl sm:text-[28px] font-normal text-center text-[#101517] mb-6 tracking-tight">
            Log in to your account.
          </h1>

          {/* White Card Container */}
          <div className="bg-white border border-[#dcdcde] rounded-md shadow-sm p-6 sm:p-8">
            
            {/* Quick Role Switcher Tabs */}
            <div className="mb-5">
              <label className="block text-xs font-semibold text-[#646970] uppercase tracking-wider mb-2">
                Quick Demo Role
              </label>
              <div className="grid grid-cols-4 gap-1.5 p-1 bg-[#f0f0f1] rounded-md border border-[#dcdcde]">
                {roles.map((r) => {
                  const isActive = selectedRole === r.id;
                  return (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => handleRoleSelect(r)}
                      className={`py-1.5 text-xs font-medium rounded transition-all text-center ${
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

            {/* Error Banner */}
            {error && (
              <div className="mb-4 p-3 bg-[#fcf0f2] border-l-4 border-[#d63638] text-[#d63638] text-xs">
                {error}
              </div>
            )}

            {/* Login Form */}
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
                  placeholder="Enter your email"
                  required
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-sm font-medium text-[#101517]">
                    Password
                  </label>
                </div>
                <div className="relative">
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-white border border-[#8c8f94] focus:border-[#006088] focus:ring-1 focus:ring-[#006088] rounded px-3.5 py-2.5 text-sm text-[#101517] outline-none pr-10 transition-all"
                    placeholder="Enter your password"
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

              <p className="text-[12px] text-[#646970] text-center pt-1">
                By continuing with any of the options below, you agree to our{' '}
                <span className="text-[#006088] cursor-pointer hover:underline">Terms of Service</span>.
              </p>

              {/* Primary Continue Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#0087be] hover:bg-[#0073aa] text-white font-semibold py-2.5 px-4 rounded text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm disabled:opacity-50"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <span>Continue</span>
                )}
              </button>

              {/* OR Divider */}
              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[#dcdcde]" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-[#646970]">OR</span>
                </div>
              </div>

              {/* Role Demo Quick Button */}
              <button
                type="button"
                onClick={handleSubmit}
                className="w-full bg-white border border-[#8c8f94] hover:bg-[#f6f7f7] text-[#2c3338] font-medium py-2 px-4 rounded text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Continue as {selectedRole.toUpperCase()}</span>
                <ArrowRight className="w-4 h-4 text-[#50575e]" />
              </button>
            </form>
          </div>

          {/* Sub-card Links */}
          <div className="mt-5 text-center text-sm space-y-2.5">
            <div>
              <Link to="/register" className="text-[#006088] hover:underline">
                Create a new patient account
              </Link>
            </div>
            <div>
              <span className="text-[#646970] text-xs">Lost your password? Contact hospital reception desk.</span>
            </div>
            <div className="pt-2">
              <span className="text-xs text-[#646970]">
                🏥 CareSync Hospital Management System · 40 Beds · 4 Floors Live
              </span>
            </div>
          </div>
        </div>
      </main>

      {/* Footer (WordPress Style) */}
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
