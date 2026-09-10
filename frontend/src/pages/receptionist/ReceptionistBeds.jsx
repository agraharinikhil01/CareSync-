import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import DashboardLayout from '../../layouts/DashboardLayout';
import { Bed, User, ArrowRightLeft, LogOut, Wrench, Plus, RefreshCw, X, Check, ShieldCheck } from 'lucide-react';
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
    if (!window.confirm(`Discharge patient ${bed.currentPatient?.name} from Bed ${bed.bedNumber}? An automated inpatient bill will be generated.`)) return;

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
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#dcdcde] pb-4 bg-white p-6 rounded-md shadow-xs">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 bg-[#e6f4f8] text-[#006088] rounded-md">
                <Bed className="w-6 h-6" />
              </span>
              <h1 className="text-2xl font-semibold text-[#2c3338] tracking-tight">
                4-Floor Inpatient Bed Matrix & Admissions
              </h1>
            </div>
            <p className="text-sm text-[#50575e] mt-1">
              Floor-by-floor ward layout, patient admissions, bed transfers, and automated discharge invoicing.
            </p>
          </div>
          <button
            onClick={() => {
              fetchBeds();
              fetchStats();
            }}
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-[#f6f7f7] hover:bg-[#eaeaea] text-[#2c3338] border border-[#dcdcde] text-sm font-medium rounded-sm shadow-xs transition-colors cursor-pointer"
          >
            <RefreshCw className="w-4 h-4 text-gray-500" /> Refresh Grid
          </button>
        </div>

        {/* 4 Stats Chips */}
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-md border border-[#dcdcde] shadow-xs">
              <span className="text-xs font-semibold text-gray-500 uppercase">Total Ward Capacity</span>
              <p className="text-2xl font-bold text-[#2c3338] mt-1">{stats.total}</p>
            </div>
            <div className="bg-white p-4 rounded-md border border-emerald-200 bg-emerald-50/20 shadow-xs">
              <span className="text-xs font-semibold text-emerald-800 uppercase">Available</span>
              <p className="text-2xl font-bold text-emerald-600 mt-1">{stats.available}</p>
            </div>
            <div className="bg-white p-4 rounded-md border border-rose-200 bg-rose-50/20 shadow-xs">
              <span className="text-xs font-semibold text-rose-800 uppercase">Occupied</span>
              <p className="text-2xl font-bold text-rose-600 mt-1">{stats.occupied}</p>
            </div>
            <div className="bg-white p-4 rounded-md border border-amber-200 bg-amber-50/20 shadow-xs">
              <span className="text-xs font-semibold text-amber-800 uppercase">Maintenance</span>
              <p className="text-2xl font-bold text-amber-600 mt-1">{stats.maintenance}</p>
            </div>
          </div>
        )}

        {/* Floor Tabs */}
        <div className="bg-white p-2 rounded-md border border-[#dcdcde] shadow-xs flex items-center gap-1 overflow-x-auto">
          {FLOORS.map((f) => (
            <button
              key={f.floor}
              onClick={() => setSelectedFloor(f.floor)}
              className={`px-4 py-2 text-xs font-semibold rounded-sm transition-colors cursor-pointer whitespace-nowrap ${
                selectedFloor === f.floor
                  ? 'bg-[#006088] text-white'
                  : 'text-[#50575e] hover:bg-[#f6f7f7] hover:text-[#2c3338]'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Bed Cards Grid */}
        {loading ? (
          <div className="p-12 text-center bg-white rounded-md border border-[#dcdcde]">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-[#0087be] border-t-transparent"></div>
            <p className="mt-3 text-sm text-[#50575e]">Updating bed statuses across hospital wings...</p>
          </div>
        ) : beds.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-md border border-[#dcdcde]">
            <Bed className="w-12 h-12 text-gray-300 mx-auto mb-2" />
            <p className="text-base font-medium text-[#2c3338]">No beds located on this floor</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {beds.map((b) => (
              <div
                key={b._id}
                className={`bg-white rounded-md border p-4 shadow-xs flex flex-col justify-between transition-all ${
                  b.status === 'AVAILABLE'
                    ? 'border-emerald-200 hover:border-emerald-400'
                    : b.status === 'OCCUPIED'
                    ? 'border-rose-200 hover:border-rose-400'
                    : 'border-amber-200 hover:border-amber-400'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[11px] font-bold text-gray-400">FL {b.floor}</span>
                      <h4 className="font-bold text-lg text-[#2c3338] leading-tight">{b.bedNumber}</h4>
                      <p className="text-xs text-[#006088] font-medium mt-0.5">{b.wardType}</p>
                    </div>
                    <span
                      className={`text-[11px] px-2 py-0.5 rounded-full font-semibold ${
                        b.status === 'AVAILABLE'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : b.status === 'OCCUPIED'
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {b.status}
                    </span>
                  </div>

                  <div className="mt-3 pt-3 border-t border-gray-100 text-xs space-y-1">
                    <div className="flex justify-between text-gray-500">
                      <span>Daily Rate:</span>
                      <span className="font-semibold text-[#2c3338]">₹{b.dailyRate} / day</span>
                    </div>

                    {b.status === 'OCCUPIED' && b.currentPatient ? (
                      <div className="mt-2 p-2.5 bg-rose-50/60 rounded-sm border border-rose-100">
                        <p className="text-xs font-semibold text-rose-900 flex items-center gap-1">
                          <User className="w-3.5 h-3.5 text-rose-600" />
                          {b.currentPatient.name}
                        </p>
                        <p className="text-[10px] text-gray-500 mt-1">
                          Admitted: {new Date(b.admissionDate).toLocaleDateString()}
                        </p>
                      </div>
                    ) : b.status === 'MAINTENANCE' ? (
                      <p className="text-xs text-amber-700 italic pt-1 flex items-center gap-1">
                        <Wrench className="w-3 h-3" /> Undergoing sanitization
                      </p>
                    ) : (
                      <p className="text-xs text-emerald-600 font-medium pt-1">
                        ● Available for immediate admission
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between gap-1 flex-wrap">
                  {b.status === 'AVAILABLE' && (
                    <button
                      onClick={() => {
                        setAssignModalBed(b);
                        setSelectedPatientId('');
                      }}
                      className="w-full py-1.5 bg-[#0087be] hover:bg-[#006088] text-white text-xs font-semibold rounded-sm transition-colors flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" /> Admit Patient
                    </button>
                  )}

                  {b.status === 'OCCUPIED' && (
                    <div className="flex items-center gap-1 w-full">
                      <button
                        onClick={() => {
                          setTransferModalBed(b);
                          setTargetBedId('');
                        }}
                        className="flex-1 py-1 bg-gray-100 hover:bg-gray-200 text-[#2c3338] text-xs font-medium rounded-sm transition-colors flex items-center justify-center gap-1 cursor-pointer"
                        title="Transfer Patient to another bed"
                      >
                        <ArrowRightLeft className="w-3 h-3" /> Transfer
                      </button>
                      <button
                        onClick={() => handleDischarge(b)}
                        className="flex-1 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold rounded-sm transition-colors flex items-center justify-center gap-1 cursor-pointer"
                        title="Discharge patient and generate billing invoice"
                      >
                        <LogOut className="w-3 h-3" /> Discharge
                      </button>
                    </div>
                  )}

                  {b.status === 'MAINTENANCE' && (
                    <button
                      onClick={() => handleToggleMaintenance(b._id)}
                      className="w-full py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-semibold rounded-sm transition-colors cursor-pointer"
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
          <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-md border border-[#dcdcde] shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between px-6 py-4 border-b border-[#dcdcde] bg-[#f6f7f7]">
                <h3 className="font-semibold text-[#2c3338] text-base flex items-center gap-2">
                  <Bed className="w-5 h-5 text-[#006088]" />
                  Admit to Bed {assignModalBed.bedNumber}
                </h3>
                <button
                  onClick={() => setAssignModalBed(null)}
                  className="text-gray-400 hover:text-gray-600 p-1 rounded-sm cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAssign} className="p-6 space-y-4">
                <div className="bg-[#e6f4f8] p-3 rounded-sm text-xs text-[#006088] space-y-1">
                  <p>
                    <strong>Ward:</strong> {assignModalBed.wardType} (Floor {assignModalBed.floor})
                  </p>
                  <p>
                    <strong>Daily Rate:</strong> ₹{assignModalBed.dailyRate} / 24h
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#2c3338] uppercase mb-1">
                    Select Patient to Admit *
                  </label>
                  <select
                    required
                    value={selectedPatientId}
                    onChange={(e) => setSelectedPatientId(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-[#dcdcde] rounded-sm focus:outline-hidden focus:border-[#0087be] bg-white text-[#2c3338]"
                  >
                    <option value="">-- Choose Registered Patient --</option>
                    {patients.map((p) => (
                      <option key={p._id} value={p.user?._id || p.user}>
                        {p.user?.name} ({p.patientId}) - Blood: {p.bloodGroup}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="pt-4 border-t border-[#dcdcde] flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setAssignModalBed(null)}
                    className="px-4 py-2 border border-[#dcdcde] text-sm text-[#50575e] hover:bg-[#f6f7f7] rounded-sm font-medium cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#0087be] hover:bg-[#006088] text-white text-sm font-medium rounded-sm shadow-xs transition-colors cursor-pointer"
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
          <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-md border border-[#dcdcde] shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between px-6 py-4 border-b border-[#dcdcde] bg-[#f6f7f7]">
                <h3 className="font-semibold text-[#2c3338] text-base flex items-center gap-2">
                  <ArrowRightLeft className="w-5 h-5 text-[#006088]" />
                  Transfer Bed {transferModalBed.bedNumber}
                </h3>
                <button
                  onClick={() => setTransferModalBed(null)}
                  className="text-gray-400 hover:text-gray-600 p-1 rounded-sm cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleTransfer} className="p-6 space-y-4">
                <p className="text-sm text-[#50575e]">
                  Transferring patient{' '}
                  <strong className="text-[#2c3338]">{transferModalBed.currentPatient?.name}</strong> from{' '}
                  <strong>Bed {transferModalBed.bedNumber}</strong>.
                </p>

                <div>
                  <label className="block text-xs font-semibold text-[#2c3338] uppercase mb-1">
                    Select Target Available Bed *
                  </label>
                  <select
                    required
                    value={targetBedId}
                    onChange={(e) => setTargetBedId(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-[#dcdcde] rounded-sm focus:outline-hidden focus:border-[#0087be] bg-white text-[#2c3338]"
                  >
                    <option value="">-- Choose Destination Bed --</option>
                    {availableBeds.map((b) => (
                      <option key={b._id} value={b._id}>
                        Bed {b.bedNumber} · {b.wardType} (Floor {b.floor}) - ₹{b.dailyRate}/day
                      </option>
                    ))}
                  </select>
                </div>

                <div className="pt-4 border-t border-[#dcdcde] flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setTransferModalBed(null)}
                    className="px-4 py-2 border border-[#dcdcde] text-sm text-[#50575e] hover:bg-[#f6f7f7] rounded-sm font-medium cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#0087be] hover:bg-[#006088] text-white text-sm font-medium rounded-sm shadow-xs transition-colors cursor-pointer"
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
