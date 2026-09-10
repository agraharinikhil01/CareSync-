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
  Plus,
  ArrowRight,
  Receipt,
  UserPlus,
  Shield,
  FileText,
  AlertCircle,
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
import { Link } from 'react-router-dom';
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
    } catch {
      toast.error('Failed to load dashboard metrics');
    } finally {
      setLoading(false);
    }
  };

  const getTimeGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const topKpis = [
    {
      title: 'Total Patients',
      value: stats?.totalPatients || 0,
      icon: Users,
      color: 'from-sky-500 to-sky-600',
      textColor: 'text-sky-600',
      bgLight: 'bg-sky-50',
      context: 'Registered clinical charts',
    },
    {
      title: 'Attending Doctors',
      value: stats?.totalDoctors || 0,
      icon: Stethoscope,
      color: 'from-teal-500 to-teal-600',
      textColor: 'text-teal-600',
      bgLight: 'bg-teal-50',
      context: 'Medical faculty on roster',
    },
    {
      title: "Today's Appointments",
      value: stats?.todayAppointments || 0,
      icon: Calendar,
      color: 'from-indigo-500 to-indigo-600',
      textColor: 'text-indigo-600',
      bgLight: 'bg-indigo-50',
      context: 'Scheduled for current date',
    },
    {
      title: 'Gross Revenue',
      value: `₹${(stats?.totalRevenue || 0).toLocaleString('en-IN')}`,
      icon: DollarSign,
      color: 'from-emerald-500 to-emerald-600',
      textColor: 'text-emerald-600',
      bgLight: 'bg-emerald-50',
      context: 'Settled hospital invoices',
    },
  ];

  const secondaryKpis = [
    {
      title: 'Available Beds',
      value: stats?.availableBeds || 0,
      icon: BedDouble,
      context: 'Immediate admission capacity',
      statusColor: 'text-emerald-600 bg-emerald-50 border-emerald-200',
    },
    {
      title: 'Occupied Beds',
      value: stats?.occupiedBeds || 0,
      icon: Activity,
      context: 'Inpatient wards currently active',
      statusColor: 'text-rose-600 bg-rose-50 border-rose-200',
    },
    {
      title: 'Recent Bills Issued',
      value: stats?.recentBills?.length || 0,
      icon: Receipt,
      context: 'Latest processed accounts',
      statusColor: 'text-indigo-600 bg-indigo-50 border-indigo-200',
    },
    {
      title: 'OPD Queue Records',
      value: stats?.recentAppointments?.length || 0,
      icon: Clock,
      context: 'Active consultations in pipeline',
      statusColor: 'text-sky-600 bg-sky-50 border-sky-200',
    },
  ];

  if (loading) {
    return (
      <DashboardLayout title="Hospital Operations Center">
        <div className="space-y-6">
          <div className="h-24 bg-white rounded-2xl border border-slate-200 animate-pulse"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-white rounded-2xl border border-slate-200 animate-pulse"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-80 bg-white rounded-2xl border border-slate-200 animate-pulse"></div>
            <div className="h-80 bg-white rounded-2xl border border-slate-200 animate-pulse"></div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Hospital Operations Center">
      <div className="space-y-6">
        {/* Modern Header Hero */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-sky-50 border border-sky-200/60 text-xs text-sky-800 font-semibold mb-2">
              <Shield className="w-3.5 h-3.5 text-sky-600" />
              <span>Hospital Governance Console</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              {getTimeGreeting()}, Admin
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Here's what's happening across CareSync operations today.
            </p>
          </div>

          {/* Quick Actions Ribbon */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <Link
              to="/admin/patients"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold shadow-xs shadow-sky-600/20 transition-all cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>Add Patient</span>
            </Link>
            <Link
              to="/admin/doctors"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition-all cursor-pointer"
            >
              <Stethoscope className="w-4 h-4 text-teal-400" />
              <span>Add Doctor</span>
            </Link>
            <Link
              to="/admin/beds"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold transition-all cursor-pointer shadow-2xs"
            >
              <BedDouble className="w-4 h-4 text-slate-500" />
              <span>Manage Beds</span>
            </Link>
          </div>
        </div>

        {/* Top 4 KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {topKpis.map((kpi, idx) => {
            const Icon = kpi.icon;
            return (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div className="flex items-start justify-between mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    {kpi.title}
                  </span>
                  <div className={`w-9 h-9 rounded-xl ${kpi.bgLight} ${kpi.textColor} flex items-center justify-center shadow-2xs`}>
                    <Icon className="w-4 h-4" />
                  </div>
                </div>
                <div>
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                    {kpi.value}
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-1 font-medium">{kpi.context}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Secondary 4 Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          {secondaryKpis.map((sec, idx) => {
            const Icon = sec.icon;
            return (
              <div
                key={idx}
                className="bg-white rounded-xl border border-slate-200/70 p-4 shadow-2xs flex flex-col justify-between"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-semibold text-slate-600 truncate">{sec.title}</span>
                  <Icon className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-xl font-bold text-slate-900">{sec.value}</span>
                </div>
                <span className="text-[10px] text-slate-400 mt-1 truncate">{sec.context}</span>
              </div>
            );
          })}
        </div>

        {/* Analytical Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue Stream AreaChart */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-emerald-600" />
                  Monthly Hospital Revenue
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">Aggregated payments across hospital wings</p>
              </div>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                INR (₹)
              </span>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={stats?.monthlyRevenue || []}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0284c7" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#0284c7" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderRadius: '12px',
                      color: '#ffffff',
                      border: 'none',
                      fontSize: '12px',
                    }}
                    formatter={(val) => [`₹${val.toLocaleString('en-IN')}`, 'Revenue']}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#0284c7"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#revenueGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Weekly Appointment Flow BarChart */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-sky-600" />
                  Weekly Consultation Volume
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">Consultations booked across the current week</p>
              </div>
              <span className="text-xs font-bold text-sky-700 bg-sky-50 px-2.5 py-1 rounded-full border border-sky-200">
                OPD Volume
              </span>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={stats?.weeklyAppointments || []}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderRadius: '12px',
                      color: '#ffffff',
                      border: 'none',
                      fontSize: '12px',
                    }}
                    formatter={(val) => [val, 'Consultations']}
                  />
                  <Bar dataKey="appointments" fill="#0d9488" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Bottom Split: Recent Consultations & Newest Registered Patients */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Appointments (2 cols) */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
                <div>
                  <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-sky-600" />
                    Latest Hospital Consultations
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">Real-time appointments ledger entries</p>
                </div>
                <Link
                  to="/admin/appointments"
                  className="text-xs font-semibold text-sky-600 hover:text-sky-700 hover:underline flex items-center gap-1"
                >
                  All Appointments <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {(!stats?.recentAppointments || stats.recentAppointments.length === 0) ? (
                <div className="p-8 text-center text-slate-400 text-xs">No recent appointments recorded</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="text-slate-400 font-bold border-b border-slate-100 uppercase tracking-wider">
                        <th className="py-2.5 px-3">Patient</th>
                        <th className="py-2.5 px-3">Attending Physician</th>
                        <th className="py-2.5 px-3">Slot</th>
                        <th className="py-2.5 px-3 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {stats.recentAppointments.map((app) => (
                        <tr key={app._id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-3 px-3 font-semibold text-slate-900">
                            {app.patient?.name || 'Walk-In Patient'}
                          </td>
                          <td className="py-3 px-3 text-slate-600">
                            Dr. {app.doctor?.name || 'Attending'}
                          </td>
                          <td className="py-3 px-3 text-slate-500 font-mono">
                            {app.time || '10:00 AM'}
                          </td>
                          <td className="py-3 px-3 text-right">
                            <span
                              className={`inline-flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-full font-semibold ${
                                app.status === 'CONFIRMED'
                                  ? 'bg-sky-50 text-sky-700 border border-sky-200'
                                  : app.status === 'COMPLETED'
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : app.status === 'CANCELLED'
                                  ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                  : 'bg-amber-50 text-amber-700 border border-amber-200'
                              }`}
                            >
                              ● {app.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Recent Patients Card (1 col) */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
                <div>
                  <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Users className="w-4 h-4 text-teal-600" />
                    New Patients
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">Recently registered charts</p>
                </div>
                <Link
                  to="/admin/patients"
                  className="text-xs font-semibold text-sky-600 hover:text-sky-700 hover:underline flex items-center gap-1"
                >
                  Directory <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {(!stats?.recentPatients || stats.recentPatients.length === 0) ? (
                <div className="p-8 text-center text-slate-400 text-xs">No registered patients</div>
              ) : (
                <div className="space-y-3">
                  {stats.recentPatients.map((p) => (
                    <div
                      key={p._id}
                      className="p-2.5 rounded-xl border border-slate-100 hover:border-slate-200 bg-slate-50/50 hover:bg-slate-50 flex items-center justify-between transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-teal-600 text-white flex items-center justify-center font-bold text-xs shadow-2xs">
                          {p.user?.name ? p.user.name.charAt(0).toUpperCase() : 'P'}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-900">{p.user?.name}</p>
                          <p className="text-[10px] text-slate-500 font-mono">{p.patientId}</p>
                        </div>
                      </div>
                      <span className="text-[10px] text-slate-400 font-medium">
                        {new Date(p.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Link
              to="/admin/patients"
              className="mt-4 w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl text-center block transition-colors"
            >
              Open Full Patient Directory
            </Link>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
