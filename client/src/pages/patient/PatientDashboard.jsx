import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import StatCard from '../../components/StatCard';
import Table from '../../components/Table';
import Modal from '../../components/Modal';
import { PrescriptionViewerModal } from '../../components/PrescriptionModal';
import { InvoiceViewerModal } from '../../components/InvoiceModal';
import HealthPassportModal from '../../components/HealthPassportModal';
import { VisualBedMap } from '../../components/VisualBedMap';
import { useAuth } from '../../context/AuthContext';
import {
  getPatientDashboardApi,
  getDoctorsListApi,
  createAppointmentApi,
  getPatientProfileApi,
  updatePatientProfileApi,
  getPrescriptionsApi,
  getInvoicesApi,
  updateAppointmentStatusApi,
  getBedsApi,
  allocateBedApi,
  releaseBedApi,
} from '../../api/endpoints';
import {
  CalendarCheck,
  FileText,
  CreditCard,
  HeartPulse,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  User,
  Shield,
  Stethoscope,
  QrCode,
  AlertTriangle,
  ShieldAlert,
  Sparkles,
  Phone,
  PhoneCall,
  Globe,
} from 'lucide-react';
import { CURRENCIES, formatCurrency } from '../../utils/currency';

const PatientDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [dashboardData, setDashboardData] = useState(null);
  const [isPassportOpen, setIsPassportOpen] = useState(false);
  const [preferredCurrency, setPreferredCurrency] = useState('INR');
  const [doctors, setDoctors] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [beds, setBeds] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Booking Form state
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [specializationFilter, setSpecializationFilter] = useState('All');
  const [doctorSearch, setDoctorSearch] = useState('');
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTimeSlot, setBookingTimeSlot] = useState('10:00 AM');
  const [bookingReason, setBookingReason] = useState('');
  const [bookingType, setBookingType] = useState('General Consultation');
  const [bookingSuccessMsg, setBookingSuccessMsg] = useState('');
  const [bookingError, setBookingError] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);

  // Modals for viewing Rx and Invoices
  const [viewPrescription, setViewPrescription] = useState(null);
  const [viewInvoice, setViewInvoice] = useState(null);

  // Profile Edit
  const [profileForm, setProfileForm] = useState({
    age: '',
    gender: 'Male',
    bloodGroup: 'B+',
    emergencyContact: { name: '', phone: '', relationship: '' },
    address: { street: '', city: '', state: '', zipCode: '' },
    allergies: '',
  });

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    try {
      setLoading(true);
      if (activeTab === 'overview') {
        const [dashRes, profRes] = await Promise.allSettled([
          getPatientDashboardApi(),
          getPatientProfileApi(),
        ]);
        if (dashRes.status === 'fulfilled' && dashRes.value.data.success) {
          setDashboardData(dashRes.value.data.data);
        }
        if (profRes.status === 'fulfilled' && profRes.value.data.success) {
          setProfile(profRes.value.data.data);
        }
      } else if (activeTab === 'book') {
        const res = await getDoctorsListApi();
        if (res.data.success) setDoctors(res.data.data);
      } else if (activeTab === 'beds') {
        const res = await getBedsApi();
        if (res.data.success) setBeds(res.data.data);
      } else if (activeTab === 'prescriptions') {
        const res = await getPrescriptionsApi();
        if (res.data.success) setPrescriptions(res.data.data);
      } else if (activeTab === 'invoices') {
        const res = await getInvoicesApi();
        if (res.data.success) setInvoices(res.data.data);
      } else if (activeTab === 'profile') {
        const res = await getPatientProfileApi();
        if (res.data.success) {
          setProfile(res.data.data);
          setProfileForm({
            age: res.data.data.age || '',
            gender: res.data.data.gender || 'Male',
            bloodGroup: res.data.data.bloodGroup || 'B+',
            emergencyContact: res.data.data.emergencyContact || { name: '', phone: '', relationship: '' },
            address: res.data.data.address || { street: '', city: '', state: '', zipCode: '' },
            allergies: res.data.data.allergies?.join(', ') || '',
          });
        }
      }
    } catch (error) {
      console.error('Error loading patient data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBookAppointment = async (e) => {
    e.preventDefault();
    setBookingError('');
    setBookingSuccessMsg('');

    if (!selectedDoctor || !bookingDate || !bookingReason) {
      setBookingError('Please select a doctor, date, and appointment reason');
      return;
    }

    try {
      setBookingLoading(true);
      const res = await createAppointmentApi({
        doctorId: selectedDoctor.userId?._id || selectedDoctor.userId,
        date: bookingDate,
        timeSlot: bookingTimeSlot,
        reason: bookingReason,
        type: bookingType,
      });

      if (res.data.success) {
        setBookingSuccessMsg('Appointment booked successfully! Our staff will confirm your slot.');
        setSelectedDoctor(null);
        setBookingReason('');
      }
    } catch (err) {
      setBookingError(err.response?.data?.message || 'Failed to book appointment');
    } finally {
      setBookingLoading(false);
    }
  };

  const handleCancelAppointment = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) return;
    try {
      const res = await updateAppointmentStatusApi(id, { status: 'Cancelled' });
      if (res.data.success) {
        fetchData();
      }
    } catch (err) {
      alert('Failed to cancel appointment');
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        age: Number(profileForm.age),
        gender: profileForm.gender,
        bloodGroup: profileForm.bloodGroup,
        emergencyContact: profileForm.emergencyContact,
        address: profileForm.address,
        allergies: profileForm.allergies.split(',').map((s) => s.trim()).filter(Boolean),
      };
      const res = await updatePatientProfileApi(payload);
      if (res.data.success) {
        alert('Health profile updated successfully');
        setProfile(res.data.data);
      }
    } catch (err) {
      alert('Failed to update profile');
    }
  };

  const handlePatientAllocateBed = async (bedId) => {
    const res = await allocateBedApi(bedId, { patientId: user._id });
    if (res.data.success) {
      const bRes = await getBedsApi();
      if (bRes.data.success) setBeds(bRes.data.data);
    }
  };

  const handlePatientReleaseBed = async (bedId) => {
    const res = await releaseBedApi(bedId);
    if (res.data.success) {
      const bRes = await getBedsApi();
      if (bRes.data.success) setBeds(bRes.data.data);
    }
  };

  const filteredDoctors = doctors.filter((doc) => {
    const matchSpec = specializationFilter === 'All' || doc.specialization.toLowerCase().includes(specializationFilter.toLowerCase());
    const matchSearch = doc.userId?.name?.toLowerCase().includes(doctorSearch.toLowerCase()) || doc.specialization.toLowerCase().includes(doctorSearch.toLowerCase());
    return matchSpec && matchSearch;
  });

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
                  <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Patient Health Portal</h1>
                  <p className="text-sm text-slate-500">Appointments, prescriptions, billing records and health history</p>
                </div>
                <button
                  onClick={() => setActiveTab('book')}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold shadow transition"
                >
                  <CalendarCheck className="w-4 h-4" /> Book New Consultation
                </button>
              </div>

              {/* KPI Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                  title="Upcoming Appointments"
                  value={dashboardData?.metrics?.upcomingCount || 0}
                  subtitle="Scheduled visits"
                  icon={CalendarCheck}
                  color="sky"
                />
                <StatCard
                  title="Prescriptions Issued"
                  value={dashboardData?.metrics?.totalPrescriptions || 0}
                  subtitle="Active & past medications"
                  icon={FileText}
                  color="emerald"
                />
                <StatCard
                  title="Total Consultations"
                  value={dashboardData?.metrics?.totalAppointments || 0}
                  subtitle="Lifetime hospital visits"
                  icon={HeartPulse}
                  color="purple"
                />
                <StatCard
                  title="Pending Invoices"
                  value={`$${(dashboardData?.metrics?.pendingBills || 0).toLocaleString()}`}
                  subtitle="Outstanding balance"
                  icon={CreditCard}
                  color={dashboardData?.metrics?.pendingBills > 0 ? 'rose' : 'emerald'}
                />
              </div>

              {/* EMERGENCY DIGITAL HEALTH PASSPORT HERO BANNER */}
              <div className="bg-gradient-to-r from-slate-950 via-sky-950 to-slate-900 rounded-3xl p-6 sm:p-7 text-white shadow-xl border-2 border-sky-500/30 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
                <div className="space-y-3 relative z-10">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[11px] font-black uppercase tracking-wider flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
                      Emergency SOS Active
                    </span>
                    <span className="text-xs text-sky-400 font-mono font-bold">
                      ID: HMS-PT-{user?._id ? user._id.slice(-6).toUpperCase() : '000000'}
                    </span>
                  </div>

                  <div>
                    <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
                      Digital Emergency Health Passport <Sparkles className="w-5 h-5 text-amber-400" />
                    </h2>
                    <p className="text-xs text-slate-300 max-w-xl mt-1 leading-relaxed">
                      Instant scannable QR ID card with your verified blood group ({profile?.bloodGroup || 'B+'}), documented life-saving drug allergies, and primary kin emergency contact for trauma & first responders.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 pt-1">
                    <button
                      onClick={() => setIsPassportOpen(true)}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sky-400 hover:bg-sky-300 text-slate-950 font-black text-xs shadow-lg shadow-sky-400/30 transition-all cursor-pointer"
                    >
                      <QrCode className="w-4 h-4 text-slate-950" /> View & Print Emergency QR Card
                    </button>
                    <a
                      href={`/emergency/${user?._id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/15 transition-all"
                    >
                      Preview Public Scan Page →
                    </a>
                  </div>
                </div>

                {/* Mini Passport Chip */}
                <div
                  onClick={() => setIsPassportOpen(true)}
                  className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20 flex items-center gap-4 cursor-pointer hover:border-sky-400/60 transition-all flex-shrink-0"
                >
                  <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center p-1.5 shadow-md">
                    <QrCode className="w-11 h-11 text-slate-900" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-black text-rose-300 block">BLOOD GROUP</span>
                    <span className="text-2xl font-black text-white">{profile?.bloodGroup || 'B+'}</span>
                    <span className="text-[10px] text-sky-300 font-semibold block mt-0.5">Click to enlarge</span>
                  </div>
                </div>
              </div>

              {/* Upcoming Appointments */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="font-bold text-slate-900 text-base">Your Upcoming Consultations</h3>
                  <button onClick={() => setActiveTab('book')} className="text-xs font-bold text-sky-600">
                    Find Doctor →
                  </button>
                </div>

                {dashboardData?.upcomingAppointments && dashboardData.upcomingAppointments.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {dashboardData.upcomingAppointments.map((app) => (
                      <div key={app._id} className="p-4 rounded-2xl border border-slate-200 bg-slate-50/60 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center font-bold">
                              <Stethoscope className="w-5 h-5" />
                            </div>
                            <div>
                              <p className="font-bold text-slate-900 text-sm">{app.doctorId?.name}</p>
                              <p className="text-xs text-slate-500">{app.type}</p>
                            </div>
                          </div>
                          <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-sky-100 text-sky-800">
                            {app.timeSlot}
                          </span>
                        </div>

                        <div className="text-xs bg-white p-2.5 rounded-xl border border-slate-200">
                          <p className="text-slate-500 font-medium">Date: <span className="font-bold text-slate-800">{new Date(app.date).toLocaleDateString()}</span></p>
                          <p className="text-slate-600 mt-1"><span className="font-medium">Reason:</span> {app.reason}</p>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-slate-200 text-xs">
                          <span className="px-2 py-0.5 rounded-full font-bold bg-amber-100 text-amber-800">{app.status}</span>
                          <button
                            onClick={() => handleCancelAppointment(app._id)}
                            className="text-xs font-bold text-red-600 hover:text-red-700"
                          >
                            Cancel Appointment
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-8 text-center text-slate-400 font-medium text-sm">
                    No upcoming appointments scheduled. Need care? Book with our specialists today.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: BOOK APPOINTMENT */}
          {activeTab === 'book' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-extrabold text-slate-900">Find a Specialist & Book Appointment</h1>
                <p className="text-sm text-slate-500">Select department, check doctor qualifications & pick your consultation slot</p>
              </div>

              {bookingSuccessMsg && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  {bookingSuccessMsg}
                </div>
              )}

              {bookingError && (
                <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-xs font-bold">
                  {bookingError}
                </div>
              )}

              {/* Doctor Directory Filters */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 flex flex-wrap items-center gap-3">
                <div className="flex-1 min-w-[200px] relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    placeholder="Search doctor by name or specialty..."
                    value={doctorSearch}
                    onChange={(e) => setDoctorSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-slate-500" />
                  <select
                    value={specializationFilter}
                    onChange={(e) => setSpecializationFilter(e.target.value)}
                    className="px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 font-medium"
                  >
                    <option value="All">All Departments</option>
                    <option value="Cardiologist">Cardiology</option>
                    <option value="Neurologist">Neurology</option>
                    <option value="Pediatrician">Pediatrics</option>
                    <option value="General">General Medicine</option>
                  </select>
                </div>
              </div>

              {/* Doctor Selection Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredDoctors.map((doc) => {
                  const isSelected = selectedDoctor?._id === doc._id;
                  return (
                    <div
                      key={doc._id}
                      onClick={() => setSelectedDoctor(doc)}
                      className={`p-5 rounded-2xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'border-sky-500 bg-sky-50/50 shadow-md ring-2 ring-sky-500/20'
                          : 'border-slate-200 bg-white hover:border-sky-300 shadow-sm'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-sky-600 to-primary-400 text-white font-black flex items-center justify-center text-base shadow-sm">
                            {doc.userId?.name?.charAt(0) || 'D'}
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-900 text-sm">{doc.userId?.name}</h4>
                            <p className="text-xs font-semibold text-sky-700">{doc.specialization}</p>
                          </div>
                        </div>
                      </div>

                      <div className="mt-3 space-y-1.5 text-xs text-slate-600">
                        <p>Department: <span className="font-medium text-slate-800">{doc.department}</span></p>
                        <p>Experience: <span className="font-medium text-slate-800">{doc.experienceYears} Years</span></p>
                        <p>Consultation Fee: <span className="font-extrabold text-slate-900">${doc.consultationFee}</span></p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                        <span className="text-slate-400 font-medium">Room: {doc.roomNumber || 'Op-Desk'}</span>
                        <button
                          type="button"
                          className={`px-3 py-1.5 rounded-xl font-bold text-xs ${
                            isSelected
                              ? 'bg-sky-600 text-white'
                              : 'bg-slate-100 text-slate-700 hover:bg-sky-50 hover:text-sky-700'
                          }`}
                        >
                          {isSelected ? '✓ Selected' : 'Select Doctor'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Booking Confirmation Box */}
              {selectedDoctor && (
                <div className="bg-white p-6 rounded-3xl border border-sky-200 shadow-lg space-y-4">
                  <h3 className="text-base font-bold text-slate-900">
                    Schedule with {selectedDoctor.userId?.name} ({selectedDoctor.specialization})
                  </h3>

                  <form onSubmit={handleBookAppointment} className="space-y-4 text-xs">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="font-bold text-slate-700 uppercase">Consultation Date *</label>
                        <input
                          type="date"
                          required
                          min={new Date().toISOString().split('T')[0]}
                          value={bookingDate}
                          onChange={(e) => setBookingDate(e.target.value)}
                          className="w-full px-3.5 py-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 mt-1"
                        />
                      </div>

                      <div>
                        <label className="font-bold text-slate-700 uppercase">Preferred Time Slot *</label>
                        <select
                          value={bookingTimeSlot}
                          onChange={(e) => setBookingTimeSlot(e.target.value)}
                          className="w-full px-3.5 py-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 mt-1"
                        >
                          <option value="09:00 AM">09:00 AM</option>
                          <option value="10:00 AM">10:00 AM</option>
                          <option value="11:30 AM">11:30 AM</option>
                          <option value="02:00 PM">02:00 PM</option>
                          <option value="03:30 PM">03:30 PM</option>
                          <option value="04:30 PM">04:30 PM</option>
                        </select>
                      </div>

                      <div>
                        <label className="font-bold text-slate-700 uppercase">Visit Type</label>
                        <select
                          value={bookingType}
                          onChange={(e) => setBookingType(e.target.value)}
                          className="w-full px-3.5 py-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 mt-1"
                        >
                          <option value="General Consultation">General Consultation</option>
                          <option value="Follow-up">Follow-up</option>
                          <option value="Routine Checkup">Routine Checkup</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 uppercase">Reason for Consultation *</label>
                      <textarea
                        rows="2"
                        required
                        placeholder="Briefly describe your symptoms or reason for visit..."
                        value={bookingReason}
                        onChange={(e) => setBookingReason(e.target.value)}
                        className="w-full px-3.5 py-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 mt-1"
                      ></textarea>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <p className="text-slate-500">
                        Consultation fee: <span className="font-bold text-slate-900">${selectedDoctor.consultationFee}</span> (Payable on counter/online)
                      </p>
                      <button
                        type="submit"
                        disabled={bookingLoading}
                        className="px-6 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl shadow-md disabled:opacity-50"
                      >
                        {bookingLoading ? 'Confirming...' : 'Confirm Appointment'}
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          )}

          {/* TAB: BEDS & WARD MAP */}
          {activeTab === 'beds' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-extrabold text-slate-900">Hospital Beds & Ward Floor Plan</h1>
                <p className="text-sm text-slate-500">View real-time room availability, ward amenities and self-reserve a bed</p>
              </div>

              <VisualBedMap
                beds={beds}
                patients={user ? [{ _id: user._id, name: user.name, email: user.email, phone: user.phone }] : []}
                onAllocateBed={handlePatientAllocateBed}
                onReleaseBed={handlePatientReleaseBed}
                loading={loading}
              />
            </div>
          )}

          {/* TAB 3: PRESCRIPTIONS */}
          {activeTab === 'prescriptions' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-extrabold text-slate-900">My Medical Prescriptions</h1>
                <p className="text-sm text-slate-500">Digital records of doctor diagnosis, medicines and instructions</p>
              </div>

              <Table
                columns={[
                  {
                    header: 'Doctor Name',
                    render: (row) => <span className="font-bold text-slate-900">{row.doctorId?.name}</span>,
                  },
                  {
                    header: 'Diagnosis',
                    accessor: 'diagnosis',
                  },
                  {
                    header: 'Medicines Prescribed',
                    render: (row) => (
                      <span className="text-xs text-slate-600 font-medium">
                        {row.medicines?.map((m) => m.name).join(', ') || 'None'}
                      </span>
                    ),
                  },
                  {
                    header: 'Date',
                    render: (row) => <span className="text-xs text-slate-500">{new Date(row.date).toLocaleDateString()}</span>,
                  },
                  {
                    header: 'Action',
                    render: (row) => (
                      <button
                        onClick={() => setViewPrescription(row)}
                        className="px-3 py-1.5 text-xs font-bold text-sky-700 bg-sky-50 hover:bg-sky-100 rounded-lg border border-sky-200"
                      >
                        View & Download Rx
                      </button>
                    ),
                  },
                ]}
                data={prescriptions}
              />
            </div>
          )}

          {/* TAB 4: BILLING & INVOICES */}
          {activeTab === 'invoices' && (() => {
            const pendingTotal = invoices
              .filter((b) => b.paymentStatus === 'Pending')
              .reduce((acc, b) => acc + (Number(b.totalAmount) || 0), 0);
            const paidTotal = invoices
              .filter((b) => b.paymentStatus === 'Paid')
              .reduce((acc, b) => acc + (Number(b.totalAmount) || 0), 0);

            const pendingFmt = formatCurrency(pendingTotal, preferredCurrency);
            const paidFmt = formatCurrency(paidTotal, preferredCurrency);

            return (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h1 className="text-2xl font-extrabold text-slate-900">Hospital Billing & Online Payments</h1>
                    <p className="text-sm text-slate-500">Pay medical bills online in your local currency with instant receipts</p>
                  </div>

                  {/* GLOBAL CURRENCY SWITCHER */}
                  <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-1.5 flex-wrap">
                    <span className="text-[11px] font-bold text-slate-500 mr-1 flex items-center gap-1 pl-1">
                      <Globe className="w-3.5 h-3.5 text-sky-600" /> Currency:
                    </span>
                    {Object.keys(CURRENCIES).map((code) => {
                      const c = CURRENCIES[code];
                      const isSelected = preferredCurrency === code;
                      return (
                        <button
                          key={code}
                          type="button"
                          onClick={() => setPreferredCurrency(code)}
                          className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1 border ${
                            isSelected
                              ? 'bg-sky-600 text-white border-sky-600 shadow-md shadow-sky-600/30'
                              : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          <span>{c.flag}</span>
                          <span>{c.code}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* BILLING SUMMARY CARDS IN PREFERRED CURRENCY */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 p-5 rounded-2xl border border-amber-200 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-amber-800 uppercase tracking-wider block">
                        Total Pending Balance ({pendingFmt.code})
                      </span>
                      <p className="text-2xl font-black text-amber-900 mt-1">{pendingFmt.formatted}</p>
                      <p className="text-[11px] text-amber-700 mt-0.5">Awaiting instant clearance</p>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-lg shadow-amber-500/30">
                      <CreditCard className="w-6 h-6" />
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 p-5 rounded-2xl border border-emerald-200 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider block">
                        Total Paid Lifetime ({paidFmt.code})
                      </span>
                      <p className="text-2xl font-black text-emerald-900 mt-1">{paidFmt.formatted}</p>
                      <p className="text-[11px] text-emerald-700 mt-0.5">Verified settled hospital fees</p>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/30">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                  </div>
                </div>

                {/* INVOICES TABLE */}
                <Table
                  columns={[
                    {
                      header: 'Invoice #',
                      render: (row) => <span className="font-mono font-bold text-sky-700">{row.invoiceNumber}</span>,
                    },
                    {
                      header: 'Billed Date',
                      render: (row) => <span className="text-xs text-slate-500">{new Date(row.invoiceDate).toLocaleDateString()}</span>,
                    },
                    {
                      header: `Amount (${pendingFmt.code})`,
                      render: (row) => {
                        const rowFmt = formatCurrency(row.totalAmount, preferredCurrency);
                        return <span className="font-black text-slate-900">{rowFmt.formatted}</span>;
                      },
                    },
                    {
                      header: 'Status',
                      render: (row) => (
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1 ${
                            row.paymentStatus === 'Paid'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : 'bg-amber-100 text-amber-800 border border-amber-300 animate-pulse'
                          }`}
                        >
                          {row.paymentStatus === 'Paid' ? '✓ Paid' : '● Pending'}
                        </span>
                      ),
                    },
                    {
                      header: 'Action / Payment',
                      render: (row) => {
                        const rowFmt = formatCurrency(row.totalAmount, preferredCurrency);
                        return (
                          <div className="flex items-center gap-2">
                            {row.paymentStatus === 'Paid' ? (
                              <button
                                onClick={() => setViewInvoice(row)}
                                className="px-3.5 py-1.5 text-xs font-bold text-sky-700 bg-sky-50 hover:bg-sky-100 rounded-xl border border-sky-200 transition"
                              >
                                📄 View Paid Receipt
                              </button>
                            ) : (
                              <button
                                onClick={() => setViewInvoice(row)}
                                className="px-4 py-1.5 text-xs font-black text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md shadow-emerald-600/30 transition flex items-center gap-1.5 animate-bounce"
                              >
                                <CreditCard className="w-3.5 h-3.5" /> Pay {rowFmt.formatted} Now
                              </button>
                            )}
                          </div>
                        );
                      },
                    },
                  ]}
                  data={invoices}
                />
              </div>
            );
          })()}

          {/* TAB 5: HEALTH PROFILE & EHR */}
          {activeTab === 'profile' && (() => {
            const commonAllergiesList = [
              'Penicillin',
              'Sulfa drugs',
              'Aspirin',
              'Ibuprofen',
              'Peanuts',
              'Dairy / Milk',
              'Eggs',
              'Dust / Pollen',
              'Latex',
            ];

            const currentAllergies = profileForm.allergies
              ? profileForm.allergies.split(',').map((s) => s.trim()).filter(Boolean)
              : [];

            const toggleAllergy = (tag) => {
              const exists = currentAllergies.some((a) => a.toLowerCase() === tag.toLowerCase());
              let updated;
              if (exists) {
                updated = currentAllergies.filter((a) => a.toLowerCase() !== tag.toLowerCase());
              } else {
                updated = [...currentAllergies, tag];
              }
              setProfileForm({ ...profileForm, allergies: updated.join(', ') });
            };

            // Calculate profile completeness %
            let score = 0;
            if (profileForm.age) score += 15;
            if (profileForm.gender) score += 10;
            if (profileForm.bloodGroup) score += 25;
            if (profileForm.allergies) score += 15;
            if (profileForm.emergencyContact?.name && profileForm.emergencyContact?.phone) score += 25;
            if (profileForm.address?.city) score += 10;
            const completionPercent = Math.min(score, 100);

            return (
              <div className="space-y-6 max-w-4xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h1 className="text-2xl font-extrabold text-slate-900">Health Profile & Emergency Card</h1>
                    <p className="text-sm text-slate-500">Update medical history, vital stats and emergency information</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsPassportOpen(true)}
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-slate-900 to-sky-950 text-white rounded-xl text-xs font-bold shadow-md border border-sky-400/30 hover:border-sky-400 transition"
                  >
                    <QrCode className="w-4 h-4 text-sky-400" /> View My Emergency QR Badge
                  </button>
                </div>

                {/* PROFILE COMPLETENESS WIDGET */}
                <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 font-bold text-slate-800">
                      <Sparkles className="w-4 h-4 text-amber-500" />
                      <span>Health Profile Vitals Completeness</span>
                    </div>
                    <span className="font-black text-sky-600 text-sm">{completionPercent}% Complete</span>
                  </div>

                  <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        completionPercent >= 80 ? 'bg-gradient-to-r from-emerald-500 to-teal-500' : 'bg-gradient-to-r from-sky-500 to-indigo-500'
                      }`}
                      style={{ width: `${completionPercent}%` }}
                    ></div>
                  </div>

                  <p className="text-[11px] text-slate-500 flex items-center gap-1.5">
                    {completionPercent >= 80 ? (
                      <span className="text-emerald-700 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Great! Your emergency QR profile has all vital life-saving details ready.
                      </span>
                    ) : (
                      <span className="text-amber-700 font-medium">
                        💡 Tip: Fill your blood group and emergency contact so ER doctors can help in an emergency.
                      </span>
                    )}
                  </p>
                </div>

                <form onSubmit={handleUpdateProfile} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6 text-xs">
                  {/* BASIC VITALS */}
                  <div className="space-y-3">
                    <h3 className="font-bold text-slate-900 uppercase tracking-wider text-xs flex items-center gap-1.5">
                      <User className="w-4 h-4 text-sky-600" /> 1. Personal & Physical Vitals
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="font-bold text-slate-700 block mb-1">Age (Years) *</label>
                        <input
                          type="number"
                          placeholder="e.g. 38"
                          value={profileForm.age}
                          onChange={(e) => setProfileForm({ ...profileForm, age: e.target.value })}
                          className="w-full px-3.5 py-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500"
                        />
                      </div>
                      <div>
                        <label className="font-bold text-slate-700 block mb-1">Gender</label>
                        <div className="flex gap-2">
                          {['Male', 'Female', 'Other'].map((g) => (
                            <button
                              key={g}
                              type="button"
                              onClick={() => setProfileForm({ ...profileForm, gender: g })}
                              className={`flex-1 py-2 rounded-xl font-bold transition-all text-xs border ${
                                profileForm.gender === g
                                  ? 'bg-sky-600 text-white border-sky-600 shadow-md shadow-sky-600/30'
                                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                              }`}
                            >
                              {g}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* VISUAL BLOOD GROUP SELECTOR */}
                  <div className="space-y-2.5 border-t border-slate-100 pt-5">
                    <div className="flex items-center justify-between">
                      <label className="font-bold text-slate-900 uppercase tracking-wider text-xs flex items-center gap-1.5">
                        <HeartPulse className="w-4 h-4 text-rose-600" /> 2. Blood Group (Select with 1-Tap) *
                      </label>
                      <span className="text-[11px] font-black text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200">
                        Selected: {profileForm.bloodGroup}
                      </span>
                    </div>

                    <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                      {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map((bg) => {
                        const isSelected = profileForm.bloodGroup === bg;
                        return (
                          <button
                            key={bg}
                            type="button"
                            onClick={() => setProfileForm({ ...profileForm, bloodGroup: bg })}
                            className={`py-3 rounded-2xl font-black text-sm transition-all flex flex-col items-center justify-center gap-0.5 border-2 ${
                              isSelected
                                ? 'bg-gradient-to-b from-rose-600 to-rose-700 text-white border-rose-400 shadow-lg shadow-rose-600/30 scale-105'
                                : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-rose-300 hover:bg-rose-50/50'
                            }`}
                          >
                            <span className="text-base leading-none">🩸</span>
                            <span>{bg}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* 1-CLICK ALLERGY TAG SELECTOR */}
                  <div className="space-y-3 border-t border-slate-100 pt-5">
                    <div>
                      <label className="font-bold text-slate-900 uppercase tracking-wider text-xs flex items-center gap-1.5">
                        <ShieldAlert className="w-4 h-4 text-amber-600" /> 3. Known Drug & Food Allergies (1-Click Tags)
                      </label>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Tap on any allergy below to add or remove it from your life-saving QR profile.
                      </p>
                    </div>

                    {/* Quick Pill Chips */}
                    <div className="flex flex-wrap gap-2">
                      {commonAllergiesList.map((tag) => {
                        const isSelected = currentAllergies.some((a) => a.toLowerCase() === tag.toLowerCase());
                        return (
                          <button
                            key={tag}
                            type="button"
                            onClick={() => toggleAllergy(tag)}
                            className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 border ${
                              isSelected
                                ? 'bg-rose-600 text-white border-rose-600 shadow-md shadow-rose-600/30'
                                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            <span>{isSelected ? '✓' : '+'}</span>
                            <span>{tag}</span>
                          </button>
                        );
                      })}
                    </div>

                    <div>
                      <input
                        type="text"
                        placeholder="Custom allergies (comma separated e.g. Sulfa, Peanuts)"
                        value={profileForm.allergies}
                        onChange={(e) => setProfileForm({ ...profileForm, allergies: e.target.value })}
                        className="w-full px-3.5 py-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 bg-slate-50/50"
                      />
                    </div>
                  </div>

                  {/* EMERGENCY CONTACT WITH QUICK RELATIONSHIP PRESETS */}
                  <div className="border-t border-slate-100 pt-5 space-y-3.5">
                    <div>
                      <h4 className="font-bold text-slate-900 uppercase tracking-wider text-xs flex items-center gap-1.5">
                        <Phone className="w-4 h-4 text-emerald-600" /> 4. Emergency Kin Contact (1-Tap Call in Accident)
                      </h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        First responders and ER doctors will see this contact when scanning your QR card.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="font-bold text-slate-700 block mb-1">Contact Full Name *</label>
                        <input
                          type="text"
                          placeholder="e.g. Sunita Verma"
                          value={profileForm.emergencyContact?.name || ''}
                          onChange={(e) =>
                            setProfileForm({
                              ...profileForm,
                              emergencyContact: { ...profileForm.emergencyContact, name: e.target.value },
                            })
                          }
                          className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500"
                        />
                      </div>
                      <div>
                        <label className="font-bold text-slate-700 block mb-1">Phone Number *</label>
                        <input
                          type="text"
                          placeholder="e.g. +1 (555) 093-1109"
                          value={profileForm.emergencyContact?.phone || ''}
                          onChange={(e) =>
                            setProfileForm({
                              ...profileForm,
                              emergencyContact: { ...profileForm.emergencyContact, phone: e.target.value },
                            })
                          }
                          className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500"
                        />
                      </div>
                      <div>
                        <label className="font-bold text-slate-700 block mb-1">Relationship</label>
                        <input
                          type="text"
                          placeholder="e.g. Spouse / Father"
                          value={profileForm.emergencyContact?.relationship || ''}
                          onChange={(e) =>
                            setProfileForm({
                              ...profileForm,
                              emergencyContact: { ...profileForm.emergencyContact, relationship: e.target.value },
                            })
                          }
                          className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500"
                        />
                      </div>
                    </div>

                    {/* Quick Relationship Chips */}
                    <div className="flex flex-wrap gap-1.5">
                      <span className="text-[11px] text-slate-400 font-medium mr-1 py-1">Quick Select:</span>
                      {['Spouse', 'Parent', 'Sibling', 'Child', 'Friend'].map((rel) => (
                        <button
                          key={rel}
                          type="button"
                          onClick={() =>
                            setProfileForm({
                              ...profileForm,
                              emergencyContact: { ...profileForm.emergencyContact, relationship: rel },
                            })
                          }
                          className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold transition"
                        >
                          {rel}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-end pt-4 border-t border-slate-100">
                    <button
                      type="submit"
                      className="px-7 py-3 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-2xl shadow-lg shadow-sky-600/30 text-xs transition"
                    >
                      Save Health Profile & Update QR Card
                    </button>
                  </div>
                </form>
              </div>
            );
          })()}
        </main>
      </div>

      {/* PRESCRIPTION VIEWER MODAL */}
      <PrescriptionViewerModal
        isOpen={!!viewPrescription}
        onClose={() => setViewPrescription(null)}
        prescription={viewPrescription}
      />

      {/* INVOICE VIEWER & PAYMENT MODAL */}
      <InvoiceViewerModal
        isOpen={!!viewInvoice}
        onClose={() => setViewInvoice(null)}
        invoice={viewInvoice}
        onPaymentSuccess={() => {
          fetchData();
          setViewInvoice(null);
        }}
      />

      {/* EMERGENCY DIGITAL HEALTH PASSPORT QR MODAL */}
      <HealthPassportModal
        isOpen={isPassportOpen}
        onClose={() => setIsPassportOpen(false)}
        patient={user}
        profile={profile}
      />
    </div>
  );
};

export default PatientDashboard;
