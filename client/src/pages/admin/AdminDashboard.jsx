import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import StatCard from '../../components/StatCard';
import Table from '../../components/Table';
import Modal from '../../components/Modal';
import SystemDesignTab from '../../components/SystemDesignTab';
import { VisualBedMap } from '../../components/VisualBedMap';
import {
  getAdminStatsApi,
  getAdminDoctorsApi,
  createAdminDoctorApi,
  getAdminPatientsApi,
  getAppointmentsApi,
  updateAppointmentStatusApi,
  getBedsApi,
  createBedApi,
  allocateBedApi,
  releaseBedApi,
  getInvoicesApi,
  toggleUserStatusApi,
} from '../../api/endpoints';
import {
  Users,
  Stethoscope,
  CreditCard,
  BedDouble,
  CalendarCheck,
  Plus,
  TrendingUp,
  Activity,
  CheckCircle,
  XCircle,
  Clock,
  ShieldCheck,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [beds, setBeds] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  // Add Doctor Modal
  const [isDoctorModalOpen, setIsDoctorModalOpen] = useState(false);
  const [doctorForm, setDoctorForm] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    specialization: 'Cardiologist',
    department: 'Cardiology',
    consultationFee: 750,
    experienceYears: 5,
    roomNumber: 'Suite 201',
  });

  // Add Bed Modal
  const [isBedModalOpen, setIsBedModalOpen] = useState(false);
  const [bedForm, setBedForm] = useState({
    bedNumber: '',
    type: 'ICU',
    ward: 'Floor 3 - ICU Wing',
    dailyRate: 3500,
  });

  useEffect(() => {
    fetchDashboardData();
  }, [activeTab]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      if (activeTab === 'overview') {
        const res = await getAdminStatsApi();
        if (res.data.success) setStats(res.data.data);
      } else if (activeTab === 'doctors') {
        const res = await getAdminDoctorsApi();
        if (res.data.success) setDoctors(res.data.data);
      } else if (activeTab === 'patients') {
        const res = await getAdminPatientsApi();
        if (res.data.success) setPatients(res.data.data);
      } else if (activeTab === 'appointments') {
        const res = await getAppointmentsApi();
        if (res.data.success) setAppointments(res.data.data);
      } else if (activeTab === 'beds') {
        const res = await getBedsApi();
        if (res.data.success) setBeds(res.data.data);
      } else if (activeTab === 'billing') {
        const res = await getInvoicesApi();
        if (res.data.success) setInvoices(res.data.data);
      }
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDoctor = async (e) => {
    e.preventDefault();
    try {
      const res = await createAdminDoctorApi(doctorForm);
      if (res.data.success) {
        setIsDoctorModalOpen(false);
        setDoctorForm({
          name: '',
          email: '',
          password: '',
          phone: '',
          specialization: 'Cardiologist',
          department: 'Cardiology',
          consultationFee: 750,
          experienceYears: 5,
          roomNumber: 'Suite 201',
        });
        fetchDashboardData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error creating doctor');
    }
  };

  const handleCreateBed = async (e) => {
    e.preventDefault();
    try {
      const res = await createBedApi(bedForm);
      if (res.data.success) {
        setIsBedModalOpen(false);
        setBedForm({
          bedNumber: '',
          type: 'ICU',
          ward: 'Floor 3 - ICU Wing',
          dailyRate: 3500,
        });
        fetchDashboardData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error creating bed');
    }
  };

  const handleUpdateAppStatus = async (id, status) => {
    try {
      const res = await updateAppointmentStatusApi(id, { status });
      if (res.data.success) {
        setAppointments(appointments.map((a) => (a._id === id ? res.data.data : a)));
      }
    } catch (err) {
      alert('Failed to update status');
    }
  };

  const handleToggleUser = async (userId) => {
    try {
      const res = await toggleUserStatusApi(userId);
      if (res.data.success) {
        fetchDashboardData();
      }
    } catch (err) {
      alert('Failed to toggle status');
    }
  };

  const handleDirectAllocate = async (bedId, patientId) => {
    const res = await allocateBedApi(bedId, { patientId });
    if (res.data.success) {
      await fetchDashboardData();
    }
  };

  const handleDirectRelease = async (bedId) => {
    const res = await releaseBedApi(bedId);
    if (res.data.success) {
      await fetchDashboardData();
    }
  };

  const PIE_COLORS = ['#0284c7', '#10b981', '#f59e0b', '#ef4444'];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Hospital Executive Command Center</h1>
                  <p className="text-sm text-slate-500">Live operational overview, occupancy metrics & financials</p>
                </div>
                <button
                  onClick={() => setIsDoctorModalOpen(true)}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold shadow-sm transition"
                >
                  <Plus className="w-4 h-4" /> Add New Doctor
                </button>
              </div>

              {/* KPI Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                  title="Total Registered Patients"
                  value={stats?.summary?.totalPatients || 0}
                  subtitle="Active EHR Patient Profiles"
                  icon={Users}
                  color="sky"
                  trend={{ positive: true, text: '12% this month' }}
                />
                <StatCard
                  title="Doctor Specialists"
                  value={stats?.summary?.totalDoctors || 0}
                  subtitle="On-Duty Medical Staff"
                  icon={Stethoscope}
                  color="emerald"
                />
                <StatCard
                  title="Hospital Bed Occupancy"
                  value={`${stats?.summary?.occupancyRate || 0}%`}
                  subtitle={`${stats?.summary?.occupiedBeds || 0} / ${stats?.summary?.totalBeds || 0} Beds in use`}
                  icon={BedDouble}
                  color={stats?.summary?.occupancyRate > 75 ? 'rose' : 'purple'}
                />
                <StatCard
                  title="Total Revenue Collected"
                  value={`$${(stats?.summary?.totalRevenue || 0).toLocaleString()}`}
                  subtitle={`Pending: $${(stats?.summary?.pendingRevenue || 0).toLocaleString()}`}
                  icon={CreditCard}
                  color="amber"
                  trend={{ positive: true, text: 'Financial healthy' }}
                />
              </div>

              {/* Charts Section */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Revenue Analytics Trend */}
                <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-bold text-slate-800 text-sm">Monthly Revenue & Patient Volume</h3>
                      <p className="text-xs text-slate-400">Financial cash-flows over recent cycles</p>
                    </div>
                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                      +18.4% YoY
                    </span>
                  </div>

                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={stats?.revenueAnalytics || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#0284c7" stopOpacity={0.4} />
                            <stop offset="95%" stopColor="#0284c7" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} />
                        <YAxis stroke="#94a3b8" fontSize={11} />
                        <Tooltip />
                        <Area type="monotone" dataKey="revenue" stroke="#0284c7" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRev)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Appointment Status Pie */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-slate-800 text-sm">Appointment Status Distribution</h3>
                    <p className="text-xs text-slate-400">Breakdown of patient consultations</p>
                  </div>

                  <div className="h-56">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={stats?.appointmentStatusData || [{ name: 'Confirmed', value: 1 }]}
                          innerRadius={50}
                          outerRadius={75}
                          paddingAngle={4}
                          dataKey="value"
                        >
                          {(stats?.appointmentStatusData || []).map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend iconSize={8} wrapperStyle={{ fontSize: '11px' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Recent Appointments Queue */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-bold text-slate-800 text-sm">Recent Appointments Log</h3>
                    <p className="text-xs text-slate-400">Live feed of scheduled consultations</p>
                  </div>
                  <button
                    onClick={() => setActiveTab('appointments')}
                    className="text-xs font-bold text-sky-600 hover:text-sky-700"
                  >
                    View All →
                  </button>
                </div>

                <Table
                  columns={[
                    {
                      header: 'Patient',
                      render: (row) => (
                        <div>
                          <p className="font-bold text-slate-900">{row.patientId?.name || 'Walk-in'}</p>
                          <p className="text-xs text-slate-400">{row.patientId?.email}</p>
                        </div>
                      ),
                    },
                    {
                      header: 'Assigned Doctor',
                      render: (row) => <span className="font-semibold text-sky-800">{row.doctorId?.name || 'Unassigned'}</span>,
                    },
                    {
                      header: 'Schedule',
                      render: (row) => (
                        <span className="text-xs text-slate-600">
                          {new Date(row.date).toLocaleDateString()} at {row.timeSlot}
                        </span>
                      ),
                    },
                    {
                      header: 'Reason',
                      accessor: 'reason',
                    },
                    {
                      header: 'Status',
                      render: (row) => {
                        const statusColors = {
                          Pending: 'bg-amber-100 text-amber-800',
                          Confirmed: 'bg-sky-100 text-sky-800',
                          Completed: 'bg-emerald-100 text-emerald-800',
                          Cancelled: 'bg-red-100 text-red-800',
                        };
                        return (
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${statusColors[row.status] || 'bg-slate-100'}`}>
                            {row.status}
                          </span>
                        );
                      },
                    },
                  ]}
                  data={stats?.recentAppointments || []}
                />
              </div>
            </div>
          )}

          {/* TAB 2: DOCTOR DIRECTORY */}
          {activeTab === 'doctors' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-extrabold text-slate-900">Doctor Directory & Specialists</h1>
                  <p className="text-sm text-slate-500">Manage medical consultants, departments and consultation pricing</p>
                </div>
                <button
                  onClick={() => setIsDoctorModalOpen(true)}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold shadow transition"
                >
                  <Plus className="w-4 h-4" /> Add Doctor
                </button>
              </div>

              <Table
                columns={[
                  {
                    header: 'Doctor Name',
                    render: (row) => (
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 font-black flex items-center justify-center text-sm">
                          {row.userId?.name?.charAt(0) || 'D'}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{row.userId?.name}</p>
                          <p className="text-xs text-slate-400">{row.userId?.email}</p>
                        </div>
                      </div>
                    ),
                  },
                  {
                    header: 'Specialization & Dept',
                    render: (row) => (
                      <div>
                        <p className="font-semibold text-slate-800">{row.specialization}</p>
                        <p className="text-xs text-slate-400">{row.department}</p>
                      </div>
                    ),
                  },
                  {
                    header: 'Experience & Qualifications',
                    render: (row) => (
                      <span className="text-xs text-slate-600">
                        {row.experienceYears} Years • {row.qualifications?.join(', ')}
                      </span>
                    ),
                  },
                  {
                    header: 'Consultation Fee',
                    render: (row) => <span className="font-black text-slate-800">${row.consultationFee}</span>,
                  },
                  {
                    header: 'Room',
                    accessor: 'roomNumber',
                  },
                  {
                    header: 'Status',
                    render: (row) => (
                      <button
                        onClick={() => handleToggleUser(row.userId?._id)}
                        className={`px-3 py-1 rounded-full text-xs font-bold transition ${
                          row.userId?.isActive
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                            : 'bg-red-100 text-red-800 hover:bg-red-200'
                        }`}
                      >
                        {row.userId?.isActive ? 'Active' : 'Deactivated'}
                      </button>
                    ),
                  },
                ]}
                data={doctors}
              />
            </div>
          )}

          {/* TAB 3: REGISTERED PATIENTS */}
          {activeTab === 'patients' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-extrabold text-slate-900">Registered Patient Directory</h1>
                <p className="text-sm text-slate-500">Electronic Health Record (EHR) profiles and emergency contact ledger</p>
              </div>

              <Table
                columns={[
                  {
                    header: 'Patient Details',
                    render: (row) => (
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-sky-100 text-sky-700 font-black flex items-center justify-center text-sm">
                          {row.userId?.name?.charAt(0) || 'P'}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{row.userId?.name}</p>
                          <p className="text-xs text-slate-400">{row.userId?.email} • {row.userId?.phone || 'No Phone'}</p>
                        </div>
                      </div>
                    ),
                  },
                  {
                    header: 'Age / Gender',
                    render: (row) => <span>{row.age} yrs • {row.gender}</span>,
                  },
                  {
                    header: 'Blood Group',
                    render: (row) => (
                      <span className="px-2.5 py-0.5 rounded-md font-bold bg-rose-50 text-rose-700 border border-rose-200 text-xs">
                        {row.bloodGroup}
                      </span>
                    ),
                  },
                  {
                    header: 'Emergency Contact',
                    render: (row) => (
                      <span className="text-xs text-slate-600">
                        {row.emergencyContact?.name} ({row.emergencyContact?.relationship}) • {row.emergencyContact?.phone}
                      </span>
                    ),
                  },
                  {
                    header: 'Registered Date',
                    render: (row) => <span className="text-xs text-slate-500">{new Date(row.createdAt).toLocaleDateString()}</span>,
                  },
                ]}
                data={patients}
              />
            </div>
          )}

          {/* TAB 4: APPOINTMENTS */}
          {activeTab === 'appointments' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-extrabold text-slate-900">Hospital Appointment Ledger</h1>
                <p className="text-sm text-slate-500">Master schedule of patient appointments and consultations</p>
              </div>

              <Table
                columns={[
                  {
                    header: 'Patient',
                    render: (row) => (
                      <div>
                        <p className="font-bold text-slate-900">{row.patientId?.name}</p>
                        <p className="text-xs text-slate-400">{row.patientId?.phone}</p>
                      </div>
                    ),
                  },
                  {
                    header: 'Doctor',
                    render: (row) => <span className="font-semibold text-sky-800">{row.doctorId?.name}</span>,
                  },
                  {
                    header: 'Schedule',
                    render: (row) => (
                      <span className="text-xs text-slate-700 font-medium">
                        {new Date(row.date).toLocaleDateString()} • {row.timeSlot}
                      </span>
                    ),
                  },
                  {
                    header: 'Reason',
                    accessor: 'reason',
                  },
                  {
                    header: 'Status',
                    render: (row) => (
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                          row.status === 'Confirmed'
                            ? 'bg-sky-100 text-sky-800'
                            : row.status === 'Completed'
                            ? 'bg-emerald-100 text-emerald-800'
                            : row.status === 'Cancelled'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {row.status}
                      </span>
                    ),
                  },
                  {
                    header: 'Actions',
                    render: (row) => (
                      <div className="flex items-center gap-1.5">
                        {row.status === 'Pending' && (
                          <button
                            onClick={() => handleUpdateAppStatus(row._id, 'Confirmed')}
                            className="p-1.5 text-xs font-bold text-sky-700 bg-sky-50 hover:bg-sky-100 rounded-lg"
                            title="Confirm"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}
                        {row.status !== 'Cancelled' && row.status !== 'Completed' && (
                          <button
                            onClick={() => handleUpdateAppStatus(row._id, 'Cancelled')}
                            className="p-1.5 text-xs font-bold text-red-700 bg-red-50 hover:bg-red-100 rounded-lg"
                            title="Cancel"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ),
                  },
                ]}
                data={appointments}
              />
            </div>
          )}

          {/* TAB 5: BEDS & ROOM INVENTORY */}
          {activeTab === 'beds' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-extrabold text-slate-900">Hospital Bed & Ward Floor Plan</h1>
                  <p className="text-sm text-slate-500">Live interactive ward occupancy, ICU allocation and real-time floor plan map</p>
                </div>
                <button
                  onClick={() => setIsBedModalOpen(true)}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold shadow transition"
                >
                  <Plus className="w-4 h-4" /> Add New Bed
                </button>
              </div>

              <VisualBedMap
                beds={beds}
                patients={patients.map((p) => ({
                  _id: p.userId?._id || p._id,
                  name: p.userId?.name || p.name,
                  email: p.userId?.email || p.email,
                  phone: p.userId?.phone || p.phone,
                }))}
                onAllocateBed={handleDirectAllocate}
                onReleaseBed={handleDirectRelease}
                loading={loading}
              />
            </div>
          )}

          {/* TAB 6: BILLING & FINANCIALS */}
          {activeTab === 'billing' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-extrabold text-slate-900">Hospital Billing & Invoices</h1>
                <p className="text-sm text-slate-500">Itemized financial records, revenue streams and patient payment status</p>
              </div>

              <Table
                columns={[
                  {
                    header: 'Invoice #',
                    render: (row) => <span className="font-mono font-bold text-sky-700">{row.invoiceNumber}</span>,
                  },
                  {
                    header: 'Patient Name',
                    render: (row) => <span className="font-bold text-slate-900">{row.patientId?.name}</span>,
                  },
                  {
                    header: 'Date',
                    render: (row) => <span className="text-xs text-slate-500">{new Date(row.invoiceDate).toLocaleDateString()}</span>,
                  },
                  {
                    header: 'Amount',
                    render: (row) => <span className="font-extrabold text-slate-900">${row.totalAmount?.toLocaleString()}</span>,
                  },
                  {
                    header: 'Payment Status',
                    render: (row) => (
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          row.paymentStatus === 'Paid'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {row.paymentStatus}
                      </span>
                    ),
                  },
                  {
                    header: 'Method',
                    accessor: 'paymentMethod',
                  },
                ]}
                data={invoices}
              />
            </div>
          )}

          {/* SYSTEM DESIGN & ARCHITECTURE TAB */}
          {activeTab === 'system_design' && <SystemDesignTab />}
        </main>
      </div>

      {/* CREATE DOCTOR MODAL */}
      <Modal isOpen={isDoctorModalOpen} onClose={() => setIsDoctorModalOpen(false)} title="Register New Medical Consultant">
        <form onSubmit={handleCreateDoctor} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 uppercase">Doctor Name *</label>
              <input
                type="text"
                required
                value={doctorForm.name}
                onChange={(e) => setDoctorForm({ ...doctorForm, name: e.target.value })}
                placeholder="Dr. Samantha Ray"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 mt-1"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 uppercase">Email Address *</label>
              <input
                type="email"
                required
                value={doctorForm.email}
                onChange={(e) => setDoctorForm({ ...doctorForm, email: e.target.value })}
                placeholder="samantha@hospital.com"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 mt-1"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 uppercase">Specialization</label>
              <input
                type="text"
                required
                value={doctorForm.specialization}
                onChange={(e) => setDoctorForm({ ...doctorForm, specialization: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 mt-1"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 uppercase">Department</label>
              <input
                type="text"
                required
                value={doctorForm.department}
                onChange={(e) => setDoctorForm({ ...doctorForm, department: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 mt-1"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="font-bold text-slate-700 uppercase">Fee ($)</label>
              <input
                type="number"
                min="0"
                value={doctorForm.consultationFee}
                onChange={(e) => setDoctorForm({ ...doctorForm, consultationFee: Number(e.target.value) })}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 mt-1"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 uppercase">Experience (Yrs)</label>
              <input
                type="number"
                min="0"
                value={doctorForm.experienceYears}
                onChange={(e) => setDoctorForm({ ...doctorForm, experienceYears: Number(e.target.value) })}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 mt-1"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 uppercase">Room #</label>
              <input
                type="text"
                value={doctorForm.roomNumber}
                onChange={(e) => setDoctorForm({ ...doctorForm, roomNumber: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 mt-1"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setIsDoctorModalOpen(false)}
              className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-lg shadow"
            >
              Add Doctor
            </button>
          </div>
        </form>
      </Modal>

      {/* CREATE BED MODAL */}
      <Modal isOpen={isBedModalOpen} onClose={() => setIsBedModalOpen(false)} title="Add Hospital Bed to Inventory">
        <form onSubmit={handleCreateBed} className="space-y-4 text-xs">
          <div>
            <label className="font-bold text-slate-700 uppercase">Bed Number (e.g. ICU-105) *</label>
            <input
              type="text"
              required
              value={bedForm.bedNumber}
              onChange={(e) => setBedForm({ ...bedForm, bedNumber: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 mt-1"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 uppercase">Bed Type</label>
              <select
                value={bedForm.type}
                onChange={(e) => setBedForm({ ...bedForm, type: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 mt-1"
              >
                <option value="ICU">ICU</option>
                <option value="General Ward">General Ward</option>
                <option value="Private Room">Private Room</option>
                <option value="Emergency">Emergency</option>
              </select>
            </div>
            <div>
              <label className="font-bold text-slate-700 uppercase">Daily Rate ($)</label>
              <input
                type="number"
                min="0"
                value={bedForm.dailyRate}
                onChange={(e) => setBedForm({ ...bedForm, dailyRate: Number(e.target.value) })}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 mt-1"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 uppercase">Ward / Floor Location</label>
            <input
              type="text"
              value={bedForm.ward}
              onChange={(e) => setBedForm({ ...bedForm, ward: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 mt-1"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setIsBedModalOpen(false)}
              className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-lg shadow"
            >
              Add Bed
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminDashboard;
