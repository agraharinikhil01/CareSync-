import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  getDoctorAppointments,
  getDoctorPrescriptions,
  updateAppointmentStatus,
  createPrescription,
  getAllPatients
} from '../../api/endpoints';
import toast from 'react-hot-toast';
import {
  Stethoscope,
  LogOut,
  Calendar,
  FileText,
  Plus,
  X,
  CheckCircle,
  Heart,
  User,
  Clock
} from 'lucide-react';

const DoctorDashboard = () => {
  const { user, logout } = useAuth();
  const [tab, setTab] = useState('appointments');
  const [appointments, setApps] = useState([]);
  const [prescriptions, setRx] = useState([]);
  const [patients, setPatients] = useState([]);
  const [showRxForm, setShowRxForm] = useState(false);
  const [rxForm, setRxForm] = useState({
    patient: '',
    diagnosis: '',
    advice: '',
    medicines: [{ name: '', dosage: '', frequency: '', duration: '' }],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [aRes, rRes, pRes] = await Promise.all([
        getDoctorAppointments(),
        getDoctorPrescriptions(),
        getAllPatients(),
      ]);
      setApps(aRes.data.data);
      setRx(rRes.data.data);
      setPatients(pRes.data.data);
    } catch {
      toast.error('Failed to load clinical data');
    }
    setLoading(false);
  };

  const handleStatusChange = async (id, status) => {
    try {
      await updateAppointmentStatus(id, { status });
      toast.success(`Appointment marked as ${status}`);
      fetchData();
    } catch {
      toast.error('Update failed');
    }
  };

  const addMedicine = () =>
    setRxForm((f) => ({
      ...f,
      medicines: [...f.medicines, { name: '', dosage: '', frequency: '', duration: '' }],
    }));

  const removeMedicine = (i) =>
    setRxForm((f) => ({
      ...f,
      medicines: f.medicines.filter((_, idx) => idx !== i),
    }));

  const updateMedicine = (i, field, val) =>
    setRxForm((f) => ({
      ...f,
      medicines: f.medicines.map((m, idx) => (idx === i ? { ...m, [field]: val } : m)),
    }));

  const handleCreateRx = async (e) => {
    e.preventDefault();
    try {
      await createPrescription(rxForm);
      toast.success('Prescription generated successfully!');
      setShowRxForm(false);
      setRxForm({
        patient: '',
        diagnosis: '',
        advice: '',
        medicines: [{ name: '', dosage: '', frequency: '', duration: '' }],
      });
      fetchData();
    } catch {
      toast.error('Failed to create prescription');
    }
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
              <span className="font-bold text-base tracking-tight">CareSync Doctor Desk</span>
              <span className="text-[11px] bg-white/15 px-2 py-0.5 rounded text-emerald-100 font-medium">
                Clinical OPD
              </span>
            </div>
            <p className="text-[11px] text-blue-100 hidden sm:block">Consultation & Electronic Prescription Suite</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex flex-col text-right">
            <span className="text-xs font-semibold text-white">Dr. {user?.name}</span>
            <span className="text-[10px] text-cyan-200">Physician On Duty</span>
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
            Patient Appointments ({appointments.length})
          </button>
          <button
            onClick={() => setTab('prescriptions')}
            className={`py-3 text-sm font-medium border-b-2 transition-all cursor-pointer ${
              tab === 'prescriptions'
                ? 'border-[#0087be] text-[#006088] font-semibold'
                : 'border-transparent text-[#646970] hover:text-[#101517]'
            }`}
          >
            Prescription Records ({prescriptions.length})
          </button>
        </div>

        <button
          onClick={() => setShowRxForm(true)}
          className="bg-[#0087be] hover:bg-[#0073aa] text-white text-xs font-semibold px-3 py-1.5 rounded flex items-center gap-1.5 cursor-pointer shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" /> Write Prescription
        </button>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-6">
        
        {/* APPOINTMENTS TAB */}
        {tab === 'appointments' && (
          <div className="bg-white rounded-md border border-[#dcdcde] shadow-sm overflow-hidden">
            <div className="p-4 border-b border-[#dcdcde] flex justify-between items-center bg-[#fbfbfb]">
              <div>
                <h3 className="font-bold text-sm text-[#101517]">Assigned Patient Consultations</h3>
                <p className="text-xs text-[#646970]">Review queue, accept bookings, or complete consultations</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#f0f0f1] text-[#50575e] border-b border-[#dcdcde] uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="px-4 py-3">Patient Name</th>
                    <th className="px-4 py-3">Scheduled Date</th>
                    <th className="px-4 py-3">Time Slot</th>
                    <th className="px-4 py-3">Symptoms / Reason</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f0f0f1]">
                  {appointments.map((a) => (
                    <tr key={a._id} className="hover:bg-[#f6f7f7] transition-colors">
                      <td className="px-4 py-3.5 font-medium text-[#101517]">{a.patient?.name}</td>
                      <td className="px-4 py-3.5 text-[#50575e]">{new Date(a.date).toLocaleDateString('en-IN')}</td>
                      <td className="px-4 py-3.5 text-[#50575e]">{a.time}</td>
                      <td className="px-4 py-3.5 text-[#50575e] max-w-xs truncate">{a.reason || 'General checkup'}</td>
                      <td className="px-4 py-3.5">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                          a.status === 'completed' ? 'bg-emerald-100 text-emerald-800' :
                          a.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                          'bg-amber-100 text-amber-800'
                        }`}>
                          {a.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        {a.status === 'pending' && (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleStatusChange(a._id, 'confirmed')}
                              className="text-xs text-[#006088] hover:underline font-semibold"
                            >
                              Confirm
                            </button>
                            <span className="text-[#dcdcde]">|</span>
                            <button
                              onClick={() => handleStatusChange(a._id, 'completed')}
                              className="text-xs text-emerald-700 hover:underline font-semibold"
                            >
                              Mark Done
                            </button>
                          </div>
                        )}
                        {a.status === 'confirmed' && (
                          <button
                            onClick={() => handleStatusChange(a._id, 'completed')}
                            className="text-xs text-emerald-700 hover:underline font-semibold"
                          >
                            Mark Completed
                          </button>
                        )}
                        {a.status === 'completed' && (
                          <span className="text-[#646970] text-[11px]">✓ Finished</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {appointments.length === 0 && (
                <p className="text-center text-[#646970] text-sm py-12">No patient appointments scheduled.</p>
              )}
            </div>
          </div>
        )}

        {/* PRESCRIPTIONS TAB */}
        {tab === 'prescriptions' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {prescriptions.map((rx) => (
                <div key={rx._id} className="bg-white rounded-md border border-[#dcdcde] shadow-sm p-5">
                  <div className="flex justify-between items-start border-b border-[#f0f0f1] pb-3 mb-3">
                    <div>
                      <p className="font-bold text-sm text-[#101517]">Patient: {rx.patient?.name}</p>
                      <p className="text-xs text-[#006088] font-medium mt-0.5">Diagnosis: {rx.diagnosis}</p>
                    </div>
                    <span className="text-[11px] text-[#646970]">
                      {new Date(rx.createdAt).toLocaleDateString('en-IN')}
                    </span>
                  </div>

                  <div className="space-y-2 mb-3">
                    <p className="text-[11px] uppercase tracking-wider font-semibold text-[#646970]">Prescribed Medicines:</p>
                    {rx.medicines.map((m, idx) => (
                      <div key={idx} className="p-2 bg-[#f6f7f7] rounded border border-[#dcdcde] text-xs">
                        <span className="font-semibold text-[#101517]">{m.name}</span>
                        <span className="text-[#646970]"> — {m.dosage || 'Standard'} ({m.frequency || '1x daily'}, {m.duration || '5 days'})</span>
                      </div>
                    ))}
                  </div>

                  {rx.advice && (
                    <p className="text-xs text-[#50575e] bg-amber-50/60 p-2 rounded border border-amber-200/60">
                      <strong>Clinical Advice:</strong> {rx.advice}
                    </p>
                  )}
                </div>
              ))}
            </div>
            {prescriptions.length === 0 && (
              <div className="bg-white rounded-md border border-[#dcdcde] p-12 text-center text-[#646970] text-sm">
                No prescriptions issued yet. Click "Write Prescription" above.
              </div>
            )}
          </div>
        )}
      </main>

      {/* Prescription Modal */}
      {showRxForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-md border border-[#dcdcde] shadow-lg w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-[#dcdcde] pb-3 mb-4">
              <h3 className="font-bold text-base text-[#101517]">Issue New Clinical Prescription</h3>
              <button onClick={() => setShowRxForm(false)} className="text-[#646970] hover:text-[#101517]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateRx} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#101517] mb-1">Select Patient</label>
                <select
                  value={rxForm.patient}
                  onChange={(e) => setRxForm((f) => ({ ...f, patient: e.target.value }))}
                  className="w-full border border-[#8c8f94] rounded px-3 py-2 text-xs focus:border-[#006088] outline-none"
                  required
                >
                  <option value="">Choose patient from records...</option>
                  {patients.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.name} ({p.email})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#101517] mb-1">Diagnosis / Condition</label>
                <input
                  type="text"
                  value={rxForm.diagnosis}
                  onChange={(e) => setRxForm((f) => ({ ...f, diagnosis: e.target.value }))}
                  placeholder="e.g. Acute Viral Bronchitis"
                  className="w-full border border-[#8c8f94] rounded px-3 py-2 text-xs focus:border-[#006088] outline-none"
                  required
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-xs font-semibold text-[#101517]">Medicines</label>
                  <button type="button" onClick={addMedicine} className="text-xs text-[#006088] hover:underline font-semibold">
                    + Add Item
                  </button>
                </div>
                {rxForm.medicines.map((m, i) => (
                  <div key={i} className="p-2.5 bg-[#f6f7f7] border border-[#dcdcde] rounded mb-2 space-y-1.5 text-xs">
                    <input
                      placeholder="Medicine name (e.g. Paracetamol)"
                      value={m.name}
                      onChange={(e) => updateMedicine(i, 'name', e.target.value)}
                      className="w-full bg-white border border-[#8c8f94] rounded px-2 py-1.5 outline-none"
                      required
                    />
                    <div className="grid grid-cols-3 gap-1.5">
                      <input
                        placeholder="Dosage (500mg)"
                        value={m.dosage}
                        onChange={(e) => updateMedicine(i, 'dosage', e.target.value)}
                        className="bg-white border border-[#8c8f94] rounded px-2 py-1 outline-none"
                      />
                      <input
                        placeholder="Frequency (2x daily)"
                        value={m.frequency}
                        onChange={(e) => updateMedicine(i, 'frequency', e.target.value)}
                        className="bg-white border border-[#8c8f94] rounded px-2 py-1 outline-none"
                      />
                      <input
                        placeholder="Duration (5 days)"
                        value={m.duration}
                        onChange={(e) => updateMedicine(i, 'duration', e.target.value)}
                        className="bg-white border border-[#8c8f94] rounded px-2 py-1 outline-none"
                      />
                    </div>
                    {rxForm.medicines.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeMedicine(i)}
                        className="text-[11px] text-[#d63638] hover:underline"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#101517] mb-1">Doctor Advice / Notes</label>
                <textarea
                  value={rxForm.advice}
                  onChange={(e) => setRxForm((f) => ({ ...f, advice: e.target.value }))}
                  placeholder="Drink warm water, take rest, revisit in 7 days..."
                  rows={2}
                  className="w-full border border-[#8c8f94] rounded px-3 py-2 text-xs focus:border-[#006088] outline-none"
                />
              </div>

              <div className="flex gap-2 pt-2 border-t border-[#dcdcde]">
                <button
                  type="submit"
                  className="flex-1 bg-[#0087be] hover:bg-[#0073aa] text-white font-semibold py-2 px-4 rounded text-xs transition-colors"
                >
                  Save Prescription
                </button>
                <button
                  type="button"
                  onClick={() => setShowRxForm(false)}
                  className="bg-white border border-[#8c8f94] hover:bg-[#f6f7f7] text-[#2c3338] py-2 px-4 rounded text-xs"
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

export default DoctorDashboard;
