import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import DashboardLayout from '../../layouts/DashboardLayout';
import { Receipt, Download, CreditCard, CheckCircle2, Clock, Sparkles } from 'lucide-react';
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
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Header Banner */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-sky-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-sky-500/20">
              <Receipt className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                  Billing & Invoices
                </h1>
                <span className="text-[11px] font-semibold tracking-wide uppercase px-2.5 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-200/80">
                  Financial Ledger
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Review itemized hospital statements, settle outstanding invoices online via UPI, and download tax receipts.
              </p>
            </div>
          </div>
        </div>

        {/* Bills List */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          {loading ? (
            <div className="p-16 text-center">
              <div className="inline-block animate-spin rounded-full h-9 w-9 border-3 border-sky-600 border-t-transparent"></div>
              <p className="mt-3 text-xs sm:text-sm font-medium text-slate-500">Loading billing history...</p>
            </div>
          ) : bills.length === 0 ? (
            <div className="p-16 text-center">
              <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-3 text-slate-400">
                <Receipt className="w-7 h-7" />
              </div>
              <p className="text-base font-semibold text-slate-800">No invoices on record</p>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                All consultations and bed stays are settled. You have no pending payments.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="bg-slate-50/80 text-slate-500 font-semibold text-[11px] uppercase tracking-wider border-b border-slate-200/80">
                    <th className="py-3.5 px-5">Invoice Number</th>
                    <th className="py-3.5 px-5">Date</th>
                    <th className="py-3.5 px-5">Line Items Breakdown</th>
                    <th className="py-3.5 px-5">Total Amount</th>
                    <th className="py-3.5 px-5">Payment Status</th>
                    <th className="py-3.5 px-5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {bills.map((b) => (
                    <tr key={b._id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-5 font-mono font-semibold text-xs text-sky-700">
                        <span className="px-2.5 py-1 rounded-lg bg-sky-50 border border-sky-200/70">
                          {b.invoiceNumber}
                        </span>
                      </td>
                      <td className="py-3.5 px-5 text-xs text-slate-500 whitespace-nowrap">
                        {new Date(b.createdAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="py-3.5 px-5 text-xs text-slate-600 max-w-xs truncate">
                        {b.items?.map((i) => i.description).join(', ')}
                      </td>
                      <td className="py-3.5 px-5 font-bold text-slate-900">
                        ₹{b.totalAmount?.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3.5 px-5">
                        <span
                          className={`inline-flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-full font-semibold border ${
                            b.paymentStatus === 'PAID'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200/80'
                              : 'bg-amber-50 text-amber-700 border-amber-200/80'
                          }`}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                          {b.paymentStatus}
                        </span>
                      </td>
                      <td className="py-3.5 px-5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {b.paymentStatus === 'PENDING' && (
                            <button
                              onClick={() => handlePayNow(b._id)}
                              className="px-3.5 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-semibold rounded-xl shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
                            >
                              <CreditCard className="w-3.5 h-3.5" /> Pay Online
                            </button>
                          )}
                          <button
                            onClick={() => handleDownloadPDF(b._id, b.invoiceNumber)}
                            className="p-1.5 text-slate-500 hover:text-sky-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer inline-flex items-center"
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
