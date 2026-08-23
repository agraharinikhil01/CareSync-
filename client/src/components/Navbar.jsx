import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, User as UserIcon, Bell, Activity, ShieldCheck, Stethoscope, HeartPulse, UserCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Navbar = ({ onToggleSidebar }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'admin':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 border border-purple-200">
            <ShieldCheck className="w-3.5 h-3.5" /> Admin
          </span>
        );
      case 'doctor':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <Stethoscope className="w-3.5 h-3.5" /> Doctor
          </span>
        );
      case 'receptionist':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
            <UserCheck className="w-3.5 h-3.5" /> Receptionist
          </span>
        );
      case 'patient':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-100 text-sky-800 border border-sky-200">
            <HeartPulse className="w-3.5 h-3.5" /> Patient
          </span>
        );
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-sm">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand / Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 to-primary-400 flex items-center justify-center text-white shadow-md shadow-sky-500/20">
              <Activity className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <span className="text-xl font-bold bg-gradient-to-r from-sky-700 to-sky-500 bg-clip-text text-transparent">
                CareSync<span className="text-slate-800 font-extrabold ml-1">HMS</span>
              </span>
              <span className="hidden sm:inline-block ml-2 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-500 rounded">
                v1.0 Pro
              </span>
            </div>
          </div>

          {/* User actions */}
          <div className="flex items-center gap-3 sm:gap-5">
            {user ? (
              <>
                <div className="hidden sm:flex flex-col items-end">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-slate-800">{user.name}</span>
                    {getRoleBadge(user.role)}
                  </div>
                  <span className="text-xs text-slate-500">{user.email}</span>
                </div>

                <div className="w-9 h-9 rounded-full bg-sky-100 border border-sky-200 text-sky-700 flex items-center justify-center font-bold text-sm">
                  {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>

                <button
                  onClick={handleLogout}
                  title="Logout"
                  className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors border border-red-100"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigate('/login')}
                  className="px-4 py-2 text-sm font-semibold text-sky-600 hover:text-sky-700"
                >
                  Sign In
                </button>
                <button
                  onClick={() => navigate('/register')}
                  className="px-4 py-2 text-sm font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-lg shadow-sm"
                >
                  Register
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
