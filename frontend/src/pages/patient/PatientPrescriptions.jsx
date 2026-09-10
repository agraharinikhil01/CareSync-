import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import DashboardLayout from '../../layouts/DashboardLayout';
import { FileText, Download, QrCode, Stethoscope, Calendar, Pill } from 'lucide-react';
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
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#dcdcde] pb-4 bg-white p-6 rounded-md shadow-xs">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 bg-[#e6f4f8] text-[#006088] rounded-md">
                <FileText className="w-6 h-6" />
              </span>
              <h1 className="text-2xl font-semibold text-[#2c3338] tracking-tight">Electronic Prescriptions Archive</h1>
            </div>
            <p className="text-sm text-[#50575e] mt-1">
              Access your digitally-signed doctor prescriptions, medication dosage guides, and QR verification codes.
            </p>
          </div>
        </div>

        {/* Prescriptions List */}
        {loading ? (
          <div className="p-12 text-center bg-white rounded-md border border-[#dcdcde]">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-[#0087be] border-t-transparent"></div>
            <p className="mt-3 text-sm text-[#50575e]">Loading prescriptions archive...</p>
          </div>
        ) : prescriptions.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-md border border-[#dcdcde]">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-base font-medium text-[#2c3338]">No prescriptions on file</p>
            <p className="text-sm text-[#50575e] mt-1">After your consultation, your doctor will upload your signed Rx here.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {prescriptions.map((rx) => (
              <div
                key={rx._id}
                className="bg-white rounded-md border border-[#dcdcde] shadow-xs p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 border-b border-gray-100 pb-4">
                  <div>
                    <span className="text-xs font-mono font-medium text-[#0087be] bg-[#e6f4f8] px-2 py-0.5 rounded-sm">
                      Rx #{rx._id.substring(rx._id.length - 8).toUpperCase()}
                    </span>
                    <h3 className="font-semibold text-lg text-[#2c3338] mt-1">
                      Diagnosis: {rx.diagnosis}
                    </h3>
                    <p className="text-xs text-[#50575e] flex items-center gap-1.5 mt-0.5">
                      <Stethoscope className="w-3.5 h-3.5 text-[#006088]" />
                      Attending Doctor: <strong>Dr. {rx.doctor?.name}</strong> · Date:{' '}
                      {new Date(rx.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {rx.qrCode && (
                      <button
                        onClick={() => setQrModal(rx)}
                        className="px-3 py-1.5 bg-[#f6f7f7] hover:bg-[#eaeaea] text-[#2c3338] border border-[#dcdcde] text-xs font-medium rounded-sm flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <QrCode className="w-3.5 h-3.5" /> Verification QR
                      </button>
                    )}
                    <button
                      onClick={() => handleDownloadPDF(rx._id)}
                      className="px-3.5 py-1.5 bg-[#0087be] hover:bg-[#006088] text-white text-xs font-semibold rounded-sm shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" /> Download Signed PDF
                    </button>
                  </div>
                </div>

                {/* Medicines List */}
                <div className="mt-4">
                  <h4 className="text-xs font-semibold text-[#2c3338] uppercase flex items-center gap-1 mb-2">
                    <Pill className="w-3.5 h-3.5 text-emerald-600" /> Prescribed Medications:
                  </h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border border-[#dcdcde] rounded-sm">
                      <thead className="bg-[#f6f7f7] text-[#50575e]">
                        <tr>
                          <th className="py-2 px-3 border-b border-[#dcdcde]">MEDICINE</th>
                          <th className="py-2 px-3 border-b border-[#dcdcde]">DOSAGE</th>
                          <th className="py-2 px-3 border-b border-[#dcdcde]">FREQUENCY</th>
                          <th className="py-2 px-3 border-b border-[#dcdcde]">DURATION</th>
                          <th className="py-2 px-3 border-b border-[#dcdcde]">INSTRUCTIONS</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#dcdcde]">
                        {rx.medicines?.map((m, idx) => (
                          <tr key={idx}>
                            <td className="py-2 px-3 font-semibold text-[#2c3338]">{m.name}</td>
                            <td className="py-2 px-3 text-[#50575e]">{m.dosage}</td>
                            <td className="py-2 px-3 text-[#50575e]">{m.frequency}</td>
                            <td className="py-2 px-3 text-[#50575e]">{m.duration}</td>
                            <td className="py-2 px-3 text-[#50575e]">{m.instructions}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Advice & Follow-up */}
                {(rx.advice || rx.followUpDate) && (
                  <div className="mt-4 bg-[#f6f7f7] p-3 rounded-sm text-xs text-[#50575e] space-y-1">
                    {rx.advice && (
                      <p>
                        <strong className="text-[#2c3338]">Clinical Advice:</strong> {rx.advice}
                      </p>
                    )}
                    {rx.followUpDate && (
                      <p className="flex items-center gap-1 text-[#006088] font-medium">
                        <Calendar className="w-3.5 h-3.5" /> Follow-Up Consultation:{' '}
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
          <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-md border border-[#dcdcde] shadow-xl w-full max-w-sm p-6 text-center animate-in fade-in zoom-in-95 duration-150">
              <h3 className="font-semibold text-[#2c3338] text-base mb-1">Authentic Prescription QR</h3>
              <p className="text-xs text-[#50575e] mb-4">
                Scan with any QR scanner to verify validity and digital hash on CareSync.
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

export default PatientPrescriptions;
