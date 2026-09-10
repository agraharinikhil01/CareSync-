import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getAdminStats, getAllUsers, toggleUser, deleteUser } from '../../api/endpoints';
import toast from 'react-hot-toast';
import {
  Users,
  Stethoscope,
  BedDouble,
  DollarSign,
  LogOut,
  Shield,
  CheckCircle,
  XCircle,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Heart,
  Activity,
  CalendarCheck,
  Building2
} from 'lucide-react';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [tab, setTab] = useState('overview');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [sRes, uRes] = await Promise.all([getAdminStats(), getAllUsers()]);
      setStats(sRes.data.data);
      setUsers(uRes.data.data);
    } catch (e) {
      toast.error('Failed to load admin data');
    }
    setLoading(false);
  };

  const handleToggle = async (id) => {
    try {
      await toggleUser(id);
      toast.success('User status updated');
      fetchData();
    } catch {
      toast.error('Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this user permanently from database?')) return;
    try {
      await deleteUser(id);
      toast.success('User deleted');
      fetchData();
    } catch {
      toast.error('Delete failed');
    }
  };

  const tabs = [
    { id: 'overview', label: 'Hospital Overview' },
    { id: 'users', label: 'Staff & Patients Directory' },
  ];

  return (
    <div className="min-h-screen bg-[#f6f7f7] text-[#101517] font-sans">
      
      {/* Top Header Bar */}
      <header className="bg-[#006088] text-white px-6 py-3.5 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center ring-1 ring-white/20">
            <Heart className="w-4 h-4 text-white" fill="currentColor" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-base tracking-tight">CareSync Admin Portal</span>
              <span className="text-[11px] bg-white/15 px-2 py-0.5 rounded text-cyan-100 font-medium">
                Live Cloud
              </span>
            </div>
            <p className="text-[11px] text-blue-100 hidden sm:block">Central Healthcare Management Console</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex flex-col text-right">
            <span className="text-xs font-semibold text-white">{user?.name}</span>
            <span className="text-[10px] text-cyan-200">System Administrator</span>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-1.5 text-xs bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" /> Sign Out
          </button>
        </div>
      </header>

      {/* Sub Navigation Bar */}
      <div className="bg-white border-b border-[#dcdcde] px-6">
        <div className="flex gap-6">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`py-3 text-sm font-medium border-b-2 transition-all cursor-pointer ${
                tab === t.id
                  ? 'border-[#0087be] text-[#006088] font-semibold'
                  : 'border-transparent text-[#646970] hover:text-[#101517]'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto p-6">
        
        {/* OVERVIEW TAB */}
        {tab === 'overview' && (
          <div className="space-y-6">
            
            {/* KPI Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-md border border-[#dcdcde] shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-blue-50 text-[#0087be] flex items-center justify-center">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs text-[#646970] uppercase tracking-wider font-semibold">Registered Patients</p>
                  <p className="text-2xl font-bold text-[#101517] mt-0.5">{loading ? '...' : stats?.totalPatients || 0}</p>
                </div>
              </div>

              <div className="bg-white p-5 rounded-md border border-[#dcdcde] shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Stethoscope className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs text-[#646970] uppercase tracking-wider font-semibold">Doctors on Duty</p>
                  <p className="text-2xl font-bold text-[#101517] mt-0.5">{loading ? '...' : stats?.totalDoctors || 0}</p>
                </div>
              </div>

              <div className="bg-white p-5 rounded-md border border-[#dcdcde] shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-cyan-50 text-cyan-600 flex items-center justify-center">
                  <BedDouble className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs text-[#646970] uppercase tracking-wider font-semibold">Ward Beds Available</p>
                  <p className="text-2xl font-bold text-[#101517] mt-0.5">{loading ? '...' : `${stats?.availableBeds || 0} / 40`}</p>
                </div>
              </div>

              <div className="bg-white p-5 rounded-md border border-[#dcdcde] shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                  <DollarSign className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs text-[#646970] uppercase tracking-wider font-semibold">Total Revenue</p>
                  <p className="text-2xl font-bold text-[#101517] mt-0.5">₹{loading ? '...' : stats?.totalRevenue?.toLocaleString() || 0}</p>
                </div>
              </div>
            </div>

            {/* Hospital Ward Distribution & Status */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-white rounded-md border border-[#dcdcde] shadow-sm p-6">
                <h3 className="text-base font-bold text-[#101517] mb-3 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-[#006088]" /> Ward Occupancy Summary
                </h3>
                <p className="text-xs text-[#646970] mb-4">Real-time breakdown of hospital capacity across all 4 ward floors.</p>
                <div className="space-y-3">
                  {[
                    { name: 'Floor 1 — General Ward', total: 10, occupied: 1 },
                    { name: 'Floor 2 — Intensive Care Unit (ICU)', total: 10, occupied: 0 },
                    { name: 'Floor 3 — Private Ward Suite', total: 10, occupied: 0 },
                    { name: 'Floor 4 — Semi-Private Ward', total: 10, occupied: 0 },
                  ].map((fl) => (
                    <div key={fl.name} className="p-3 bg-[#f6f7f7] rounded border border-[#dcdcde]">
                      <div className="flex justify-between items-center text-xs font-semibold mb-1.5">
                        <span className="text-[#101517]">{fl.name}</span>
                        <span className="text-[#006088]">{fl.total - fl.occupied} Available / {fl.total} Total</span>
                      </div>
                      <div className="w-full bg-[#dcdcde] h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-[#0087be] h-full"
                          style={{ width: `${(fl.occupied / fl.total) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-md border border-[#dcdcde] shadow-sm p-6">
                <h3 className="text-base font-bold text-[#101517] mb-3 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-600" /> System Diagnostics
                </h3>
                <ul className="space-y-3 text-xs text-[#646970]">
                  <li className="flex justify-between py-1.5 border-b border-[#f0f0f1]">
                    <span>MongoDB Atlas Cluster</span>
                    <span className="text-emerald-600 font-semibold">● Connected (hms)</span>
                  </li>
                  <li className="flex justify-between py-1.5 border-b border-[#f0f0f1]">
                    <span>Brevo Email Service</span>
                    <span className="text-emerald-600 font-semibold">● Active (300/day)</span>
                  </li>
                  <li className="flex justify-between py-1.5 border-b border-[#f0f0f1]">
                    <span>Google Gemini AI</span>
                    <span className="text-emerald-600 font-semibold">● Enabled (Dual Engine)</span>
                  </li>
                  <li className="flex justify-between py-1.5">
                    <span>Active Appointments</span>
                    <span className="font-semibold text-[#101517]">{stats?.totalAppointments || 0} Total</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* USERS DIRECTORY TAB */}
        {tab === 'users' && (
          <div className="bg-white rounded-md border border-[#dcdcde] shadow-sm overflow-hidden">
            <div className="p-4 border-b border-[#dcdcde] flex justify-between items-center bg-[#fbfbfb]">
              <div>
                <h3 className="font-bold text-sm text-[#101517]">User Accounts Directory</h3>
                <p className="text-xs text-[#646970]">Manage staff, doctors, receptionists, and patients</p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 bg-[#f0f0f1] text-[#50575e] rounded border border-[#dcdcde]">
                Total: {users.length} Users
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#f0f0f1] text-[#50575e] border-b border-[#dcdcde] uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="px-4 py-3">Full Name</th>
                    <th className="px-4 py-3">Email Address</th>
                    <th className="px-4 py-3">Role</th>
                    <th className="px-4 py-3">Phone</th>
                    <th className="px-4 py-3">Account Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f0f0f1]">
                  {users.map((u) => (
                    <tr key={u._id} className="hover:bg-[#f6f7f7] transition-colors">
                      <td className="px-4 py-3.5 font-medium text-[#101517]">{u.name}</td>
                      <td className="px-4 py-3.5 text-[#50575e]">{u.email}</td>
                      <td className="px-4 py-3.5">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                          u.role === 'admin' ? 'bg-amber-100 text-amber-800' :
                          u.role === 'doctor' ? 'bg-emerald-100 text-emerald-800' :
                          u.role === 'receptionist' ? 'bg-cyan-100 text-cyan-800' :
                          'bg-purple-100 text-purple-800'
                        }`}>
                          {u.role.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-[#50575e]">{u.phone || '—'}</td>
                      <td className="px-4 py-3.5">
                        {u.isActive ? (
                          <span className="inline-flex items-center gap-1 text-emerald-700 font-medium">
                            <CheckCircle className="w-3.5 h-3.5" /> Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-red-600 font-medium">
                            <XCircle className="w-3.5 h-3.5" /> Inactive
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        {u.role !== 'admin' && (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleToggle(u._id)}
                              className="text-xs text-[#006088] hover:underline"
                            >
                              {u.isActive ? 'Deactivate' : 'Activate'}
                            </button>
                            <span className="text-[#dcdcde]">|</span>
                            <button
                              onClick={() => handleDelete(u._id)}
                              className="text-xs text-[#d63638] hover:underline"
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-12 py-5 text-center text-xs text-[#646970] border-t border-[#dcdcde] bg-white">
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

export default AdminDashboard;
