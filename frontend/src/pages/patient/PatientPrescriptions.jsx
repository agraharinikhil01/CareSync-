import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import DashboardLayout from '../../layouts/DashboardLayout';
import { FileText, Download, QrCode, Stethoscope, Calendar, Pill, Sparkles, CheckCircle2, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';

const PatientPrescriptions = () => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [qrModal, setQrModal] = useState(null);

  useEffect(() => {
    fetchPrescriptions();
  }, []);

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

  const handleDownloadPDF = async (id) => {
    try {
      toast.loading('Downloading signed prescription...', { id: 'pdf' });
      const res = await api.get(`/prescriptions/${id}/pdf`, { responseType: 'blob' });
      const blob = new Blob([res.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Prescription_${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Downloaded successfully', { id: 'pdf' });
    } catch {
      toast.error('Failed to download PDF', { id: 'pdf' });
    }
  };

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
                  Electronic Prescriptions Archive
                </h1>
                <span className="text-[11px] font-semibold tracking-wide uppercase px-2.5 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-200/80">
                  Digital Rx
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Access your digitally-signed doctor prescriptions, medication dosage guides, and QR verification codes.
              </p>
            </div>
          </div>
        </div>

        {/* Prescriptions List */}
        {loading ? (
          <div className="p-16 text-center bg-white rounded-2xl border border-slate-200/80">
            <div className="inline-block animate-spin rounded-full h-9 w-9 border-3 border-sky-600 border-t-transparent"></div>
            <p className="mt-3 text-xs sm:text-sm font-medium text-slate-500">Loading prescriptions archive...</p>
          </div>
        ) : prescriptions.length === 0 ? (
          <div className="p-16 text-center bg-white rounded-2xl border border-slate-200/80">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-3 text-slate-400">
              <FileText className="w-7 h-7" />
            </div>
            <p className="text-base font-semibold text-slate-800">No prescriptions on file</p>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              After your doctor consultation, your signed medical prescription and dosage instructions will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {prescriptions.map((rx) => (
              <div
                key={rx._id}
                className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 hover:shadow-md hover:border-sky-200 transition-all"
              >
                <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 border-b border-slate-100 pb-4">
                  <div>
                    <span className="text-[11px] font-mono font-semibold text-sky-700 bg-sky-50 px-2.5 py-0.5 rounded-md border border-sky-200/70">
                      Rx #{rx._id.substring(rx._id.length - 8).toUpperCase()}
                    </span>
                    <h3 className="font-bold text-lg text-slate-900 mt-1.5">
                      Diagnosis: {rx.diagnosis}
                    </h3>
                    <p className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                      <span className="flex items-center gap-1 font-medium text-slate-700">
                        <Stethoscope className="w-3.5 h-3.5 text-sky-600" />
                        Dr. {rx.doctor?.name}
                      </span>
                      <span>·</span>
                      <span>
                        Issued:{' '}
                        {new Date(rx.createdAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {rx.qrCode && (
                      <button
                        onClick={() => setQrModal(rx)}
                        className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <QrCode className="w-4 h-4 text-slate-600" /> Verification QR
                      </button>
                    )}
                    <button
                      onClick={() => handleDownloadPDF(rx._id)}
                      className="px-4 py-2 bg-gradient-to-r from-sky-600 to-teal-600 hover:from-sky-700 hover:to-teal-700 text-white text-xs font-semibold rounded-xl shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <Download className="w-4 h-4" /> Download Signed PDF
                    </button>
                  </div>
                </div>

                {/* Medicines List */}
                <div className="mt-4">
                  <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-1.5 mb-2.5">
                    <Pill className="w-4 h-4 text-emerald-600" /> Prescribed Medications:
                  </h4>
                  <div className="overflow-x-auto rounded-xl border border-slate-200/80">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50/80 text-slate-500 font-semibold text-[11px] uppercase tracking-wider border-b border-slate-200/80">
                        <tr>
                          <th className="py-2.5 px-3.5">Medicine</th>
                          <th className="py-2.5 px-3.5">Dosage</th>
                          <th className="py-2.5 px-3.5">Frequency</th>
                          <th className="py-2.5 px-3.5">Duration</th>
                          <th className="py-2.5 px-3.5">Instructions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {rx.medicines?.map((m, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/50">
                            <td className="py-2.5 px-3.5 font-bold text-slate-900">{m.name}</td>
                            <td className="py-2.5 px-3.5 text-slate-600">{m.dosage}</td>
                            <td className="py-2.5 px-3.5 text-slate-600">{m.frequency}</td>
                            <td className="py-2.5 px-3.5 text-slate-600">{m.duration}</td>
                            <td className="py-2.5 px-3.5 text-slate-600">{m.instructions}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Advice & Follow-up */}
                {(rx.advice || rx.followUpDate) && (
                  <div className="mt-4 bg-slate-50 p-4 rounded-xl text-xs text-slate-600 space-y-1.5 border border-slate-100">
                    {rx.advice && (
                      <p>
                        <strong className="text-slate-800">Clinical Advice:</strong> {rx.advice}
                      </p>
                    )}
                    {rx.followUpDate && (
                      <p className="flex items-center gap-1.5 text-sky-700 font-semibold">
                        <Calendar className="w-3.5 h-3.5 text-sky-600" /> Follow-Up Consultation:{' '}
                        {new Date(rx.followUpDate).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Verification QR Modal */}
        {qrModal && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xl w-full max-w-sm p-6 text-center animate-in zoom-in-95 duration-150">
              <div className="w-12 h-12 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center mx-auto mb-3">
                <QrCode className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 text-base mb-1">Authentic Prescription QR</h3>
              <p className="text-xs text-slate-500 mb-4">
                Scan with any QR scanner to verify validity and digital hash on CareSync.
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

export default PatientPrescriptions;
