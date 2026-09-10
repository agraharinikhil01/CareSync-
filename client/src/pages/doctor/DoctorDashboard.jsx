import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getDoctorAppointments, getDoctorPrescriptions, getDoctorProfile, updateAppointmentStatus, createPrescription, getAllPatients } from '../../api/endpoints';
import toast from 'react-hot-toast';
import { Stethoscope, LogOut, Calendar, FileText, User, Clock, CheckCircle, Plus, X } from 'lucide-react';

const DoctorDashboard = () => {
  const { user, logout } = useAuth();
  const [tab, setTab]               = useState('appointments');
  const [appointments, setApps]     = useState([]);
  const [prescriptions, setRx]      = useState([]);
  const [patients, setPatients]     = useState([]);
  const [showRxForm, setShowRxForm] = useState(false);
  const [rxForm, setRxForm]         = useState({ patient: '', diagnosis: '', advice: '', medicines: [{ name: '', dosage: '', frequency: '', duration: '' }] });
  const [loading, setLoading]       = useState(true);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [aRes, rRes, pRes] = await Promise.all([getDoctorAppointments(), getDoctorPrescriptions(), getAllPatients()]);
      setApps(aRes.data.data);
      setRx(rRes.data.data);
      setPatients(pRes.data.data);
    } catch { toast.error('Failed to load data'); }
    setLoading(false);
  };

  const handleStatusChange = async (id, status) => {
    try {
      await updateAppointmentStatus(id, { status });
      toast.success(`Appointment ${status}`);
      fetchData();
    } catch { toast.error('Failed'); }
  };

  const addMedicine = () => setRxForm(f => ({ ...f, medicines: [...f.medicines, { name: '', dosage: '', frequency: '', duration: '' }] }));
  const removeMedicine = (i) => setRxForm(f => ({ ...f, medicines: f.medicines.filter((_, idx) => idx !== i) }));
  const updateMedicine = (i, field, val) => setRxForm(f => ({ ...f, medicines: f.medicines.map((m, idx) => idx === i ? { ...m, [field]: val } : m) }));

  const handleCreateRx = async (e) => {
    e.preventDefault();
    try {
      await createPrescription(rxForm);
      toast.success('Prescription created!');
      setShowRxForm(false);
      setRxForm({ patient: '', diagnosis: '', advice: '', medicines: [{ name: '', dosage: '', frequency: '', duration: '' }] });
      fetchData();
    } catch { toast.error('Failed to create prescription'); }
  };

  const today = appointments.filter(a => new Date(a.date).toDateString() === new Date().toDateString());
  const statusBadge = (s) => <span className={`badge-${s}`}>{s}</span>;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
            <Stethoscope className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-gray-800">CareSync HMS</h1>
            <p className="text-xs text-gray-500">Doctor Panel</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">🩺 Dr. {user?.name}</span>
          <button onClick={logout} className="flex items-center gap-1 text-sm text-red-500 hover:text-red-700">
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
      </header>

      <div className="p-6">
        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="card text-center">
            <p className="text-3xl font-bold text-blue-600">{appointments.length}</p>
            <p className="text-sm text-gray-500 mt-1">Total Appointments</p>
          </div>
          <div className="card text-center">
            <p className="text-3xl font-bold text-green-600">{today.length}</p>
            <p className="text-sm text-gray-500 mt-1">Today's Appointments</p>
          </div>
          <div className="card text-center">
            <p className="text-3xl font-bold text-purple-600">{prescriptions.length}</p>
            <p className="text-sm text-gray-500 mt-1">Prescriptions Written</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-5">
          {['appointments', 'prescriptions'].map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-lg text-sm font-medium capitalize ${tab === t ? 'bg-green-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}>
              {t}
            </button>
          ))}
          <button onClick={() => setShowRxForm(true)} className="ml-auto flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
            <Plus className="w-4 h-4" /> New Prescription
          </button>
        </div>

        {/* Appointments Tab */}
        {tab === 'appointments' && (
          <div className="bg-white rounded-xl border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>{['Patient','Date','Time','Reason','Status','Action'].map(h => <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">{h}</th>)}</tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {appointments.map(a => (
                  <tr key={a._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">{a.patient?.name}</td>
                    <td className="px-4 py-3 text-gray-500">{new Date(a.date).toLocaleDateString('en-IN')}</td>
                    <td className="px-4 py-3 text-gray-500">{a.time}</td>
                    <td className="px-4 py-3 text-gray-500 max-w-xs truncate">{a.reason || '—'}</td>
                    <td className="px-4 py-3">{statusBadge(a.status)}</td>
                    <td className="px-4 py-3">
                      {a.status === 'pending' && (
                        <div className="flex gap-1">
                          <button onClick={() => handleStatusChange(a._id, 'confirmed')} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200">Confirm</button>
                          <button onClick={() => handleStatusChange(a._id, 'completed')} className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded hover:bg-green-200">Complete</button>
                        </div>
                      )}
                      {a.status === 'confirmed' && (
                        <button onClick={() => handleStatusChange(a._id, 'completed')} className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded hover:bg-green-200">Mark Done</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {appointments.length === 0 && <p className="text-center text-gray-400 py-8">No appointments found</p>}
          </div>
        )}

        {/* Prescriptions Tab */}
        {tab === 'prescriptions' && (
          <div className="grid gap-4">
            {prescriptions.map(rx => (
              <div key={rx._id} className="card">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="font-semibold text-gray-800">Patient: {rx.patient?.name}</p>
                    <p className="text-sm text-gray-500">Diagnosis: {rx.diagnosis}</p>
                  </div>
                  <p className="text-xs text-gray-400">{new Date(rx.createdAt).toLocaleDateString('en-IN')}</p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {rx.medicines.map((m, i) => (
                    <div key={i} className="bg-blue-50 rounded-lg p-2 text-xs">
                      <p className="font-medium text-blue-800">{m.name}</p>
                      <p className="text-blue-600">{m.dosage} · {m.frequency} · {m.duration}</p>
                    </div>
                  ))}
                </div>
                {rx.advice && <p className="text-xs text-gray-500 mt-2">Advice: {rx.advice}</p>}
              </div>
            ))}
            {prescriptions.length === 0 && <p className="text-center text-gray-400 py-8">No prescriptions yet</p>}
          </div>
        )}
      </div>

      {/* New Prescription Modal */}
      {showRxForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-800">New Prescription</h3>
              <button onClick={() => setShowRxForm(false)}><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <form onSubmit={handleCreateRx} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Patient</label>
                <select value={rxForm.patient} onChange={e => setRxForm(f=>({...f,patient:e.target.value}))} className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" required>
                  <option value="">Select patient...</option>
                  {patients.map(p => <option key={p._id} value={p._id}>{p.name} ({p.email})</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Diagnosis</label>
                <input value={rxForm.diagnosis} onChange={e=>setRxForm(f=>({...f,diagnosis:e.target.value}))} className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="e.g. Viral Fever" required />
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-medium text-gray-700">Medicines</label>
                  <button type="button" onClick={addMedicine} className="text-xs text-blue-600 hover:underline">+ Add Medicine</button>
                </div>
                {rxForm.medicines.map((m, i) => (
                  <div key={i} className="grid grid-cols-2 gap-2 mb-2 p-3 bg-gray-50 rounded-lg">
                    <input placeholder="Medicine name" value={m.name} onChange={e=>updateMedicine(i,'name',e.target.value)} className="border rounded px-2 py-1.5 text-sm col-span-2 focus:outline-none focus:ring-1 focus:ring-blue-400" required />
                    <input placeholder="Dosage (e.g. 500mg)" value={m.dosage} onChange={e=>updateMedicine(i,'dosage',e.target.value)} className="border rounded px-2 py-1.5 text-sm focus:outline-none" />
                    <input placeholder="Frequency (e.g. 3x/day)" value={m.frequency} onChange={e=>updateMedicine(i,'frequency',e.target.value)} className="border rounded px-2 py-1.5 text-sm focus:outline-none" />
                    <input placeholder="Duration (e.g. 5 days)" value={m.duration} onChange={e=>updateMedicine(i,'duration',e.target.value)} className="border rounded px-2 py-1.5 text-sm focus:outline-none" />
                    {rxForm.medicines.length > 1 && (
                      <button type="button" onClick={()=>removeMedicine(i)} className="text-red-400 text-xs hover:text-red-600 text-left">Remove</button>
                    )}
                  </div>
                ))}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Advice / Notes</label>
                <textarea value={rxForm.advice} onChange={e=>setRxForm(f=>({...f,advice:e.target.value}))} className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" rows={2} placeholder="Rest, drink fluids, follow-up in 7 days..." />
              </div>

              <div className="flex gap-3 pt-2">
                <button type="submit" className="flex-1 btn-primary">Create Prescription</button>
                <button type="button" onClick={()=>setShowRxForm(false)} className="flex-1 btn-secondary">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorDashboard;
