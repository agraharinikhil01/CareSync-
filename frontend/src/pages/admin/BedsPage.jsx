import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import DashboardLayout from '../../layouts/DashboardLayout';
import {
  Bed,
  CheckCircle,
  AlertTriangle,
  XCircle,
  RefreshCw,
  Wrench,
  Shield,
  User,
  Filter,
  Layers,
  Sparkles,
} from 'lucide-react';
import toast from 'react-hot-toast';

const FLOORS = [
  { floor: 0, label: 'All 4 Floors', subtitle: 'Hospital-wide ward view' },
  { floor: 1, label: 'Floor 1', subtitle: 'General Medicine Ward' },
  { floor: 2, label: 'Floor 2', subtitle: 'Semi-Private Rooms' },
  { floor: 3, label: 'Floor 3', subtitle: 'Intensive Care Unit (ICU)' },
  { floor: 4, label: 'Floor 4', subtitle: 'Deluxe Executive Suites' },
];

const BedsPage = () => {
  const [beds, setBeds] = useState([]);
  const [stats, setStats] = useState(null);
  const [selectedFloor, setSelectedFloor] = useState(0);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBeds();
    fetchStats();
  }, [selectedFloor, statusFilter]);

  const fetchStats = async () => {
    try {
      const res = await api.get('/beds/stats');
      if (res.data.success) {
        setStats(res.data.data);
      }
    } catch {
      console.log('Error loading bed stats');
    }
  };

  const fetchBeds = async () => {
    setLoading(true);
    try {
      let url = '/beds?';
      if (selectedFloor !== 0) url += `floor=${selectedFloor}&`;
      if (statusFilter !== 'ALL') url += `status=${statusFilter}`;

      const res = await api.get(url);
      if (res.data.success) {
        setBeds(res.data.data);
      }
    } catch {
      toast.error('Failed to load bed inventory');
    } finally {
      setLoading(false);
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
      toast.error(err.response?.data?.message || 'Action failed');
    }
  };

  return (
    <DashboardLayout title="4-Floor Inpatient Bed Matrix">
      <div className="space-y-6">
        {/* Header Hero */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-sky-50 border border-sky-200/60 text-xs text-sky-800 font-semibold mb-2">
              <Layers className="w-3.5 h-3.5 text-sky-600" />
              <span>Ward Infrastructure Telemetry</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              4-Floor Bed Matrix & Inpatient Ward Map
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Live ward monitoring, real-time sanitization/maintenance status, and bed allocation registry across all hospital floors.
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
            <span>Refresh Ward State</span>
          </button>
        </div>

        {/* Stats KPI Cards */}
        {stats && (
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
            <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
              <p className="text-xs font-semibold text-slate-500 uppercase">Total Capacity</p>
              <h3 className="text-2xl font-extrabold text-slate-900 mt-1">{stats.total}</h3>
              <span className="text-[11px] text-slate-400">All 4 Floors</span>
            </div>
            <div className="bg-white p-4 rounded-xl border border-emerald-200/80 bg-emerald-50/20 shadow-2xs">
              <p className="text-xs font-semibold text-emerald-800 uppercase">Available</p>
              <h3 className="text-2xl font-extrabold text-emerald-600 mt-1">{stats.available}</h3>
              <span className="text-[11px] text-emerald-600">Ready for admission</span>
            </div>
            <div className="bg-white p-4 rounded-xl border border-rose-200/80 bg-rose-50/20 shadow-2xs">
              <p className="text-xs font-semibold text-rose-800 uppercase">Occupied</p>
              <h3 className="text-2xl font-extrabold text-rose-600 mt-1">{stats.occupied}</h3>
              <span className="text-[11px] text-rose-600">In-treatment</span>
            </div>
            <div className="bg-white p-4 rounded-xl border border-amber-200/80 bg-amber-50/20 shadow-2xs">
              <p className="text-xs font-semibold text-amber-800 uppercase">Sanitization</p>
              <h3 className="text-2xl font-extrabold text-amber-600 mt-1">{stats.maintenance}</h3>
              <span className="text-[11px] text-amber-600">Maintenance / clean</span>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
              <p className="text-xs font-semibold text-slate-500 uppercase">Occupancy Rate</p>
              <h3 className="text-2xl font-extrabold text-sky-600 mt-1">{stats.occupancyRate}%</h3>
              <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
                <div
                  className="bg-sky-600 h-full rounded-full transition-all duration-300"
                  style={{ width: `${stats.occupancyRate}%` }}
                ></div>
              </div>
            </div>
          </div>
        )}

        {/* Floor and Status Filter Ribbon */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row gap-4 justify-between items-center">
          {/* Floor selection tabs */}
          <div className="flex items-center gap-1.5 border-b md:border-b-0 border-slate-100 pb-2 md:pb-0 overflow-x-auto w-full md:w-auto">
            {FLOORS.map((f) => (
              <button
                key={f.floor}
                onClick={() => setSelectedFloor(f.floor)}
                className={`px-3.5 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                  selectedFloor === f.floor
                    ? 'bg-sky-600 text-white shadow-xs shadow-sky-600/20'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Status filter dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 text-xs font-semibold border border-slate-200 rounded-xl bg-white text-slate-700 focus:outline-hidden focus:border-sky-500"
            >
              <option value="ALL">All Statuses</option>
              <option value="AVAILABLE">Available Only</option>
              <option value="OCCUPIED">Occupied Only</option>
              <option value="MAINTENANCE">Maintenance Only</option>
            </select>
          </div>
        </div>

        {/* 4-Floor Bed Interactive Grid */}
        {loading ? (
          <div className="p-16 text-center bg-white rounded-2xl border border-slate-200">
            <div className="w-8 h-8 border-3 border-sky-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs text-slate-500">Scanning ward floors...</p>
          </div>
        ) : beds.length === 0 ? (
          <div className="p-16 text-center bg-white rounded-2xl border border-slate-200">
            <Bed className="w-12 h-12 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700">No beds located for this criteria</p>
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
                        FLOOR {b.floor}
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
                        <Wrench className="w-3 h-3" /> Under sanitization
                      </p>
                    ) : (
                      <p className="text-xs text-emerald-600 font-medium pt-1">
                        ✓ Ready for immediate triage
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <button
                    onClick={() => handleToggleMaintenance(b._id)}
                    disabled={b.status === 'OCCUPIED'}
                    className={`w-full text-xs py-1.5 rounded-xl font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                      b.status === 'OCCUPIED'
                        ? 'text-slate-300 bg-slate-50 cursor-not-allowed'
                        : b.status === 'MAINTENANCE'
                        ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <Wrench className="w-3.5 h-3.5" />
                    <span>{b.status === 'MAINTENANCE' ? 'Finish Service & Ready' : 'Service Bed'}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default BedsPage;
