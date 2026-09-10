import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { HeartPulse, ArrowLeft, Mail, CheckCircle2, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/auth/forgot-password', { email });
      if (res.data.success) {
        setSubmitted(true);
        toast.success('Password reset instructions sent');
      }
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between font-sans">
      <header className="border-b border-slate-200/80 bg-white px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-sky-600 text-white flex items-center justify-center shadow-md">
            <HeartPulse className="w-5 h-5" />
          </div>
          <span className="font-bold text-lg tracking-tight text-slate-900">CareSync</span>
          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 ml-1">
            Healthcare OS
          </span>
        </div>
        <Link to="/login" className="text-xs font-semibold text-sky-600 hover:text-sky-700">
          Sign In
        </Link>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xl shadow-slate-200/50 p-8">
            {submitted ? (
              <div className="text-center space-y-4 py-4">
                <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-100">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <h3 className="font-bold text-lg text-slate-900">Check your email</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  If an account exists for <strong className="text-slate-900">{email}</strong>, we have sent a secure password reset link.
                </p>
                <div className="pt-4">
                  <Link
                    to="/login"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-sky-600 hover:text-sky-700 hover:underline"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" /> Return to Sign In
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                    Reset your password
                  </h1>
                  <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                    Enter your registered account email. We will send a secure link to reset your credentials.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:border-sky-500 focus:ring-3 focus:ring-sky-500/15 transition-all text-slate-900"
                      placeholder="doctor@hospital.com"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 px-4 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-semibold text-sm shadow-md shadow-sky-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  {loading ? 'Sending link...' : 'Send Reset Link'}
                  {!loading && <ArrowRight className="w-4 h-4" />}
                </button>
              </form>
            )}
          </div>

          <div className="mt-6 text-center">
            <Link
              to="/login"
              className="text-xs text-slate-500 hover:text-sky-600 font-medium inline-flex items-center gap-1.5 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
            </Link>
          </div>
        </div>
      </main>

      <footer className="py-4 text-center text-xs text-slate-500 border-t border-slate-200/80 bg-white">
        CareSync · Healthcare OS © 2026
      </footer>
    </div>
  );
};

export default ForgotPassword;
