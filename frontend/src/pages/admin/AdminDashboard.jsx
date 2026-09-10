import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import DashboardLayout from '../../layouts/DashboardLayout';
import {
  Users,
  Stethoscope,
  Calendar,
  DollarSign,
  BedDouble,
  Activity,
  ArrowUpRight,
  TrendingUp,
  Clock,
  ShieldCheck,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
} from 'recharts';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const res = await api.get('/admin/dashboard-stats');
      if (res.data.success) {
        setStats(res.data.data);
      }
    } catch (err) {
      toast.error('Failed to load dashboard metrics');
    } finally {
      setLoading(false);
    }
  };

  const cards = [
    { title: 'Total Patients', value: stats?.totalPatients || 0, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
    { title: 'Total Doctors', value: stats?.totalDoctors || 0, icon: Stethoscope, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { title: "Today's Appointments", value: stats?.todayAppointments || 0, icon: Calendar, color: 'text-purple-600', bg: 'bg-purple-50' },
    { title: 'Total Revenue', value: `₹${(stats?.totalRevenue || 0).toLocaleString('en-IN')}`, icon: DollarSign, color: 'text-amber-600', bg: 'bg-amber-50' },
    { title: 'Available Beds', value: stats?.availableBeds || 0, icon: BedDouble, color: 'text-teal-600', bg: 'bg-teal-50' },
    { title: 'Occupied Beds', value: stats?.occupiedBeds || 0, icon: Activity, color: 'text-rose-600', bg: 'bg-rose-50' },
  ];

  return (
    <DashboardLayout title="Hospital Overview & Analytics">
      {loading ? (
        <div className="py-20 text-center">
          <div className="w-8 h-8 border-3 border-[#0087be] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-[#646970]">Loading real-time hospital telemetry...</p>
        </div>
      ) : (
        <div className="space-y-6">
          
          {/* Welcome Banner */}
          <div className="bg-white border border-[#dcdcde] rounded-md p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-[#101517] tracking-tight">Executive Hospital Governance Dashboard</h2>
              <p className="text-xs text-[#646970] mt-0.5">
                Real-time central telemetry from MongoDB Atlas, active bed occupancy, and revenue stream.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded border border-emerald-200">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Live System Active
              </span>
            </div>
          </div>

          {/* 6 Key Stat Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
            {cards.map((card, i) => {
              const Icon = card.icon;
              return (
                <div key={i} className="bg-white border border-[#dcdcde] rounded-md p-4 shadow-xs">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-semibold text-[#646970] uppercase tracking-wider">{card.title}</span>
                    <div className={`w-7 h-7 rounded flex items-center justify-center ${card.bg} ${card.color}`}>
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                  </div>
                  <p className="text-xl font-bold text-[#101517]">{card.value}</p>
                </div>
              );
            })}
          </div>

          {/* Recharts Analytics Section */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Monthly Revenue Chart */}
            <div className="lg:col-span-8 bg-white border border-[#dcdcde] rounded-md p-5 shadow-xs">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="text-sm font-bold text-[#101517]">Monthly Revenue Stream (INR)</h3>
                  <p className="text-xs text-[#646970]">Revenue calculated across consultations, procedures, and bed charges</p>
                </div>
                <div className="flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  <TrendingUp className="w-3.5 h-3.5" /> Growth Stable
                </div>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={stats?.monthlyRevenue || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0087be" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#0087be" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f1" />
                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#646970' }} axisLine={{ stroke: '#dcdcde' }} />
                    <YAxis tick={{ fontSize: 11, fill: '#646970' }} axisLine={{ stroke: '#dcdcde' }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #dcdcde', borderRadius: '4px', fontSize: '12px' }}
                      formatter={(val) => [`₹${val.toLocaleString('en-IN')}`, 'Revenue']}
                    />
                    <Area type="monotone" dataKey="revenue" stroke="#0087be" strokeWidth={2} fillOpacity={1} fill="url(#revGrad)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Appointment Status Breakdown */}
            <div className="lg:col-span-4 bg-white border border-[#dcdcde] rounded-md p-5 shadow-xs flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold text-[#101517]">Appointment Statistics</h3>
                <p className="text-xs text-[#646970] mb-4">Breakdown by current consultation status</p>
                <div className="h-52 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats?.appointmentStats || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f1" />
                      <XAxis dataKey="status" tick={{ fontSize: 10, fill: '#646970' }} axisLine={{ stroke: '#dcdcde' }} />
                      <YAxis tick={{ fontSize: 10, fill: '#646970' }} axisLine={{ stroke: '#dcdcde' }} />
                      <Tooltip contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #dcdcde', borderRadius: '4px', fontSize: '12px' }} />
                      <Bar dataKey="count" fill="#006088" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <p className="text-[11px] text-[#646970] pt-2 border-t border-[#f0f0f1] text-center">
                Real-time appointment scheduling metrics
              </p>
            </div>
          </div>

          {/* Recent Records Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Recent Appointments */}
            <div className="bg-white border border-[#dcdcde] rounded-md p-4 shadow-xs">
              <h4 className="font-bold text-xs text-[#101517] uppercase tracking-wider mb-3">Recent Appointments</h4>
              <div className="space-y-2.5">
                {stats?.recentAppointments?.map((a) => (
                  <div key={a._id} className="p-2 bg-[#f6f7f7] rounded border border-[#dcdcde] text-xs flex justify-between items-center">
                    <div>
                      <p className="font-semibold text-[#101517]">{a.patient?.name || 'Patient'}</p>
                      <p className="text-[11px] text-[#646970]">Dr. {a.doctor?.name || 'Doctor'}</p>
                    </div>
                    <span className="text-[10px] bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded font-medium">
                      {a.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Registered Patients */}
            <div className="bg-white border border-[#dcdcde] rounded-md p-4 shadow-xs">
              <h4 className="font-bold text-xs text-[#101517] uppercase tracking-wider mb-3">Recent Patients</h4>
              <div className="space-y-2.5">
                {stats?.recentPatients?.map((p) => (
                  <div key={p._id} className="p-2 bg-[#f6f7f7] rounded border border-[#dcdcde] text-xs flex justify-between items-center">
                    <div>
                      <p className="font-semibold text-[#101517]">{p.user?.name || 'Patient'}</p>
                      <p className="text-[11px] text-[#646970]">{p.user?.email || '—'}</p>
                    </div>
                    <span className="text-[10px] text-[#646970]">
                      {new Date(p.createdAt).toLocaleDateString('en-IN')}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Bills */}
            <div className="bg-white border border-[#dcdcde] rounded-md p-4 shadow-xs">
              <h4 className="font-bold text-xs text-[#101517] uppercase tracking-wider mb-3">Recent Invoices</h4>
              <div className="space-y-2.5">
                {stats?.recentBills?.map((b) => (
                  <div key={b._id} className="p-2 bg-[#f6f7f7] rounded border border-[#dcdcde] text-xs flex justify-between items-center">
                    <div>
                      <p className="font-semibold text-[#101517]">₹{b.totalAmount?.toLocaleString('en-IN')}</p>
                      <p className="text-[11px] text-[#646970]">{b.patient?.name || 'Patient'}</p>
                    </div>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                      b.paymentStatus === 'PAID' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {b.paymentStatus}
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default AdminDashboard;
