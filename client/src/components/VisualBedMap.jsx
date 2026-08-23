import React, { useState, useEffect } from 'react';
import {
  BedDouble,
  Activity,
  HeartPulse,
  ShieldAlert,
  UserCheck,
  CheckCircle2,
  Clock,
  Sparkles,
  AlertCircle,
  LogOut,
  Plus,
  Search,
  Filter,
  Layers,
  Building2,
  Zap,
  Info,
  Check,
} from 'lucide-react';
import Modal from './Modal';

export const VisualBedMap = ({
  beds = [],
  patients = [],
  onAllocateBed,
  onReleaseBed,
  loading = false,
}) => {
  const [localBeds, setLocalBeds] = useState(beds);
  const [selectedFloor, setSelectedFloor] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL', 'VACANT', 'OCCUPIED'
  const [searchQuery, setSearchQuery] = useState('');

  // Keep localBeds synced with props
  useEffect(() => {
    setLocalBeds(beds);
  }, [beds]);

  // Allocation Modal State
  const [isAllocateModalOpen, setIsAllocateModalOpen] = useState(false);
  const [targetBed, setTargetBed] = useState(null);
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [allocationSubmitting, setAllocationSubmitting] = useState(false);
  const [actionSuccessMsg, setActionSuccessMsg] = useState('');
  const [modalError, setModalError] = useState('');

  // Floor Definitions
  const FLOORS = [
    { id: 'ALL', name: 'All Wards', icon: '🌐', desc: 'Panoramic Hospital Overview' },
    { id: 'Emergency', name: 'Ground Floor', badge: 'Trauma & Emergency ER', icon: '🚨', desc: 'Critical triage & emergency stabilization' },
    { id: 'ICU', name: '1st Floor', badge: 'Intensive Care Unit (ICU)', icon: '🫀', desc: 'High-dependency life-support & monitoring' },
    { id: 'General Ward', name: '2nd Floor', badge: 'General Medical Ward', icon: '🛏️', desc: 'Inpatient recovery & standard care' },
    { id: 'Private Room', name: '3rd Floor', badge: 'VIP & Executive Suites', icon: '🌟', desc: 'Private en-suite recovery rooms' },
  ];

  // Filter beds based on floor, status and search query
  const filteredBeds = localBeds.filter((bed) => {
    // Floor filter
    if (selectedFloor !== 'ALL' && bed.type !== selectedFloor) return false;

    // Status filter
    if (statusFilter === 'VACANT' && bed.isOccupied) return false;
    if (statusFilter === 'OCCUPIED' && !bed.isOccupied) return false;

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchNumber = bed.bedNumber?.toLowerCase().includes(q);
      const matchWard = bed.ward?.toLowerCase().includes(q);
      const matchPatient = bed.patientId?.name?.toLowerCase().includes(q);
      if (!matchNumber && !matchWard && !matchPatient) return false;
    }

    return true;
  });

  // Calculate live KPI statistics from localBeds
  const totalBeds = localBeds.length;
  const occupiedBeds = localBeds.filter((b) => b.isOccupied).length;
  const vacantBeds = totalBeds - occupiedBeds;
  const occupancyPercent = totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0;
  const icuBeds = localBeds.filter((b) => b.type === 'ICU');
  const icuAvailable = icuBeds.filter((b) => !b.isOccupied).length;

  // Map of patientId -> bedNumber for all currently admitted patients
  const occupiedPatientMap = {};
  localBeds.forEach((b) => {
    if (b.isOccupied && b.patientId) {
      const pid = (b.patientId._id || b.patientId).toString();
      occupiedPatientMap[pid] = b.bedNumber;
    }
  });

  const availablePatients = patients.filter(
    (p) => !occupiedPatientMap[p._id.toString()]
  );

  const handleOpenAllocate = (bed) => {
    setTargetBed(bed);
    // Auto-select first unadmitted patient
    const firstAvailable = patients.find((p) => !occupiedPatientMap[p._id.toString()]);
    setSelectedPatientId(firstAvailable ? firstAvailable._id : '');
    setModalError('');
    setIsAllocateModalOpen(true);
  };

  const handleConfirmAllocate = async (e) => {
    e.preventDefault();
    if (!targetBed || !selectedPatientId) return;

    try {
      setModalError('');
      setAllocationSubmitting(true);
      const chosenPatient = patients.find((p) => p._id === selectedPatientId) || { name: 'Admitted Patient' };

      await onAllocateBed(targetBed._id, selectedPatientId);

      // On verified success, mark bed as occupied
      setLocalBeds((prev) =>
        prev.map((b) =>
          b._id === targetBed._id
            ? {
                ...b,
                isOccupied: true,
                patientId: chosenPatient,
                assignedAt: new Date(),
              }
            : b
        )
      );

      setActionSuccessMsg(`Bed ${targetBed.bedNumber} allocated successfully to ${chosenPatient.name}!`);
      setIsAllocateModalOpen(false);
      setTimeout(() => setActionSuccessMsg(''), 3500);
    } catch (err) {
      console.error('Allocation error:', err);
      setModalError(err.response?.data?.message || err.message || 'Allocation failed. Please try again.');
    } finally {
      setAllocationSubmitting(false);
    }
  };

  const handleRelease = async (bed) => {
    if (window.confirm(`Are you sure you want to discharge and release Bed ${bed.bedNumber}?`)) {
      try {
        // Optimistic instant release (0ms delay)
        setLocalBeds((prev) =>
          prev.map((b) =>
            b._id === bed._id
              ? {
                  ...b,
                  isOccupied: false,
                  patientId: null,
                  assignedAt: null,
                }
              : b
          )
        );

        await onReleaseBed(bed._id);
        setActionSuccessMsg(`Bed ${bed.bedNumber} has been released and marked available!`);
        setTimeout(() => setActionSuccessMsg(''), 3500);
      } catch (err) {
        console.error('Release error:', err);
        setLocalBeds(beds);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* SUCCESS NOTIFICATION TOAST */}
      {actionSuccessMsg && (
        <div className="p-4 bg-emerald-500 text-white rounded-2xl shadow-lg shadow-emerald-500/20 font-bold flex items-center justify-between animate-bounce">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-white" />
            <span>{actionSuccessMsg}</span>
          </div>
          <button onClick={() => setActionSuccessMsg('')} className="text-white/80 hover:text-white text-xs">
            ✕ Dismiss
          </button>
        </div>
      )}

      {/* HOSPITAL BED OCCUPANCY METER & KPIS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Hospital Capacity */}
        <div className="p-5 bg-white rounded-3xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Total Hospital Beds</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-black text-slate-900">{totalBeds}</span>
              <span className="text-xs font-semibold text-slate-500">Beds</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Across 4 Active Wings</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold">
            <Building2 className="w-6 h-6" />
          </div>
        </div>

        {/* Card 2: Vacant & Ready */}
        <div className="p-5 bg-white rounded-3xl border border-emerald-100 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider block">Available / Vacant</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-black text-emerald-600">{vacantBeds}</span>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                {100 - occupancyPercent}% Free
              </span>
            </div>
            <p className="text-[11px] text-emerald-600/80 mt-1">Ready for Immediate Admission</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <Check className="w-6 h-6" />
          </div>
        </div>

        {/* Card 3: Occupied & Inpatient */}
        <div className="p-5 bg-white rounded-3xl border border-rose-100 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-rose-600 uppercase tracking-wider block">Occupied Beds</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-black text-rose-600">{occupiedBeds}</span>
              <span className="text-xs font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md">
                {occupancyPercent}% Load
              </span>
            </div>
            <p className="text-[11px] text-rose-600/80 mt-1">Patients Currently Admitted</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
            <Activity className="w-6 h-6" />
          </div>
        </div>

        {/* Card 4: Critical ICU Readiness */}
        <div className="p-5 bg-white rounded-3xl border border-amber-100 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-amber-600 uppercase tracking-wider block">ICU Critical Care</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-black text-amber-600">{icuAvailable}</span>
              <span className="text-xs font-semibold text-slate-500">/ {icuBeds.length} Ready</span>
            </div>
            <p className="text-[11px] text-amber-700 mt-1">Ventilator & Life-Support Standby</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <Zap className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* FLOOR SELECTOR TABS (GROUND, 1ST, 2ND, 3RD) */}
      <div className="bg-white p-3 rounded-3xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {FLOORS.map((floor) => {
            const countForFloor = floor.id === 'ALL' ? beds.length : beds.filter((b) => b.type === floor.id).length;
            const isSelected = selectedFloor === floor.id;

            return (
              <button
                key={floor.id}
                onClick={() => setSelectedFloor(floor.id)}
                className={`flex items-center gap-2.5 px-4 py-3 rounded-2xl text-xs font-black transition-all whitespace-nowrap ${
                  isSelected
                    ? 'bg-slate-900 text-white shadow-md shadow-slate-900/20 scale-100'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200/60'
                }`}
              >
                <span className="text-base">{floor.icon}</span>
                <div className="text-left">
                  <div className="font-bold flex items-center gap-1.5">
                    <span>{floor.name}</span>
                    {floor.badge && (
                      <span
                        className={`text-[9px] px-1.5 py-0.2 rounded font-bold ${
                          isSelected ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        {floor.badge}
                      </span>
                    )}
                  </div>
                </div>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-bold ml-1 ${
                    isSelected ? 'bg-sky-500 text-white' : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {countForFloor}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* FILTER & SEARCH TOOLBAR */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
        {/* Status Filter Chips */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-500 flex items-center gap-1 mr-1">
            <Filter className="w-3.5 h-3.5" /> Filter Beds:
          </span>
          <button
            onClick={() => setStatusFilter('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              statusFilter === 'ALL'
                ? 'bg-slate-900 text-white'
                : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
            }`}
          >
            All Status ({beds.length})
          </button>
          <button
            onClick={() => setStatusFilter('VACANT')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              statusFilter === 'VACANT'
                ? 'bg-emerald-600 text-white'
                : 'bg-white text-emerald-700 hover:bg-emerald-50 border border-emerald-200'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            🟢 Available ({vacantBeds})
          </button>
          <button
            onClick={() => setStatusFilter('OCCUPIED')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              statusFilter === 'OCCUPIED'
                ? 'bg-rose-600 text-white'
                : 'bg-white text-rose-700 hover:bg-rose-50 border border-rose-200'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-rose-500"></span>
            🔴 Occupied ({occupiedBeds})
          </button>
        </div>

        {/* Search Box */}
        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search bed number or patient..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-none"
          />
        </div>
      </div>

      {/* VISUAL BED MAP GRID */}
      {filteredBeds.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-3xl border border-slate-200 space-y-3">
          <BedDouble className="w-12 h-12 text-slate-300 mx-auto" />
          <h4 className="font-bold text-slate-700 text-sm">No beds found matching the filter</h4>
          <p className="text-xs text-slate-400">Try changing the floor or status filter</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredBeds.map((bed) => {
            const isOccupied = bed.isOccupied;

            return (
              <div
                key={bed._id}
                className={`relative rounded-3xl border-2 transition-all duration-300 overflow-hidden flex flex-col justify-between ${
                  isOccupied
                    ? 'bg-gradient-to-b from-rose-50/70 to-white border-rose-200 hover:border-rose-300 hover:shadow-lg hover:shadow-rose-500/10'
                    : 'bg-gradient-to-b from-emerald-50/70 to-white border-emerald-200 hover:border-emerald-400 hover:shadow-lg hover:shadow-emerald-500/10'
                }`}
              >
                {/* Top Status Banner */}
                <div
                  className={`px-4 py-2 flex items-center justify-between text-xs font-black border-b ${
                    isOccupied
                      ? 'bg-rose-100/70 text-rose-800 border-rose-200'
                      : 'bg-emerald-100/70 text-emerald-800 border-emerald-200'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`w-2.5 h-2.5 rounded-full ${
                        isOccupied ? 'bg-rose-500' : 'bg-emerald-500 animate-pulse'
                      }`}
                    ></span>
                    <span>{isOccupied ? 'OCCUPIED' : 'VACANT • READY'}</span>
                  </div>
                  <span className="font-mono text-[11px] font-bold text-slate-600">₹{bed.dailyRate}/day</span>
                </div>

                {/* Bed Body Content */}
                <div className="p-4 space-y-3.5 flex-1">
                  {/* Bed Icon & Identifier */}
                  <div className="flex items-start justify-between">
                    <div className="space-y-0.5">
                      <h3 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-1.5">
                        {bed.bedNumber}
                      </h3>
                      <p className="text-[11px] font-bold text-slate-500">{bed.ward}</p>
                    </div>

                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold shadow-sm ${
                        isOccupied
                          ? 'bg-rose-100 text-rose-600'
                          : 'bg-emerald-100 text-emerald-700'
                      }`}
                    >
                      <BedDouble className="w-6 h-6" />
                    </div>
                  </div>

                  {/* Ward Type Tag */}
                  <div>
                    <span className="px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200 inline-block">
                      {bed.type}
                    </span>
                  </div>

                  {/* Occupant Details or Amenities */}
                  {isOccupied ? (
                    <div className="p-3 bg-rose-50/80 rounded-2xl border border-rose-100 space-y-1.5 text-xs">
                      <span className="text-[10px] font-extrabold text-rose-600 uppercase tracking-wider block">
                        Admitted Patient:
                      </span>
                      <p className="font-black text-slate-900 text-sm">{bed.patientId?.name || 'Assigned Patient'}</p>
                      <p className="text-[11px] text-slate-500">{bed.patientId?.phone || bed.patientId?.email}</p>
                      <p className="text-[10px] text-slate-400 font-semibold pt-1 border-t border-rose-200/60">
                        Admitted: {new Date(bed.assignedAt || bed.updatedAt).toLocaleDateString()}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Equipped Features:
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {bed.features?.map((feat, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-600 text-[10px] font-semibold"
                          >
                            {feat}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Bottom Action Footer */}
                <div className="p-3 bg-white/80 border-t border-slate-100">
                  {isOccupied ? (
                    <button
                      onClick={() => handleRelease(bed)}
                      className="w-full py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 hover:text-rose-800 rounded-xl font-bold text-xs border border-rose-200 transition flex items-center justify-center gap-1.5 shadow-sm"
                    >
                      <LogOut className="w-3.5 h-3.5" /> Discharge / Release Bed
                    </button>
                  ) : (
                    <button
                      onClick={() => handleOpenAllocate(bed)}
                      className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black text-xs transition flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/30"
                    >
                      <UserCheck className="w-3.5 h-3.5" /> Assign to Patient
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* QUICK BED ALLOCATION MODAL */}
      <Modal
        isOpen={isAllocateModalOpen}
        onClose={() => setIsAllocateModalOpen(false)}
        title={`Allocate Bed: ${targetBed?.bedNumber || ''}`}
        maxWidth="max-w-md"
      >
        {targetBed && (
          <form onSubmit={handleConfirmAllocate} className="space-y-4 text-xs">
            <div className="p-4 bg-sky-50 rounded-2xl border border-sky-100 space-y-1">
              <div className="flex justify-between items-center">
                <span className="font-bold text-sky-800 uppercase text-[10px]">Target Location:</span>
                <span className="font-bold text-sky-700 bg-white px-2 py-0.5 rounded border border-sky-200">
                  {targetBed.type}
                </span>
              </div>
              <h4 className="font-black text-slate-900 text-base">{targetBed.bedNumber}</h4>
              <p className="text-slate-600 text-[11px]">{targetBed.ward}</p>
              <p className="text-slate-700 font-bold text-[11px] pt-1">
                Room Daily Tariff: ₹{targetBed.dailyRate} / day
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="block font-bold text-slate-700">Select Patient for Admission *</label>
              {patients.length > 0 ? (
                availablePatients.length > 0 ? (
                  <select
                    value={selectedPatientId}
                    onChange={(e) => setSelectedPatientId(e.target.value)}
                    required
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  >
                    <option value="">-- Select Patient to Admit --</option>
                    {patients.map((p) => {
                      const isAdmitted = !!occupiedPatientMap[p._id.toString()];
                      return (
                        <option
                          key={p._id}
                          value={p._id}
                          disabled={isAdmitted}
                          className={isAdmitted ? 'text-slate-400 bg-slate-100' : 'text-slate-900 font-bold'}
                        >
                          {p.name} {isAdmitted ? `[Already Admitted in ${occupiedPatientMap[p._id.toString()]}]` : `(${p.phone || p.email || 'Ready for Admission'})`}
                        </option>
                      );
                    })}
                  </select>
                ) : (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs space-y-1">
                    <p className="font-bold">⚠️ All registered patients are currently admitted in hospital beds.</p>
                    <p className="text-slate-600">To admit a new patient, register them first in the Intake tab, or release an existing patient from their bed.</p>
                  </div>
                )
              ) : (
                <p className="text-amber-600 bg-amber-50 p-2.5 rounded-xl border border-amber-200">
                  No registered patients found. Please register a patient first in the intake tab.
                </p>
              )}
            </div>

            {modalError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                <span>{modalError}</span>
              </div>
            )}

            <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsAllocateModalOpen(false)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={allocationSubmitting || !selectedPatientId}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black shadow-md shadow-emerald-600/30 disabled:opacity-50 flex items-center gap-1.5"
              >
                {allocationSubmitting ? 'Allocating...' : 'Confirm Admission'}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};
