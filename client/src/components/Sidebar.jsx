import React from 'react';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  CalendarCheck,
  FileText,
  CreditCard,
  BedDouble,
  UserPlus,
  Stethoscope,
  Activity,
  HeartPulse,
  Settings,
} from 'lucide-react';

const Sidebar = ({ activeTab, setActiveTab }) => {
  const { user } = useAuth();

  if (!user) return null;

  const getMenuItems = () => {
    switch (user.role) {
      case 'admin':
        return [
          { id: 'overview', label: 'Analytics & Overview', icon: LayoutDashboard },
          { id: 'doctors', label: 'Doctor Directory & Staff', icon: Stethoscope },
          { id: 'patients', label: 'Registered Patients', icon: Users },
          { id: 'appointments', label: 'All Appointments', icon: CalendarCheck },
          { id: 'beds', label: 'Bed & Room Inventory', icon: BedDouble },
          { id: 'billing', label: 'Financial & Invoices', icon: CreditCard },
          { id: 'system_design', label: 'System Design & Diagrams', icon: Activity },
        ];

      case 'doctor':
        return [
          { id: 'overview', label: 'Doctor Schedule & Queue', icon: LayoutDashboard },
          { id: 'appointments', label: 'Appointment List', icon: CalendarCheck },
          { id: 'beds', label: 'Ward Floor Plan & Beds', icon: BedDouble },
          { id: 'patients', label: 'Patient Medical Records', icon: Users },
          { id: 'prescriptions', label: 'Prescriptions Issued', icon: FileText },
        ];

      case 'patient':
        return [
          { id: 'overview', label: 'My Patient Portal', icon: LayoutDashboard },
          { id: 'book', label: 'Book Appointment', icon: CalendarCheck },
          { id: 'beds', label: 'Hospital Beds & Ward Map', icon: BedDouble },
          { id: 'prescriptions', label: 'My Prescriptions', icon: FileText },
          { id: 'invoices', label: 'Billing & Invoices', icon: CreditCard },
          { id: 'profile', label: 'Health Profile & EHR', icon: HeartPulse },
        ];

      case 'receptionist':
        return [
          { id: 'overview', label: 'Reception Dashboard', icon: LayoutDashboard },
          { id: 'register_patient', label: 'New Patient Intake', icon: UserPlus },
          { id: 'appointments', label: 'Book Appointments', icon: CalendarCheck },
          { id: 'bed_allocation', label: 'Bed Allocation & Ward', icon: BedDouble },
          { id: 'billing', label: 'Invoice Generation', icon: CreditCard },
        ];

      default:
        return [];
    }
  };

  const menuItems = getMenuItems();

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 min-h-[calc(100vh-4rem)] flex flex-col justify-between p-4 flex-shrink-0 border-r border-slate-800">
      <div>
        <div className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
          Navigation Menu
        </div>
        <nav className="mt-2 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all text-left ${
                  isActive
                    ? 'bg-sky-600 text-white shadow-md shadow-sky-600/30 font-semibold'
                    : 'hover:bg-slate-800/80 hover:text-slate-100 text-slate-400'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Hospital System Status Badge */}
      <div className="bg-slate-800/60 rounded-xl p-3 border border-slate-700/50">
        <div className="flex items-center gap-2 mb-1">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="text-xs font-semibold text-slate-200">HMS Core Online</span>
        </div>
        <p className="text-[11px] text-slate-400">Encrypted HIPAA & RBAC compliant hospital platform.</p>
      </div>
    </aside>
  );
};

export default Sidebar;
