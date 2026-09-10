import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getPatientAppointments, getPatientPrescriptions, getPatientBills, getAllDoctors, createAppointment, markBillPaid, chatWithAI } from '../../api/endpoints';
import toast from 'react-hot-toast';
import { User, LogOut, Calendar, FileText, Receipt, Bot, Plus, X, Send, Mic } from 'lucide-react';

const PatientDashboard = () => {
  const { user, logout } = useAuth();
  const [tab, setTab]               = useState('appointments');
  const [appointments, setApps]     = useState([]);
  const [prescriptions, setRx]      = useState([]);
  const [bills, setBills]           = useState([]);
  const [doctors, setDoctors]       = useState([]);
  const [showBook, setShowBook]     = useState(false);
  const [showAI, setShowAI]         = useState(false);
  const [aiMessages, setAiMessages] = useState([{ role: 'ai', text: 'Namaste! 👋 Main CareSync AI Assistant hun. Aap kuch bhi pooch sakte hain — symptoms, doctor info, appointments, ya kuch bhi!' }]);
  const [aiInput, setAiInput]       = useState('');
  const [aiLoading, setAiLoading]   = useState(false);
  const [apptForm, setApptForm]     = useState({ doctor: '', date: '', time: '', reason: '' });
  const [loading, setLoading]       = useState(true);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [aRes, rRes, bRes, dRes] = await Promise.all([getPatientAppointments(), getPatientPrescriptions(), getPatientBills(), getAllDoctors()]);
      setApps(aRes.data.data);
      setRx(rRes.data.data);
      setBills(bRes.data.data);
      setDoctors(dRes.data.data);
    } catch { toast.error('Failed to load data'); }
    setLoading(false);
  };

  const handleBookAppt = async (e) => {
    e.preventDefault();
    try {
      await createAppointment({ ...apptForm, patient: user._id });
      toast.success('Appointment booked!');
      setShowBook(false);
      setApptForm({ doctor: '', date: '', time: '', reason: '' });
      fetchData();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const handlePayBill = async (id) => {
    try {
      await markBillPaid(id, { paymentMethod: 'online' });
      toast.success('Bill paid!');
      fetchData();
    } catch { toast.error('Failed'); }
  };

  const handleAISend = async () => {
    if (!aiInput.trim()) return;
    const userMsg = aiInput.trim();
    setAiMessages(m => [...m, { role: 'user', text: userMsg }]);
    setAiInput('');
    setAiLoading(true);
    try {
      const res = await chatWithAI({ message: userMsg });
      setAiMessages(m => [...m, { role: 'ai', text: res.data.data.reply }]);
    } catch {
      setAiMessages(m => [...m, { role: 'ai', text: 'Sorry, AI assistant abhi available nahi hai. Please try again.' }]);
    }
    setAiLoading(false);
  };

  const statusBadge = (s) => <span className={`badge-${s}`}>{s}</span>;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
            <User className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-gray-800">CareSync HMS</h1>
            <p className="text-xs text-gray-500">Patient Portal</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={() => setShowAI(true)} className="flex items-center gap-1.5 text-sm text-purple-600 hover:text-purple-800 font-medium">
            <Bot className="w-4 h-4" /> AI Assistant
          </button>
          <span className="text-sm text-gray-600">🧑 {user?.name}</span>
          <button onClick={logout} className="flex items-center gap-1 text-sm text-red-500 hover:text-red-700">
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
      </header>

      <div className="p-6">
        {/* Welcome Card */}
        <div className="card bg-gradient-to-r from-purple-600 to-blue-600 text-white mb-6">
          <h2 className="text-lg font-bold">Namaste, {user?.name}! 👋</h2>
          <p className="text-purple-100 text-sm mt-1">Aapke paas {appointments.filter(a=>a.status!=='cancelled').length} appointments hain</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="card text-center">
            <p className="text-2xl font-bold text-blue-500">{appointments.length}</p>
            <p className="text-sm text-gray-500">Appointments</p>
          </div>
          <div className="card text-center">
            <p className="text-2xl font-bold text-green-500">{prescriptions.length}</p>
            <p className="text-sm text-gray-500">Prescriptions</p>
          </div>
          <div className="card text-center">
            <p className="text-2xl font-bold text-amber-500">{bills.filter(b=>!b.isPaid).length}</p>
            <p className="text-sm text-gray-500">Pending Bills</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-5 flex-wrap">
          {['appointments', 'prescriptions', 'billing'].map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-lg text-sm font-medium capitalize ${tab === t ? 'bg-purple-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}>
              {t}
            </button>
          ))}
          {tab === 'appointments' && (
            <button onClick={() => setShowBook(true)} className="ml-auto flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
              <Plus className="w-4 h-4" /> Book Appointment
            </button>
          )}
        </div>

        {/* Appointments */}
        {tab === 'appointments' && (
          <div className="grid gap-3">
            {appointments.map(a => (
              <div key={a._id} className="card flex justify-between items-start">
                <div>
                  <p className="font-semibold text-gray-800">Dr. {a.doctor?.name}</p>
                  <p className="text-sm text-gray-500">{new Date(a.date).toLocaleDateString('en-IN')} · {a.time}</p>
                  {a.reason && <p className="text-xs text-gray-400 mt-1">{a.reason}</p>}
                </div>
                {statusBadge(a.status)}
              </div>
            ))}
            {appointments.length === 0 && <div className="card text-center text-gray-400 py-8">Koi appointment nahi hai. Abhi book karein! 📅</div>}
          </div>
        )}

        {/* Prescriptions */}
        {tab === 'prescriptions' && (
          <div className="grid gap-4">
            {prescriptions.map(rx => (
              <div key={rx._id} className="card">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="font-semibold text-gray-800">Dr. {rx.doctor?.name}</p>
                    <p className="text-sm text-blue-600">Diagnosis: {rx.diagnosis}</p>
                  </div>
                  <p className="text-xs text-gray-400">{new Date(rx.createdAt).toLocaleDateString('en-IN')}</p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {rx.medicines.map((m, i) => (
                    <div key={i} className="bg-green-50 rounded-lg p-2 text-xs">
                      <p className="font-semibold text-green-800">{m.name}</p>
                      <p className="text-green-600">{m.dosage} · {m.frequency}</p>
                      <p className="text-green-500">{m.duration}</p>
                    </div>
                  ))}
                </div>
                {rx.advice && <p className="text-xs text-gray-500 mt-2 italic">💡 {rx.advice}</p>}
              </div>
            ))}
            {prescriptions.length === 0 && <div className="card text-center text-gray-400 py-8">Koi prescription nahi mili abhi tak</div>}
          </div>
        )}

        {/* Billing */}
        {tab === 'billing' && (
          <div className="grid gap-3">
            {bills.map(b => (
              <div key={b._id} className="card flex justify-between items-center">
                <div>
                  <p className="font-semibold text-gray-800">₹{b.totalAmount?.toLocaleString()}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{new Date(b.createdAt).toLocaleDateString('en-IN')}</p>
                  <div className="text-xs text-gray-400 mt-1">
                    {b.items?.map((item, i) => <span key={i}>{item.description}: ₹{item.amount}{i < b.items.length-1 ? ' · ' : ''}</span>)}
                  </div>
                </div>
                {b.isPaid
                  ? <span className="badge-completed">✅ Paid</span>
                  : <button onClick={() => handlePayBill(b._id)} className="btn-primary text-xs">Pay Now</button>
                }
              </div>
            ))}
            {bills.length === 0 && <div className="card text-center text-gray-400 py-8">Koi bill nahi hai abhi</div>}
          </div>
        )}
      </div>

      {/* Book Appointment Modal */}
      {showBook && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-gray-800">Book Appointment</h3>
              <button onClick={() => setShowBook(false)}><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <form onSubmit={handleBookAppt} className="space-y-3">
              <select value={apptForm.doctor} onChange={e=>setApptForm(f=>({...f,doctor:e.target.value}))} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" required>
                <option value="">Select Doctor</option>
                {doctors.map(d => <option key={d._id} value={d.user?._id || d._id}>Dr. {d.user?.name} — {d.specialization} (₹{d.consultationFee})</option>)}
              </select>
              <input type="date" value={apptForm.date} onChange={e=>setApptForm(f=>({...f,date:e.target.value}))} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" required min={new Date().toISOString().split('T')[0]} />
              <input type="time" value={apptForm.time} onChange={e=>setApptForm(f=>({...f,time:e.target.value}))} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" required />
              <input placeholder="Reason / Symptoms" value={apptForm.reason} onChange={e=>setApptForm(f=>({...f,reason:e.target.value}))} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
              <div className="flex gap-3 pt-1">
                <button type="submit" className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-lg">Book</button>
                <button type="button" onClick={() => setShowBook(false)} className="flex-1 btn-secondary">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* AI Assistant Chat */}
      {showAI && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm flex flex-col" style={{ height: '500px' }}>
            <div className="flex justify-between items-center p-4 border-b">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-gray-800 text-sm">CareSync AI</p>
                  <p className="text-xs text-green-500">● Online</p>
                </div>
              </div>
              <button onClick={() => setShowAI(false)}><X className="w-5 h-5 text-gray-400" /></button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {aiMessages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] px-3 py-2 rounded-xl text-sm ${msg.role === 'user' ? 'bg-purple-600 text-white rounded-br-none' : 'bg-gray-100 text-gray-800 rounded-bl-none'}`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {aiLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 px-3 py-2 rounded-xl rounded-bl-none">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="p-3 border-t flex gap-2">
              <input
                value={aiInput}
                onChange={e => setAiInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleAISend()}
                placeholder="Kuch bhi poochhen..."
                className="flex-1 border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
              />
              <button onClick={handleAISend} disabled={aiLoading} className="w-9 h-9 bg-purple-600 text-white rounded-xl flex items-center justify-center hover:bg-purple-700 disabled:bg-purple-300">
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientDashboard;
