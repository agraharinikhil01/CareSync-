import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import DashboardLayout from '../../layouts/DashboardLayout';
import { Receipt, Plus, Search, Filter, Download, CheckCircle2, Clock, Trash2, X, CreditCard, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

const STATUS_TABS = ['ALL', 'PENDING', 'PAID', 'CANCELLED'];

const ReceptionistBills = () => {
  const [bills, setBills] = useState([]);
  const [patients, setPatients] = useState([]);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const [form, setForm] = useState({
    patient: '',
    items: [{ description: 'OPD Consultation Fee', amount: 500 }],
    discount: 0,
    tax: 0,
    paymentMethod: 'CASH',
  });

  useEffect(() => {
    fetchBills();
  }, [statusFilter]);

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      const res = await api.get('/patients');
      if (res.data.success) setPatients(res.data.data);
    } catch {
      console.log('Error loading patients');
    }
  };

  const fetchBills = async () => {
    setLoading(true);
    try {
      let url = '/bills?';
      if (statusFilter !== 'ALL') url += `status=${statusFilter}`;
      const res = await api.get(url);
      if (res.data.success) setBills(res.data.data);
    } catch {
      toast.error('Failed to load billing ledger');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkPaid = async (id) => {
    try {
      const res = await api.patch(`/bills/${id}/pay`, { paymentMethod: 'CASH' });
      if (res.data.success) {
        toast.success('Payment recorded. Bill marked as PAID');
        fetchBills();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update payment');
    }
  };

  const handleDownloadPDF = async (id, invoiceNumber) => {
    try {
      toast.loading('Generating invoice PDF...', { id: 'pdf' });
      const res = await api.get(`/bills/${id}/pdf`, { responseType: 'blob' });
      const blob = new Blob([res.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${invoiceNumber || 'Invoice'}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Invoice PDF downloaded', { id: 'pdf' });
    } catch {
      toast.error('Failed to download PDF', { id: 'pdf' });
    }
  };

  const addItemRow = () => {
    setForm({
      ...form,
      items: [...form.items, { description: '', amount: 0 }],
    });
  };

  const removeItemRow = (idx) => {
    if (form.items.length === 1) return;
    setForm({
      ...form,
      items: form.items.filter((_, i) => i !== idx),
    });
  };

  const updateItem = (idx, field, val) => {
    const updated = [...form.items];
    updated[idx][field] = field === 'amount' ? Number(val) : val;
    setForm({ ...form, items: updated });
  };

  const calculateTotal = () => {
    const sub = form.items.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
    const disc = Number(form.discount) || 0;
    const tax = Number(form.tax) || 0;
    return Math.max(0, sub - disc + tax);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.patient) {
      toast.error('Please select patient');
      return;
    }

    try {
      const res = await api.post('/bills', {
        patient: form.patient,
        items: form.items,
        discount: Number(form.discount),
        tax: Number(form.tax),
        paymentMethod: form.paymentMethod,
      });

      if (res.data.success) {
        toast.success('Invoice generated successfully');
        setShowModal(false);
        setForm({
          patient: '',
          items: [{ description: 'OPD Consultation Fee', amount: 500 }],
          discount: 0,
          tax: 0,
          paymentMethod: 'CASH',
        });
        fetchBills();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to issue bill');
    }
  };

  const filtered = bills.filter((b) => {
    if (!search) return true;
    const term = search.toLowerCase();
    const inv = b.invoiceNumber?.toLowerCase() || '';
    const pat = b.patient?.name?.toLowerCase() || '';
    return inv.includes(term) || pat.includes(term);
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PAID':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200/80';
      case 'PENDING':
        return 'bg-amber-50 text-amber-700 border-amber-200/80';
      default:
        return 'bg-rose-50 text-rose-700 border-rose-200/80';
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
                  Cashier POS & Invoicing Desk
                </h1>
                <span className="text-[11px] font-semibold tracking-wide uppercase px-2.5 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-200/80">
                  Billing
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Issue outpatient receipts, record counter payments, and generate itemized hospital tax statements.
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-sky-600 to-teal-600 hover:from-sky-700 hover:to-teal-700 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-xs transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Issue Invoice
          </button>
        </div>

        {/* Filter bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="flex items-center gap-1.5 p-1 bg-slate-100/80 rounded-xl overflow-x-auto w-full md:w-auto">
            {STATUS_TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setStatusFilter(tab)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                  statusFilter === tab
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search invoice number or patient..."
              className="w-full pl-10 pr-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-hidden focus:border-sky-500 focus:ring-3 focus:ring-sky-500/15 transition-all text-slate-800 placeholder:text-slate-400"
            />
          </div>
        </div>

        {/* Bills Table */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          {loading ? (
            <div className="p-16 text-center">
              <div className="inline-block animate-spin rounded-full h-9 w-9 border-3 border-sky-600 border-t-transparent"></div>
              <p className="mt-3 text-xs sm:text-sm font-medium text-slate-500">Loading billing ledger...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-16 text-center">
              <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-3 text-slate-400">
                <Receipt className="w-7 h-7" />
              </div>
              <p className="text-base font-semibold text-slate-800">No invoices match filter</p>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                No invoices found in this category. Click "Issue Invoice" to record a new transaction.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="bg-slate-50/80 text-slate-500 font-semibold text-[11px] uppercase tracking-wider border-b border-slate-200/80">
                    <th className="py-3.5 px-5">Invoice #</th>
                    <th className="py-3.5 px-5">Patient Details</th>
                    <th className="py-3.5 px-5">Issued Date</th>
                    <th className="py-3.5 px-5">Total Amount</th>
                    <th className="py-3.5 px-5">Payment Status</th>
                    <th className="py-3.5 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map((b) => (
                    <tr key={b._id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-5 font-mono font-semibold text-xs text-sky-700">
                        <span className="px-2.5 py-1 rounded-lg bg-sky-50 border border-sky-200/70">
                          {b.invoiceNumber}
                        </span>
                      </td>
                      <td className="py-3.5 px-5">
                        <div className="font-semibold text-slate-900">{b.patient?.name || 'Unknown'}</div>
                        <div className="text-[11px] text-slate-500">{b.patient?.phone}</div>
                      </td>
                      <td className="py-3.5 px-5 text-xs text-slate-500 whitespace-nowrap">
                        {new Date(b.createdAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="py-3.5 px-5 font-bold text-slate-900">
                        ₹{b.totalAmount?.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3.5 px-5">
                        <span
                          className={`inline-flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-full font-semibold border ${getStatusBadge(
                            b.paymentStatus
                          )}`}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                          {b.paymentStatus}
                        </span>
                      </td>
                      <td className="py-3.5 px-5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {b.paymentStatus === 'PENDING' && (
                            <button
                              onClick={() => handleMarkPaid(b._id)}
                              className="px-2.5 py-1 text-xs font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg border border-emerald-200/80 transition-colors cursor-pointer"
                            >
                              Collect Payment
                            </button>
                          )}
                          <button
                            onClick={() => handleDownloadPDF(b._id, b.invoiceNumber)}
                            className="p-1.5 text-slate-500 hover:text-sky-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer inline-flex items-center"
                            title="Download Invoice PDF"
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

        {/* Modal: Issue Bill */}
        {showModal && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center">
                    <Receipt className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">Issue Patient Invoice</h3>
                    <p className="text-[11px] text-slate-500">Calculate line-items & taxes</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreate} className="p-6 space-y-4 max-h-[78vh] overflow-y-auto">
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
                    <option value="">-- Select Patient --</option>
                    {patients.map((p) => (
                      <option key={p._id} value={p.user?._id || p.user}>
                        {p.user?.name} ({p.patientId}) - {p.user?.phone}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      Line Items Breakdown
                    </label>
                    <button
                      type="button"
                      onClick={addItemRow}
                      className="text-xs text-sky-600 hover:text-sky-700 font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Item
                    </button>
                  </div>

                  <div className="space-y-2.5">
                    {form.items.map((item, idx) => (
                      <div key={idx} className="flex gap-2 items-center">
                        <input
                          type="text"
                          required
                          placeholder="e.g. OPD Consultation Fee"
                          value={item.description}
                          onChange={(e) => updateItem(idx, 'description', e.target.value)}
                          className="flex-1 px-3.5 py-2 text-xs sm:text-sm border border-slate-200 rounded-xl focus:outline-hidden focus:border-sky-500"
                        />
                        <div className="w-36 relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-semibold">
                            ₹
                          </span>
                          <input
                            type="number"
                            min="0"
                            required
                            value={item.amount}
                            onChange={(e) => updateItem(idx, 'amount', e.target.value)}
                            className="w-full pl-7 pr-3 py-2 text-xs sm:text-sm border border-slate-200 rounded-xl focus:outline-hidden focus:border-sky-500 font-semibold text-slate-800"
                          />
                        </div>
                        {form.items.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeItemRow(idx)}
                            className="text-slate-400 hover:text-rose-600 p-1.5 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                      Discount (₹)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={form.discount}
                      onChange={(e) => setForm({ ...form, discount: e.target.value })}
                      className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-hidden focus:border-sky-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                      Taxes (₹)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={form.tax}
                      onChange={(e) => setForm({ ...form, tax: e.target.value })}
                      className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-hidden focus:border-sky-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                      Payment Mode
                    </label>
                    <select
                      value={form.paymentMethod}
                      onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })}
                      className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-hidden focus:border-sky-500"
                    >
                      <option value="CASH">Cash</option>
                      <option value="CARD">Card / POS</option>
                      <option value="UPI">UPI / QR Payment</option>
                      <option value="INSURANCE">Insurance</option>
                    </select>
                  </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 flex justify-between items-center text-sm">
                  <span className="font-semibold text-slate-600">Total Payable Amount:</span>
                  <span className="font-bold text-xl text-sky-700">₹{calculateTotal().toLocaleString('en-IN')}</span>
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
                    Issue Invoice
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ReceptionistBills;
