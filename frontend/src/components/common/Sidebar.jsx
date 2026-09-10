import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  Stethoscope,
  CalendarCheck,
  BedDouble,
  Receipt,
  FileText,
  UserCheck,
  X,
  HeartPulse,
  Sparkles,
  LogOut,
  Shield,
  Clock,
  Settings,
} from 'lucide-react';

const Sidebar = ({ isOpen, closeSidebar, openAI }) => {
  const { user, logout } = useAuth();

  const getLinks = () => {
    switch (user?.role) {
      case 'ADMIN':
        return [
          { to: '/admin/dashboard', label: 'Hospital Overview', icon: LayoutDashboard },
          { to: '/admin/patients', label: 'Patient Directory', icon: Users },
          { to: '/admin/doctors', label: 'Doctor Specialists', icon: Stethoscope },
          { to: '/admin/appointments', label: 'Appointments Schedule', icon: CalendarCheck },
          { to: '/admin/beds', label: '4-Floor Bed Matrix', icon: BedDouble },
          { to: '/admin/bills', label: 'Billing & Ledger', icon: Receipt },
        ];
      case 'DOCTOR':
        return [
          { to: '/doctor/dashboard', label: 'Clinical Overview', icon: LayoutDashboard },
          { to: '/doctor/appointments', label: 'Patient Queue & OPD', icon: CalendarCheck },
          { to: '/doctor/patients', label: 'Assigned Patients', icon: Users },
          { to: '/doctor/prescriptions', label: 'Prescription Records', icon: FileText },
          { to: '/doctor/profile', label: 'Physician Profile', icon: UserCheck },
        ];
      case 'RECEPTIONIST':
        return [
          { to: '/receptionist/dashboard', label: 'Front Desk Overview', icon: LayoutDashboard },
          { to: '/receptionist/appointments', label: 'Book & Confirm Visits', icon: CalendarCheck },
          { to: '/receptionist/beds', label: '4-Floor Bed Matrix', icon: BedDouble },
          { to: '/receptionist/patients', label: 'Patient Intake', icon: Users },
          { to: '/receptionist/bills', label: 'Cashier & Billing', icon: Receipt },
        ];
      case 'PATIENT':
        return [
          { to: '/patient/dashboard', label: 'Health Overview', icon: LayoutDashboard },
          { to: '/patient/appointments', label: 'My Consultations', icon: CalendarCheck },
          { to: '/patient/prescriptions', label: 'Prescriptions & Rx', icon: FileText },
          { to: '/patient/bills', label: 'Invoices & Payments', icon: Receipt },
          { to: '/patient/profile', label: 'Digital Health Passport', icon: UserCheck },
        ];
      default:
        return [];
    }
  };

  const links = getLinks();

  const roleMeta = {
    ADMIN: { label: 'Admin Console', badge: 'Superuser', color: 'bg-rose-50 text-rose-700 border-rose-200' },
    DOCTOR: { label: 'Doctor Portal', badge: 'Attending Physician', color: 'bg-sky-50 text-sky-700 border-sky-200' },
    RECEPTIONIST: { label: 'Staff Desk', badge: 'Front Desk', color: 'bg-teal-50 text-teal-700 border-teal-200' },
    PATIENT: { label: 'Patient Portal', badge: 'Verified Patient', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  };

  const currentRole = roleMeta[user?.role] || { label: 'Workspace', badge: user?.role, color: 'bg-slate-50 text-slate-700 border-slate-200' };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={closeSidebar}
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 w-72 bg-white border-r border-slate-200/80 z-50 flex flex-col justify-between transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:z-auto ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex-1 flex flex-col overflow-y-auto">
          {/* Header Brand */}
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 to-teal-500 text-white flex items-center justify-center shadow-md shadow-sky-500/20">
                <HeartPulse className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-base tracking-tight text-slate-900">CareSync</span>
                  <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-sky-50 text-sky-700 border border-sky-200/60">
                    OS
                  </span>
                </div>
                <p className="text-[11px] font-medium text-slate-400">Connected Healthcare</p>
              </div>
            </div>
            <button
              onClick={closeSidebar}
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Role Space Indicator */}
          <div className="px-5 py-3 bg-slate-50/60 border-b border-slate-100 flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              {currentRole.label}
            </span>
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${currentRole.color}`}>
              {currentRole.badge}
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="p-3.5 space-y-1">
            {links.map((link) => {
              const Icon = link.icon;
              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  onClick={closeSidebar}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-sky-600 text-white shadow-sm shadow-sky-600/20'
                        : 'text-slate-600 hover:bg-slate-100/70 hover:text-slate-900'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                      <span className="flex-1">{link.label}</span>
                    </>
                  )}
                </NavLink>
              );
            })}
          </nav>

          {/* AI Clinical Assistant Widget in Sidebar */}
          <div className="mt-auto px-4 py-3">
            <div className="p-3.5 rounded-2xl bg-gradient-to-br from-slate-900 to-sky-950 text-white shadow-md relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-sky-500/15 rounded-full blur-xl pointer-events-none"></div>
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="w-6 h-6 rounded-lg bg-sky-500/20 flex items-center justify-center text-sky-300">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs font-bold text-white tracking-tight">Gemini AI Copilot</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed mb-3">
                  Ask clinical queries, check bed availability & schedule advice.
                </p>
                <button
                  onClick={() => {
                    closeSidebar();
                    openAI();
                  }}
                  className="w-full py-2 px-3 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/15 transition-all flex items-center justify-center gap-1.5 cursor-pointer backdrop-blur-xs"
                >
                  <span>Launch Assistant</span>
                  <Sparkles className="w-3 h-3 text-teal-300" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* User Profile Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-sky-600 text-white flex items-center justify-center font-bold text-sm shadow-xs shrink-0">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-900 truncate">{user?.name || 'User'}</p>
              <p className="text-[11px] text-slate-500 truncate font-mono">{user?.email}</p>
            </div>
          </div>

          <button
            onClick={logout}
            title="Sign Out"
            className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer shrink-0"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
