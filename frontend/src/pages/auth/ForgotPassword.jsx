import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { Heart, ArrowLeft, Mail, CheckCircle } from 'lucide-react';
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
        toast.success('Password reset instructions sent!');
      }
    } catch (err) {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f6f7f7] text-[#101517] flex flex-col justify-between font-sans">
      <header className="bg-[#006088] text-white px-6 py-3.5 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center ring-1 ring-white/20">
            <Heart className="w-4 h-4 text-white" fill="currentColor" />
          </div>
          <span className="font-bold text-lg tracking-tight">CareSync.com</span>
        </div>
        <Link to="/login" className="text-sm font-medium text-white hover:text-cyan-200">
          Sign In
        </Link>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-[440px]">
          <h1 className="text-2xl font-normal text-center text-[#101517] mb-6 tracking-tight">
            Reset your password.
          </h1>

          <div className="bg-white border border-[#dcdcde] rounded-md shadow-sm p-6 sm:p-8">
            {submitted ? (
              <div className="text-center space-y-3 py-4">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-sm text-[#101517]">Check your email inbox</h3>
                <p className="text-xs text-[#646970]">
                  If an account exists for <strong>{email}</strong>, we have sent a secure password reset link.
                </p>
                <div className="pt-2">
                  <Link to="/login" className="text-xs text-[#006088] font-semibold hover:underline">
                    ← Return to login
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <p className="text-xs text-[#646970]">
                  Enter your registered account email address. We will send you instructions to reset your password.
                </p>

                <div>
                  <label className="block text-sm font-medium text-[#101517] mb-1.5">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-white border border-[#8c8f94] focus:border-[#006088] rounded px-3.5 py-2.5 text-sm text-[#101517] outline-none"
                    placeholder="name@mail.com"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#0087be] hover:bg-[#0073aa] text-white font-semibold py-2.5 px-4 rounded text-sm transition-colors cursor-pointer shadow-sm disabled:opacity-50"
                >
                  {loading ? 'Sending link...' : 'Send Reset Link'}
                </button>
              </form>
            )}
          </div>

          <div className="mt-5 text-center text-sm">
            <Link to="/login" className="text-[#006088] hover:underline flex items-center justify-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Login
            </Link>
          </div>
        </div>
      </main>

      <footer className="py-5 text-center text-xs text-[#646970] border-t border-[#dcdcde] bg-white">
        <p className="flex items-center justify-center gap-1.5">
          <span>Powered by</span>
          <span className="font-bold text-[#006088] flex items-center gap-1">
            <Heart className="w-3.5 h-3.5 text-[#006088]" fill="currentColor" /> CareSync Health
          </span>
        </p>
      </footer>
    </div>
  );
};

export default ForgotPassword;
