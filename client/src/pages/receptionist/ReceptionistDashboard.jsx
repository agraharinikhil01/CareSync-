import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import StatCard from '../../components/StatCard';
import Table from '../../components/Table';
import Modal from '../../components/Modal';
import { InvoiceGeneratorModal, InvoiceViewerModal } from '../../components/InvoiceModal';
import { VisualBedMap } from '../../components/VisualBedMap';
import {
  getAdminPatientsApi,
  getDoctorsListApi,
  getAppointmentsApi,
  createAppointmentApi,
  updateAppointmentStatusApi,
  getBedsApi,
  allocateBedApi,
  releaseBedApi,
  getInvoicesApi,
  registerApi,
} from '../../api/endpoints';
import {
  UserPlus,
  BedDouble,
  CreditCard,
  CalendarCheck,
  CheckCircle,
  Plus,
  Search,
  Clock,
  ArrowRight,
} from 'lucide-react';

const ReceptionistDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [beds, setBeds] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [bedSummary, setBedSummary] = useState({ total: 0, occupied: 0, available: 0 });
  const [loading, setLoading] = useState(true);

  // Patient Intake Form
  const [newPatientForm, setNewPatientForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: 'Patient@123',
    age: 30,
    gender: 'Male',
    bloodGroup: 'O+',
  });
  const [intakeSuccess, setIntakeSuccess] = useState('');
  const [intakeError, setIntakeError] = useState('');

  // Counter Appointment Form
  const [appForm, setAppForm] = useState({
    patientId: '',
    doctorId: '',
    date: new Date().toISOString().split('T')[0],
    timeSlot: '10:00 AM',
    reason: 'On-counter walk-in consultation',
    type: 'General Consultation',
  });
  const [appMsg, setAppMsg] = useState('');

  // Bed Allocation Modal
  const [selectedBedForAllocation, setSelectedBedForAllocation] = useState(null);
  const [allocatePatientId, setAllocatePatientId] = useState('');

  // Invoice Modals
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  useEffect(() => {
    fetchReceptionData();
  }, [activeTab]);

  const fetchReceptionData = async () => {
    try {
      setLoading(true);
      const [pRes, dRes, aRes, bRes, iRes] = await Promise.allSettled([
        getAdminPatientsApi(),
        getDoctorsListApi(),
        getAppointmentsApi(),
        getBedsApi(),
        getInvoicesApi(),
      ]);

      if (pRes.status === 'fulfilled' && pRes.value.data.success) setPatients(pRes.value.data.data);
      if (dRes.status === 'fulfilled' && dRes.value.data.success) setDoctors(dRes.value.data.data);
      if (aRes.status === 'fulfilled' && aRes.value.data.success) setAppointments(aRes.value.data.data);
      if (bRes.status === 'fulfilled' && bRes.value.data.success) {
        setBeds(bRes.value.data.data);
        if (bRes.value.data.summary) setBedSummary(bRes.value.data.summary);
      }
      if (iRes.status === 'fulfilled' && iRes.value.data.success) setInvoices(iRes.value.data.data);
    } catch (error) {
      console.error('Error loading receptionist data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePatientIntake = async (e) => {
    e.preventDefault();
    setIntakeError('');
    setIntakeSuccess('');
    try {
      const res = await registerApi({ ...newPatientForm, role: 'patient' });
      if (res.data.success) {
        setIntakeSuccess(`Patient ${newPatientForm.name} registered with portal login password: Patient@123`);
        setNewPatientForm({
          name: '',
          email: '',
          phone: '',
          password: 'Patient@123',
          age: 30,
          gender: 'Male',
          bloodGroup: 'O+',
        });
        fetchReceptionData();
      }
    } catch (err) {
      setIntakeError(err.response?.data?.message || 'Failed to register patient');
    }
  };

  const handleBookAppointment = async (e) => {
    e.preventDefault();
    setAppMsg('');
    try {
      const res = await createAppointmentApi(appForm);
      if (res.data.success) {
        setAppMsg('Appointment booked & initial consultation invoice auto-generated!');
        fetchReceptionData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error booking appointment');
    }
  };

  const handleAllocateBed = async (e) => {
    e.preventDefault();
    if (!selectedBedForAllocation || !allocatePatientId) return;
    try {
      const res = await allocateBedApi(selectedBedForAllocation._id, { patientId: allocatePatientId });
      if (res.data.success) {
        setSelectedBedForAllocation(null);
        setAllocatePatientId('');
        fetchReceptionData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Allocation failed');
    }
  };

  const handleReleaseBed = async (bedId) => {
    if (!window.confirm('Confirm patient discharge and mark this bed available?')) return;
    try {
      const res = await releaseBedApi(bedId);
      if (res.data.success) {
        fetchReceptionData();
      }
    } catch (err) {
      alert('Failed to release bed');
    }
  };

  const handleDirectAllocate = async (bedId, patientId) => {
    const res = await allocateBedApi(bedId, { patientId });
    if (res.data.success) {
      await fetchReceptionData();
    }
  };

  const handleDirectRelease = async (bedId) => {
    const res = await releaseBedApi(bedId);
    if (res.data.success) {
      await fetchReceptionData();
    }
  };

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
                  <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Front Desk & Billing Command</h1>
                  <p className="text-sm text-slate-500">Counter registrations, bed admissions & billing clearance</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setActiveTab('register_patient')}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold shadow transition"
                  >
                    <UserPlus className="w-4 h-4" /> New Patient Intake
                  </button>
                  <button
                    onClick={() => setIsInvoiceModalOpen(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow transition"
                  >
                    <Plus className="w-4 h-4" /> Create Bill
                  </button>
                </div>
              </div>

              {/* KPI Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                  title="Registered Patients"
                  value={patients.length}
                  subtitle="Total hospital patient records"
                  icon={UserPlus}
                  color="sky"
                />
                <StatCard
                  title="Available Beds"
                  value={bedSummary.available}
                  subtitle={`${bedSummary.occupied} / ${bedSummary.total} currently occupied`}
                  icon={BedDouble}
                  color="emerald"
                />
                <StatCard
                  title="Today's Appointments"
                  value={appointments.length}
                  subtitle="Active consultation queue"
                  icon={CalendarCheck}
                  color="purple"
                />
                <StatCard
                  title="Pending Bills"
                  value={invoices.filter((i) => i.paymentStatus === 'Pending').length}
                  subtitle="Awaiting counter clearance"
                  icon={CreditCard}
                  color="amber"
                />
              </div>

              {/* Recent Invoices Ledger */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="font-bold text-slate-900 text-base">Counter Billing & Invoices Queue</h3>
                  <button onClick={() => setActiveTab('billing')} className="text-xs font-bold text-sky-600">
                    View All Invoices →
                  </button>
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
                      header: 'Amount',
                      render: (row) => <span className="font-extrabold text-slate-900">${row.totalAmount?.toLocaleString()}</span>,
                    },
                    {
                      header: 'Status',
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
                      header: 'Action',
                      render: (row) => (
                        <button
                          onClick={() => setSelectedInvoice(row)}
                          className="px-3 py-1 bg-sky-50 text-sky-700 hover:bg-sky-100 rounded-lg text-xs font-bold border border-sky-200"
                        >
                          Collect Payment / View
                        </button>
                      ),
                    },
                  ]}
                  data={invoices.slice(0, 6)}
                />
              </div>
            </div>
          )}

          {/* TAB 2: REGISTER PATIENT */}
          {activeTab === 'register_patient' && (
            <div className="space-y-6 max-w-3xl">
              <div>
                <h1 className="text-2xl font-extrabold text-slate-900">On-Counter Patient Intake</h1>
                <p className="text-sm text-slate-500">Register new hospital patients immediately at front desk</p>
              </div>

              {intakeSuccess && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-bold flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-emerald-600" />
                  {intakeSuccess}
                </div>
              )}

              {intakeError && (
                <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-xs font-bold">
                  {intakeError}
                </div>
              )}

              <form onSubmit={handlePatientIntake} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 uppercase">Patient Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Alex Morgan"
                      value={newPatientForm.name}
                      onChange={(e) => setNewPatientForm({ ...newPatientForm, name: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 mt-1"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 uppercase">Email Address *</label>
                    <input
                      type="email"
                      required
                      placeholder="alex.morgan@email.com"
                      value={newPatientForm.email}
                      onChange={(e) => setNewPatientForm({ ...newPatientForm, email: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 mt-1"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 uppercase">Phone Number</label>
                    <input
                      type="text"
                      placeholder="+1 555-0199"
                      value={newPatientForm.phone}
                      onChange={(e) => setNewPatientForm({ ...newPatientForm, phone: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 mt-1"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 uppercase">Age</label>
                    <input
                      type="number"
                      min="1"
                      value={newPatientForm.age}
                      onChange={(e) => setNewPatientForm({ ...newPatientForm, age: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 mt-1"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 uppercase">Blood Group</label>
                    <select
                      value={newPatientForm.bloodGroup}
                      onChange={(e) => setNewPatientForm({ ...newPatientForm, bloodGroup: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 mt-1 font-bold"
                    >
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end pt-3">
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl shadow-md"
                  >
                    Register Patient & Create EHR
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 3: BOOK APPOINTMENT */}
          {activeTab === 'appointments' && (
            <div className="space-y-6 max-w-3xl">
              <div>
                <h1 className="text-2xl font-extrabold text-slate-900">Manual Appointment Booking</h1>
                <p className="text-sm text-slate-500">Book patient consultation directly with available specialist</p>
              </div>

              {appMsg && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-bold flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-emerald-600" />
                  {appMsg}
                </div>
              )}

              <form onSubmit={handleBookAppointment} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 uppercase">Select Patient *</label>
                    <select
                      required
                      value={appForm.patientId}
                      onChange={(e) => setAppForm({ ...appForm, patientId: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 mt-1"
                    >
                      <option value="">-- Choose Patient --</option>
                      {patients.map((p) => (
                        <option key={p.userId?._id || p._id} value={p.userId?._id || p._id}>
                          {p.userId?.name || p.name} ({p.userId?.email || p.email})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 uppercase">Select Doctor *</label>
                    <select
                      required
                      value={appForm.doctorId}
                      onChange={(e) => setAppForm({ ...appForm, doctorId: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 mt-1"
                    >
                      <option value="">-- Choose Doctor --</option>
                      {doctors.map((d) => (
                        <option key={d.userId?._id || d._id} value={d.userId?._id || d._id}>
                          {d.userId?.name || d.name} ({d.specialization}) - ${d.consultationFee}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 uppercase">Date *</label>
                    <input
                      type="date"
                      required
                      value={appForm.date}
                      onChange={(e) => setAppForm({ ...appForm, date: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 mt-1"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 uppercase">Time Slot *</label>
                    <select
                      value={appForm.timeSlot}
                      onChange={(e) => setAppForm({ ...appForm, timeSlot: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 mt-1"
                    >
                      <option value="09:00 AM">09:00 AM</option>
                      <option value="10:00 AM">10:00 AM</option>
                      <option value="11:30 AM">11:30 AM</option>
                      <option value="02:00 PM">02:00 PM</option>
                      <option value="04:00 PM">04:00 PM</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 uppercase">Reason / Symptoms</label>
                  <textarea
                    rows="2"
                    value={appForm.reason}
                    onChange={(e) => setAppForm({ ...appForm, reason: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 mt-1"
                  ></textarea>
                </div>

                <div className="flex justify-end pt-3">
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl shadow-md"
                  >
                    Confirm Consultation Booking
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 4: BED ALLOCATION */}
          {activeTab === 'bed_allocation' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-extrabold text-slate-900">Hospital Bed & Ward Floor Plan</h1>
                <p className="text-sm text-slate-500">Interactive live visual bed allocation map across all hospital floors</p>
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

          {/* TAB 5: BILLING */}
          {activeTab === 'billing' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-extrabold text-slate-900">Hospital Invoicing & Payments</h1>
                  <p className="text-sm text-slate-500">Issue custom hospital invoices, collect payments and print receipts</p>
                </div>
                <button
                  onClick={() => setIsInvoiceModalOpen(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow"
                >
                  <Plus className="w-4 h-4" /> Create New Bill
                </button>
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
                    header: 'Status',
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
                    header: 'Actions',
                    render: (row) => (
                      <button
                        onClick={() => setSelectedInvoice(row)}
                        className="px-3 py-1 bg-sky-50 text-sky-700 hover:bg-sky-100 rounded-lg text-xs font-bold border border-sky-200"
                      >
                        Collect / View Receipt
                      </button>
                    ),
                  },
                ]}
                data={invoices}
              />
            </div>
          )}
        </main>
      </div>

      {/* BED ALLOCATION MODAL */}
      <Modal
        isOpen={!!selectedBedForAllocation}
        onClose={() => setSelectedBedForAllocation(null)}
        title={`Allocate Bed ${selectedBedForAllocation?.bedNumber}`}
      >
        <form onSubmit={handleAllocateBed} className="space-y-4 text-xs">
          <div>
            <label className="font-bold text-slate-700 uppercase">Select Patient for Admission *</label>
            <select
              required
              value={allocatePatientId}
              onChange={(e) => setAllocatePatientId(e.target.value)}
              className="w-full px-3 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 mt-1"
            >
              <option value="">-- Choose Patient --</option>
              {patients.map((p) => (
                <option key={p.userId?._id || p._id} value={p.userId?._id || p._id}>
                  {p.userId?.name || p.name} ({p.userId?.email || p.email})
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setSelectedBedForAllocation(null)}
              className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-lg shadow"
            >
              Confirm Bed Allocation
            </button>
          </div>
        </form>
      </Modal>

      {/* CREATE INVOICE MODAL */}
      <InvoiceGeneratorModal
        isOpen={isInvoiceModalOpen}
        onClose={() => setIsInvoiceModalOpen(false)}
        patients={patients}
        doctors={doctors}
        onSuccess={() => fetchReceptionData()}
      />

      {/* INVOICE VIEWER & PAYMENT MODAL */}
      <InvoiceViewerModal
        isOpen={!!selectedInvoice}
        onClose={() => setSelectedInvoice(null)}
        invoice={selectedInvoice}
        onPaymentSuccess={() => {
          fetchReceptionData();
          setSelectedInvoice(null);
        }}
      />
    </div>
  );
};

export default ReceptionistDashboard;
