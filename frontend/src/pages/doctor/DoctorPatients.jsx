import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import DashboardLayout from '../../layouts/DashboardLayout';
import { Users, Search, HeartPulse, AlertCircle, Phone, Calendar, FileText, Activity, ShieldAlert } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const DoctorPatients = () => {
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    setLoading(true);
    try {
      const res = await api.get('/patients');
      if (res.data.success) {
        setPatients(res.data.data);
      }
    } catch {
      toast.error('Failed to load patient records');
    } finally {
      setLoading(false);
    }
  };

  const filteredPatients = patients.filter((p) => {
    if (!search) return true;
    const term = search.toLowerCase();
    const name = p.user?.name?.toLowerCase() || '';
    const pid = p.patientId?.toLowerCase() || '';
    const phone = p.user?.phone?.toLowerCase() || '';
    return name.includes(term) || pid.includes(term) || phone.includes(term);
  });

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Header Banner */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-teal-600 to-emerald-500 text-white flex items-center justify-center shadow-md shadow-teal-500/20">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                  Clinical Patient Directory
                </h1>
                <span className="text-[11px] font-semibold tracking-wide uppercase px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200/80">
                  EMR Archive
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Review diagnostic profiles, recorded allergies, chronic medical conditions, and clinical parameters.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700">
            <Activity className="w-4 h-4 text-teal-600" />
            <span>{patients.length} Registered Patients</span>
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between gap-4">
          <div className="relative w-full max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by patient name, ID (e.g. PAT-), or phone..."
              className="w-full pl-10 pr-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-hidden focus:border-teal-500 focus:ring-3 focus:ring-teal-500/15 transition-all text-slate-800 placeholder:text-slate-400"
            />
          </div>
          <span className="text-xs text-slate-500 font-medium hidden sm:inline">
            Showing <strong className="text-slate-800">{filteredPatients.length}</strong> matching records
          </span>
        </div>

        {/* Patients Grid */}
        {loading ? (
          <div className="p-16 text-center bg-white rounded-2xl border border-slate-200/80">
            <div className="inline-block animate-spin rounded-full h-9 w-9 border-3 border-teal-600 border-t-transparent"></div>
            <p className="mt-3 text-xs sm:text-sm font-medium text-slate-500">Loading clinical charts...</p>
          </div>
        ) : filteredPatients.length === 0 ? (
          <div className="p-16 text-center bg-white rounded-2xl border border-slate-200/80">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-3 text-slate-400">
              <Users className="w-7 h-7" />
            </div>
            <p className="text-base font-semibold text-slate-800">No matching patient records</p>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              No patients match your current search query. Check for typos or search by another parameter.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredPatients.map((p) => (
              <div
                key={p._id}
                className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 sm:p-6 flex flex-col justify-between hover:shadow-md hover:border-teal-200 transition-all"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="text-[11px] font-mono font-semibold text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-md border border-teal-200/60">
                        {p.patientId}
                      </span>
                      <h3 className="font-bold text-slate-900 text-base mt-2">
                        {p.user?.name || 'Unnamed Patient'}
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {p.gender || 'Unknown'} · Blood Group:{' '}
                        <span className="font-semibold text-rose-600">{p.bloodGroup || 'N/A'}</span>
                      </p>
                    </div>
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-teal-500 to-emerald-500 text-white flex items-center justify-center font-bold text-base shadow-sm shrink-0">
                      {p.user?.name ? p.user.name.charAt(0).toUpperCase() : 'P'}
                    </div>
                  </div>

                  <div className="mt-4 pt-3.5 border-t border-slate-100 space-y-2.5 text-xs text-slate-600">
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="font-medium text-slate-700">{p.user?.phone || 'No phone recorded'}</span>
                    </div>

                    <div>
                      <span className="font-semibold text-slate-700 block mb-1 flex items-center gap-1">
                        <ShieldAlert className="w-3 h-3 text-rose-500" /> Allergies:
                      </span>
                      {p.allergies && p.allergies.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {p.allergies.map((a, i) => (
                            <span
                              key={i}
                              className="px-2 py-0.5 bg-rose-50 text-rose-700 rounded-md text-[11px] font-medium border border-rose-200/70"
                            >
                              {a}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-slate-400 italic text-[11px]">No known drug allergies</span>
                      )}
                    </div>

                    <div>
                      <span className="font-semibold text-slate-700 block mb-1 flex items-center gap-1">
                        <HeartPulse className="w-3 h-3 text-amber-500" /> Chronic Conditions:
                      </span>
                      {p.chronicDiseases && p.chronicDiseases.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {p.chronicDiseases.map((c, i) => (
                            <span
                              key={i}
                              className="px-2 py-0.5 bg-amber-50 text-amber-800 rounded-md text-[11px] font-medium border border-amber-200/70"
                            >
                              {c}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-slate-400 italic text-[11px]">None documented</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-3.5 border-t border-slate-100 flex justify-end">
                  <Link
                    to="/doctor/prescriptions"
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors"
                  >
                    <FileText className="w-3.5 h-3.5 text-teal-400" />
                    Write Prescription
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default DoctorPatients;
