import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import DashboardLayout from '../../layouts/DashboardLayout';
import { Bed, CheckCircle, AlertTriangle, XCircle, RefreshCw, Wrench, Shield, User, Filter } from 'lucide-react';
import toast from 'react-hot-toast';

const FLOORS = [
  { floor: 0, label: 'All Floors' },
  { floor: 1, label: 'Floor 1 · General Ward' },
  { floor: 2, label: 'Floor 2 · Semi-Private' },
  { floor: 3, label: 'Floor 3 · Intensive Care Unit (ICU)' },
  { floor: 4, label: 'Floor 4 · Deluxe Suites' },
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
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#dcdcde] pb-4 bg-white p-6 rounded-md shadow-xs">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 bg-[#e6f4f8] text-[#006088] rounded-md">
                <Bed className="w-6 h-6" />
              </span>
              <h1 className="text-2xl font-semibold text-[#2c3338] tracking-tight">4-Floor Inpatient Bed Matrix</h1>
            </div>
            <p className="text-sm text-[#50575e] mt-1">
              Live ward monitoring, real-time sanitization/maintenance status, and bed allocation registry across all 4 hospital floors.
            </p>
          </div>
          <button
            onClick={() => {
              fetchBeds();
              fetchStats();
            }}
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-[#f6f7f7] hover:bg-[#eaeaea] text-[#2c3338] border border-[#dcdcde] text-sm font-medium rounded-sm shadow-xs transition-colors cursor-pointer"
          >
            <RefreshCw className="w-4 h-4 text-gray-500" />
            Refresh Status
          </button>
        </div>

        {/* Stats KPI Cards */}
        {stats && (
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="bg-white p-4 rounded-md border border-[#dcdcde] shadow-xs">
              <p className="text-xs font-semibold text-[#50575e] uppercase">Total Capacity</p>
              <h3 className="text-2xl font-bold text-[#2c3338] mt-1">{stats.total}</h3>
              <span className="text-xs text-gray-400">All 4 Floors</span>
            </div>
            <div className="bg-white p-4 rounded-md border border-emerald-200 shadow-xs bg-emerald-50/20">
              <p className="text-xs font-semibold text-emerald-800 uppercase">Available Beds</p>
              <h3 className="text-2xl font-bold text-emerald-600 mt-1">{stats.available}</h3>
              <span className="text-xs text-emerald-600">Ready for admission</span>
            </div>
            <div className="bg-white p-4 rounded-md border border-rose-200 shadow-xs bg-rose-50/20">
              <p className="text-xs font-semibold text-rose-800 uppercase">Occupied Beds</p>
              <h3 className="text-2xl font-bold text-rose-600 mt-1">{stats.occupied}</h3>
              <span className="text-xs text-rose-600">In-treatment</span>
            </div>
            <div className="bg-white p-4 rounded-md border border-amber-200 shadow-xs bg-amber-50/20">
              <p className="text-xs font-semibold text-amber-800 uppercase">Maintenance</p>
              <h3 className="text-2xl font-bold text-amber-600 mt-1">{stats.maintenance}</h3>
              <span className="text-xs text-amber-600">Sanitizing / repair</span>
            </div>
            <div className="bg-white p-4 rounded-md border border-[#dcdcde] shadow-xs">
              <p className="text-xs font-semibold text-[#50575e] uppercase">Occupancy Rate</p>
              <h3 className="text-2xl font-bold text-[#006088] mt-1">{stats.occupancyRate}%</h3>
              <div className="w-full bg-gray-200 h-1.5 rounded-full mt-2 overflow-hidden">
                <div
                  className="bg-[#006088] h-full rounded-full transition-all duration-300"
                  style={{ width: `${stats.occupancyRate}%` }}
                ></div>
              </div>
            </div>
          </div>
        )}

        {/* Floor and Status Filter Tabs */}
        <div className="bg-white p-4 rounded-md border border-[#dcdcde] shadow-xs flex flex-col md:flex-row gap-4 justify-between items-center">
          {/* Floor selection */}
          <div className="flex items-center gap-1 border-b md:border-b-0 border-[#dcdcde] pb-2 md:pb-0 overflow-x-auto w-full md:w-auto">
            {FLOORS.map((f) => (
              <button
                key={f.floor}
                onClick={() => setSelectedFloor(f.floor)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-sm transition-colors cursor-pointer whitespace-nowrap ${
                  selectedFloor === f.floor
                    ? 'bg-[#006088] text-white'
                    : 'text-[#50575e] hover:bg-[#f6f7f7] hover:text-[#2c3338]'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Status filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-[#50575e] uppercase">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 text-xs border border-[#dcdcde] rounded-sm bg-white text-[#2c3338] focus:outline-hidden focus:border-[#0087be]"
            >
              <option value="ALL">All Statuses</option>
              <option value="AVAILABLE">Available</option>
              <option value="OCCUPIED">Occupied</option>
              <option value="MAINTENANCE">Maintenance</option>
            </select>
          </div>
        </div>

        {/* 4-Floor Bed Grid */}
        {loading ? (
          <div className="bg-white p-12 text-center rounded-md border border-[#dcdcde]">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-[#0087be] border-t-transparent"></div>
            <p className="mt-3 text-sm text-[#50575e]">Updating ward state...</p>
          </div>
        ) : beds.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-md border border-[#dcdcde]">
            <Bed className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-base font-medium text-[#2c3338]">No beds match the current filter</p>
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
                      <span className="text-xs font-bold text-gray-400">FL {b.floor}</span>
                      <h4 className="font-bold text-base text-[#2c3338]">{b.bedNumber}</h4>
                      <p className="text-xs text-[#006088] font-medium">{b.wardType}</p>
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

                  <div className="mt-3 pt-3 border-t border-gray-100 text-xs space-y-1.5">
                    <div className="flex justify-between text-gray-500">
                      <span>Rate / Day:</span>
                      <span className="font-semibold text-[#2c3338]">₹{b.dailyRate}</span>
                    </div>

                    {b.status === 'OCCUPIED' && b.currentPatient ? (
                      <div className="mt-2 p-2 bg-rose-50/50 rounded-sm border border-rose-100">
                        <p className="text-[11px] font-semibold text-rose-900 flex items-center gap-1">
                          <User className="w-3 h-3 text-rose-600" />
                          {b.currentPatient.name}
                        </p>
                        <p className="text-[10px] text-gray-500 mt-0.5">
                          Admitted: {new Date(b.admissionDate).toLocaleDateString()}
                        </p>
                      </div>
                    ) : (
                      <p className="text-[11px] text-gray-400 italic pt-1">No patient admitted</p>
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                  <button
                    onClick={() => handleToggleMaintenance(b._id)}
                    disabled={b.status === 'OCCUPIED'}
                    className={`text-xs px-2.5 py-1 rounded-sm font-medium flex items-center gap-1 transition-colors cursor-pointer ${
                      b.status === 'OCCUPIED'
                        ? 'text-gray-300 cursor-not-allowed'
                        : b.status === 'MAINTENANCE'
                        ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                    title={
                      b.status === 'OCCUPIED'
                        ? 'Cannot service an occupied bed'
                        : 'Toggle sanitation/maintenance mode'
                    }
                  >
                    <Wrench className="w-3 h-3" />
                    {b.status === 'MAINTENANCE' ? 'Finish Service' : 'Service Bed'}
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
