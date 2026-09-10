import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getAdminStats, getAllUsers, toggleUser, deleteUser, getAllDoctors, getAppointments, getBills } from '../../api/endpoints';
import toast from 'react-hot-toast';
import { Users, Stethoscope, BedDouble, DollarSign, LogOut, Shield, CheckCircle, XCircle, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const [stats, setStats]   = useState(null);
  const [users, setUsers]   = useState([]);
  const [tab, setTab]       = useState('overview');
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [sRes, uRes] = await Promise.all([getAdminStats(), getAllUsers()]);
      setStats(sRes.data.data);
      setUsers(uRes.data.data);
    } catch (e) { toast.error('Failed to load data'); }
    setLoading(false);
  };

  const handleToggle = async (id) => {
    try {
      await toggleUser(id);
      toast.success('User status updated');
      fetchData();
    } catch { toast.error('Failed'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this user permanently?')) return;
    try {
      await deleteUser(id);
      toast.success('User deleted');
      fetchData();
    } catch { toast.error('Failed'); }
  };

  const StatCard = ({ icon: Icon, label, value, color }) => (
    <div className="card flex items-center gap-4">
      <div className={`p-3 rounded-xl ${color}`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-2xl font-bold text-gray-800">{loading ? '...' : value}</p>
      </div>
    </div>
  );

  const tabs = ['overview', 'users', 'doctors', 'appointments'];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Shield className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-gray-800">CareSync HMS</h1>
            <p className="text-xs text-gray-500">Admin Panel</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">👑 {user?.name}</span>
          <button onClick={logout} className="flex items-center gap-1.5 text-sm text-red-500 hover:text-red-700">
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
      </header>

      <div className="p-6">
        {/* Tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {tabs.map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${tab === t ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'}`}>
              {t}
            </button>
          ))}
        </div>

        {/* Overview */}
        {tab === 'overview' && (
          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-4">Dashboard Overview</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
              <StatCard icon={Users}       label="Total Patients"     value={stats?.totalPatients}    color="bg-blue-500" />
              <StatCard icon={Stethoscope} label="Total Doctors"      value={stats?.totalDoctors}     color="bg-green-500" />
              <StatCard icon={BedDouble}   label="Occupied Beds"      value={stats?.occupiedBeds}     color="bg-red-500" />
              <StatCard icon={BedDouble}   label="Available Beds"     value={stats?.availableBeds}    color="bg-emerald-500" />
              <StatCard icon={Users}       label="Appointments"       value={stats?.totalAppointments}color="bg-purple-500" />
              <StatCard icon={DollarSign}  label="Total Revenue (₹)"  value={`₹${stats?.totalRevenue?.toLocaleString() || 0}`} color="bg-amber-500" />
            </div>

            <div className="card">
              <h3 className="font-semibold text-gray-700 mb-3">Quick Info</h3>
              <p className="text-sm text-gray-500">Manage users, appointments, and billing from the tabs above. Use the <strong>Users</strong> tab to activate/deactivate staff or patient accounts.</p>
            </div>
          </div>
        )}

        {/* Users */}
        {tab === 'users' && (
          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-4">All Users ({users.length})</h2>
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>{['Name','Email','Role','Status','Actions'].map(h => <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">{h}</th>)}</tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {users.map(u => (
                    <tr key={u._id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-800">{u.name}</td>
                      <td className="px-4 py-3 text-gray-500">{u.email}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          u.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                          u.role === 'doctor' ? 'bg-blue-100 text-blue-700' :
                          u.role === 'receptionist' ? 'bg-green-100 text-green-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>{u.role}</span>
                      </td>
                      <td className="px-4 py-3">
                        {u.isActive
                          ? <span className="flex items-center gap-1 text-green-600 text-xs"><CheckCircle className="w-3 h-3"/>Active</span>
                          : <span className="flex items-center gap-1 text-red-500 text-xs"><XCircle className="w-3 h-3"/>Inactive</span>}
                      </td>
                      <td className="px-4 py-3">
                        {u.role !== 'admin' && (
                          <div className="flex gap-2">
                            <button onClick={() => handleToggle(u._id)} className="text-blue-500 hover:text-blue-700" title={u.isActive ? 'Deactivate' : 'Activate'}>
                              {u.isActive ? <ToggleRight className="w-4 h-4"/> : <ToggleLeft className="w-4 h-4"/>}
                            </button>
                            <button onClick={() => handleDelete(u._id)} className="text-red-400 hover:text-red-600">
                              <Trash2 className="w-4 h-4"/>
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {users.length === 0 && <p className="text-center text-gray-400 py-8">No users found</p>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
