import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import DashboardLayout from '../../layouts/DashboardLayout';
import {
  Bed,
  User,
  ArrowRightLeft,
  LogOut,
  Wrench,
  Plus,
  RefreshCw,
  X,
  Layers,
  Sparkles,
} from 'lucide-react';
import toast from 'react-hot-toast';

const FLOORS = [
  { floor: 0, label: 'All 4 Floors' },
  { floor: 1, label: 'Floor 1 · General Ward' },
  { floor: 2, label: 'Floor 2 · Semi-Private' },
  { floor: 3, label: 'Floor 3 · ICU' },
  { floor: 4, label: 'Floor 4 · Deluxe Suite' },
];

const ReceptionistBeds = () => {
  const [beds, setBeds] = useState([]);
  const [stats, setStats] = useState(null);
  const [patients, setPatients] = useState([]);
  const [selectedFloor, setSelectedFloor] = useState(0);
  const [loading, setLoading] = useState(true);

  // Modals
  const [assignModalBed, setAssignModalBed] = useState(null);
  const [transferModalBed, setTransferModalBed] = useState(null);
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [targetBedId, setTargetBedId] = useState('');

  useEffect(() => {
    fetchBeds();
    fetchStats();
    fetchPatients();
  }, [selectedFloor]);

  const fetchPatients = async () => {
    try {
      const res = await api.get('/patients');
      if (res.data.success) setPatients(res.data.data);
    } catch {
      console.log('Error loading patients');
    }
  };

  const fetchStats = async () => {
    try {
      const res = await api.get('/beds/stats');
      if (res.data.success) setStats(res.data.data);
    } catch {
      console.log('Error loading bed stats');
    }
  };

  const fetchBeds = async () => {
    setLoading(true);
    try {
      let url = '/beds?';
      if (selectedFloor !== 0) url += `floor=${selectedFloor}`;
      const res = await api.get(url);
      if (res.data.success) {
        setBeds(res.data.data);
      }
    } catch {
      toast.error('Failed to load bed matrix');
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async (e) => {
    e.preventDefault();
    if (!selectedPatientId || !assignModalBed) {
      toast.error('Please select patient');
      return;
    }

    try {
      const res = await api.post(`/beds/${assignModalBed._id}/assign`, {
        patientId: selectedPatientId,
      });
      if (res.data.success) {
        toast.success(res.data.message || 'Patient admitted and bed assigned');
        setAssignModalBed(null);
        setSelectedPatientId('');
        fetchBeds();
        fetchStats();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Bed assignment failed');
    }
  };

  const handleTransfer = async (e) => {
    e.preventDefault();
    if (!targetBedId || !transferModalBed) {
      toast.error('Please select destination bed');
      return;
    }

    try {
      const res = await api.post(`/beds/${transferModalBed._id}/transfer`, {
        targetBedId,
      });
      if (res.data.success) {
        toast.success(res.data.message || 'Patient transferred successfully');
        setTransferModalBed(null);
        setTargetBedId('');
        fetchBeds();
        fetchStats();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Transfer failed');
    }
  };

  const handleDischarge = async (bed) => {
    if (
      !window.confirm(
        `Discharge patient ${bed.currentPatient?.name} from Bed ${bed.bedNumber}? An inpatient invoice will be issued.`
      )
    )
      return;

    try {
      const res = await api.post(`/beds/${bed._id}/discharge`);
      if (res.data.success) {
        toast.success(res.data.message || 'Patient discharged and invoice issued');
        fetchBeds();
        fetchStats();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Discharge failed');
    }
  };

  const handleToggleMaintenance = async (id) => {
    try {
      const res = await api.patch(`/beds/${id}/maintenance`);
      if (res.data.success) {
        toast.success(res.data.message);
        fetchBeds();
        fetchStats();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Maintenance update failed');
    }
  };

  const availableBeds = beds.filter((b) => b.status === 'AVAILABLE');

  return (
    <DashboardLayout title="Inpatient Bed Matrix & Admissions">
      <div className="space-y-6">
        {/* Header Hero */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-teal-50 border border-teal-200/60 text-xs text-teal-800 font-semibold mb-2">
              <Layers className="w-3.5 h-3.5 text-teal-600" />
              <span>Ward Triage & Bed Allocation</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              4-Floor Bed Matrix & Admissions
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Admit walk-in patients, transfer wards, execute discharges, and toggle sanitation modes.
            </p>
          </div>
          <button
            onClick={() => {
              fetchBeds();
              fetchStats();
            }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold rounded-xl shadow-2xs transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
            <span>Refresh Beds</span>
          </button>
        </div>

        {/* 4 Stats Chips */}
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
              <span className="text-xs font-semibold text-slate-500 uppercase">Ward Capacity</span>
              <p className="text-2xl font-extrabold text-slate-900 mt-1">{stats.total}</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-emerald-200/80 bg-emerald-50/20 shadow-2xs">
              <span className="text-xs font-semibold text-emerald-800 uppercase">Available</span>
              <p className="text-2xl font-extrabold text-emerald-600 mt-1">{stats.available}</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-rose-200/80 bg-rose-50/20 shadow-2xs">
              <span className="text-xs font-semibold text-rose-800 uppercase">Occupied</span>
              <p className="text-2xl font-extrabold text-rose-600 mt-1">{stats.occupied}</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-amber-200/80 bg-amber-50/20 shadow-2xs">
              <span className="text-xs font-semibold text-amber-800 uppercase">Sanitization</span>
              <p className="text-2xl font-extrabold text-amber-600 mt-1">{stats.maintenance}</p>
            </div>
          </div>
        )}

        {/* Floor Tabs */}
        <div className="bg-white p-2 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-1.5 overflow-x-auto">
          {FLOORS.map((f) => (
            <button
              key={f.floor}
              onClick={() => setSelectedFloor(f.floor)}
              className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                selectedFloor === f.floor
                  ? 'bg-sky-600 text-white shadow-xs shadow-sky-600/20'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Bed Cards Grid */}
        {loading ? (
          <div className="p-16 text-center bg-white rounded-2xl border border-slate-200">
            <div className="w-8 h-8 border-3 border-sky-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs text-slate-500">Loading beds...</p>
          </div>
        ) : beds.length === 0 ? (
          <div className="p-16 text-center bg-white rounded-2xl border border-slate-200">
            <Bed className="w-12 h-12 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700">No beds located on this floor</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {beds.map((b) => (
              <div
                key={b._id}
                className={`bg-white rounded-2xl border p-4 shadow-xs flex flex-col justify-between transition-all hover:shadow-md ${
                  b.status === 'AVAILABLE'
                    ? 'border-emerald-200/90'
                    : b.status === 'OCCUPIED'
                    ? 'border-rose-200/90'
                    : 'border-amber-200/90'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 font-mono">
                        FL {b.floor}
                      </span>
                      <h4 className="font-extrabold text-xl text-slate-900 leading-tight">
                        {b.bedNumber}
                      </h4>
                      <p className="text-xs text-sky-700 font-medium mt-0.5">{b.wardType}</p>
                    </div>
                    <span
                      className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold ${
                        b.status === 'AVAILABLE'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : b.status === 'OCCUPIED'
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      ● {b.status}
                    </span>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 text-xs space-y-1.5">
                    <div className="flex justify-between text-slate-500">
                      <span>Daily Tariff:</span>
                      <span className="font-bold text-slate-900">₹{b.dailyRate} / day</span>
                    </div>

                    {b.status === 'OCCUPIED' && b.currentPatient ? (
                      <div className="mt-2 p-2.5 bg-rose-50/70 rounded-xl border border-rose-100">
                        <p className="text-xs font-bold text-rose-900 flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-rose-600" />
                          {b.currentPatient.name}
                        </p>
                        <p className="text-[10px] text-slate-500 mt-1">
                          Admitted: {new Date(b.admissionDate).toLocaleDateString()}
                        </p>
                      </div>
                    ) : b.status === 'MAINTENANCE' ? (
                      <p className="text-xs text-amber-700 italic pt-1 flex items-center gap-1">
                        <Wrench className="w-3 h-3" /> Undergoing sanitization
                      </p>
                    ) : (
                      <p className="text-xs text-emerald-600 font-medium pt-1">
                        ✓ Ready for admission
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-1.5 flex-wrap">
                  {b.status === 'AVAILABLE' && (
                    <button
                      onClick={() => {
                        setAssignModalBed(b);
                        setSelectedPatientId('');
                      }}
                      className="w-full py-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs shadow-sky-600/20"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Admit Patient</span>
                    </button>
                  )}

                  {b.status === 'OCCUPIED' && (
                    <div className="flex items-center gap-1.5 w-full">
                      <button
                        onClick={() => {
                          setTransferModalBed(b);
                          setTargetBedId('');
                        }}
                        className="flex-1 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors flex items-center justify-center gap-1 cursor-pointer"
                        title="Transfer Patient to another bed"
                      >
                        <ArrowRightLeft className="w-3 h-3" /> Transfer
                      </button>
                      <button
                        onClick={() => handleDischarge(b)}
                        className="flex-1 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold rounded-xl transition-colors flex items-center justify-center gap-1 cursor-pointer"
                        title="Discharge patient and generate billing invoice"
                      >
                        <LogOut className="w-3 h-3" /> Discharge
                      </button>
                    </div>
                  )}

                  {b.status === 'MAINTENANCE' && (
                    <button
                      onClick={() => handleToggleMaintenance(b._id)}
                      className="w-full py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                    >
                      Mark Ready & Available
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal: Admit Patient */}
        {assignModalBed && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                  <Bed className="w-5 h-5 text-sky-600" />
                  Admit to Bed {assignModalBed.bedNumber}
                </h3>
                <button
                  onClick={() => setAssignModalBed(null)}
                  className="text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAssign} className="p-6 space-y-4">
                <div className="bg-sky-50 p-3.5 rounded-xl text-xs text-sky-900 border border-sky-100 space-y-1">
                  <p>
                    <strong>Ward:</strong> {assignModalBed.wardType} (Floor {assignModalBed.floor})
                  </p>
                  <p>
                    <strong>Daily Rate:</strong> ₹{assignModalBed.dailyRate} / 24h
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Select Patient to Admit *
                  </label>
                  <select
                    required
                    value={selectedPatientId}
                    onChange={(e) => setSelectedPatientId(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-hidden focus:border-sky-500 bg-white text-slate-900"
                  >
                    <option value="">-- Choose Registered Patient --</option>
                    {patients.map((p) => (
                      <option key={p._id} value={p.user?._id || p.user}>
                        {p.user?.name} ({p.patientId}) - Blood: {p.bloodGroup}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="pt-4 border-t border-slate-100 flex justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setAssignModalBed(null)}
                    className="px-4 py-2 border border-slate-200 text-xs text-slate-600 hover:bg-slate-50 rounded-xl font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold rounded-xl shadow-xs shadow-sky-600/20 transition-all cursor-pointer"
                  >
                    Confirm Admission
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Transfer Bed */}
        {transferModalBed && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                  <ArrowRightLeft className="w-5 h-5 text-sky-600" />
                  Transfer Patient from Bed {transferModalBed.bedNumber}
                </h3>
                <button
                  onClick={() => setTransferModalBed(null)}
                  className="text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleTransfer} className="p-6 space-y-4">
                <p className="text-xs text-slate-600">
                  Transferring patient{' '}
                  <strong className="text-slate-900">{transferModalBed.currentPatient?.name}</strong> from{' '}
                  <strong>Bed {transferModalBed.bedNumber}</strong>.
                </p>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Select Target Available Bed *
                  </label>
                  <select
                    required
                    value={targetBedId}
                    onChange={(e) => setTargetBedId(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-hidden focus:border-sky-500 bg-white text-slate-900"
                  >
                    <option value="">-- Choose Destination Bed --</option>
                    {availableBeds.map((b) => (
                      <option key={b._id} value={b._id}>
                        Bed {b.bedNumber} · {b.wardType} (Floor {b.floor}) - ₹{b.dailyRate}/day
                      </option>
                    ))}
                  </select>
                </div>

                <div className="pt-4 border-t border-slate-100 flex justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setTransferModalBed(null)}
                    className="px-4 py-2 border border-slate-200 text-xs text-slate-600 hover:bg-slate-50 rounded-xl font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold rounded-xl shadow-xs shadow-sky-600/20 transition-all cursor-pointer"
                  >
                    Execute Transfer
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ReceptionistBeds;
