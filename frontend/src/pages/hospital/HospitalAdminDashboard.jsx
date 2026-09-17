import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import socket from '../../services/socket';
import {
  Building2,
  Bed,
  HeartPulse,
  Siren,
  Users,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Minus,
  CheckCircle2,
  XCircle,
  Clock,
  Send,
  AlertTriangle,
  Loader2,
  RefreshCw,
  LogOut,
  Sparkles,
} from 'lucide-react';
import toast from 'react-hot-toast';

const HospitalAdminDashboard = () => {
  const { user, logout } = useAuth();
  const [hospital, setHospital] = useState(null);
  const [beds, setBeds] = useState([]);
  const [transfers, setTransfers] = useState([]);
  const [emergencyAlerts, setEmergencyAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingBed, setUpdatingBed] = useState(false);

  useEffect(() => {
    fetchDashboardData();

    // Listen to real-time socket events
    socket.on('emergency:new_request', (data) => {
      toast.error(`🚨 New Emergency Alert: ${data.emergencyType} - ${data.patientName}!`, {
        duration: 6000,
      });
      setEmergencyAlerts((prev) => [data, ...prev]);
    });

    socket.on('transfer:status_changed', () => {
      fetchTransfers();
    });

    return () => {
      socket.off('emergency:new_request');
      socket.off('transfer:status_changed');
    };
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Find hospital affiliated with this admin or first hospital
      const res = await api.get('/hospitals');
      if (res.data.success && res.data.data.length > 0) {
        const myHosp =
          res.data.data.find(
            (h) => h.adminUser === user?._id || h._id === user?.hospitalId
          ) || res.data.data[0];

        setHospital(myHosp);

        // Fetch beds
        const bedsRes = await api.get(`/hospitals/${myHosp._id}/beds`);
        if (bedsRes.data.success) {
          setBeds(bedsRes.data.data);
        }

        // Fetch transfers
        fetchTransfers(myHosp._id);

        // Fetch emergency requests
        const emergRes = await api.get(`/emergency?hospitalId=${myHosp._id}`);
        if (emergRes.data.success) {
          setEmergencyAlerts(emergRes.data.data);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTransfers = async (hospId) => {
    try {
      const id = hospId || hospital?._id;
      if (!id) return;
      const res = await api.get(`/transfers?hospitalId=${id}`);
      if (res.data.success) {
        setTransfers(res.data.data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Fast bed capacity increment/decrement with real-time socket broadcast
  const handleQuickAdjust = async (category, delta) => {
    if (!hospital || updatingBed) return;

    const currentBed = beds.find((b) => b.category === category);
    const currentOcc = currentBed ? currentBed.occupied : 0;
    const currentTot = currentBed ? currentBed.total : 50;
    const newOcc = Math.max(0, Math.min(currentTot, currentOcc - delta)); // delta > 0 means freeing bed, so occupied decreases!

    setUpdatingBed(true);
    try {
      const res = await api.patch(`/hospitals/${hospital._id}/beds`, {
        category,
        total: currentTot,
        occupied: newOcc,
      });

      if (res.data.success) {
        toast.success(`Updated ${category} beds in real-time!`);
        // Update local state
        setHospital((prev) => ({
          ...prev,
          capacitySummary: res.data.data.capacitySummary,
        }));
        setBeds((prev) =>
          prev.map((b) => (b.category === category ? res.data.data.bed : b))
        );
      }
    } catch (err) {
      toast.error('Failed to update bed capacity');
    } finally {
      setUpdatingBed(false);
    }
  };

  // Handle transfer approval/rejection
  const handleTransferStatus = async (transferId, status) => {
    try {
      const res = await api.patch(`/transfers/${transferId}`, { status });
      if (res.data.success) {
        toast.success(`Transfer marked as ${status}`);
        fetchTransfers();
      }
    } catch (e) {
      toast.error('Failed to update transfer status');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-sky-600" />
      </div>
    );
  }

  const generalAvail = hospital?.capacitySummary?.general?.available || 0;
  const generalTot = hospital?.capacitySummary?.general?.total || 1;
  const icuAvail = hospital?.capacitySummary?.icu?.available || 0;
  const icuTot = hospital?.capacitySummary?.icu?.total || 1;

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 pb-20">
      {/* Top Bar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-sky-600 flex items-center justify-center text-white shadow-md shadow-sky-600/20">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-sm text-slate-900 leading-tight block">
                {hospital?.name || 'CareSync Hospital Command'}
              </span>
              <span className="text-[10px] text-slate-400 font-medium">
                Hospital Administration • {hospital?.city || 'Delhi'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={fetchDashboardData}
              className="p-2 rounded-xl text-slate-500 hover:text-sky-600 hover:bg-slate-100 transition-colors cursor-pointer"
              title="Refresh"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <Link
              to="/hospital/beds"
              className="px-3 py-1.5 rounded-xl bg-sky-50 text-sky-700 hover:bg-sky-100 text-xs font-bold transition-colors"
            >
              Live Bed Manager
            </Link>
            <button
              onClick={logout}
              className="p-2 rounded-xl text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
              title="Log Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        {/* Real-Time Hospital Banner */}
        <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 to-slate-800 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[11px] font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              <span>Socket.IO Live Network Sync Active</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black">{hospital?.name}</h2>
            <p className="text-xs text-slate-300">
              Any changes made here immediately update all patient discovery maps in real-time.
            </p>
          </div>

          {/* Quick Availability Adjusters */}
          <div className="flex items-center gap-3 shrink-0 bg-white/10 p-3 rounded-2xl border border-white/10">
            {/* General Bed Quick Adjust */}
            <div className="text-center">
              <p className="text-[10px] text-slate-300 font-bold uppercase">General Beds</p>
              <p className="text-base font-extrabold text-white my-0.5">{generalAvail} Avail</p>
              <div className="flex items-center gap-1 justify-center">
                <button
                  type="button"
                  disabled={updatingBed || generalAvail <= 0}
                  onClick={() => handleQuickAdjust('GENERAL', -1)}
                  className="p-1 rounded-lg bg-white/20 hover:bg-rose-500/80 text-white transition-colors disabled:opacity-30 cursor-pointer"
                  title="Occupy 1 bed"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  disabled={updatingBed || generalAvail >= generalTot}
                  onClick={() => handleQuickAdjust('GENERAL', 1)}
                  className="p-1 rounded-lg bg-white/20 hover:bg-emerald-500/80 text-white transition-colors disabled:opacity-30 cursor-pointer"
                  title="Free 1 bed"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="w-px h-10 bg-white/20"></div>

            {/* ICU Quick Adjust */}
            <div className="text-center">
              <p className="text-[10px] text-rose-300 font-bold uppercase">ICU Beds</p>
              <p className="text-base font-extrabold text-white my-0.5">{icuAvail} Avail</p>
              <div className="flex items-center gap-1 justify-center">
                <button
                  type="button"
                  disabled={updatingBed || icuAvail <= 0}
                  onClick={() => handleQuickAdjust('ICU', -1)}
                  className="p-1 rounded-lg bg-white/20 hover:bg-rose-500/80 text-white transition-colors disabled:opacity-30 cursor-pointer"
                  title="Occupy 1 ICU"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  disabled={updatingBed || icuAvail >= icuTot}
                  onClick={() => handleQuickAdjust('ICU', 1)}
                  className="p-1 rounded-lg bg-white/20 hover:bg-emerald-500/80 text-white transition-colors disabled:opacity-30 cursor-pointer"
                  title="Free 1 ICU"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Dashboard Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-sm space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Bed className="w-3.5 h-3.5 text-sky-600" /> Total Beds
            </span>
            <p className="text-2xl font-black text-slate-900">{generalTot}</p>
            <p className="text-xs font-semibold text-emerald-600">{generalAvail} Currently Free</p>
          </div>

          <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-sm space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <HeartPulse className="w-3.5 h-3.5 text-rose-600" /> Critical Care ICU
            </span>
            <p className="text-2xl font-black text-slate-900">{icuTot}</p>
            <p className="text-xs font-semibold text-rose-600">{icuAvail} Available Units</p>
          </div>

          <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-sm space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Siren className="w-3.5 h-3.5 text-amber-600" /> Emergency Wing
            </span>
            <p className="text-2xl font-black text-slate-900">
              {hospital?.emergencyAvailable ? 'ACTIVE' : 'FULL'}
            </p>
            <p className="text-xs text-slate-500">24/7 Trauma Standby</p>
          </div>

          <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-sm space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Send className="w-3.5 h-3.5 text-purple-600" /> Inter-Hospital Transfers
            </span>
            <p className="text-2xl font-black text-slate-900">{transfers.length}</p>
            <p className="text-xs text-purple-600 font-semibold">HospiSync Grid</p>
          </div>
        </div>

        {/* Transfers & Emergency Alert Feeds */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* HospiSync Patient Transfer Feed */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Send className="w-4 h-4 text-purple-600" />
                <h3 className="font-bold text-sm text-slate-900">Patient Transfers (HospiSync)</h3>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-50 text-purple-700">
                {transfers.filter((t) => t.status === 'PENDING').length} Pending
              </span>
            </div>

            {transfers.length === 0 ? (
              <p className="text-xs text-slate-400 italic text-center py-6">No transfer requests right now.</p>
            ) : (
              <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
                {transfers.map((t) => {
                  const isIncoming = t.toHospital?._id === hospital?._id;
                  return (
                    <div
                      key={t._id}
                      className="p-3.5 rounded-2xl border border-slate-100 bg-slate-50/70 text-xs space-y-2"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-extrabold text-slate-900">
                            {t.patientName} ({t.patientAge}y, {t.patientGender})
                          </p>
                          <p className="text-[10px] text-slate-500 mt-0.5">
                            {isIncoming
                              ? `Incoming from: ${t.fromHospital?.name}`
                              : `Outgoing to: ${t.toHospital?.name}`}
                          </p>
                        </div>
                        <span
                          className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md ${
                            t.status === 'PENDING'
                              ? 'bg-amber-100 text-amber-800'
                              : t.status === 'ACCEPTED'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-slate-200 text-slate-700'
                          }`}
                        >
                          {t.status}
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-600 bg-white p-2 rounded-xl border border-slate-200/60">
                        <strong>Reason:</strong> {t.reason} • <strong>Dept:</strong> {t.requiredDepartment} (
                        {t.requiredBedType})
                      </p>

                      {isIncoming && t.status === 'PENDING' && (
                        <div className="flex items-center justify-end gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => handleTransferStatus(t._id, 'REJECTED')}
                            className="px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 font-bold text-[11px] cursor-pointer"
                          >
                            Reject
                          </button>
                          <button
                            type="button"
                            onClick={() => handleTransferStatus(t._id, 'ACCEPTED')}
                            className="px-3 py-1 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 font-bold text-[11px] shadow-sm cursor-pointer"
                          >
                            Accept Transfer
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Incoming Emergency Dispatch Alerts */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Siren className="w-4 h-4 text-rose-600" />
                <h3 className="font-bold text-sm text-slate-900">Emergency Dispatches</h3>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 animate-pulse">
                Live Alert Feed
              </span>
            </div>

            {emergencyAlerts.length === 0 ? (
              <p className="text-xs text-slate-400 italic text-center py-6">No emergency requests active.</p>
            ) : (
              <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
                {emergencyAlerts.map((e) => (
                  <div
                    key={e._id}
                    className="p-3.5 rounded-2xl border border-rose-200 bg-rose-50/40 text-xs space-y-2"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-extrabold text-slate-900 flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-rose-600 animate-ping"></span>
                          {e.patientName}
                        </p>
                        <p className="text-[10px] text-slate-500 mt-0.5">
                          Phone: <strong>{e.contactPhone}</strong>
                        </p>
                      </div>
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-rose-600 text-white">
                        {e.emergencyType}
                      </span>
                    </div>

                    {e.notes && <p className="text-[11px] text-slate-600 italic">"{e.notes}"</p>}

                    <div className="flex items-center justify-between pt-1 text-[10px] text-slate-400">
                      <span>Status: <strong>{e.status}</strong></span>
                      <a
                        href={`tel:${e.contactPhone}`}
                        className="text-rose-600 font-bold hover:underline"
                      >
                        Call Patient
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HospitalAdminDashboard;
