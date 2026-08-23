import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import { QRCodeSVG } from 'qrcode.react';
import {
  Plus,
  Trash2,
  Printer,
  CheckCircle,
  CreditCard,
  Activity,
  QrCode,
  Smartphone,
  Building,
  ShieldCheck,
  Globe,
  Sparkles,
  Lock,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import { createInvoiceApi, updatePaymentStatusApi, getPublicInvoiceApi } from '../api/endpoints';
import { CURRENCIES, formatCurrency } from '../utils/currency';

// Invoice Creation Form Modal (For Receptionist/Admin)
export const InvoiceGeneratorModal = ({ isOpen, onClose, patients = [], doctors = [], onSuccess }) => {
  const [patientId, setPatientId] = useState('');
  const [doctorId, setDoctorId] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [paymentStatus, setPaymentStatus] = useState('Pending');
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [items, setItems] = useState([
    { description: 'General Consultation Fee', quantity: 1, unitPrice: 500 },
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAddItem = () => {
    setItems([...items, { description: '', quantity: 1, unitPrice: 0 }]);
  };

  const handleRemoveItem = (index) => {
    if (items.length === 1) return;
    setItems(items.filter((_, idx) => idx !== index));
  };

  const handleItemChange = (index, field, value) => {
    const updated = [...items];
    updated[index][field] = value;
    setItems(updated);
  };

  const subTotal = items.reduce((acc, item) => acc + (Number(item.quantity || 1) * Number(item.unitPrice || 0)), 0);
  const tax = Math.round(subTotal * 0.05);
  const total = Math.max(0, subTotal + tax - Number(discountAmount || 0));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!patientId) {
      setError('Please select a patient');
      return;
    }

    const invalid = items.some((i) => !i.description.trim() || Number(i.unitPrice) < 0);
    if (invalid) {
      setError('Please provide valid descriptions and amounts for all items');
      return;
    }

    try {
      setLoading(true);
      const payload = {
        patientId,
        doctorId: doctorId || null,
        items,
        discountAmount: Number(discountAmount || 0),
        paymentStatus,
        paymentMethod: paymentStatus === 'Paid' ? paymentMethod : 'Pending Selection',
      };

      const res = await createInvoiceApi(payload);
      if (res.data.success) {
        onSuccess(res.data.data);
        onClose();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create invoice');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Generate Hospital Billing Invoice" maxWidth="max-w-2xl">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 text-xs font-semibold text-red-700 bg-red-50 border border-red-200 rounded-xl">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Select Patient *
            </label>
            <select
              required
              value={patientId}
              onChange={(e) => setPatientId(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-none"
            >
              <option value="">-- Choose Patient --</option>
              {patients.map((p) => (
                <option key={p.userId?._id || p._id} value={p.userId?._id || p._id}>
                  {p.userId?.name || p.name} ({p.userId?.email || p.email})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Attending Doctor (Optional)
            </label>
            <select
              value={doctorId}
              onChange={(e) => setDoctorId(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-none"
            >
              <option value="">-- None / General Billing --</option>
              {doctors.map((d) => (
                <option key={d.userId?._id || d._id} value={d.userId?._id || d._id}>
                  {d.userId?.name || d.name} ({d.specialization})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Invoice Item Rows */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Billed Medical Services / Medications *
            </label>
            <button
              type="button"
              onClick={handleAddItem}
              className="inline-flex items-center gap-1 text-xs font-semibold text-sky-600 hover:text-sky-700 bg-sky-50 px-2.5 py-1 rounded-lg border border-sky-200"
            >
              <Plus className="w-3.5 h-3.5" /> Add Service Row
            </button>
          </div>

          <div className="space-y-2">
            {items.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Service / Medicine (e.g. ICU Room Charge, Blood Test)"
                  value={item.description}
                  onChange={(e) => handleItemChange(idx, 'description', e.target.value)}
                  className="flex-1 px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-sky-500 focus:outline-none"
                  required
                />
                <input
                  type="number"
                  placeholder="Qty"
                  min="1"
                  value={item.quantity}
                  onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                  className="w-16 px-2 py-2 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-sky-500 focus:outline-none text-center"
                />
                <input
                  type="number"
                  placeholder="Price ($)"
                  min="0"
                  value={item.unitPrice}
                  onChange={(e) => handleItemChange(idx, 'unitPrice', e.target.value)}
                  className="w-24 px-2 py-2 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-sky-500 focus:outline-none text-right"
                  required
                />
                {items.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(idx)}
                    className="p-2 text-red-500 hover:text-red-700 rounded-lg hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Calculation Summary */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 text-xs text-slate-600">
          <div className="flex justify-between">
            <span>Subtotal:</span>
            <span className="font-semibold text-slate-800">${subTotal.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span>Tax (5% GST/Service):</span>
            <span className="font-semibold text-slate-800">${tax.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center">
            <span>Discount Amount ($):</span>
            <input
              type="number"
              min="0"
              value={discountAmount}
              onChange={(e) => setDiscountAmount(e.target.value)}
              className="w-24 px-2 py-1 text-xs border border-slate-300 rounded-lg text-right focus:ring-1 focus:ring-sky-500"
            />
          </div>
          <div className="flex justify-between pt-2 border-t border-slate-200 text-sm font-extrabold text-slate-900">
            <span>Final Billable Amount:</span>
            <span className="text-sky-700">${total.toLocaleString()}</span>
          </div>
        </div>

        {/* Payment options */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Payment Status
            </label>
            <select
              value={paymentStatus}
              onChange={(e) => setPaymentStatus(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500"
            >
              <option value="Pending">Pending (Pay Later)</option>
              <option value="Paid">Paid Immediately</option>
            </select>
          </div>

          {paymentStatus === 'Paid' && (
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Payment Method
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500"
              >
                <option value="Cash">Cash Counter</option>
                <option value="Credit/Debit Card">Credit / Debit Card</option>
                <option value="UPI/Online">UPI / Online Gateway</option>
                <option value="Health Insurance">Health Insurance Claim</option>
              </select>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-sm font-semibold shadow-md disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Generate Invoice'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

// Printable Invoice Modal with Multi-Currency & Interactive Payment Gateway
export const InvoiceViewerModal = ({ isOpen, onClose, invoice, onPaymentSuccess }) => {
  const [selectedCurrency, setSelectedCurrency] = useState('INR');
  const [payChannel, setPayChannel] = useState('upi'); // 'upi', 'card', 'netbanking'
  const [payLoading, setPayLoading] = useState(false);
  const [paySuccess, setPaySuccess] = useState(false);
  const [liveInvoice, setLiveInvoice] = useState(invoice);

  // Card details state
  const [cardForm, setCardForm] = useState({
    name: '',
    number: '',
    expiry: '',
    cvv: '',
  });

  // Net banking state
  const [selectedBank, setSelectedBank] = useState('HDFC Bank');

  useEffect(() => {
    setLiveInvoice(invoice);
  }, [invoice]);

  // Live polling for instant mobile payment detection
  useEffect(() => {
    if (!isOpen || !invoice?._id || liveInvoice?.paymentStatus === 'Paid') return;

    const interval = setInterval(async () => {
      try {
        const res = await getPublicInvoiceApi(invoice._id);
        if (res.data.success && res.data.data.paymentStatus === 'Paid') {
          setLiveInvoice(res.data.data);
          setPaySuccess(true);
          if (onPaymentSuccess) {
            onPaymentSuccess(res.data.data);
          }
        }
      } catch (e) {
        // silent polling catch
      }
    }, 2500);

    return () => clearInterval(interval);
  }, [isOpen, invoice?._id, liveInvoice?.paymentStatus]);

  if (!invoice) return null;

  const currentInvoice = liveInvoice || invoice;
  const isPaid = currentInvoice.paymentStatus === 'Paid' || paySuccess;

  // Currency formatted calculations
  const subTotalFmt = formatCurrency(currentInvoice.subTotal || 0, selectedCurrency);
  const taxFmt = formatCurrency(currentInvoice.taxAmount || 0, selectedCurrency);
  const discountFmt = formatCurrency(currentInvoice.discountAmount || 0, selectedCurrency);
  const totalFmt = formatCurrency(currentInvoice.totalAmount || 0, selectedCurrency);

  const origin = typeof window !== 'undefined' ? window.location.origin : 'http://10.27.112.75:5173';
  const mobileCheckoutUrl = origin.includes('localhost')
    ? `http://10.27.112.75:5173/pay/${currentInvoice._id}`
    : `${origin}/pay/${currentInvoice._id}`;

  const inrAmount = (Number(currentInvoice.totalAmount || 0) * 86.5).toFixed(2);
  const upiPayString = `upi://pay?pa=caresync@okaxis&pn=CareSyncHospital&mc=8062&tr=${currentInvoice.invoiceNumber}&am=${inrAmount}&cu=INR&tn=CareSyncHospitalBill`;

  const handlePrint = () => {
    window.print();
  };

  const handleProcessPayment = async () => {
    try {
      setPayLoading(true);
      const methodLabel =
        payChannel === 'upi'
          ? `UPI (${totalFmt.code})`
          : payChannel === 'card'
          ? `Card ending ${cardForm.number.slice(-4) || '4242'}`
          : `NetBanking (${selectedBank})`;

      const res = await updatePaymentStatusApi(currentInvoice._id, {
        paymentStatus: 'Paid',
        paymentMethod: methodLabel,
        transactionId: `TXN-${totalFmt.code}-${Date.now().toString().slice(-8)}`,
      });

      if (res.data.success) {
        setPaySuccess(true);
        setLiveInvoice(res.data.data);
        if (onPaymentSuccess) {
          onPaymentSuccess(res.data.data);
        }
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Payment processing failed');
    } finally {
      setPayLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Hospital Invoice: ${invoice.invoiceNumber}`} maxWidth="max-w-3xl">
      <div className="space-y-6 text-xs">
        {/* MULTI-CURRENCY CONVERTER TOP BAR */}
        <div className="no-print bg-gradient-to-r from-slate-900 via-sky-950 to-slate-900 text-white p-3.5 rounded-2xl flex flex-wrap items-center justify-between gap-3 shadow-md">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-sky-400" />
            <span className="font-bold text-xs">International Currency Converter:</span>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            {Object.keys(CURRENCIES).map((code) => {
              const c = CURRENCIES[code];
              const isSelected = selectedCurrency === code;
              return (
                <button
                  key={code}
                  type="button"
                  onClick={() => setSelectedCurrency(code)}
                  className={`px-2.5 py-1 rounded-xl text-xs font-black transition-all flex items-center gap-1 border ${
                    isSelected
                      ? 'bg-sky-500 text-slate-950 border-sky-400 shadow-md scale-105'
                      : 'bg-white/10 text-white border-white/10 hover:bg-white/20'
                  }`}
                >
                  <span>{c.flag}</span>
                  <span>{c.code}</span>
                  <span className="opacity-80">({c.symbol})</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* PRINTABLE INVOICE SHEET */}
        <div className="printable-area bg-white p-6 rounded-2xl border border-slate-200 space-y-5 text-slate-800 relative">
          {/* PAID WATERMARK BADGE */}
          {isPaid && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-15 rotate-[-25deg]">
              <span className="text-7xl sm:text-8xl font-black text-emerald-600 border-8 border-emerald-600 px-8 py-3 rounded-3xl uppercase tracking-widest">
                PAID
              </span>
            </div>
          )}

          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b-2 border-sky-600">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-sky-600 text-white flex items-center justify-center shadow-md">
                <Activity className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900 tracking-tight">CareSync Multi-Specialty Hospital</h3>
                <p className="text-xs text-slate-500">100 Healthcare Avenue, NY 10001 | 24/7 Helpline: +1 (555) 010-9999</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-base font-black text-sky-700 font-mono">{invoice.invoiceNumber}</p>
              <p className="text-slate-500 text-xs">Date: {new Date(invoice.invoiceDate).toLocaleDateString()}</p>
            </div>
          </div>

          {/* Patient & Status Bar */}
          <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
            <div>
              <span className="font-bold text-slate-500 uppercase tracking-wider block mb-1">Billed To (Patient):</span>
              <p className="font-black text-slate-900 text-sm">{invoice.patientId?.name}</p>
              <p className="text-slate-600">{invoice.patientId?.email} • {invoice.patientId?.phone}</p>
            </div>
            <div className="text-right">
              <span className="font-bold text-slate-500 uppercase tracking-wider block mb-1">Payment Status:</span>
              <span
                className={`inline-flex items-center gap-1 px-3 py-1 rounded-full font-black text-xs ${
                  isPaid
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : 'bg-amber-100 text-amber-800 border border-amber-300 animate-pulse'
                }`}
              >
                {isPaid ? <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> : null}
                {isPaid ? 'PAID / SETTLED' : 'PAYMENT PENDING'}
              </span>
              {invoice.paymentMethod && (
                <p className="text-slate-600 mt-1 font-medium">Method: {invoice.paymentMethod}</p>
              )}
              {invoice.transactionId && (
                <p className="text-slate-400 font-mono text-[10px]">Txn ID: {invoice.transactionId}</p>
              )}
            </div>
          </div>

          {/* Line Items Table */}
          <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
            <table className="w-full text-left">
              <thead className="bg-slate-100 font-bold text-slate-700 border-b border-slate-200">
                <tr>
                  <th className="p-2.5">Medical Service / Item</th>
                  <th className="p-2.5 text-center">Qty</th>
                  <th className="p-2.5 text-right">Unit Price ({totalFmt.symbol})</th>
                  <th className="p-2.5 text-right">Amount ({totalFmt.symbol})</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {invoice.items?.map((item, idx) => {
                  const itemUnitFmt = formatCurrency(item.unitPrice || 0, selectedCurrency);
                  const itemAmountFmt = formatCurrency(item.amount || 0, selectedCurrency);
                  return (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="p-2.5 font-semibold text-slate-900">{item.description}</td>
                      <td className="p-2.5 text-center text-slate-600">{item.quantity}</td>
                      <td className="p-2.5 text-right text-slate-600">{itemUnitFmt.formatted}</td>
                      <td className="p-2.5 text-right font-bold text-slate-900">{itemAmountFmt.formatted}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Calculation in Selected Currency */}
          <div className="space-y-1.5 max-w-xs ml-auto text-right text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal:</span>
              <span className="font-semibold text-slate-800">{subTotalFmt.formatted}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Tax (5% Service):</span>
              <span className="font-semibold text-slate-800">{taxFmt.formatted}</span>
            </div>
            {invoice.discountAmount > 0 && (
              <div className="flex justify-between text-emerald-600">
                <span>Discount Applied:</span>
                <span className="font-semibold">-{discountFmt.formatted}</span>
              </div>
            )}
            <div className="flex justify-between pt-2 border-t-2 border-slate-300 text-sm font-black text-slate-900">
              <span>Total Payable ({totalFmt.code}):</span>
              <span className="text-sky-700 text-base font-extrabold">{totalFmt.formatted}</span>
            </div>
          </div>
        </div>

        {/* INTERACTIVE MULTI-PAYMENT GATEWAY (When Payment is Pending) */}
        {!isPaid && (
          <div className="no-print bg-slate-900 text-white p-5 rounded-2xl border-2 border-sky-500/30 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-emerald-400" />
                <span className="font-black text-sm text-white">Instant Payment Portal (256-Bit SSL Encrypted)</span>
              </div>
              <span className="text-xs font-black text-sky-400 bg-sky-950 px-3 py-1 rounded-xl border border-sky-800">
                Amount to Pay: {totalFmt.formatted}
              </span>
            </div>

            {/* Payment Channel Tabs */}
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setPayChannel('upi')}
                className={`py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all border ${
                  payChannel === 'upi'
                    ? 'bg-sky-500 text-slate-950 border-sky-400 shadow-md font-black'
                    : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10'
                }`}
              >
                <Smartphone className="w-4 h-4" /> Instant UPI / QR
              </button>
              <button
                type="button"
                onClick={() => setPayChannel('card')}
                className={`py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all border ${
                  payChannel === 'card'
                    ? 'bg-sky-500 text-slate-950 border-sky-400 shadow-md font-black'
                    : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10'
                }`}
              >
                <CreditCard className="w-4 h-4" /> Debit / Credit Card
              </button>
              <button
                type="button"
                onClick={() => setPayChannel('netbanking')}
                className={`py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all border ${
                  payChannel === 'netbanking'
                    ? 'bg-sky-500 text-slate-950 border-sky-400 shadow-md font-black'
                    : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10'
                }`}
              >
                <Building className="w-4 h-4" /> Net Banking
              </button>
            </div>

            {/* TAB 1: UPI / MOBILE QR SCAN */}
            {payChannel === 'upi' && (
              <div className="bg-white/5 p-4 rounded-xl border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="space-y-2 text-slate-300 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
                    <p className="font-bold text-white text-xs">Scan & Pay via any Phone (UPI / Card / NetBanking)</p>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Scan with <strong className="text-white">Google Lens, Camera, PhonePe, Paytm, or GPay</strong> to open the 1-Tap Mobile Checkout.
                  </p>

                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <a
                      href={mobileCheckoutUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-[11px] font-bold shadow transition"
                    >
                      <ExternalLink className="w-3.5 h-3.5" /> Test Mobile Checkout Screen
                    </a>

                    <span className="text-[10px] text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-2 py-1 rounded-lg flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-emerald-400" /> Auto-Syncs to Desktop
                    </span>
                  </div>
                </div>

                <div className="flex flex-col items-center bg-white p-3 rounded-2xl text-slate-900 shadow-2xl border-2 border-emerald-400">
                  <QRCodeSVG value={mobileCheckoutUrl} size={115} level="M" />
                  <span className="text-[9px] font-black mt-1.5 text-slate-700 tracking-wider">
                    SCAN TO PAY ON PHONE
                  </span>
                </div>
              </div>
            )}

            {/* TAB 2: CREDIT / DEBIT CARD */}
            {payChannel === 'card' && (
              <div className="bg-white/5 p-4 rounded-xl border border-white/10 space-y-3">
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Cardholder Name</label>
                  <input
                    type="text"
                    placeholder="Rahul Verma"
                    value={cardForm.name}
                    onChange={(e) => setCardForm({ ...cardForm, name: e.target.value })}
                    className="w-full px-3 py-1.5 bg-white/10 border border-white/15 rounded-lg text-white text-xs focus:ring-1 focus:ring-sky-400"
                  />
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-2">
                    <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">16-Digit Card Number</label>
                    <input
                      type="text"
                      placeholder="4532 •••• •••• 8921"
                      maxLength="19"
                      value={cardForm.number}
                      onChange={(e) => setCardForm({ ...cardForm, number: e.target.value })}
                      className="w-full px-3 py-1.5 bg-white/10 border border-white/15 rounded-lg text-white text-xs focus:ring-1 focus:ring-sky-400"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">CVV / CVC</label>
                    <input
                      type="password"
                      placeholder="•••"
                      maxLength="4"
                      value={cardForm.cvv}
                      onChange={(e) => setCardForm({ ...cardForm, cvv: e.target.value })}
                      className="w-full px-3 py-1.5 bg-white/10 border border-white/15 rounded-lg text-white text-xs focus:ring-1 focus:ring-sky-400 text-center"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: NET BANKING */}
            {payChannel === 'netbanking' && (
              <div className="bg-white/5 p-4 rounded-xl border border-white/10 space-y-2">
                <label className="text-[10px] uppercase font-bold text-slate-400 block">Select Your Bank</label>
                <select
                  value={selectedBank}
                  onChange={(e) => setSelectedBank(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-white/15 rounded-xl text-white text-xs focus:ring-1 focus:ring-sky-400"
                >
                  <option value="HDFC Bank">HDFC Bank</option>
                  <option value="State Bank of India (SBI)">State Bank of India (SBI)</option>
                  <option value="ICICI Bank">ICICI Bank</option>
                  <option value="Axis Bank">Axis Bank</option>
                  <option value="Kotak Mahindra Bank">Kotak Mahindra Bank</option>
                  <option value="Citibank / International">Citibank / International Wire</option>
                </select>
              </div>
            )}

            {/* Direct Pay Action Button */}
            <div className="pt-2 flex items-center justify-between">
              <span className="text-[10px] text-slate-400 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Instant Bank Receipt Issued on Payment
              </span>
              <button
                onClick={handleProcessPayment}
                disabled={payLoading}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs shadow-lg shadow-emerald-500/30 transition-all disabled:opacity-50"
              >
                <CheckCircle className="w-4 h-4" />
                {payLoading ? 'Processing Secure Transaction...' : `Pay ${totalFmt.formatted} Now`}
              </button>
            </div>
          </div>
        )}

        {/* MODAL BOTTOM ACTION BAR */}
        <div className="no-print flex items-center justify-between gap-3 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
          >
            Close
          </button>
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-5 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold shadow"
          >
            <Printer className="w-4 h-4" /> Print / Save Tax Invoice ({totalFmt.code})
          </button>
        </div>
      </div>
    </Modal>
  );
};
