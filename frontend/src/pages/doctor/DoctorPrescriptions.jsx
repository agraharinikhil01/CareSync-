import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import DashboardLayout from '../../layouts/DashboardLayout';
import { FileText, Plus, Search, Download, Trash2, X, Check, Calendar, Stethoscope, QrCode } from 'lucide-react';
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
        toast.success('Prescription generated and signed');
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
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#dcdcde] pb-4 bg-white p-6 rounded-md shadow-xs">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 bg-[#e6f4f8] text-[#006088] rounded-md">
                <FileText className="w-6 h-6" />
              </span>
              <h1 className="text-2xl font-semibold text-[#2c3338] tracking-tight">Prescriptions Registry</h1>
            </div>
            <p className="text-sm text-[#50575e] mt-1">
              Issue tamper-proof Rx with medicine dosage, clinical advice, QR verification, and instant PDF generation.
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#0087be] hover:bg-[#006088] text-white text-sm font-medium rounded-sm shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Write Prescription
          </button>
        </div>

        {/* Search */}
        <div className="bg-white p-4 rounded-md border border-[#dcdcde] shadow-xs flex items-center justify-between">
          <div className="relative w-full max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by patient name or diagnosis..."
              className="w-full pl-9 pr-3 py-2 text-sm border border-[#dcdcde] rounded-sm focus:outline-hidden focus:border-[#0087be]"
            />
          </div>
          <span className="text-xs text-[#50575e] font-medium hidden sm:inline">
            Total Prescriptions: {filteredPrescriptions.length}
          </span>
        </div>

        {/* Prescription Table */}
        <div className="bg-white rounded-md border border-[#dcdcde] shadow-xs overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-[#0087be] border-t-transparent"></div>
              <p className="mt-3 text-sm text-[#50575e]">Loading prescriptions...</p>
            </div>
          ) : filteredPrescriptions.length === 0 ? (
            <div className="p-12 text-center">
              <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-base font-medium text-[#2c3338]">No prescriptions found</p>
              <p className="text-sm text-[#50575e] mt-1">Click "Write Prescription" to author a new Rx.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-[#f6f7f7] text-[#50575e] font-semibold text-xs border-b border-[#dcdcde]">
                    <th className="py-3 px-4">PATIENT</th>
                    <th className="py-3 px-4">DIAGNOSIS</th>
                    <th className="py-3 px-4">MEDICINES</th>
                    <th className="py-3 px-4">DATE ISSUED</th>
                    <th className="py-3 px-4 text-center">QR CODE</th>
                    <th className="py-3 px-4 text-right">PDF EXPORT</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#dcdcde]">
                  {filteredPrescriptions.map((rx) => (
                    <tr key={rx._id} className="hover:bg-[#fcfcfc] transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-semibold text-[#2c3338]">{rx.patient?.name}</div>
                        <div className="text-xs text-[#50575e]">{rx.patient?.email}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-medium text-[#006088]">{rx.diagnosis}</div>
                        {rx.symptoms && rx.symptoms.length > 0 && (
                          <div className="text-xs text-[#50575e] truncate max-w-xs">
                            Symptoms: {rx.symptoms.join(', ')}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4 text-xs text-[#50575e] max-w-xs truncate">
                        {rx.medicines?.map((m) => `${m.name} (${m.dosage})`).join(', ')}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap text-[#50575e]">
                        {new Date(rx.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {rx.qrCode ? (
                          <button
                            onClick={() => setQrModal(rx)}
                            className="p-1 text-gray-500 hover:text-[#0087be] inline-block cursor-pointer"
                            title="View Verification QR"
                          >
                            <QrCode className="w-5 h-5 mx-auto" />
                          </button>
                        ) : (
                          <span className="text-xs text-gray-400">N/A</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => handleDownloadPDF(rx._id)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#f6f7f7] hover:bg-[#eaeaea] text-[#2c3338] border border-[#dcdcde] text-xs font-semibold rounded-sm transition-colors cursor-pointer"
                        >
                          <Download className="w-3.5 h-3.5 text-[#006088]" />
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
          <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-md border border-[#dcdcde] shadow-xl w-full max-w-3xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between px-6 py-4 border-b border-[#dcdcde] bg-[#f6f7f7]">
                <h3 className="font-semibold text-[#2c3338] text-base flex items-center gap-2">
                  <FileText className="w-5 h-5 text-[#006088]" />
                  Author Clinical Prescription
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600 p-1 rounded-sm cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreatePrescription} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#2c3338] uppercase mb-1">
                      Select Patient *
                    </label>
                    <select
                      required
                      value={form.patient}
                      onChange={(e) => setForm({ ...form, patient: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-[#dcdcde] rounded-sm focus:outline-hidden focus:border-[#0087be] bg-white text-[#2c3338]"
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
                    <label className="block text-xs font-semibold text-[#2c3338] uppercase mb-1">
                      Diagnosis *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Acute Bronchitis, Essential Hypertension"
                      value={form.diagnosis}
                      onChange={(e) => setForm({ ...form, diagnosis: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-[#dcdcde] rounded-sm focus:outline-hidden focus:border-[#0087be]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#2c3338] uppercase mb-1">
                    Symptoms (Comma separated)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. High fever, persistent cough, shortness of breath"
                    value={form.symptoms}
                    onChange={(e) => setForm({ ...form, symptoms: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-[#dcdcde] rounded-sm focus:outline-hidden focus:border-[#0087be]"
                  />
                </div>

                {/* Medicines List */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-semibold text-[#2c3338] uppercase">
                      Prescribed Medications (Rx) *
                    </label>
                    <button
                      type="button"
                      onClick={addMedicineRow}
                      className="text-xs text-[#0087be] hover:underline font-medium flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Medication
                    </button>
                  </div>

                  <div className="space-y-3">
                    {form.medicines.map((med, idx) => (
                      <div key={idx} className="p-3 bg-[#f6f7f7] rounded-sm border border-[#dcdcde] space-y-2">
                        <div className="flex gap-2 items-center">
                          <input
                            type="text"
                            required
                            placeholder="Medicine Name (e.g. Amoxicillin 500mg)"
                            value={med.name}
                            onChange={(e) => updateMedicine(idx, 'name', e.target.value)}
                            className="flex-1 px-3 py-1.5 text-sm bg-white border border-[#dcdcde] rounded-sm focus:outline-hidden focus:border-[#0087be]"
                          />
                          <input
                            type="text"
                            placeholder="Dosage (e.g. 1 tab)"
                            value={med.dosage}
                            onChange={(e) => updateMedicine(idx, 'dosage', e.target.value)}
                            className="w-28 px-2 py-1.5 text-sm bg-white border border-[#dcdcde] rounded-sm focus:outline-hidden focus:border-[#0087be]"
                          />
                          {form.medicines.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeMedicineRow(idx)}
                              className="text-gray-400 hover:text-rose-600 p-1 cursor-pointer"
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
                            className="px-2.5 py-1 text-xs bg-white border border-[#dcdcde] rounded-sm"
                          />
                          <input
                            type="text"
                            placeholder="Duration (e.g. 5 days)"
                            value={med.duration}
                            onChange={(e) => updateMedicine(idx, 'duration', e.target.value)}
                            className="px-2.5 py-1 text-xs bg-white border border-[#dcdcde] rounded-sm"
                          />
                          <input
                            type="text"
                            placeholder="Instructions (e.g. After food)"
                            value={med.instructions}
                            onChange={(e) => updateMedicine(idx, 'instructions', e.target.value)}
                            className="px-2.5 py-1 text-xs bg-white border border-[#dcdcde] rounded-sm"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#2c3338] uppercase mb-1">
                      Lab Tests Recommended (Comma separated)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Complete Blood Count (CBC), Chest X-Ray"
                      value={form.labTests}
                      onChange={(e) => setForm({ ...form, labTests: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-[#dcdcde] rounded-sm focus:outline-hidden focus:border-[#0087be]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#2c3338] uppercase mb-1">
                      Follow-up Date
                    </label>
                    <input
                      type="date"
                      value={form.followUpDate}
                      onChange={(e) => setForm({ ...form, followUpDate: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-[#dcdcde] rounded-sm focus:outline-hidden focus:border-[#0087be]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#2c3338] uppercase mb-1">
                    Dietary & Lifestyle Advice
                  </label>
                  <textarea
                    rows="2"
                    value={form.advice}
                    onChange={(e) => setForm({ ...form, advice: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-[#dcdcde] rounded-sm focus:outline-hidden focus:border-[#0087be]"
                  ></textarea>
                </div>

                <div className="pt-4 border-t border-[#dcdcde] flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 border border-[#dcdcde] text-sm text-[#50575e] hover:bg-[#f6f7f7] rounded-sm font-medium cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#0087be] hover:bg-[#006088] text-white text-sm font-medium rounded-sm shadow-xs transition-colors cursor-pointer"
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
          <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-md border border-[#dcdcde] shadow-xl w-full max-w-sm p-6 text-center animate-in fade-in zoom-in-95 duration-150">
              <h3 className="font-semibold text-[#2c3338] text-base mb-1">Prescription Verification QR</h3>
              <p className="text-xs text-[#50575e] mb-4">
                Rx for {qrModal.patient?.name} · Signed by Dr. {qrModal.doctor?.name}
              </p>
              <div className="bg-white p-4 border border-[#dcdcde] rounded-sm inline-block shadow-inner">
                <img src={qrModal.qrCode} alt="Rx QR Code" className="w-48 h-48 mx-auto" />
              </div>
              <p className="text-[11px] font-mono text-gray-500 mt-3 truncate">
                Hash: {qrModal.verificationHash}
              </p>
              <button
                onClick={() => setQrModal(null)}
                className="mt-5 w-full py-2 bg-[#f6f7f7] hover:bg-[#eaeaea] text-[#2c3338] border border-[#dcdcde] text-sm font-medium rounded-sm cursor-pointer"
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
