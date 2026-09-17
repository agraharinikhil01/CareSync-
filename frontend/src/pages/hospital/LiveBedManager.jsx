import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import {
  Bed,
  ArrowLeft,
  Save,
  CheckCircle2,
  AlertCircle,
  Building2,
  HeartPulse,
  Siren,
  Shield,
  Loader2,
} from 'lucide-react';
import toast from 'react-hot-toast';

const CATEGORIES = [
  { id: 'GENERAL', label: 'General Ward Beds', icon: Bed, color: 'text-sky-600' },
  { id: 'ICU', label: 'Intensive Care Unit (ICU)', icon: HeartPulse, color: 'text-rose-600' },
  { id: 'EMERGENCY', label: 'Emergency Trauma Beds', icon: Siren, color: 'text-amber-600' },
  { id: 'ISOLATION', label: 'Infection Isolation Beds', icon: Shield, color: 'text-purple-600' },
  { id: 'PRIVATE', label: 'Private Deluxe Suites', icon: Building2, color: 'text-teal-600' },
  { id: 'SEMI_PRIVATE', label: 'Semi-Private Rooms', icon: Bed, color: 'text-indigo-600' },
];

const LiveBedManager = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [hospital, setHospital] = useState(null);
  const [beds, setBeds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingCategory, setSavingCategory] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const hRes = await api.get('/hospitals');
      if (hRes.data.success && hRes.data.data.length > 0) {
        const myHosp =
          hRes.data.data.find(
            (h) => h.adminUser === user?._id || h._id === user?.hospitalId
          ) || hRes.data.data[0];

        setHospital(myHosp);

        const bRes = await api.get(`/hospitals/${myHosp._id}/beds`);
        if (bRes.data.success) {
          // Merge with categories ensuring all categories exist
          const loaded = bRes.data.data;
          const merged = CATEGORIES.map((cat) => {
            const found = loaded.find((b) => b.category === cat.id);
            return (
              found || {
                category: cat.id,
                total: 20,
                occupied: 10,
                reserved: 0,
                maintenance: 0,
                available: 10,
              }
            );
          });
          setBeds(merged);
        }
      }
    } catch (e) {
      toast.error('Failed to load bed inventory');
    } finally {
      setLoading(false);
    }
  };

  const handleFieldChange = (category, field, value) => {
    const num = Math.max(0, parseInt(value || 0, 10));
    setBeds((prev) =>
      prev.map((b) => {
        if (b.category === category) {
          const updated = { ...b, [field]: num };
          // Auto calculate available
          const tot = field === 'total' ? num : updated.total;
          const occ = field === 'occupied' ? num : updated.occupied;
          const res = field === 'reserved' ? num : updated.reserved;
          const main = field === 'maintenance' ? num : updated.maintenance;
          updated.available = Math.max(0, tot - (occ + res + main));
          return updated;
        }
        return b;
      })
    );
  };

  const handleSaveBed = async (category) => {
    const bed = beds.find((b) => b.category === category);
    if (!bed || !hospital) return;

    setSavingCategory(category);
    try {
      const res = await api.patch(`/hospitals/${hospital._id}/beds`, {
        category: bed.category,
        total: bed.total,
        occupied: bed.occupied,
        reserved: bed.reserved,
        maintenance: bed.maintenance,
      });

      if (res.data.success) {
        toast.success(`${category} bed inventory saved and synced!`);
      }
    } catch (err) {
      toast.error('Failed to save bed updates');
    } finally {
      setSavingCategory(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-sky-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      {/* Top Header */}
      <div className="bg-white border-b border-slate-200/80 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </button>
          <span className="text-xs font-extrabold text-sky-700 bg-sky-50 border border-sky-200 px-3 py-1 rounded-xl">
            Live Bed Inventory Management
          </span>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-8 space-y-6">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Bed Inventory Manager — {hospital?.name}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time occupancy formulas: <code className="bg-slate-200 px-1.5 py-0.5 rounded font-bold text-slate-800">Available = Total - Occupied - Reserved - Maintenance</code>
          </p>
        </div>

        {/* Category Cards Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const bed = beds.find((b) => b.category === cat.id) || {
              total: 0,
              occupied: 0,
              reserved: 0,
              maintenance: 0,
              available: 0,
            };

            const isSaving = savingCategory === cat.id;

            return (
              <div
                key={cat.id}
                className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-sm space-y-5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-slate-100">
                      <Icon className={`w-5 h-5 ${cat.color}`} />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-sm text-slate-900">{cat.label}</h3>
                      <p className="text-[10px] text-slate-400 font-bold uppercase">{cat.id}</p>
                    </div>
                  </div>

                  {/* Calculated Available Badge */}
                  <div className="text-right">
                    <span className="text-xs font-extrabold px-3 py-1 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {bed.available} Available
                    </span>
                  </div>
                </div>

                {/* Input Fields */}
                <div className="grid grid-cols-4 gap-2.5 text-xs">
                  <div>
                    <label className="font-bold text-slate-600 block mb-1">Total</label>
                    <input
                      type="number"
                      min={0}
                      value={bed.total}
                      onChange={(e) => handleFieldChange(cat.id, 'total', e.target.value)}
                      className="w-full px-2.5 py-2 rounded-xl border border-slate-200 text-center font-extrabold text-slate-900 focus:ring-2 focus:ring-sky-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-600 block mb-1">Occupied</label>
                    <input
                      type="number"
                      min={0}
                      value={bed.occupied}
                      onChange={(e) => handleFieldChange(cat.id, 'occupied', e.target.value)}
                      className="w-full px-2.5 py-2 rounded-xl border border-slate-200 text-center font-extrabold text-rose-600 focus:ring-2 focus:ring-sky-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-600 block mb-1">Reserved</label>
                    <input
                      type="number"
                      min={0}
                      value={bed.reserved}
                      onChange={(e) => handleFieldChange(cat.id, 'reserved', e.target.value)}
                      className="w-full px-2.5 py-2 rounded-xl border border-slate-200 text-center font-bold text-amber-600 focus:ring-2 focus:ring-sky-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-600 block mb-1">Maintenance</label>
                    <input
                      type="number"
                      min={0}
                      value={bed.maintenance}
                      onChange={(e) => handleFieldChange(cat.id, 'maintenance', e.target.value)}
                      className="w-full px-2.5 py-2 rounded-xl border border-slate-200 text-center font-bold text-slate-500 focus:ring-2 focus:ring-sky-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Save Button */}
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={() => handleSaveBed(cat.id)}
                  className="w-full py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Syncing...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-3.5 h-3.5" />
                      <span>Save &amp; Broadcast Updates</span>
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default LiveBedManager;
