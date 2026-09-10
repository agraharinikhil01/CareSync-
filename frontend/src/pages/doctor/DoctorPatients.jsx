import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import DashboardLayout from '../../layouts/DashboardLayout';
import { Users, Search, HeartPulse, AlertCircle, Phone, Calendar, FileText } from 'lucide-react';
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
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#dcdcde] pb-4 bg-white p-6 rounded-md shadow-xs">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 bg-[#e6f4f8] text-[#006088] rounded-md">
                <Users className="w-6 h-6" />
              </span>
              <h1 className="text-2xl font-semibold text-[#2c3338] tracking-tight">Patient Clinical Records</h1>
            </div>
            <p className="text-sm text-[#50575e] mt-1">
              Review diagnostic history, allergies, chronic ailments, and vital patient parameters.
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white p-4 rounded-md border border-[#dcdcde] shadow-xs flex items-center justify-between">
          <div className="relative w-full max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by patient name, ID (e.g. PAT-), or phone..."
              className="w-full pl-9 pr-3 py-2 text-sm border border-[#dcdcde] rounded-sm focus:outline-hidden focus:border-[#0087be] focus:ring-1 focus:ring-[#0087be]"
            />
          </div>
          <span className="text-xs text-[#50575e] font-medium hidden sm:inline">
            Showing {filteredPatients.length} patient records
          </span>
        </div>

        {/* Patients Grid */}
        {loading ? (
          <div className="p-12 text-center bg-white rounded-md border border-[#dcdcde]">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-[#0087be] border-t-transparent"></div>
            <p className="mt-3 text-sm text-[#50575e]">Loading clinical charts...</p>
          </div>
        ) : filteredPatients.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-md border border-[#dcdcde]">
            <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-base font-medium text-[#2c3338]">No matching patients found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredPatients.map((p) => (
              <div
                key={p._id}
                className="bg-white rounded-md border border-[#dcdcde] shadow-xs p-5 flex flex-col justify-between hover:shadow-md transition-shadow"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-xs font-mono font-semibold text-[#0087be] bg-[#e6f4f8] px-2 py-0.5 rounded-sm">
                        {p.patientId}
                      </span>
                      <h3 className="font-semibold text-[#2c3338] text-base mt-2">
                        {p.user?.name}
                      </h3>
                      <p className="text-xs text-[#50575e]">
                        {p.gender} · Blood: <span className="font-semibold text-rose-700">{p.bloodGroup}</span>
                      </p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center font-bold text-[#006088]">
                      {p.user?.name ? p.user.name.charAt(0) : 'P'}
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-gray-100 space-y-2 text-xs text-[#50575e]">
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-gray-400" />
                      <span>{p.user?.phone || 'No phone'}</span>
                    </div>

                    <div>
                      <span className="font-semibold text-gray-600 block mb-0.5">Allergies:</span>
                      {p.allergies && p.allergies.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {p.allergies.map((a, i) => (
                            <span
                              key={i}
                              className="px-2 py-0.5 bg-rose-50 text-rose-700 rounded-sm text-[11px] font-medium border border-rose-200"
                            >
                              {a}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-gray-400 italic">No known allergies</span>
                      )}
                    </div>

                    <div>
                      <span className="font-semibold text-gray-600 block mb-0.5">Chronic Conditions:</span>
                      {p.chronicDiseases && p.chronicDiseases.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {p.chronicDiseases.map((c, i) => (
                            <span
                              key={i}
                              className="px-2 py-0.5 bg-amber-50 text-amber-800 rounded-sm text-[11px] font-medium border border-amber-200"
                            >
                              {c}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-gray-400 italic">None documented</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-[#dcdcde] flex justify-end">
                  <Link
                    to="/doctor/prescriptions"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#0087be] hover:bg-[#006088] text-white text-xs font-semibold rounded-sm transition-colors"
                  >
                    <FileText className="w-3.5 h-3.5" />
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
