import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  getPatientAppointments,
  getPatientPrescriptions,
  getPatientBills,
  getAllDoctors,
  createAppointment,
  markBillPaid,
  chatWithAI
} from '../../api/endpoints';
import toast from 'react-hot-toast';
import {
  User,
  LogOut,
  Calendar,
  FileText,
  Receipt,
  Bot,
  Plus,
  X,
  Send,
  Heart,
  CheckCircle2
} from 'lucide-react';

const PatientDashboard = () => {
  const { user, logout } = useAuth();
  const [tab, setTab] = useState('appointments');
  const [appointments, setApps] = useState([]);
  const [prescriptions, setRx] = useState([]);
  const [bills, setBills] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [showBook, setShowBook] = useState(false);
  const [showAI, setShowAI] = useState(false);
  const [aiMessages, setAiMessages] = useState([
    { role: 'ai', text: 'Namaste! 👋 Main CareSync Hospital AI Assistant hun. Aap mujhse symptoms, doctor schedule ya bed availability ke baare me pooch sakte hain.' },
  ]);
  const [aiInput, setAiInput] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [apptForm, setApptForm] = useState({ doctor: '', date: '', time: '', reason: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [aRes, rRes, bRes, dRes] = await Promise.all([
        getPatientAppointments(),
        getPatientPrescriptions(),
        getPatientBills(),
        getAllDoctors(),
      ]);
      setApps(aRes.data.data);
      setRx(rRes.data.data);
      setBills(bRes.data.data);
      setDoctors(dRes.data.data);
    } catch {
      toast.error('Failed to load patient records');
    }
    setLoading(false);
  };

  const handleBookAppt = async (e) => {
    e.preventDefault();
    try {
      await createAppointment({ ...apptForm, patient: user._id });
      toast.success('Appointment booked successfully!');
      setShowBook(false);
      setApptForm({ doctor: '', date: '', time: '', reason: '' });
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Booking failed');
    }
  };

  const handlePayBill = async (id) => {
    try {
      await markBillPaid(id, { paymentMethod: 'online' });
      toast.success('Bill payment processed!');
      fetchData();
    } catch {
      toast.error('Payment failed');
    }
  };

  const handleAISend = async () => {
    if (!aiInput.trim()) return;
    const userMsg = aiInput.trim();
    setAiMessages((m) => [...m, { role: 'user', text: userMsg }]);
    setAiInput('');
    setAiLoading(true);
    try {
      const res = await chatWithAI({ message: userMsg });
      setAiMessages((m) => [...m, { role: 'ai', text: res.data.data.reply }]);
    } catch {
      setAiMessages((m) => [
        ...m,
        { role: 'ai', text: 'CareSync AI Assistant currently offline. Please consult hospital helpdesk.' },
      ]);
    }
    setAiLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#f6f7f7] text-[#101517] font-sans">
      
      {/* Top Header */}
      <header className="bg-[#006088] text-white px-6 py-3.5 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center ring-1 ring-white/20">
            <Heart className="w-4 h-4 text-white" fill="currentColor" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-base tracking-tight">CareSync Patient Health Portal</span>
            </div>
            <p className="text-[11px] text-blue-100 hidden sm:block">Electronic Medical Records & Telehealth</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowAI(true)}
            className="flex items-center gap-1.5 text-xs bg-white/15 hover:bg-white/25 text-white px-3 py-1.5 rounded transition-colors font-medium cursor-pointer"
          >
            <Bot className="w-3.5 h-3.5" /> AI Health Assistant
          </button>
          <div className="hidden sm:flex flex-col text-right">
            <span className="text-xs font-semibold text-white">{user?.name}</span>
            <span className="text-[10px] text-cyan-200">Patient ID: #{user?._id?.slice(-5)}</span>
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
            onClick={() => setTab('appointments')}
            className={`py-3 text-sm font-medium border-b-2 transition-all cursor-pointer ${
              tab === 'appointments'
                ? 'border-[#0087be] text-[#006088] font-semibold'
                : 'border-transparent text-[#646970] hover:text-[#101517]'
            }`}
          >
            My Appointments ({appointments.length})
          </button>
          <button
            onClick={() => setTab('prescriptions')}
            className={`py-3 text-sm font-medium border-b-2 transition-all cursor-pointer ${
              tab === 'prescriptions'
                ? 'border-[#0087be] text-[#006088] font-semibold'
                : 'border-transparent text-[#646970] hover:text-[#101517]'
            }`}
          >
            Prescriptions ({prescriptions.length})
          </button>
          <button
            onClick={() => setTab('billing')}
            className={`py-3 text-sm font-medium border-b-2 transition-all cursor-pointer ${
              tab === 'billing'
                ? 'border-[#0087be] text-[#006088] font-semibold'
                : 'border-transparent text-[#646970] hover:text-[#101517]'
            }`}
          >
            Billing & Invoices ({bills.length})
          </button>
        </div>

        {tab === 'appointments' && (
          <button
            onClick={() => setShowBook(true)}
            className="bg-[#0087be] hover:bg-[#0073aa] text-white text-xs font-semibold px-3 py-1.5 rounded flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" /> Book New Appointment
          </button>
        )}
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-6">
        
        {/* Welcome Notice Banner */}
        <div className="bg-white border border-[#dcdcde] rounded-md p-5 mb-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-[#101517]">Welcome back, {user?.name}!</h2>
            <p className="text-xs text-[#646970] mt-0.5">
              Access your prescription records, schedule doctor visits, or consult with our 24/7 AI Health assistant.
            </p>
          </div>
          <div className="flex gap-2">
            <span className="text-xs bg-[#f0f6fc] text-[#006088] border border-[#a0c5e8] px-2.5 py-1 rounded font-medium">
              Blood Group: {user?.bloodGroup || 'O+'}
            </span>
          </div>
        </div>

        {/* APPOINTMENTS TAB */}
        {tab === 'appointments' && (
          <div className="space-y-3">
            {appointments.map((a) => (
              <div key={a._id} className="bg-white border border-[#dcdcde] rounded-md p-4 shadow-sm flex justify-between items-center">
                <div>
                  <h4 className="font-bold text-sm text-[#101517]">Dr. {a.doctor?.name}</h4>
                  <p className="text-xs text-[#646970] mt-0.5">
                    Date: {new Date(a.date).toLocaleDateString('en-IN')} · Slot: {a.time}
                  </p>
                  {a.reason && <p className="text-xs text-[#50575e] mt-1">Reason: {a.reason}</p>}
                </div>
                <span className={`px-2.5 py-0.5 rounded text-[11px] font-semibold uppercase ${
                  a.status === 'completed' ? 'bg-emerald-100 text-emerald-800' :
                  a.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                  'bg-amber-100 text-amber-800'
                }`}>
                  {a.status}
                </span>
              </div>
            ))}
            {appointments.length === 0 && (
              <div className="bg-white border border-[#dcdcde] rounded-md p-12 text-center text-[#646970] text-sm">
                No active appointments. Click "Book New Appointment" to see a specialist.
              </div>
            )}
          </div>
        )}

        {/* PRESCRIPTIONS TAB */}
        {tab === 'prescriptions' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {prescriptions.map((rx) => (
              <div key={rx._id} className="bg-white border border-[#dcdcde] rounded-md p-5 shadow-sm">
                <div className="flex justify-between items-start border-b border-[#f0f0f1] pb-3 mb-3">
                  <div>
                    <h4 className="font-bold text-sm text-[#101517]">Dr. {rx.doctor?.name}</h4>
                    <p className="text-xs text-[#006088] font-medium mt-0.5">Condition: {rx.diagnosis}</p>
                  </div>
                  <span className="text-[11px] text-[#646970]">
                    {new Date(rx.createdAt).toLocaleDateString('en-IN')}
                  </span>
                </div>

                <div className="space-y-1.5 mb-3">
                  <p className="text-[11px] font-semibold text-[#646970] uppercase tracking-wider">Medicines:</p>
                  {rx.medicines.map((m, i) => (
                    <div key={i} className="p-2 bg-[#f6f7f7] border border-[#dcdcde] rounded text-xs">
                      <span className="font-bold text-[#101517]">{m.name}</span>
                      <span className="text-[#646970]"> — {m.dosage} ({m.frequency}, {m.duration})</span>
                    </div>
                  ))}
                </div>

                {rx.advice && (
                  <p className="text-xs text-[#50575e] bg-amber-50/60 p-2 rounded border border-amber-200/60">
                    <strong>Advice:</strong> {rx.advice}
                  </p>
                )}
              </div>
            ))}
            {prescriptions.length === 0 && (
              <div className="col-span-2 bg-white border border-[#dcdcde] rounded-md p-12 text-center text-[#646970] text-sm">
                No prescriptions issued on record yet.
              </div>
            )}
          </div>
        )}

        {/* BILLING TAB */}
        {tab === 'billing' && (
          <div className="space-y-3">
            {bills.map((b) => (
              <div key={b._id} className="bg-white border border-[#dcdcde] rounded-md p-4 shadow-sm flex justify-between items-center">
                <div>
                  <p className="text-base font-bold text-[#101517]">₹{b.totalAmount?.toLocaleString()}</p>
                  <p className="text-xs text-[#646970] mt-0.5">
                    Invoice Date: {new Date(b.createdAt).toLocaleDateString('en-IN')}
                  </p>
                  <div className="text-xs text-[#50575e] mt-1">
                    {b.items?.map((item, i) => (
                      <span key={i}>
                        {item.description}: ₹{item.amount}{i < b.items.length - 1 ? ' · ' : ''}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  {b.isPaid ? (
                    <span className="px-2.5 py-1 rounded text-xs font-semibold bg-emerald-100 text-emerald-800">
                      PAID ✓
                    </span>
                  ) : (
                    <button
                      onClick={() => handlePayBill(b._id)}
                      className="bg-[#0087be] hover:bg-[#0073aa] text-white text-xs font-semibold px-3 py-1.5 rounded cursor-pointer"
                    >
                      Pay Now
                    </button>
                  )}
                </div>
              </div>
            ))}
            {bills.length === 0 && (
              <div className="bg-white border border-[#dcdcde] rounded-md p-12 text-center text-[#646970] text-sm">
                No pending hospital invoices.
              </div>
            )}
          </div>
        )}
      </main>

      {/* Book Appointment Modal */}
      {showBook && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-md border border-[#dcdcde] shadow-lg w-full max-w-sm p-6">
            <div className="flex justify-between items-center border-b border-[#dcdcde] pb-3 mb-4">
              <h3 className="font-bold text-sm text-[#101517]">Book Doctor Appointment</h3>
              <button onClick={() => setShowBook(false)} className="text-[#646970] hover:text-[#101517]">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleBookAppt} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Select Doctor / Department</label>
                <select
                  value={apptForm.doctor}
                  onChange={(e) => setApptForm((f) => ({ ...f, doctor: e.target.value }))}
                  className="w-full border border-[#8c8f94] rounded px-3 py-2 outline-none"
                  required
                >
                  <option value="">Choose physician...</option>
                  {doctors.map((d) => (
                    <option key={d._id} value={d.user?._id || d._id}>
                      Dr. {d.user?.name} — {d.specialization} (Fee: ₹{d.consultationFee})
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
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Preferred Time</label>
                <input
                  type="time"
                  value={apptForm.time}
                  onChange={(e) => setApptForm((f) => ({ ...f, time: e.target.value }))}
                  className="w-full border border-[#8c8f94] rounded px-3 py-2 outline-none"
                  required
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Symptoms / Reason</label>
                <input
                  placeholder="e.g. Chest pain, fever since 2 days"
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
                  Confirm Booking
                </button>
                <button
                  type="button"
                  onClick={() => setShowBook(false)}
                  className="bg-white border border-[#8c8f94] text-[#2c3338] py-2 px-3 rounded"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* AI Assistant Chat Modal */}
      {showAI && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-md border border-[#dcdcde] shadow-xl w-full max-w-md flex flex-col h-[520px]">
            <div className="bg-[#006088] text-white p-3.5 flex justify-between items-center rounded-t-md">
              <div className="flex items-center gap-2">
                <Bot className="w-5 h-5" />
                <div>
                  <h4 className="font-bold text-sm leading-tight">CareSync AI Medical Assistant</h4>
                  <p className="text-[10px] text-cyan-200">Instant Clinical & Hospital Knowledge</p>
                </div>
              </div>
              <button onClick={() => setShowAI(false)} className="text-white/80 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#f6f7f7]">
              {aiMessages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[85%] text-xs p-3 rounded-md leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-[#0087be] text-white'
                        : 'bg-white text-[#101517] border border-[#dcdcde] shadow-xs'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
              {aiLoading && (
                <div className="flex justify-start">
                  <div className="bg-white border border-[#dcdcde] px-3 py-2 rounded-md text-xs text-[#646970]">
                    CareSync AI is thinking...
                  </div>
                </div>
              )}
            </div>

            <div className="p-3 border-t border-[#dcdcde] bg-white flex gap-2">
              <input
                type="text"
                value={aiInput}
                onChange={(e) => setAiInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAISend()}
                placeholder="Ask about symptoms, beds or doctors..."
                className="flex-1 border border-[#8c8f94] rounded px-3 py-2 text-xs outline-none focus:border-[#006088]"
              />
              <button
                onClick={handleAISend}
                disabled={aiLoading}
                className="bg-[#0087be] hover:bg-[#0073aa] text-white px-3 py-2 rounded text-xs font-semibold cursor-pointer disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
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

export default PatientDashboard;
