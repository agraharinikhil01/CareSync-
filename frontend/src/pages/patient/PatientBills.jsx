import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import DashboardLayout from '../../layouts/DashboardLayout';
import { Receipt, Download, CreditCard, CheckCircle2, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

const PatientBills = () => {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBills();
  }, []);

  const fetchBills = async () => {
    setLoading(true);
    try {
      const res = await api.get('/bills');
      if (res.data.success) {
        setBills(res.data.data);
      }
    } catch {
      toast.error('Failed to load your bills');
    } finally {
      setLoading(false);
    }
  };

  const handlePayNow = async (id) => {
    try {
      const res = await api.patch(`/bills/${id}/pay`, { paymentMethod: 'UPI' });
      if (res.data.success) {
        toast.success('Payment completed successfully via UPI!');
        fetchBills();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Payment failed');
    }
  };

  const handleDownloadPDF = async (id, invoiceNumber) => {
    try {
      toast.loading('Generating invoice statement...', { id: 'pdf' });
      const res = await api.get(`/bills/${id}/pdf`, { responseType: 'blob' });
      const blob = new Blob([res.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${invoiceNumber || 'Invoice'}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Invoice downloaded', { id: 'pdf' });
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
                <Receipt className="w-6 h-6" />
              </span>
              <h1 className="text-2xl font-semibold text-[#2c3338] tracking-tight">Billing & Invoices</h1>
            </div>
            <p className="text-sm text-[#50575e] mt-1">
              Review itemized hospital statements, settle outstanding invoices online, and download tax receipts.
            </p>
          </div>
        </div>

        {/* Bills List */}
        <div className="bg-white rounded-md border border-[#dcdcde] shadow-xs overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-[#0087be] border-t-transparent"></div>
              <p className="mt-3 text-sm text-[#50575e]">Loading billing history...</p>
            </div>
          ) : bills.length === 0 ? (
            <div className="p-12 text-center">
              <Receipt className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-base font-medium text-[#2c3338]">No invoices on record</p>
              <p className="text-sm text-[#50575e] mt-1">All hospital consultations and bed stays are settled.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-[#f6f7f7] text-[#50575e] font-semibold text-xs border-b border-[#dcdcde]">
                    <th className="py-3 px-4">INVOICE NUMBER</th>
                    <th className="py-3 px-4">DATE</th>
                    <th className="py-3 px-4">LINE ITEMS</th>
                    <th className="py-3 px-4">TOTAL AMOUNT</th>
                    <th className="py-3 px-4">STATUS</th>
                    <th className="py-3 px-4 text-right">ACTION</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#dcdcde]">
                  {bills.map((b) => (
                    <tr key={b._id} className="hover:bg-[#fcfcfc] transition-colors">
                      <td className="py-3 px-4 font-mono font-medium text-[#006088]">
                        {b.invoiceNumber}
                      </td>
                      <td className="py-3 px-4 text-[#50575e] whitespace-nowrap">
                        {new Date(b.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-xs text-[#50575e] max-w-xs truncate">
                        {b.items?.map((i) => i.description).join(', ')}
                      </td>
                      <td className="py-3 px-4 font-semibold text-[#2c3338]">
                        ₹{b.totalAmount?.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium ${
                            b.paymentStatus === 'PAID'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          ● {b.paymentStatus}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {b.paymentStatus === 'PENDING' && (
                            <button
                              onClick={() => handlePayNow(b._id)}
                              className="px-3 py-1.5 bg-[#0087be] hover:bg-[#006088] text-white text-xs font-semibold rounded-sm shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                            >
                              <CreditCard className="w-3.5 h-3.5" /> Pay Online
                            </button>
                          )}
                          <button
                            onClick={() => handleDownloadPDF(b._id, b.invoiceNumber)}
                            className="p-1.5 text-gray-600 hover:text-[#0087be] hover:bg-[#f6f7f7] rounded-sm transition-colors cursor-pointer"
                            title="Download Tax Invoice PDF"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default PatientBills;
