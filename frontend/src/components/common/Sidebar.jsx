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
  Heart,
  Bot
} from 'lucide-react';

const Sidebar = ({ isOpen, closeSidebar, openAI }) => {
  const { user } = useAuth();

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
          { to: '/doctor/profile', label: 'My Physician Profile', icon: UserCheck },
        ];
      case 'RECEPTIONIST':
        return [
          { to: '/receptionist/dashboard', label: 'Front Desk Overview', icon: LayoutDashboard },
          { to: '/receptionist/appointments', label: 'Book & Confirm Visits', icon: CalendarCheck },
          { to: '/receptionist/beds', label: '4-Floor Bed Matrix', icon: BedDouble },
          { to: '/receptionist/patients', label: 'Patient Check-in', icon: Users },
          { to: '/receptionist/bills', label: 'Billing & Cashier', icon: Receipt },
        ];
      case 'PATIENT':
        return [
          { to: '/patient/dashboard', label: 'My Health Home', icon: LayoutDashboard },
          { to: '/patient/appointments', label: 'My Appointments', icon: CalendarCheck },
          { to: '/patient/prescriptions', label: 'Prescriptions & Rx', icon: FileText },
          { to: '/patient/bills', label: 'Invoices & Payments', icon: Receipt },
          { to: '/patient/profile', label: 'Digital Health Passport', icon: UserCheck },
        ];
      default:
        return [];
    }
  };

  const links = getLinks();

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={closeSidebar}
          className="fixed inset-0 bg-black/40 z-40 lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Drawer */}
      <aside
        className={`fixed top-0 bottom-0 left-0 w-64 bg-white border-r border-[#dcdcde] z-50 flex flex-col justify-between transition-transform duration-200 lg:translate-x-0 lg:static lg:z-auto ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          {/* Header */}
          <div className="p-4 border-b border-[#dcdcde] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded bg-[#006088] text-white flex items-center justify-center">
                <Heart className="w-4 h-4" fill="currentColor" />
              </div>
              <span className="font-bold text-sm text-[#101517]">CareSync Portal</span>
            </div>
            <button
              onClick={closeSidebar}
              className="lg:hidden p-1 text-[#646970] hover:text-[#101517]"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1">
            {links.map((link) => {
              const Icon = link.icon;
              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  onClick={closeSidebar}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded text-xs font-medium transition-colors ${
                      isActive
                        ? 'bg-[#f0f6fc] text-[#006088] font-semibold border-l-3 border-[#0087be]'
                        : 'text-[#50575e] hover:bg-[#f0f0f1] hover:text-[#101517]'
                    }`
                  }
                >
                  <Icon className="w-4 h-4" />
                  <span>{link.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* AI Quick Button in Sidebar */}
        <div className="p-3 border-t border-[#dcdcde]">
          <button
            onClick={() => {
              closeSidebar();
              openAI();
            }}
            className="w-full bg-[#f0f6fc] hover:bg-[#e1effa] border border-[#a0c5e8] text-[#006088] rounded p-2.5 flex items-center justify-center gap-2 text-xs font-semibold transition-colors cursor-pointer"
          >
            <Bot className="w-4 h-4 text-[#0087be]" />
            <span>AI Health Assistant</span>
          </button>
          <p className="text-[10px] text-[#646970] text-center mt-2">
            CareSync HMS v2.5 · Cloud
          </p>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
