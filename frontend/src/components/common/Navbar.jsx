import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Menu, LogOut, Bell, Shield, Stethoscope, CalendarCheck, User, Sparkles } from 'lucide-react';

const Navbar = ({ toggleSidebar, title = 'Overview', openAI }) => {
  const { user, logout } = useAuth();

  const roleMeta = {
    ADMIN: { label: 'Admin', icon: Shield, color: 'text-rose-600 bg-rose-50 border-rose-200' },
    DOCTOR: { label: 'Doctor', icon: Stethoscope, color: 'text-sky-600 bg-sky-50 border-sky-200' },
    RECEPTIONIST: { label: 'Staff', icon: CalendarCheck, color: 'text-teal-600 bg-teal-50 border-teal-200' },
    PATIENT: { label: 'Patient', icon: User, color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
  };

  const meta = roleMeta[user?.role] || { label: user?.role, icon: User, color: 'text-slate-600 bg-slate-50 border-slate-200' };
  const RoleIcon = meta.icon;

  const todayFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  return (
    <header className="bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 py-3.5 flex items-center justify-between sticky top-0 z-30 shadow-xs">
      {/* Left: Mobile Toggle & Breadcrumbs */}
      <div className="flex items-center gap-3">
        <button
          onClick={toggleSidebar}
          className="lg:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
          aria-label="Toggle navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-400 hidden sm:inline-block">CareSync</span>
          <span className="text-slate-300 hidden sm:inline-block">/</span>
          <h1 className="text-base sm:text-lg font-bold tracking-tight text-slate-900 flex items-center gap-2">
            {title}
          </h1>
          <span className="hidden md:inline-flex items-center gap-1.5 ml-3 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-medium border border-emerald-200/60">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            Live OS
          </span>
        </div>
      </div>

      {/* Right: Actions, Date, Role Pill, User Avatar */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Date Display */}
        <span className="hidden md:inline-block text-xs font-medium text-slate-500 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200/60">
          {todayFormatted}
        </span>

        {/* AI Quick Button in Topbar */}
        {openAI && (
          <button
            onClick={openAI}
            className="hidden sm:flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-sky-50 to-teal-50 hover:from-sky-100 hover:to-teal-100 text-sky-800 border border-sky-200 transition-all cursor-pointer shadow-2xs"
            title="Open Gemini Clinical Copilot"
          >
            <Sparkles className="w-3.5 h-3.5 text-sky-600" />
            <span>AI Assistant</span>
          </button>
        )}

        {/* Notification Bell */}
        <button
          className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors relative cursor-pointer"
          title="Hospital Alerts"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-sky-500 ring-2 ring-white"></span>
        </button>

        {/* User Pill */}
        <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200/80">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-sky-600 to-slate-800 text-white flex items-center justify-center font-bold text-xs shadow-xs">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>

          <div className="hidden sm:flex flex-col text-left">
            <span className="text-xs font-bold text-slate-800 leading-tight truncate max-w-[130px]">
              {user?.name || 'User'}
            </span>
            <span className="text-[10px] font-semibold text-slate-400 leading-tight">
              {meta.label}
            </span>
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={logout}
          className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
          title="Sign Out"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};

export default Navbar;
