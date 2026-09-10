import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Heart, Menu, LogOut, User, Bell } from 'lucide-react';

const Navbar = ({ toggleSidebar, title = 'Dashboard' }) => {
  const { user, logout } = useAuth();

  const roleLabels = {
    ADMIN: '👑 Hospital Administrator',
    DOCTOR: '🩺 Consulting Physician',
    RECEPTIONIST: '🏥 Front Desk Staff',
    PATIENT: '🧑 Patient Portal',
  };

  return (
    <header className="bg-[#006088] text-white px-4 sm:px-6 py-3 flex items-center justify-between shadow-sm sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <button
          onClick={toggleSidebar}
          className="lg:hidden p-1.5 rounded hover:bg-white/10 text-white transition-colors"
          aria-label="Toggle navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center ring-1 ring-white/20">
            <Heart className="w-3.5 h-3.5 text-white" fill="currentColor" />
          </div>
          <span className="font-bold text-base tracking-tight hidden sm:inline-block">CareSync.com</span>
          <span className="text-white/40 hidden sm:inline-block">/</span>
          <span className="text-xs sm:text-sm text-blue-100 font-medium">{title}</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden sm:flex flex-col text-right">
          <span className="text-xs font-semibold text-white">{user?.name}</span>
          <span className="text-[10px] text-cyan-200">{roleLabels[user?.role] || user?.role}</span>
        </div>

        <button
          onClick={logout}
          className="flex items-center gap-1.5 text-xs bg-white/10 hover:bg-white/20 text-white px-2.5 py-1.5 rounded transition-colors font-medium"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Sign Out</span>
        </button>
      </div>
    </header>
  );
};

export default Navbar;
