import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import DashboardLayout from '../../layouts/DashboardLayout';
import { Receipt, Plus, Search, Filter, Download, CheckCircle2, Clock, Trash2, X, DollarSign } from 'lucide-react';
import toast from 'react-hot-toast';

const STATUS_TABS = ['ALL', 'PAID', 'PENDING', 'CANCELLED'];

const BillsPage = () => {
  const [bills, setBills] = useState([]);
  const [revenueStats, setRevenueStats] = useState(null);
  const [patients, setPatients] = useState([]);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const [form, setForm] = useState({
    patient: '',
    items: [{ description: 'Consultation & Clinical Review', amount: 750 }],
    discount: 0,
    tax: 0,
    paymentMethod: 'CASH',
  });

  useEffect(() => {
    fetchBills();
  }, [statusFilter]);

  useEffect(() => {
    fetchRevenueStats();
    fetchPatients();
  }, []);

  const fetchRevenueStats = async () => {
    try {
      const res = await api.get('/bills/stats/revenue');
      if (res.data.success) {
        setRevenueStats(res.data.data);
      }
    } catch {
      console.log('Error fetching revenue');
    }
  };

  const fetchPatients = async () => {
    try {
      const res = await api.get('/patients');
      if (res.data.success) {
        setPatients(res.data.data);
      }
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
      if (res.data.success) {
        setBills(res.data.data);
      }
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
        toast.success('Bill marked as PAID');
        fetchBills();
        fetchRevenueStats();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Payment update failed');
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

  const removeItemRow = (index) => {
    if (form.items.length === 1) return;
    const updated = form.items.filter((_, i) => i !== index);
    setForm({ ...form, items: updated });
  };

  const updateItem = (index, field, value) => {
    const updated = [...form.items];
    updated[index][field] = field === 'amount' ? Number(value) : value;
    setForm({ ...form, items: updated });
  };

  const calculateSubtotal = () => {
    return form.items.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
  };

  const calculateTotal = () => {
    const sub = calculateSubtotal();
    const discount = Number(form.discount) || 0;
    const tax = Number(form.tax) || 0;
    return Math.max(0, sub - discount + tax);
  };

  const handleCreateBill = async (e) => {
    e.preventDefault();
    if (!form.patient) {
      toast.error('Please select a patient');
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
        toast.success('Invoice created successfully');
        setShowModal(false);
        setForm({
          patient: '',
          items: [{ description: 'Consultation & Clinical Review', amount: 750 }],
          discount: 0,
          tax: 0,
          paymentMethod: 'CASH',
        });
        fetchBills();
        fetchRevenueStats();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to generate bill');
    }
  };

  const filteredBills = bills.filter((b) => {
    if (!search) return true;
    const term = search.toLowerCase();
    const inv = b.invoiceNumber?.toLowerCase() || '';
    const pat = b.patient?.name?.toLowerCase() || '';
    return inv.includes(term) || pat.includes(term);
  });

  return (
    <DashboardLayout title="Billing & Revenue Ledger">
      <div className="space-y-6">
        {/* Header Hero */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200/60 text-xs text-emerald-800 font-semibold mb-2">
              <Receipt className="w-3.5 h-3.5 text-emerald-600" />
              <span>Accounts & Cashier Management</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Billing & Revenue Ledger
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Automated invoice generation, payment status auditing, line-item itemization, and PDF receipts.
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold rounded-xl shadow-xs shadow-sky-600/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Generate Invoice</span>
          </button>
        </div>

        {/* Revenue KPI Summary */}
        {revenueStats && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Billed</p>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
                ₹{revenueStats.totalRevenue?.toLocaleString('en-IN') || 0}
              </h3>
              <p className="text-xs text-slate-500 mt-1">{revenueStats.totalBills || 0} invoices issued</p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-emerald-200/80 bg-emerald-50/20 shadow-xs">
              <p className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Paid Revenue (Collected)</p>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-emerald-600 mt-1">
                ₹{revenueStats.paidRevenue?.toLocaleString('en-IN') || 0}
              </h3>
              <p className="text-xs text-emerald-700 mt-1">{revenueStats.paidCount || 0} settled payments</p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-amber-200/80 bg-amber-50/20 shadow-xs">
              <p className="text-xs font-bold text-amber-800 uppercase tracking-wider">Outstanding Receivables</p>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-amber-600 mt-1">
                ₹{revenueStats.pendingRevenue?.toLocaleString('en-IN') || 0}
              </h3>
              <p className="text-xs text-amber-700 mt-1">{revenueStats.pendingCount || 0} pending clearance</p>
            </div>
          </div>
        )}

        {/* Filter bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="flex items-center gap-1.5 border-b md:border-b-0 border-slate-100 pb-2 md:pb-0 overflow-x-auto w-full md:w-auto">
            {STATUS_TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setStatusFilter(tab)}
                className={`px-3.5 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                  statusFilter === tab
                    ? 'bg-sky-600 text-white shadow-xs shadow-sky-600/20'
                    : 'text-slate-600 hover:bg-slate-100'
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
              className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:border-sky-500 focus:ring-3 focus:ring-sky-500/15 text-slate-900"
            />
          </div>
        </div>

        {/* Bills Table */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          {loading ? (
            <div className="p-16 text-center">
              <div className="w-8 h-8 border-3 border-sky-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-xs text-slate-500">Loading billing records...</p>
            </div>
          ) : filteredBills.length === 0 ? (
            <div className="p-16 text-center">
              <Receipt className="w-12 h-12 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-700">No invoices found</p>
              <p className="text-xs text-slate-400 mt-1">No billing records match the selected filter.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="text-slate-400 font-bold border-b border-slate-100 uppercase tracking-wider bg-slate-50/50">
                    <th className="py-3 px-4">Invoice #</th>
                    <th className="py-3 px-4">Patient</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Line Items</th>
                    <th className="py-3 px-4">Amount</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredBills.map((b) => (
                    <tr key={b._id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-sky-700">
                        {b.invoiceNumber}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 text-sm">{b.patient?.name}</div>
                        <div className="text-[11px] text-slate-400 font-mono">{b.patient?.email}</div>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap text-slate-500">
                        {new Date(b.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 max-w-xs truncate">
                        {b.items?.map((i) => i.description).join(', ')}
                      </td>
                      <td className="py-3.5 px-4 font-extrabold text-slate-900 text-sm">
                        ₹{b.totalAmount?.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-full font-bold ${
                            b.paymentStatus === 'PAID'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : b.paymentStatus === 'PENDING'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}
                        >
                          ● {b.paymentStatus}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {b.paymentStatus === 'PENDING' && (
                            <button
                              onClick={() => handleMarkPaid(b._id)}
                              className="px-2.5 py-1 text-xs font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg border border-emerald-200 cursor-pointer"
                            >
                              Mark Paid
                            </button>
                          )}
                          <button
                            onClick={() => handleDownloadPDF(b._id, b.invoiceNumber)}
                            className="p-1.5 text-slate-500 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors cursor-pointer"
                            title="Download PDF Invoice"
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

        {/* Modal: Create Invoice */}
        {showModal && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                  <Receipt className="w-5 h-5 text-sky-600" />
                  Generate Patient Invoice
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateBill} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Select Patient *
                  </label>
                  <select
                    required
                    value={form.patient}
                    onChange={(e) => setForm({ ...form, patient: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-hidden focus:border-sky-500 bg-white"
                  >
                    <option value="">-- Choose Patient --</option>
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
                      className="text-xs text-sky-600 hover:text-sky-700 font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Item
                    </button>
                  </div>

                  <div className="space-y-2">
                    {form.items.map((item, idx) => (
                      <div key={idx} className="flex gap-2 items-center">
                        <input
                          type="text"
                          required
                          placeholder="e.g. Consultation, Lab Test, Bed Charge"
                          value={item.description}
                          onChange={(e) => updateItem(idx, 'description', e.target.value)}
                          className="flex-1 px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:outline-hidden focus:border-sky-500"
                        />
                        <div className="w-32 relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">
                            ₹
                          </span>
                          <input
                            type="number"
                            min="0"
                            required
                            value={item.amount}
                            onChange={(e) => updateItem(idx, 'amount', e.target.value)}
                            className="w-full pl-7 pr-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-hidden focus:border-sky-500"
                          />
                        </div>
                        {form.items.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeItemRow(idx)}
                            className="text-slate-400 hover:text-rose-600 p-1.5 cursor-pointer"
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
                      className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:outline-hidden focus:border-sky-500"
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
                      className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:outline-hidden focus:border-sky-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                      Payment Mode
                    </label>
                    <select
                      value={form.paymentMethod}
                      onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })}
                      className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:outline-hidden focus:border-sky-500 bg-white text-slate-900"
                    >
                      <option value="CASH">Cash</option>
                      <option value="CARD">Card / POS</option>
                      <option value="UPI">UPI / Net Banking</option>
                      <option value="INSURANCE">Health Insurance</option>
                    </select>
                  </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex justify-between items-center text-sm">
                  <span className="font-semibold text-slate-600">Total Payable Amount:</span>
                  <span className="font-extrabold text-xl text-sky-700">
                    ₹{calculateTotal().toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="pt-4 border-t border-slate-100 flex justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 border border-slate-200 text-xs text-slate-600 hover:bg-slate-50 rounded-xl font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold rounded-xl shadow-xs shadow-sky-600/20 transition-all cursor-pointer"
                  >
                    Create & Issue Invoice
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

export default BillsPage;
