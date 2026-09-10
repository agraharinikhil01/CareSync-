import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import { Heart, Lock, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

const ResetPassword = () => {
  const { token } = useParams();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post(`/auth/reset-password/${token}`, { password });
      if (res.data.success) {
        toast.success('Password updated successfully! Please log in.');
        navigate('/login');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Password reset link is invalid or expired.');
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
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-[440px]">
          <h1 className="text-2xl font-normal text-center text-[#101517] mb-6 tracking-tight">
            Create new password.
          </h1>

          <div className="bg-white border border-[#dcdcde] rounded-md shadow-sm p-6 sm:p-8">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#101517] mb-1.5">New Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full bg-white border border-[#8c8f94] focus:border-[#006088] rounded px-3.5 py-2.5 text-sm text-[#101517] outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#101517] mb-1.5">Confirm New Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat new password"
                  className="w-full bg-white border border-[#8c8f94] focus:border-[#006088] rounded px-3.5 py-2.5 text-sm text-[#101517] outline-none"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#0087be] hover:bg-[#0073aa] text-white font-semibold py-2.5 px-4 rounded text-sm transition-colors cursor-pointer shadow-sm disabled:opacity-50"
              >
                {loading ? 'Updating password...' : 'Save New Password'}
              </button>
            </form>
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

export default ResetPassword;
