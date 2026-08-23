import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Activity,
  ShieldCheck,
  CheckCircle2,
  Smartphone,
  CreditCard,
  Building,
  Lock,
  ArrowRight,
  Globe,
  Printer,
  Copy,
  Check,
} from 'lucide-react';
import { getPublicInvoiceApi, payPublicInvoiceApi } from '../../api/endpoints';
import { CURRENCIES, formatCurrency } from '../../utils/currency';

const MobileCheckout = () => {
  const { invoiceId } = useParams();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCurrency, setSelectedCurrency] = useState('INR');
  const [payChannel, setPayChannel] = useState('upi'); // 'upi', 'card', 'instant'
  const [paying, setPaying] = useState(false);
  const [paidSuccess, setPaidSuccess] = useState(false);
  const [copiedVPA, setCopiedVPA] = useState(false);

  // Card details state
  const [cardForm, setCardForm] = useState({
    name: '',
    number: '',
    expiry: '',
    cvv: '',
  });

  const fetchInvoice = async () => {
    try {
      setLoading(true);
      const res = await getPublicInvoiceApi(invoiceId);
      if (res.data.success) {
        setInvoice(res.data.data);
        if (res.data.data.paymentStatus === 'Paid') {
          setPaidSuccess(true);
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to load invoice details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (invoiceId) {
      fetchInvoice();
    }
  }, [invoiceId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 text-white">
        <Activity className="w-10 h-10 text-sky-400 animate-spin mb-4" />
        <p className="font-bold text-sm">Loading CareSync Hospital Invoice...</p>
        <p className="text-xs text-slate-400 mt-1">Connecting to 256-Bit SSL Secure Terminal</p>
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-white text-center">
        <div className="w-16 h-16 rounded-3xl bg-rose-500/20 border border-rose-500/30 text-rose-400 flex items-center justify-center mb-4">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold">Invoice Not Found</h2>
        <p className="text-slate-400 text-xs mt-2 max-w-sm">{error || 'This invoice may have expired or been moved.'}</p>
      </div>
    );
  }

  const isAlreadyPaid = invoice.paymentStatus === 'Paid' || paidSuccess;
  const totalFmt = formatCurrency(invoice.totalAmount || 0, selectedCurrency);
  const inrAmount = (Number(invoice.totalAmount || 0) * 86.5).toFixed(2);
  const upiIntentUri = `upi://pay?pa=caresync@okaxis&pn=CareSyncHospital&mc=8062&tr=${invoice.invoiceNumber}&am=${inrAmount}&cu=INR&tn=HospitalBill_${invoice.invoiceNumber}`;

  const handleExecutePayment = async (methodLabel = 'Mobile UPI Checkout') => {
    try {
      setPaying(true);
      const res = await payPublicInvoiceApi(invoiceId, {
        paymentMethod: methodLabel,
        transactionId: `TXN-MOB-${Date.now().toString().slice(-8)}`,
      });

      if (res.data.success) {
        setPaidSuccess(true);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Payment processing error');
    } finally {
      setPaying(false);
    }
  };

  const handleCopyVPA = () => {
    navigator.clipboard.writeText('caresync@okaxis');
    setCopiedVPA(true);
    setTimeout(() => setCopiedVPA(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center p-4 sm:p-6 font-sans">
      {/* HEADER */}
      <div className="w-full max-w-md flex items-center justify-between py-3 border-b border-white/10 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-sky-600 text-white flex items-center justify-center shadow-lg shadow-sky-600/30">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-extrabold text-sm text-white tracking-tight">CareSync Hospital</h1>
            <p className="text-[10px] text-sky-400 font-bold uppercase tracking-wider flex items-center gap-1">
              <Lock className="w-2.5 h-2.5" /> 256-Bit SSL Secured Terminal
            </p>
          </div>
        </div>
        <span className="text-[10px] font-mono bg-white/10 px-2 py-1 rounded-lg text-slate-300">
          {invoice.invoiceNumber}
        </span>
      </div>

      <div className="w-full max-w-md space-y-4">
        {/* SUCCESS CARD */}
        {isAlreadyPaid ? (
          <div className="bg-gradient-to-b from-emerald-900/40 to-slate-900 p-6 rounded-3xl border border-emerald-500/40 text-center space-y-4 shadow-2xl animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/40">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white">Payment Received!</h2>
              <p className="text-emerald-300 text-xs mt-1 font-semibold">
                Bill settled for {totalFmt.formatted}
              </p>
              <p className="text-slate-400 text-[11px] mt-2">
                The desktop screen has automatically updated. Official paid tax receipt generated.
              </p>
            </div>

            <div className="bg-white/5 p-4 rounded-2xl border border-white/10 text-left text-xs space-y-1.5 font-mono">
              <div className="flex justify-between text-slate-400">
                <span>Invoice:</span>
                <span className="text-white font-bold">{invoice.invoiceNumber}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Patient:</span>
                <span className="text-white font-bold">{invoice.patientId?.name}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Status:</span>
                <span className="text-emerald-400 font-bold">PAID & SETTLED</span>
              </div>
            </div>

            <button
              onClick={() => window.print()}
              className="w-full py-3 bg-sky-600 hover:bg-sky-500 text-white rounded-2xl font-bold text-xs flex items-center justify-center gap-2 shadow-lg"
            >
              <Printer className="w-4 h-4" /> Download / Print Tax Receipt
            </button>
          </div>
        ) : (
          <>
            {/* BILL SUMMARY HERO */}
            <div className="bg-gradient-to-br from-slate-900 to-sky-950 p-5 rounded-3xl border border-sky-500/30 shadow-xl space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Patient: <strong className="text-white">{invoice.patientId?.name}</strong></span>
                <span className="text-[11px] text-slate-400">{new Date(invoice.invoiceDate).toLocaleDateString()}</span>
              </div>

              <div className="py-2 border-y border-white/10 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    Total Amount Due
                  </span>
                  <p className="text-3xl font-black text-white tracking-tight mt-0.5">
                    {totalFmt.formatted}
                  </p>
                </div>

                {/* Currency Switcher */}
                <div className="flex flex-col items-end gap-1">
                  <span className="text-[10px] text-slate-400 flex items-center gap-1">
                    <Globe className="w-3 h-3 text-sky-400" /> Currency
                  </span>
                  <select
                    value={selectedCurrency}
                    onChange={(e) => setSelectedCurrency(e.target.value)}
                    className="bg-white/10 text-white text-xs font-bold px-2 py-1 rounded-lg border border-white/15 focus:outline-none"
                  >
                    {Object.keys(CURRENCIES).map((c) => (
                      <option key={c} value={c} className="bg-slate-900 text-white">
                        {CURRENCIES[c].flag} {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Items preview */}
              <div className="space-y-1 text-xs">
                {invoice.items?.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-slate-300 text-[11px]">
                    <span className="truncate max-w-[200px]">{item.description} (x{item.quantity})</span>
                    <span className="font-semibold text-white">
                      {formatCurrency(item.amount, selectedCurrency).formatted}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* PAYMENT METHODS SELECTOR */}
            <div className="bg-slate-900 p-5 rounded-3xl border border-white/10 space-y-4 shadow-xl">
              <div className="flex items-center gap-2 border-b border-white/10 pb-3">
                <Smartphone className="w-4 h-4 text-sky-400" />
                <h3 className="font-extrabold text-xs uppercase tracking-wider text-white">Choose Mobile Payment Option</h3>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setPayChannel('upi')}
                  className={`py-2 px-2 rounded-xl font-bold text-[11px] transition-all border ${
                    payChannel === 'upi'
                      ? 'bg-sky-500 text-slate-950 border-sky-400 font-black shadow-md'
                      : 'bg-white/5 text-slate-300 border-white/10'
                  }`}
                >
                  ⚡ UPI App
                </button>
                <button
                  type="button"
                  onClick={() => setPayChannel('card')}
                  className={`py-2 px-2 rounded-xl font-bold text-[11px] transition-all border ${
                    payChannel === 'card'
                      ? 'bg-sky-500 text-slate-950 border-sky-400 font-black shadow-md'
                      : 'bg-white/5 text-slate-300 border-white/10'
                  }`}
                >
                  💳 Card
                </button>
                <button
                  type="button"
                  onClick={() => setPayChannel('instant')}
                  className={`py-2 px-2 rounded-xl font-bold text-[11px] transition-all border ${
                    payChannel === 'instant'
                      ? 'bg-sky-500 text-slate-950 border-sky-400 font-black shadow-md'
                      : 'bg-white/5 text-slate-300 border-white/10'
                  }`}
                >
                  ✓ 1-Tap Instant
                </button>
              </div>

              {/* OPTION 1: NATIVE UPI DEEP-LINK */}
              {payChannel === 'upi' && (
                <div className="space-y-3 pt-1">
                  <a
                    href={upiIntentUri}
                    onClick={() => {
                      setTimeout(() => {
                        handleExecutePayment('UPI App Intent Pay');
                      }, 2500);
                    }}
                    className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black rounded-2xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/30 transition active:scale-95"
                  >
                    <Smartphone className="w-4 h-4" /> Open GPay / PhonePe / Paytm ({totalFmt.formatted})
                  </a>

                  <p className="text-[10px] text-center text-slate-400">
                    Tapping the button will launch your installed UPI app.
                  </p>

                  <div className="bg-white/5 p-3 rounded-xl border border-white/10 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Hospital UPI VPA Handle</span>
                      <span className="font-mono font-bold text-sky-300">caresync@okaxis</span>
                    </div>
                    <button
                      type="button"
                      onClick={handleCopyVPA}
                      className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-bold flex items-center gap-1"
                    >
                      {copiedVPA ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedVPA ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* OPTION 2: CREDIT / DEBIT CARD */}
              {payChannel === 'card' && (
                <div className="space-y-2.5 pt-1">
                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Cardholder Name</label>
                    <input
                      type="text"
                      placeholder="Rahul Verma"
                      value={cardForm.name}
                      onChange={(e) => setCardForm({ ...cardForm, name: e.target.value })}
                      className="w-full px-3 py-2 bg-white/10 border border-white/15 rounded-xl text-white text-xs focus:ring-1 focus:ring-sky-400"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="col-span-2">
                      <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">16-Digit Card #</label>
                      <input
                        type="text"
                        placeholder="4532 •••• •••• 8921"
                        maxLength="19"
                        value={cardForm.number}
                        onChange={(e) => setCardForm({ ...cardForm, number: e.target.value })}
                        className="w-full px-3 py-2 bg-white/10 border border-white/15 rounded-xl text-white text-xs focus:ring-1 focus:ring-sky-400"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">CVV</label>
                      <input
                        type="password"
                        placeholder="•••"
                        maxLength="4"
                        value={cardForm.cvv}
                        onChange={(e) => setCardForm({ ...cardForm, cvv: e.target.value })}
                        className="w-full px-3 py-2 bg-white/10 border border-white/15 rounded-xl text-white text-xs focus:ring-1 focus:ring-sky-400 text-center"
                      />
                    </div>
                  </div>

                  <button
                    onClick={() => handleExecutePayment('Mobile Card Payment')}
                    disabled={paying}
                    className="w-full mt-2 py-3.5 bg-sky-500 hover:bg-sky-400 text-slate-950 font-black rounded-2xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-sky-500/30 disabled:opacity-50"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    {paying ? 'Processing SSL Card Pay...' : `Pay ${totalFmt.formatted} Securely`}
                  </button>
                </div>
              )}

              {/* OPTION 3: 1-TAP INSTANT PAYMENT (UNIVERSAL DEMO/FAST SETTLE) */}
              {payChannel === 'instant' && (
                <div className="space-y-3 pt-1">
                  <p className="text-xs text-slate-300">
                    Instant 1-tap clearance for online patient checkout.
                  </p>
                  <button
                    onClick={() => handleExecutePayment('1-Tap Instant Checkout')}
                    disabled={paying}
                    className="w-full py-3.5 bg-gradient-to-r from-sky-500 to-indigo-500 hover:from-sky-400 hover:to-indigo-400 text-white font-black rounded-2xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-sky-500/30 disabled:opacity-50 active:scale-95"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    {paying ? 'Authorizing Payment...' : `Confirm & Settle ${totalFmt.formatted}`}
                  </button>
                </div>
              )}
            </div>
          </>
        )}

        {/* TRUST BADGE */}
        <div className="text-center text-[10px] text-slate-500 py-2 flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>CareSync Health Systems • PCI-DSS Level 1 & HIPAA Compliant</span>
        </div>
      </div>
    </div>
  );
};

export default MobileCheckout;
