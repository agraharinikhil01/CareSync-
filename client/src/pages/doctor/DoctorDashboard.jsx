import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import StatCard from '../../components/StatCard';
import Table from '../../components/Table';
import Modal from '../../components/Modal';
import {
  PrescriptionGeneratorModal,
  PrescriptionViewerModal,
} from '../../components/PrescriptionModal';
import { VisualBedMap } from '../../components/VisualBedMap';
import {
  getDoctorDashboardMetricsApi,
  getDoctorAppointmentsApi,
  getDoctorPatientsApi,
  getPrescriptionsApi,
  updateAppointmentStatusApi,
  addMedicalRecordApi,
  getBedsApi,
  allocateBedApi,
  releaseBedApi,
} from '../../api/endpoints';
import {
  CalendarCheck,
  Users,
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  Plus,
  Stethoscope,
  Activity,
  HeartPulse,
  BedDouble,
} from 'lucide-react';

const DoctorDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [dashboardData, setDashboardData] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [beds, setBeds] = useState([]);
  const [loading, setLoading] = useState(true);

  // Selected appointment for issuing prescription
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [isPrescriptionModalOpen, setIsPrescriptionModalOpen] = useState(false);

  // Prescription View modal
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [isViewerModalOpen, setIsViewerModalOpen] = useState(false);

  // EHR Add Medical Record Modal
  const [selectedPatientForRecord, setSelectedPatientForRecord] = useState(null);
  const [medicalRecordForm, setMedicalRecordForm] = useState({ condition: '', notes: '' });

  useEffect(() => {
    fetchDoctorData();
  }, [activeTab]);

  const fetchDoctorData = async () => {
    try {
      setLoading(true);
      if (activeTab === 'overview') {
        const res = await getDoctorDashboardMetricsApi();
        if (res.data.success) setDashboardData(res.data.data);
      } else if (activeTab === 'appointments') {
        const res = await getDoctorAppointmentsApi();
        if (res.data.success) setAppointments(res.data.data);
      } else if (activeTab === 'beds') {
        const [bRes, pRes] = await Promise.allSettled([
          getBedsApi(),
          getDoctorPatientsApi(),
        ]);
        if (bRes.status === 'fulfilled' && bRes.value.data.success) setBeds(bRes.value.data.data);
        if (pRes.status === 'fulfilled' && pRes.value.data.success) setPatients(pRes.value.data.data);
      } else if (activeTab === 'patients') {
        const res = await getDoctorPatientsApi();
        if (res.data.success) setPatients(res.data.data);
      } else if (activeTab === 'prescriptions') {
        const res = await getPrescriptionsApi();
        if (res.data.success) setPrescriptions(res.data.data);
      }
    } catch (error) {
      console.error('Error loading doctor dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenPrescription = (appointment) => {
    setSelectedAppointment(appointment);
    setIsPrescriptionModalOpen(true);
  };

  const handlePrescriptionSuccess = () => {
    fetchDoctorData();
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      const res = await updateAppointmentStatusApi(id, { status });
      if (res.data.success) {
        fetchDoctorData();
      }
    } catch (err) {
      alert('Failed to update status');
    }
  };

  const handleDoctorAllocateBed = async (bedId, patientId) => {
    const res = await allocateBedApi(bedId, { patientId });
    if (res.data.success) {
      const bRes = await getBedsApi();
      if (bRes.data.success) setBeds(bRes.data.data);
    }
  };

  const handleDoctorReleaseBed = async (bedId) => {
    const res = await releaseBedApi(bedId);
    if (res.data.success) {
      const bRes = await getBedsApi();
      if (bRes.data.success) setBeds(bRes.data.data);
    }
  };

  const handleAddMedicalRecord = async (e) => {
    e.preventDefault();
    if (!selectedPatientForRecord) return;
    try {
      const res = await addMedicalRecordApi(
        selectedPatientForRecord.userId._id || selectedPatientForRecord.userId,
        medicalRecordForm
      );
      if (res.data.success) {
        setSelectedPatientForRecord(null);
        setMedicalRecordForm({ condition: '', notes: '' });
        fetchDoctorData();
      }
    } catch (err) {
      alert('Failed to add medical record');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {/* TAB 1: OVERVIEW / TODAY'S QUEUE */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Doctor Clinical Station</h1>
                <p className="text-sm text-slate-500">Daily appointment queue, EHR records & electronic prescriptions</p>
              </div>

              {/* KPI Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div onClick={() => setActiveTab('overview')} className="cursor-pointer">
                  <StatCard
                    title="Today's Patient Queue"
                    value={dashboardData?.metrics?.todayCount || 0}
                    subtitle="Scheduled consultations today"
                    icon={Clock}
                    color="sky"
                  />
                </div>
                <div onClick={() => setActiveTab('appointments')} className="cursor-pointer">
                  <StatCard
                    title="Pending Consultations"
                    value={dashboardData?.metrics?.pendingCount || 0}
                    subtitle="Awaiting doctor review"
                    icon={AlertCircle}
                    color="amber"
                  />
                </div>
                <div onClick={() => setActiveTab('appointments')} className="cursor-pointer">
                  <StatCard
                    title="Completed Consultations"
                    value={dashboardData?.metrics?.completedCount || 0}
                    subtitle="Successfully treated"
                    icon={CheckCircle2}
                    color="emerald"
                  />
                </div>
                <div onClick={() => setActiveTab('prescriptions')} className="cursor-pointer">
                  <StatCard
                    title="Prescriptions Issued"
                    value={dashboardData?.metrics?.totalPrescriptions || 0}
                    subtitle="Total E-Rx Records (Click to View)"
                    icon={FileText}
                    color="purple"
                  />
                </div>
              </div>

              {/* Today's Queue List */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">Today's Patient Queue</h3>
                    <p className="text-xs text-slate-400">Consultations scheduled for today</p>
                  </div>
                  <span className="px-3 py-1 bg-sky-50 text-sky-700 text-xs font-bold rounded-xl border border-sky-100">
                    Live Schedule
                  </span>
                </div>

                {dashboardData?.todayQueue && dashboardData.todayQueue.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {dashboardData.todayQueue.map((app) => (
                      <div
                        key={app._id}
                        className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:shadow-md transition space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-700 font-black flex items-center justify-center">
                              {app.patientId?.name?.charAt(0) || 'P'}
                            </div>
                            <div>
                              <h4 className="font-bold text-slate-900 text-sm">{app.patientId?.name}</h4>
                              <p className="text-xs text-slate-500">{app.patientId?.phone || app.patientId?.email}</p>
                            </div>
                          </div>
                          <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-sky-100 text-sky-800">
                            {app.timeSlot}
                          </span>
                        </div>

                        <div className="bg-white p-3 rounded-xl border border-slate-200/80 text-xs">
                          <span className="font-bold text-slate-500 block mb-0.5">Chief Complaint:</span>
                          <p className="text-slate-800 font-medium">{app.reason}</p>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-slate-200 text-xs">
                          <span
                            className={`px-2.5 py-0.5 rounded-full font-bold ${
                              app.status === 'Completed'
                                ? 'bg-emerald-100 text-emerald-800'
                                : app.status === 'Confirmed'
                                ? 'bg-sky-100 text-sky-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {app.status}
                          </span>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleOpenPrescription(app)}
                              className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl font-black text-xs shadow-md shadow-emerald-600/30 transition"
                            >
                              <Stethoscope className="w-3.5 h-3.5" /> 🎙️ Write AI Prescription
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-12 text-center text-slate-400 font-medium">
                    No appointments scheduled in today's queue.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: APPOINTMENTS */}
          {activeTab === 'appointments' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-extrabold text-slate-900">All Assigned Consultations</h1>
                <p className="text-sm text-slate-500">Historical & upcoming patient appointments</p>
              </div>

              <Table
                columns={[
                  {
                    header: 'Patient Details',
                    render: (row) => (
                      <div>
                        <p className="font-bold text-slate-900">{row.patientId?.name}</p>
                        <p className="text-xs text-slate-400">{row.patientId?.email} • {row.patientId?.phone}</p>
                      </div>
                    ),
                  },
                  {
                    header: 'Date & Time',
                    render: (row) => (
                      <span className="text-xs font-semibold text-slate-700">
                        {new Date(row.date).toLocaleDateString()} at {row.timeSlot}
                      </span>
                    ),
                  },
                  {
                    header: 'Type',
                    accessor: 'type',
                  },
                  {
                    header: 'Reason',
                    accessor: 'reason',
                  },
                  {
                    header: 'Status',
                    render: (row) => (
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          row.status === 'Completed'
                            ? 'bg-emerald-100 text-emerald-800'
                            : row.status === 'Confirmed'
                            ? 'bg-sky-100 text-sky-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {row.status}
                      </span>
                    ),
                  },
                  {
                    header: 'Actions',
                    render: (row) => (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleOpenPrescription(row)}
                          className="px-3 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg text-xs font-black border border-emerald-200 flex items-center gap-1"
                        >
                          <Stethoscope className="w-3.5 h-3.5" /> 🎙️ Prescribe
                        </button>
                        {row.status === 'Pending' && (
                          <button
                            onClick={() => handleUpdateStatus(row._id, 'Confirmed')}
                            className="px-2.5 py-1 bg-sky-50 text-sky-700 hover:bg-sky-100 rounded-lg text-xs font-bold border border-sky-200"
                          >
                            Confirm
                          </button>
                        )}
                      </div>
                    ),
                  },
                ]}
                data={appointments}
              />
            </div>
          )}

          {/* TAB: BEDS & WARD FLOOR PLAN */}
          {activeTab === 'beds' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-extrabold text-slate-900">Hospital Ward Floor Plan & Beds</h1>
                <p className="text-sm text-slate-500">Live ward occupancy, ICU standby units and admitted inpatient map</p>
              </div>

              <VisualBedMap
                beds={beds}
                patients={patients.map((p) => ({
                  _id: p.userId?._id || p._id,
                  name: p.userId?.name || p.name,
                  email: p.userId?.email || p.email,
                  phone: p.userId?.phone || p.phone,
                }))}
                onAllocateBed={handleDoctorAllocateBed}
                onReleaseBed={handleDoctorReleaseBed}
                loading={loading}
              />
            </div>
          )}

          {/* TAB 3: PATIENT MEDICAL RECORDS (EHR) */}
          {activeTab === 'patients' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-extrabold text-slate-900">Patient EHR & Medical Histories</h1>
                <p className="text-sm text-slate-500">View diagnostic histories, allergies and chronic condition profiles</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {patients.map((pat) => (
                  <div key={pat._id} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-700 font-bold flex items-center justify-center">
                          {pat.userId?.name?.charAt(0)}
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900 text-sm">{pat.userId?.name}</h4>
                          <p className="text-xs text-slate-400">
                            {pat.age} yrs • {pat.gender} • Blood: <span className="font-bold text-rose-600">{pat.bloodGroup}</span>
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => setSelectedPatientForRecord(pat)}
                        className="inline-flex items-center gap-1 text-xs font-bold text-sky-600 bg-sky-50 hover:bg-sky-100 px-3 py-1.5 rounded-lg border border-sky-200"
                      >
                        <Plus className="w-3.5 h-3.5" /> Add Note
                      </button>
                    </div>

                    {/* Allergies */}
                    {pat.allergies && pat.allergies.length > 0 && (
                      <div className="text-xs">
                        <span className="font-bold text-rose-600 block mb-1">⚠️ Known Allergies:</span>
                        <div className="flex flex-wrap gap-1">
                          {pat.allergies.map((al, idx) => (
                            <span key={idx} className="bg-rose-50 text-rose-700 px-2 py-0.5 rounded border border-rose-200">
                              {al}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Medical History List */}
                    <div className="border-t border-slate-100 pt-2">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">
                        Past Medical Record Entries:
                      </span>
                      {pat.medicalHistory && pat.medicalHistory.length > 0 ? (
                        <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                          {pat.medicalHistory.map((rec, i) => (
                            <div key={i} className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                              <div className="flex justify-between font-bold text-slate-800">
                                <span>{rec.condition}</span>
                                <span className="text-slate-400 font-normal">{new Date(rec.diagnosedDate).toLocaleDateString()}</span>
                              </div>
                              {rec.notes && <p className="text-slate-600 mt-1">{rec.notes}</p>}
                              {rec.treatedBy && <p className="text-[10px] text-sky-700 font-semibold mt-1">Recorded by: {rec.treatedBy}</p>}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-slate-400 italic">No medical history entries on file.</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: PRESCRIPTIONS ISSUED */}
          {activeTab === 'prescriptions' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-extrabold text-slate-900">Prescriptions Issued Log</h1>
                <p className="text-sm text-slate-500">Electronic prescriptions generated with dosage instructions</p>
              </div>

              <Table
                columns={[
                  {
                    header: 'Patient Name',
                    render: (row) => <span className="font-bold text-slate-900">{row.patientId?.name}</span>,
                  },
                  {
                    header: 'Diagnosis',
                    accessor: 'diagnosis',
                  },
                  {
                    header: 'Prescribed Date',
                    render: (row) => <span className="text-xs text-slate-500">{new Date(row.date).toLocaleDateString()}</span>,
                  },
                  {
                    header: 'Medicines Count',
                    render: (row) => <span className="font-bold text-sky-700">{row.medicines?.length || 0} drugs</span>,
                  },
                  {
                    header: 'Action',
                    render: (row) => (
                      <button
                        onClick={() => {
                          setSelectedPrescription(row);
                          setIsViewerModalOpen(true);
                        }}
                        className="px-3 py-1 text-xs font-bold text-sky-700 bg-sky-50 hover:bg-sky-100 rounded-lg border border-sky-200"
                      >
                        View & Print Rx
                      </button>
                    ),
                  },
                ]}
                data={prescriptions}
              />
            </div>
          )}
        </main>
      </div>

      {/* PRESCRIPTION GENERATOR MODAL */}
      <PrescriptionGeneratorModal
        isOpen={isPrescriptionModalOpen}
        onClose={() => setIsPrescriptionModalOpen(false)}
        appointment={selectedAppointment}
        onSuccess={handlePrescriptionSuccess}
      />

      {/* PRESCRIPTION PRINT VIEWER MODAL */}
      <PrescriptionViewerModal
        isOpen={isViewerModalOpen}
        onClose={() => setIsViewerModalOpen(false)}
        prescription={selectedPrescription}
      />

      {/* ADD EHR MEDICAL RECORD MODAL */}
      <Modal
        isOpen={!!selectedPatientForRecord}
        onClose={() => setSelectedPatientForRecord(null)}
        title={`Add EHR Record: ${selectedPatientForRecord?.userId?.name}`}
      >
        <form onSubmit={handleAddMedicalRecord} className="space-y-4 text-xs">
          <div>
            <label className="font-bold text-slate-700 uppercase">Medical Condition / Diagnosis *</label>
            <input
              type="text"
              required
              value={medicalRecordForm.condition}
              onChange={(e) => setMedicalRecordForm({ ...medicalRecordForm, condition: e.target.value })}
              placeholder="e.g. Type 2 Diabetes Mellitus"
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 mt-1"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 uppercase">Clinical Notes & Observations</label>
            <textarea
              rows="3"
              value={medicalRecordForm.notes}
              onChange={(e) => setMedicalRecordForm({ ...medicalRecordForm, notes: e.target.value })}
              placeholder="Patient instructed on dietary modifications..."
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 mt-1"
            ></textarea>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setSelectedPatientForRecord(null)}
              className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-lg shadow"
            >
              Save to Patient Record
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default DoctorDashboard;
