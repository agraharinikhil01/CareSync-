import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  getBeds,
  admitPatient,
  dischargePatient,
  getAppointments,
  updateAppointmentStatus,
  getAllPatients,
  getAllDoctors,
  createAppointment,
  getBills,
  markBillPaid
} from '../../api/endpoints';
import toast from 'react-hot-toast';
import {
  BedDouble,
  LogOut,
  Calendar,
  Receipt,
  Plus,
  X,
  CheckCircle,
  Heart
} from 'lucide-react';

const ReceptionistDashboard = () => {
  const { user, logout } = useAuth();
  const [tab, setTab] = useState('beds');
  const [beds, setBeds] = useState([]);
  const [appointments, setApps] = useState([]);
  const [bills, setBills] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [showAdmit, setShowAdmit] = useState(null);
  const [showApptForm, setShowApptForm] = useState(false);
  const [selectedFloor, setSelectedFloor] = useState(1);
  const [apptForm, setApptForm] = useState({ patient: '', doctor: '', date: '', time: '', reason: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [bRes, aRes, blRes, pRes, dRes] = await Promise.all([
        getBeds(),
        getAppointments(),
        getBills(),
        getAllPatients(),
        getAllDoctors(),
      ]);
      setBeds(bRes.data.data);
      setApps(aRes.data.data);
      setBills(blRes.data.data);
      setPatients(pRes.data.data);
      setDoctors(dRes.data.data);
    } catch {
      toast.error('Failed to load front desk data');
    }
    setLoading(false);
  };

  const handleAdmit = async (e) => {
    e.preventDefault();
    try {
      await admitPatient(showAdmit._id, { patientId: showAdmit.selectedPatient });
      toast.success('Patient admitted to bed!');
      setShowAdmit(null);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Admission failed');
    }
  };

  const handleDischarge = async (bedId) => {
    if (!window.confirm('Discharge patient from this bed? Bed will be marked available.')) return;
    try {
      await dischargePatient(bedId);
      toast.success('Patient discharged successfully!');
      fetchData();
    } catch {
      toast.error('Discharge failed');
    }
  };

  const handleBookAppt = async (e) => {
    e.preventDefault();
    try {
      await createAppointment(apptForm);
      toast.success('Appointment scheduled!');
      setShowApptForm(false);
      setApptForm({ patient: '', doctor: '', date: '', time: '', reason: '' });
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Booking failed');
    }
  };

  const handleMarkPaid = async (id) => {
    try {
      await markBillPaid(id, { paymentMethod: 'cash' });
      toast.success('Invoice marked as paid');
      fetchData();
    } catch {
      toast.error('Payment update failed');
    }
  };

  const floorBeds = beds.filter((b) => b.floor === selectedFloor);
  const floorNames = {
    1: 'Floor 1 — General Ward (Beds 101 - 110)',
    2: 'Floor 2 — Intensive Care Unit / ICU (Beds 201 - 210)',
    3: 'Floor 3 — Private Ward Suite (Beds 301 - 310)',
    4: 'Floor 4 — Semi-Private Ward (Beds 401 - 410)',
  };

  return (
    <div className="min-h-screen bg-[#f6f7f7] text-[#101517] font-sans">
      
      {/* Header */}
      <header className="bg-[#006088] text-white px-6 py-3.5 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center ring-1 ring-white/20">
            <Heart className="w-4 h-4 text-white" fill="currentColor" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-base tracking-tight">CareSync Front Desk</span>
              <span className="text-[11px] bg-white/15 px-2 py-0.5 rounded text-cyan-100 font-medium">
                Receptionist Desk
              </span>
            </div>
            <p className="text-[11px] text-blue-100 hidden sm:block">Ward Admissions, Bed Allocation & Patient Check-in</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex flex-col text-right">
            <span className="text-xs font-semibold text-white">{user?.name}</span>
            <span className="text-[10px] text-cyan-200">Hospital Staff</span>
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
      <div className="bg-white border-b border-[#dcdcde] px-6 flex justify-between items-center">
        <div className="flex gap-6">
          <button
            onClick={() => setTab('beds')}
            className={`py-3 text-sm font-medium border-b-2 transition-all cursor-pointer ${
              tab === 'beds'
                ? 'border-[#0087be] text-[#006088] font-semibold'
                : 'border-transparent text-[#646970] hover:text-[#101517]'
            }`}
          >
            4-Floor Ward Beds
          </button>
          <button
            onClick={() => setTab('appointments')}
            className={`py-3 text-sm font-medium border-b-2 transition-all cursor-pointer ${
              tab === 'appointments'
                ? 'border-[#0087be] text-[#006088] font-semibold'
                : 'border-transparent text-[#646970] hover:text-[#101517]'
            }`}
          >
            Appointments Desk ({appointments.length})
          </button>
          <button
            onClick={() => setTab('billing')}
            className={`py-3 text-sm font-medium border-b-2 transition-all cursor-pointer ${
              tab === 'billing'
                ? 'border-[#0087be] text-[#006088] font-semibold'
                : 'border-transparent text-[#646970] hover:text-[#101517]'
            }`}
          >
            Cashier & Invoices ({bills.length})
          </button>
        </div>

        {tab === 'appointments' && (
          <button
            onClick={() => setShowApptForm(true)}
            className="bg-[#0087be] hover:bg-[#0073aa] text-white text-xs font-semibold px-3 py-1.5 rounded flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" /> Book Appointment
          </button>
        )}
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-6">
        
        {/* BEDS ALLOCATION TAB */}
        {tab === 'beds' && (
          <div className="space-y-4">
            
            {/* Floor Tabs */}
            <div className="flex gap-2">
              {[1, 2, 3, 4].map((f) => (
                <button
                  key={f}
                  onClick={() => setSelectedFloor(f)}
                  className={`px-4 py-2 rounded text-xs font-semibold transition-all border cursor-pointer ${
                    selectedFloor === f
                      ? 'bg-[#006088] text-white border-[#006088] shadow-sm'
                      : 'bg-white border-[#dcdcde] text-[#50575e] hover:bg-[#f0f0f1]'
                  }`}
                >
                  Floor {f}
                </button>
              ))}
            </div>

            <div className="bg-white rounded-md border border-[#dcdcde] shadow-sm p-6">
              <div className="flex justify-between items-center border-b border-[#f0f0f1] pb-3 mb-4">
                <div>
                  <h3 className="font-bold text-sm text-[#101517]">{floorNames[selectedFloor]}</h3>
                  <p className="text-xs text-[#646970]">Click an available bed to admit a patient. Discharge occupied beds when released.</p>
                </div>
                <div className="flex items-center gap-4 text-xs font-medium">
                  <span className="flex items-center gap-1.5 text-emerald-700">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Available
                  </span>
                  <span className="flex items-center gap-1.5 text-red-700">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500" /> Occupied
                  </span>
                </div>
              </div>

              {/* Bed Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {floorBeds.map((bed) => {
                  const isOcc = bed.status === 'occupied';
                  return (
                    <div
                      key={bed._id}
                      onClick={() => {
                        if (!isOcc) setShowAdmit({ ...bed, selectedPatient: '' });
                      }}
                      className={`p-3.5 rounded border transition-all ${
                        isOcc
                          ? 'bg-[#fcf0f2] border-[#e2a1a4]'
                          : 'bg-[#f0f6fc] border-[#a0c5e8] hover:border-[#0087be] cursor-pointer'
                      }`}
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-bold text-xs text-[#101517]">Bed {bed.bedNumber}</span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold uppercase ${
                          isOcc ? 'bg-red-100 text-red-800' : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {bed.status}
                        </span>
                      </div>

                      {isOcc ? (
                        <div className="mt-2 pt-2 border-t border-red-200">
                          <p className="text-xs font-medium text-[#101517] truncate">{bed.patient?.name || 'Occupied'}</p>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDischarge(bed._id);
                            }}
                            className="mt-2 w-full bg-white border border-red-300 text-red-700 hover:bg-red-50 text-[11px] font-semibold py-1 rounded transition-colors cursor-pointer"
                          >
                            Discharge
                          </button>
                        </div>
                      ) : (
                        <p className="text-[11px] text-[#006088] mt-2">Click to Admit Patient →</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* APPOINTMENTS TAB */}
        {tab === 'appointments' && (
          <div className="bg-white rounded-md border border-[#dcdcde] shadow-sm overflow-hidden">
            <div className="p-4 border-b border-[#dcdcde] flex justify-between items-center bg-[#fbfbfb]">
              <div>
                <h3 className="font-bold text-sm text-[#101517]">Hospital Appointments Schedule</h3>
                <p className="text-xs text-[#646970]">Bookings, time slots and physician schedules</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#f0f0f1] text-[#50575e] border-b border-[#dcdcde] uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="px-4 py-3">Patient</th>
                    <th className="px-4 py-3">Consulting Doctor</th>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Time</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f0f0f1]">
                  {appointments.map((a) => (
                    <tr key={a._id} className="hover:bg-[#f6f7f7]">
                      <td className="px-4 py-3 font-medium text-[#101517]">{a.patient?.name}</td>
                      <td className="px-4 py-3 text-[#50575e]">Dr. {a.doctor?.name}</td>
                      <td className="px-4 py-3 text-[#50575e]">{new Date(a.date).toLocaleDateString('en-IN')}</td>
                      <td className="px-4 py-3 text-[#50575e]">{a.time}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                          a.status === 'completed' ? 'bg-emerald-100 text-emerald-800' :
                          a.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                          'bg-amber-100 text-amber-800'
                        }`}>
                          {a.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        {a.status === 'pending' && (
                          <button
                            onClick={() => updateAppointmentStatus(a._id, { status: 'confirmed' }).then(() => { toast.success('Confirmed'); fetchData(); })}
                            className="text-xs text-[#006088] font-semibold hover:underline"
                          >
                            Confirm Booking
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {appointments.length === 0 && (
                <p className="text-center text-[#646970] text-sm py-12">No appointments on record.</p>
              )}
            </div>
          </div>
        )}

        {/* BILLING TAB */}
        {tab === 'billing' && (
          <div className="bg-white rounded-md border border-[#dcdcde] shadow-sm overflow-hidden">
            <div className="p-4 border-b border-[#dcdcde] flex justify-between items-center bg-[#fbfbfb]">
              <div>
                <h3 className="font-bold text-sm text-[#101517]">Patient Bills & Receipts</h3>
                <p className="text-xs text-[#646970]">Front desk cashier collection register</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#f0f0f1] text-[#50575e] border-b border-[#dcdcde] uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="px-4 py-3">Patient</th>
                    <th className="px-4 py-3">Total Amount</th>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f0f0f1]">
                  {bills.map((b) => (
                    <tr key={b._id} className="hover:bg-[#f6f7f7]">
                      <td className="px-4 py-3 font-medium text-[#101517]">{b.patient?.name}</td>
                      <td className="px-4 py-3 font-bold text-[#101517]">₹{b.totalAmount?.toLocaleString()}</td>
                      <td className="px-4 py-3 text-[#50575e]">{new Date(b.createdAt).toLocaleDateString('en-IN')}</td>
                      <td className="px-4 py-3">
                        {b.isPaid ? (
                          <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-100 text-emerald-800">
                            PAID
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-amber-100 text-amber-800">
                            UNPAID
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {!b.isPaid && (
                          <button
                            onClick={() => handleMarkPaid(b._id)}
                            className="text-xs bg-[#0087be] hover:bg-[#0073aa] text-white font-medium px-2.5 py-1 rounded"
                          >
                            Mark Paid
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {bills.length === 0 && (
                <p className="text-center text-[#646970] text-sm py-12">No bills generated yet.</p>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Admit Patient Modal */}
      {showAdmit && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-md border border-[#dcdcde] shadow-lg w-full max-w-sm p-6">
            <div className="flex justify-between items-center border-b border-[#dcdcde] pb-3 mb-4">
              <h3 className="font-bold text-sm text-[#101517]">Admit Patient — Bed {showAdmit.bedNumber}</h3>
              <button onClick={() => setShowAdmit(null)} className="text-[#646970] hover:text-[#101517]">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleAdmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#101517] mb-1">Select Patient</label>
                <select
                  value={showAdmit.selectedPatient}
                  onChange={(e) => setShowAdmit((s) => ({ ...s, selectedPatient: e.target.value }))}
                  className="w-full border border-[#8c8f94] rounded px-3 py-2 text-xs focus:border-[#006088] outline-none"
                  required
                >
                  <option value="">Choose patient...</option>
                  {patients.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.name} ({p.phone || p.email})
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 bg-[#0087be] hover:bg-[#0073aa] text-white font-semibold py-2 px-3 rounded text-xs"
                >
                  Admit
                </button>
                <button
                  type="button"
                  onClick={() => setShowAdmit(null)}
                  className="bg-white border border-[#8c8f94] hover:bg-[#f6f7f7] text-[#2c3338] py-2 px-3 rounded text-xs"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Book Appointment Modal */}
      {showApptForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-md border border-[#dcdcde] shadow-lg w-full max-w-sm p-6">
            <div className="flex justify-between items-center border-b border-[#dcdcde] pb-3 mb-4">
              <h3 className="font-bold text-sm text-[#101517]">Book Patient Appointment</h3>
              <button onClick={() => setShowApptForm(false)} className="text-[#646970] hover:text-[#101517]">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleBookAppt} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Patient</label>
                <select
                  value={apptForm.patient}
                  onChange={(e) => setApptForm((f) => ({ ...f, patient: e.target.value }))}
                  className="w-full border border-[#8c8f94] rounded px-3 py-2 outline-none"
                  required
                >
                  <option value="">Select Patient</option>
                  {patients.map((p) => (
                    <option key={p._id} value={p._id}>{p.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-semibold mb-1">Doctor</label>
                <select
                  value={apptForm.doctor}
                  onChange={(e) => setApptForm((f) => ({ ...f, doctor: e.target.value }))}
                  className="w-full border border-[#8c8f94] rounded px-3 py-2 outline-none"
                  required
                >
                  <option value="">Select Doctor</option>
                  {doctors.map((d) => (
                    <option key={d._id} value={d.user?._id || d._id}>
                      Dr. {d.user?.name} — {d.specialization}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-semibold mb-1">Date</label>
                <input
                  type="date"
                  value={apptForm.date}
                  onChange={(e) => setApptForm((f) => ({ ...f, date: e.target.value }))}
                  className="w-full border border-[#8c8f94] rounded px-3 py-2 outline-none"
                  required
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Time Slot</label>
                <input
                  type="time"
                  value={apptForm.time}
                  onChange={(e) => setApptForm((f) => ({ ...f, time: e.target.value }))}
                  className="w-full border border-[#8c8f94] rounded px-3 py-2 outline-none"
                  required
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Reason</label>
                <input
                  placeholder="Reason for visit"
                  value={apptForm.reason}
                  onChange={(e) => setApptForm((f) => ({ ...f, reason: e.target.value }))}
                  className="w-full border border-[#8c8f94] rounded px-3 py-2 outline-none"
                />
              </div>
              <div className="flex gap-2 pt-2 border-t border-[#dcdcde]">
                <button
                  type="submit"
                  className="flex-1 bg-[#0087be] hover:bg-[#0073aa] text-white font-semibold py-2 rounded"
                >
                  Book Appointment
                </button>
                <button
                  type="button"
                  onClick={() => setShowApptForm(false)}
                  className="bg-white border border-[#8c8f94] text-[#2c3338] py-2 px-3 rounded"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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

export default ReceptionistDashboard;
