import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import DashboardLayout from '../../layouts/DashboardLayout';
import { FileText, Plus, Search, Download, Trash2, X, Check, Calendar, Stethoscope, QrCode, Sparkles, Pill, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const DoctorPrescriptions = () => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [qrModal, setQrModal] = useState(null);
  const [search, setSearch] = useState('');

  const [form, setForm] = useState({
    patient: '',
    diagnosis: '',
    symptoms: '',
    advice: 'Drink plenty of water and complete the full antibiotic course.',
    followUpDate: '',
    medicines: [
      { name: 'Paracetamol 650mg', dosage: '1 tablet', frequency: 'TDS (3 times/day)', duration: '5 days', instructions: 'After meals' },
    ],
    labTests: '',
  });

  useEffect(() => {
    fetchPrescriptions();
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      const res = await api.get('/patients');
      if (res.data.success) setPatients(res.data.data);
    } catch {
      console.log('Error fetching patients');
    }
  };

  const fetchPrescriptions = async () => {
    setLoading(true);
    try {
      const res = await api.get('/prescriptions');
      if (res.data.success) {
        setPrescriptions(res.data.data);
      }
    } catch {
      toast.error('Failed to load prescriptions');
    } finally {
      setLoading(false);
    }
  };

  const addMedicineRow = () => {
    setForm({
      ...form,
      medicines: [
        ...form.medicines,
        { name: '', dosage: '1 tablet', frequency: 'BD (Twice daily)', duration: '5 days', instructions: 'After food' },
      ],
    });
  };

  const removeMedicineRow = (idx) => {
    if (form.medicines.length === 1) return;
    setForm({
      ...form,
      medicines: form.medicines.filter((_, i) => i !== idx),
    });
  };

  const updateMedicine = (idx, field, val) => {
    const updated = [...form.medicines];
    updated[idx][field] = val;
    setForm({ ...form, medicines: updated });
  };

  const handleCreatePrescription = async (e) => {
    e.preventDefault();
    if (!form.patient) {
      toast.error('Please select a patient');
      return;
    }
    if (!form.diagnosis.trim()) {
      toast.error('Please provide clinical diagnosis');
      return;
    }

    try {
      const payload = {
        patient: form.patient,
        diagnosis: form.diagnosis,
        symptoms: form.symptoms ? form.symptoms.split(',').map((s) => s.trim()) : [],
        medicines: form.medicines,
        advice: form.advice,
        followUpDate: form.followUpDate || null,
        labTests: form.labTests
          ? form.labTests.split(',').map((t) => ({ testName: t.trim() }))
          : [],
      };

      const res = await api.post('/prescriptions', payload);
      if (res.data.success) {
        toast.success('Prescription generated and digitally signed');
        setShowModal(false);
        setForm({
          patient: '',
          diagnosis: '',
          symptoms: '',
          advice: 'Drink plenty of water and complete the full antibiotic course.',
          followUpDate: '',
          medicines: [
            { name: 'Paracetamol 650mg', dosage: '1 tablet', frequency: 'TDS (3 times/day)', duration: '5 days', instructions: 'After meals' },
          ],
          labTests: '',
        });
        fetchPrescriptions();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to issue prescription');
    }
  };

  const handleDownloadPDF = async (id) => {
    try {
      toast.loading('Generating signed clinical PDF...', { id: 'pdf' });
      const res = await api.get(`/prescriptions/${id}/pdf`, { responseType: 'blob' });
      const blob = new Blob([res.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Prescription_${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Prescription PDF downloaded', { id: 'pdf' });
    } catch {
      toast.error('Failed to stream PDF', { id: 'pdf' });
    }
  };

  const filteredPrescriptions = prescriptions.filter((p) => {
    if (!search) return true;
    const term = search.toLowerCase();
    const patName = p.patient?.name?.toLowerCase() || '';
    const diag = p.diagnosis?.toLowerCase() || '';
    return patName.includes(term) || diag.includes(term);
  });

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Header Banner */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-sky-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-sky-500/20">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                  Prescriptions Registry
                </h1>
                <span className="text-[11px] font-semibold tracking-wide uppercase px-2.5 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-200/80">
                  Digital Rx
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Issue tamper-proof Rx with structured medication schedules, clinical advice, QR validation, and PDF export.
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-sky-600 to-teal-600 hover:from-sky-700 hover:to-teal-700 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-xs transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Write Prescription
          </button>
        </div>

        {/* Search Bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between gap-4">
          <div className="relative w-full max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by patient name or diagnosis..."
              className="w-full pl-10 pr-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-hidden focus:border-sky-500 focus:ring-3 focus:ring-sky-500/15 transition-all text-slate-800 placeholder:text-slate-400"
            />
          </div>
          <span className="text-xs text-slate-500 font-medium hidden sm:inline">
            Total Prescriptions: <strong className="text-slate-800">{filteredPrescriptions.length}</strong>
          </span>
        </div>

        {/* Prescription Table */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          {loading ? (
            <div className="p-16 text-center">
              <div className="inline-block animate-spin rounded-full h-9 w-9 border-3 border-sky-600 border-t-transparent"></div>
              <p className="mt-3 text-xs sm:text-sm font-medium text-slate-500">Loading prescriptions archive...</p>
            </div>
          ) : filteredPrescriptions.length === 0 ? (
            <div className="p-16 text-center">
              <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-3 text-slate-400">
                <FileText className="w-7 h-7" />
              </div>
              <p className="text-base font-semibold text-slate-800">No prescriptions found</p>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Click "Write Prescription" above to author a new clinically-verified digital Rx.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="bg-slate-50/80 text-slate-500 font-semibold text-[11px] uppercase tracking-wider border-b border-slate-200/80">
                    <th className="py-3.5 px-5">Patient</th>
                    <th className="py-3.5 px-5">Diagnosis & Symptoms</th>
                    <th className="py-3.5 px-5">Medications (Rx)</th>
                    <th className="py-3.5 px-5">Date Issued</th>
                    <th className="py-3.5 px-5 text-center">Verification QR</th>
                    <th className="py-3.5 px-5 text-right">PDF Export</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredPrescriptions.map((rx) => (
                    <tr key={rx._id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-5">
                        <div className="font-semibold text-slate-900">{rx.patient?.name || 'Unknown Patient'}</div>
                        <div className="text-[11px] text-slate-500">{rx.patient?.email}</div>
                      </td>
                      <td className="py-3.5 px-5">
                        <div className="font-semibold text-sky-800">{rx.diagnosis}</div>
                        {rx.symptoms && rx.symptoms.length > 0 && (
                          <div className="text-[11px] text-slate-500 truncate max-w-xs mt-0.5">
                            Symptoms: {rx.symptoms.join(', ')}
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-5 text-xs text-slate-600 max-w-xs truncate">
                        {rx.medicines?.map((m) => `${m.name} (${m.dosage})`).join(', ')}
                      </td>
                      <td className="py-3.5 px-5 whitespace-nowrap text-slate-500">
                        {new Date(rx.createdAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="py-3.5 px-5 text-center">
                        {rx.qrCode ? (
                          <button
                            onClick={() => setQrModal(rx)}
                            className="p-1.5 text-slate-500 hover:text-sky-600 hover:bg-slate-100 rounded-lg inline-block transition-colors cursor-pointer"
                            title="View Verification QR"
                          >
                            <QrCode className="w-5 h-5 mx-auto" />
                          </button>
                        ) : (
                          <span className="text-xs text-slate-400">N/A</span>
                        )}
                      </td>
                      <td className="py-3.5 px-5 text-right">
                        <button
                          onClick={() => handleDownloadPDF(rx._id)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs rounded-lg transition-colors cursor-pointer"
                        >
                          <Download className="w-3.5 h-3.5 text-sky-600" />
                          Download PDF
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modal: Write Prescription */}
        {showModal && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xl w-full max-w-3xl overflow-hidden animate-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">Author Clinical Prescription</h3>
                    <p className="text-[11px] text-slate-500">Sign with automatic digital verification hash</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreatePrescription} className="p-6 space-y-4 max-h-[78vh] overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                      Select Patient *
                    </label>
                    <select
                      required
                      value={form.patient}
                      onChange={(e) => setForm({ ...form, patient: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-hidden focus:border-sky-500 focus:ring-3 focus:ring-sky-500/15"
                    >
                      <option value="">-- Choose Patient --</option>
                      {patients.map((p) => (
                        <option key={p._id} value={p.user?._id || p.user}>
                          {p.user?.name} ({p.patientId}) - Blood: {p.bloodGroup}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                      Clinical Diagnosis *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Acute Bronchitis, Essential Hypertension"
                      value={form.diagnosis}
                      onChange={(e) => setForm({ ...form, diagnosis: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-hidden focus:border-sky-500 focus:ring-3 focus:ring-sky-500/15 placeholder:text-slate-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Presenting Symptoms (Comma separated)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. High fever, persistent cough, shortness of breath"
                    value={form.symptoms}
                    onChange={(e) => setForm({ ...form, symptoms: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-hidden focus:border-sky-500 focus:ring-3 focus:ring-sky-500/15 placeholder:text-slate-400"
                  />
                </div>

                {/* Medicines List */}
                <div className="pt-2">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                      <Pill className="w-3.5 h-3.5 text-sky-600" /> Prescribed Medications (Rx) *
                    </label>
                    <button
                      type="button"
                      onClick={addMedicineRow}
                      className="text-xs text-sky-600 hover:text-sky-700 font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Medication
                    </button>
                  </div>

                  <div className="space-y-3">
                    {form.medicines.map((med, idx) => (
                      <div key={idx} className="p-3.5 bg-slate-50/70 rounded-xl border border-slate-200/80 space-y-2.5">
                        <div className="flex gap-2 items-center">
                          <input
                            type="text"
                            required
                            placeholder="Medicine Name (e.g. Amoxicillin 500mg)"
                            value={med.name}
                            onChange={(e) => updateMedicine(idx, 'name', e.target.value)}
                            className="flex-1 px-3 py-1.5 text-xs sm:text-sm bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:border-sky-500"
                          />
                          <input
                            type="text"
                            placeholder="Dosage (e.g. 1 tab)"
                            value={med.dosage}
                            onChange={(e) => updateMedicine(idx, 'dosage', e.target.value)}
                            className="w-28 px-2.5 py-1.5 text-xs sm:text-sm bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:border-sky-500"
                          />
                          {form.medicines.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeMedicineRow(idx)}
                              className="text-slate-400 hover:text-rose-600 p-1.5 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                          <input
                            type="text"
                            placeholder="Frequency (e.g. TDS / 3x daily)"
                            value={med.frequency}
                            onChange={(e) => updateMedicine(idx, 'frequency', e.target.value)}
                            className="px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg"
                          />
                          <input
                            type="text"
                            placeholder="Duration (e.g. 5 days)"
                            value={med.duration}
                            onChange={(e) => updateMedicine(idx, 'duration', e.target.value)}
                            className="px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg"
                          />
                          <input
                            type="text"
                            placeholder="Instructions (e.g. After food)"
                            value={med.instructions}
                            onChange={(e) => updateMedicine(idx, 'instructions', e.target.value)}
                            className="px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                      Lab Tests Recommended (Comma separated)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Complete Blood Count (CBC), Chest X-Ray"
                      value={form.labTests}
                      onChange={(e) => setForm({ ...form, labTests: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-hidden focus:border-sky-500 focus:ring-3 focus:ring-sky-500/15 placeholder:text-slate-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                      Follow-up Consultation Date
                    </label>
                    <input
                      type="date"
                      value={form.followUpDate}
                      onChange={(e) => setForm({ ...form, followUpDate: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-hidden focus:border-sky-500 focus:ring-3 focus:ring-sky-500/15"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Dietary & Lifestyle Advice
                  </label>
                  <textarea
                    rows="2"
                    value={form.advice}
                    onChange={(e) => setForm({ ...form, advice: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-hidden focus:border-sky-500 focus:ring-3 focus:ring-sky-500/15 placeholder:text-slate-400"
                  ></textarea>
                </div>

                <div className="pt-4 border-t border-slate-100 flex justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 border border-slate-200 text-xs sm:text-sm text-slate-600 hover:bg-slate-50 rounded-xl font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-gradient-to-r from-sky-600 to-teal-600 hover:from-sky-700 hover:to-teal-700 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-xs transition-all cursor-pointer"
                  >
                    Sign & Issue Prescription
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* QR Code Inspection Modal */}
        {qrModal && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xl w-full max-w-sm p-6 text-center animate-in zoom-in-95 duration-150">
              <div className="w-12 h-12 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center mx-auto mb-3">
                <QrCode className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 text-base mb-1">Prescription Verification QR</h3>
              <p className="text-xs text-slate-500 mb-4">
                Rx for {qrModal.patient?.name} · Signed by Dr. {qrModal.doctor?.name}
              </p>
              <div className="bg-white p-4 border border-slate-200 rounded-xl inline-block shadow-inner">
                <img src={qrModal.qrCode} alt="Rx QR Code" className="w-44 h-44 mx-auto" />
              </div>
              <p className="text-[11px] font-mono text-slate-400 mt-3 truncate">
                Hash: {qrModal.verificationHash}
              </p>
              <button
                onClick={() => setQrModal(null)}
                className="mt-5 w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs sm:text-sm font-semibold rounded-xl transition-colors cursor-pointer"
              >
                Close Window
              </button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default DoctorPrescriptions;
