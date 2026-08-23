import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Activity, ShieldCheck, Stethoscope, HeartPulse, UserCheck, Lock, Mail, ArrowRight } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('admin@hospital.com');
  const [password, setPassword] = useState('Admin@123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const res = await login(email, password);
    setLoading(false);

    if (res.success) {
      const roleRedirects = {
        admin: '/admin',
        doctor: '/doctor',
        patient: '/patient',
        receptionist: '/receptionist',
      };
      navigate(roleRedirects[res.user.role] || '/');
    } else {
      setError(res.message);
    }
  };

  // Demo Login Helper
  const setDemoCredentials = (role) => {
    switch (role) {
      case 'admin':
        setEmail('admin@hospital.com');
        setPassword('Admin@123');
        break;
      case 'doctor':
        setEmail('doctor.sharma@hospital.com');
        setPassword('Doctor@123');
        break;
      case 'receptionist':
        setEmail('receptionist@hospital.com');
        setPassword('Staff@123');
        break;
      case 'patient':
        setEmail('patient.rahul@gmail.com');
        setPassword('Patient@123');
        break;
      default:
        break;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-sky-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-sky-600 shadow-xl shadow-sky-500/30 text-white mb-4">
          <Activity className="w-10 h-10 stroke-[2.5]" />
        </div>
        <h2 className="text-3xl font-extrabold text-white tracking-tight">CareSync HMS</h2>
        <p className="mt-2 text-sm text-slate-400">Production-Grade Hospital Management System</p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-2xl rounded-3xl sm:px-10 border border-slate-100">
          {/* Demo account quick switcher */}
          <div className="mb-6">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2.5 text-center">
              ⚡ Quick Demo Login Fill
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setDemoCredentials('admin')}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200 transition"
              >
                <ShieldCheck className="w-4 h-4" /> Admin
              </button>
              <button
                type="button"
                onClick={() => setDemoCredentials('doctor')}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition"
              >
                <Stethoscope className="w-4 h-4" /> Doctor
              </button>
              <button
                type="button"
                onClick={() => setDemoCredentials('receptionist')}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200 transition"
              >
                <UserCheck className="w-4 h-4" /> Receptionist
              </button>
              <button
                type="button"
                onClick={() => setDemoCredentials('patient')}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-sky-50 text-sky-700 hover:bg-sky-100 border border-sky-200 transition"
              >
                <HeartPulse className="w-4 h-4" /> Patient
              </button>
            </div>
          </div>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-slate-400 font-semibold">Or sign in with email</span>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-xl">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-5 h-5 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@hospital.com"
                  className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-5 h-5 text-slate-400 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 flex items-center justify-center gap-2 py-3 px-4 bg-sky-600 hover:bg-sky-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-sky-600/30 transition disabled:opacity-50"
            >
              {loading ? 'Authenticating...' : 'Sign In to Portal'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-slate-600">
            Don't have an account?{' '}
            <Link to="/register" className="font-bold text-sky-600 hover:text-sky-700">
              Register as New Patient
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
