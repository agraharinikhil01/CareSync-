import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getBeds, admitPatient, dischargePatient, getAppointments, updateAppointmentStatus, getAllPatients, getAllDoctors, createAppointment, createBill, getBills, markBillPaid } from '../../api/endpoints';
import toast from 'react-hot-toast';
import { BedDouble, LogOut, Calendar, Receipt, Plus, X, CheckCircle } from 'lucide-react';

const ReceptionistDashboard = () => {
  const { user, logout } = useAuth();
  const [tab, setTab]             = useState('beds');
  const [beds, setBeds]           = useState([]);
  const [appointments, setApps]   = useState([]);
  const [bills, setBills]         = useState([]);
  const [patients, setPatients]   = useState([]);
  const [doctors, setDoctors]     = useState([]);
  const [showAdmit, setShowAdmit] = useState(null); // bed object
  const [showApptForm, setShowApptForm] = useState(false);
  const [selectedFloor, setSelectedFloor] = useState(1);
  const [apptForm, setApptForm]   = useState({ patient: '', doctor: '', date: '', time: '', reason: '' });
  const [loading, setLoading]     = useState(true);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [bRes, aRes, blRes, pRes, dRes] = await Promise.all([getBeds(), getAppointments(), getBills(), getAllPatients(), getAllDoctors()]);
      setBeds(bRes.data.data);
      setApps(aRes.data.data);
      setBills(blRes.data.data);
      setPatients(pRes.data.data);
      setDoctors(dRes.data.data);
    } catch { toast.error('Failed to load data'); }
    setLoading(false);
  };

  const handleAdmit = async (e) => {
    e.preventDefault();
    try {
      await admitPatient(showAdmit._id, { patientId: showAdmit.selectedPatient });
      toast.success('Patient admitted!');
      setShowAdmit(null);
      fetchData();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const handleDischarge = async (bedId) => {
    if (!window.confirm('Discharge patient from this bed?')) return;
    try {
      await dischargePatient(bedId);
      toast.success('Patient discharged!');
      fetchData();
    } catch { toast.error('Failed'); }
  };

  const handleBookAppt = async (e) => {
    e.preventDefault();
    try {
      await createAppointment(apptForm);
      toast.success('Appointment booked!');
      setShowApptForm(false);
      setApptForm({ patient: '', doctor: '', date: '', time: '', reason: '' });
      fetchData();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const handleMarkPaid = async (id) => {
    try {
      await markBillPaid(id, { paymentMethod: 'cash' });
      toast.success('Bill marked as paid');
      fetchData();
    } catch { toast.error('Failed'); }
  };

  const floorBeds = beds.filter(b => b.floor === selectedFloor);
  const floorNames = { 1: 'Floor 1 — General Ward', 2: 'Floor 2 — ICU', 3: 'Floor 3 — Private Ward', 4: 'Floor 4 — Semi-Private' };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
            <BedDouble className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-gray-800">CareSync HMS</h1>
            <p className="text-xs text-gray-500">Receptionist Panel</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">🏥 {user?.name}</span>
          <button onClick={logout} className="flex items-center gap-1 text-sm text-red-500 hover:text-red-700">
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
      </header>

      <div className="p-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="card text-center">
            <p className="text-2xl font-bold text-red-500">{beds.filter(b=>b.status==='occupied').length}</p>
            <p className="text-sm text-gray-500">Occupied Beds</p>
          </div>
          <div className="card text-center">
            <p className="text-2xl font-bold text-green-500">{beds.filter(b=>b.status==='available').length}</p>
            <p className="text-sm text-gray-500">Available Beds</p>
          </div>
          <div className="card text-center">
            <p className="text-2xl font-bold text-blue-500">{appointments.filter(a=>a.status==='pending').length}</p>
            <p className="text-sm text-gray-500">Pending Appointments</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-5 flex-wrap">
          {['beds', 'appointments', 'billing'].map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-lg text-sm font-medium capitalize ${tab === t ? 'bg-emerald-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}>
              {t}
            </button>
          ))}
          {tab === 'appointments' && (
            <button onClick={() => setShowApptForm(true)} className="ml-auto flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
              <Plus className="w-4 h-4" /> Book Appointment
            </button>
          )}
        </div>

        {/* Beds Tab */}
        {tab === 'beds' && (
          <div>
            {/* Floor Selector */}
            <div className="flex gap-2 mb-4">
              {[1,2,3,4].map(f => (
                <button key={f} onClick={() => setSelectedFloor(f)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium ${selectedFloor === f ? 'bg-emerald-600 text-white' : 'bg-white border border-gray-200 text-gray-600'}`}>
                  Floor {f}
                </button>
              ))}
            </div>
            <h3 className="text-sm font-semibold text-gray-600 mb-3">{floorNames[selectedFloor]}</h3>
            <div className="grid grid-cols-5 gap-3">
              {floorBeds.map(bed => (
                <div key={bed._id}
                  className={`p-3 rounded-xl border-2 cursor-pointer transition-all ${
                    bed.status === 'occupied'
                      ? 'border-red-300 bg-red-50'
                      : 'border-green-300 bg-green-50 hover:border-green-500'
                  }`}
                  onClick={() => {
                    if (bed.status === 'available') setShowAdmit({ ...bed, selectedPatient: '' });
                  }}
                >
                  <p className="text-xs font-bold text-gray-700">Bed {bed.bedNumber}</p>
                  {bed.status === 'occupied' ? (
                    <>
                      <p className="text-xs text-red-600 mt-1 truncate">{bed.patient?.name || 'Occupied'}</p>
                      <button onClick={(e) => { e.stopPropagation(); handleDischarge(bed._id); }}
                        className="mt-1.5 text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded hover:bg-red-200 w-full">
                        Discharge
                      </button>
                    </>
                  ) : (
                    <p className="text-xs text-green-600 mt-1">Available</p>
                  )}
                </div>
              ))}
            </div>
            <div className="flex gap-4 mt-4">
              <span className="flex items-center gap-1.5 text-xs text-gray-500"><span className="w-3 h-3 rounded bg-green-400 inline-block" /> Available</span>
              <span className="flex items-center gap-1.5 text-xs text-gray-500"><span className="w-3 h-3 rounded bg-red-400 inline-block" /> Occupied</span>
            </div>
          </div>
        )}

        {/* Appointments Tab */}
        {tab === 'appointments' && (
          <div className="bg-white rounded-xl border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>{['Patient','Doctor','Date','Time','Status','Action'].map(h => <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">{h}</th>)}</tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {appointments.map(a => (
                  <tr key={a._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">{a.patient?.name}</td>
                    <td className="px-4 py-3 text-gray-500">{a.doctor?.name}</td>
                    <td className="px-4 py-3 text-gray-500">{new Date(a.date).toLocaleDateString('en-IN')}</td>
                    <td className="px-4 py-3 text-gray-500">{a.time}</td>
                    <td className="px-4 py-3"><span className={`badge-${a.status}`}>{a.status}</span></td>
                    <td className="px-4 py-3">
                      {a.status === 'pending' && (
                        <button onClick={() => updateAppointmentStatus(a._id, { status: 'confirmed' }).then(() => { toast.success('Confirmed'); fetchData(); })}
                          className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200">Confirm</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {appointments.length === 0 && <p className="text-center text-gray-400 py-8">No appointments</p>}
          </div>
        )}

        {/* Billing Tab */}
        {tab === 'billing' && (
          <div className="bg-white rounded-xl border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>{['Patient','Amount','Status','Action'].map(h => <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">{h}</th>)}</tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {bills.map(b => (
                  <tr key={b._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">{b.patient?.name}</td>
                    <td className="px-4 py-3 font-semibold text-gray-800">₹{b.totalAmount?.toLocaleString()}</td>
                    <td className="px-4 py-3">{b.isPaid ? <span className="badge-completed">Paid</span> : <span className="badge-pending">Pending</span>}</td>
                    <td className="px-4 py-3">
                      {!b.isPaid && (
                        <button onClick={() => handleMarkPaid(b._id)} className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded hover:bg-green-200 flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" /> Mark Paid
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {bills.length === 0 && <p className="text-center text-gray-400 py-8">No bills found</p>}
          </div>
        )}
      </div>

      {/* Admit Patient Modal */}
      {showAdmit && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-gray-800">Admit Patient — Bed {showAdmit.bedNumber}</h3>
              <button onClick={() => setShowAdmit(null)}><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <form onSubmit={handleAdmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Select Patient</label>
                <select value={showAdmit.selectedPatient}
                  onChange={e => setShowAdmit(s => ({ ...s, selectedPatient: e.target.value }))}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" required>
                  <option value="">Choose patient...</option>
                  {patients.map(p => <option key={p._id} value={p._id}>{p.name} ({p.phone || p.email})</option>)}
                </select>
              </div>
              <div className="flex gap-3">
                <button type="submit" className="flex-1 btn-primary">Admit Patient</button>
                <button type="button" onClick={() => setShowAdmit(null)} className="flex-1 btn-secondary">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Book Appointment Modal */}
      {showApptForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-gray-800">Book Appointment</h3>
              <button onClick={() => setShowApptForm(false)}><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <form onSubmit={handleBookAppt} className="space-y-3">
              <select value={apptForm.patient} onChange={e=>setApptForm(f=>({...f,patient:e.target.value}))} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" required>
                <option value="">Select Patient</option>
                {patients.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
              </select>
              <select value={apptForm.doctor} onChange={e=>setApptForm(f=>({...f,doctor:e.target.value}))} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" required>
                <option value="">Select Doctor</option>
                {doctors.map(d => <option key={d._id} value={d.user?._id || d._id}>{d.user?.name} — {d.specialization}</option>)}
              </select>
              <input type="date" value={apptForm.date} onChange={e=>setApptForm(f=>({...f,date:e.target.value}))} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" required />
              <input type="time" value={apptForm.time} onChange={e=>setApptForm(f=>({...f,time:e.target.value}))} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" required />
              <input placeholder="Reason (optional)" value={apptForm.reason} onChange={e=>setApptForm(f=>({...f,reason:e.target.value}))} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              <div className="flex gap-3 pt-1">
                <button type="submit" className="flex-1 btn-primary">Book</button>
                <button type="button" onClick={() => setShowApptForm(false)} className="flex-1 btn-secondary">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReceptionistDashboard;
