import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import DashboardLayout from '../../layouts/DashboardLayout';
import { Receipt, Plus, Search, Filter, Download, CheckCircle, Clock, AlertCircle, X, Trash2 } from 'lucide-react';
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
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#dcdcde] pb-4 bg-white p-6 rounded-md shadow-xs">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 bg-[#e6f4f8] text-[#006088] rounded-md">
                <Receipt className="w-6 h-6" />
              </span>
              <h1 className="text-2xl font-semibold text-[#2c3338] tracking-tight">Billing & Revenue Ledger</h1>
            </div>
            <p className="text-sm text-[#50575e] mt-1">
              Automated invoice generation, payment auditing, and PDF receipt downloads.
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#0087be] hover:bg-[#006088] text-white text-sm font-medium rounded-sm shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Generate Invoice
          </button>
        </div>

        {/* Revenue KPI Summary */}
        {revenueStats && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-md border border-[#dcdcde] shadow-xs">
              <p className="text-xs font-semibold text-[#50575e] uppercase">Total Billed</p>
              <h3 className="text-2xl font-bold text-[#2c3338] mt-1">
                ₹{revenueStats.totalRevenue?.toLocaleString('en-IN') || 0}
              </h3>
              <p className="text-xs text-[#50575e] mt-1">{revenueStats.totalBills || 0} invoices issued</p>
            </div>
            <div className="bg-white p-5 rounded-md border border-emerald-200 bg-emerald-50/20 shadow-xs">
              <p className="text-xs font-semibold text-emerald-800 uppercase">Paid Revenue (Collected)</p>
              <h3 className="text-2xl font-bold text-emerald-600 mt-1">
                ₹{revenueStats.paidRevenue?.toLocaleString('en-IN') || 0}
              </h3>
              <p className="text-xs text-emerald-700 mt-1">{revenueStats.paidCount || 0} completed payments</p>
            </div>
            <div className="bg-white p-5 rounded-md border border-amber-200 bg-amber-50/20 shadow-xs">
              <p className="text-xs font-semibold text-amber-800 uppercase">Outstanding Receivables</p>
              <h3 className="text-2xl font-bold text-amber-600 mt-1">
                ₹{revenueStats.pendingRevenue?.toLocaleString('en-IN') || 0}
              </h3>
              <p className="text-xs text-amber-700 mt-1">{revenueStats.pendingCount || 0} pending clearance</p>
            </div>
          </div>
        )}

        {/* Filter bar */}
        <div className="bg-white p-4 rounded-md border border-[#dcdcde] shadow-xs flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="flex items-center gap-1 border-b md:border-b-0 border-[#dcdcde] pb-2 md:pb-0 overflow-x-auto w-full md:w-auto">
            {STATUS_TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setStatusFilter(tab)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-sm transition-colors cursor-pointer whitespace-nowrap ${
                  statusFilter === tab
                    ? 'bg-[#006088] text-white'
                    : 'text-[#50575e] hover:bg-[#f6f7f7] hover:text-[#2c3338]'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search invoice number or patient..."
              className="w-full pl-9 pr-3 py-2 text-sm border border-[#dcdcde] rounded-sm focus:outline-hidden focus:border-[#0087be] focus:ring-1 focus:ring-[#0087be]"
            />
          </div>
        </div>

        {/* Bills Table */}
        <div className="bg-white rounded-md border border-[#dcdcde] shadow-xs overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-[#0087be] border-t-transparent"></div>
              <p className="mt-3 text-sm text-[#50575e]">Loading billing records...</p>
            </div>
          ) : filteredBills.length === 0 ? (
            <div className="p-12 text-center">
              <Receipt className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-base font-medium text-[#2c3338]">No invoices found</p>
              <p className="text-sm text-[#50575e] mt-1">No invoices match the selected criteria.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-[#f6f7f7] text-[#50575e] font-semibold text-xs border-b border-[#dcdcde]">
                    <th className="py-3 px-4">INVOICE #</th>
                    <th className="py-3 px-4">PATIENT</th>
                    <th className="py-3 px-4">DATE</th>
                    <th className="py-3 px-4">LINE ITEMS</th>
                    <th className="py-3 px-4">AMOUNT</th>
                    <th className="py-3 px-4">STATUS</th>
                    <th className="py-3 px-4 text-right">ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#dcdcde]">
                  {filteredBills.map((b) => (
                    <tr key={b._id} className="hover:bg-[#fcfcfc] transition-colors">
                      <td className="py-3 px-4 font-mono font-medium text-[#006088]">
                        {b.invoiceNumber}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-[#2c3338]">{b.patient?.name}</div>
                        <div className="text-xs text-[#50575e]">{b.patient?.email}</div>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap text-[#50575e]">
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
                              : b.paymentStatus === 'PENDING'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}
                        >
                          ● {b.paymentStatus}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {b.paymentStatus === 'PENDING' && (
                            <button
                              onClick={() => handleMarkPaid(b._id)}
                              className="px-2.5 py-1 text-xs font-medium bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-sm border border-emerald-200 cursor-pointer"
                              title="Mark as Paid"
                            >
                              Mark Paid
                            </button>
                          )}
                          <button
                            onClick={() => handleDownloadPDF(b._id, b.invoiceNumber)}
                            className="p-1.5 text-gray-600 hover:text-[#0087be] hover:bg-[#f6f7f7] rounded-sm transition-colors cursor-pointer"
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
          <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-md border border-[#dcdcde] shadow-xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between px-6 py-4 border-b border-[#dcdcde] bg-[#f6f7f7]">
                <h3 className="font-semibold text-[#2c3338] text-base flex items-center gap-2">
                  <Receipt className="w-5 h-5 text-[#006088]" />
                  Generate Patient Invoice
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600 p-1 rounded-sm cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateBill} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
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
                        {p.user?.name} ({p.patientId}) - {p.user?.phone}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-semibold text-[#2c3338] uppercase">
                      Line Items Breakdown
                    </label>
                    <button
                      type="button"
                      onClick={addItemRow}
                      className="text-xs text-[#0087be] hover:underline font-medium flex items-center gap-1 cursor-pointer"
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
                          className="flex-1 px-3 py-1.5 text-sm border border-[#dcdcde] rounded-sm focus:outline-hidden focus:border-[#0087be]"
                        />
                        <div className="w-32 relative">
                          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs">
                            ₹
                          </span>
                          <input
                            type="number"
                            min="0"
                            required
                            value={item.amount}
                            onChange={(e) => updateItem(idx, 'amount', e.target.value)}
                            className="w-full pl-6 pr-2 py-1.5 text-sm border border-[#dcdcde] rounded-sm focus:outline-hidden focus:border-[#0087be]"
                          />
                        </div>
                        {form.items.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeItemRow(idx)}
                            className="text-gray-400 hover:text-rose-600 p-1 cursor-pointer"
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
                    <label className="block text-xs font-semibold text-[#2c3338] uppercase mb-1">
                      Discount (₹)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={form.discount}
                      onChange={(e) => setForm({ ...form, discount: e.target.value })}
                      className="w-full px-3 py-1.5 text-sm border border-[#dcdcde] rounded-sm focus:outline-hidden focus:border-[#0087be]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#2c3338] uppercase mb-1">
                      Taxes (₹)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={form.tax}
                      onChange={(e) => setForm({ ...form, tax: e.target.value })}
                      className="w-full px-3 py-1.5 text-sm border border-[#dcdcde] rounded-sm focus:outline-hidden focus:border-[#0087be]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#2c3338] uppercase mb-1">
                      Payment Mode
                    </label>
                    <select
                      value={form.paymentMethod}
                      onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })}
                      className="w-full px-3 py-1.5 text-sm border border-[#dcdcde] rounded-sm focus:outline-hidden focus:border-[#0087be] bg-white text-[#2c3338]"
                    >
                      <option value="CASH">Cash</option>
                      <option value="CARD">Card / POS</option>
                      <option value="UPI">UPI / Net Banking</option>
                      <option value="INSURANCE">Health Insurance</option>
                    </select>
                  </div>
                </div>

                <div className="bg-[#f6f7f7] p-3 rounded-sm border border-[#dcdcde] flex justify-between items-center text-sm">
                  <span className="font-medium text-[#50575e]">Total Payable Amount:</span>
                  <span className="font-bold text-lg text-[#006088]">₹{calculateTotal().toLocaleString('en-IN')}</span>
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
