import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Heart, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

const Register = () => {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    role: 'PATIENT',
  });
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const roleRedirects = {
    PATIENT: '/patient/dashboard',
    DOCTOR: '/doctor/dashboard',
    RECEPTIONIST: '/receptionist/dashboard',
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.password !== form.confirmPassword) {
      toast.error('Passwords do not match!');
      return;
    }

    if (form.password.length < 6) {
      toast.error('Password must be at least 6 characters long.');
      return;
    }

    // Role safety check
    if (form.role === 'ADMIN') {
      toast.error('Public Admin registration is prohibited.');
      return;
    }

    setLoading(true);
    const res = await register({
      name: form.name,
      email: form.email,
      password: form.password,
      phone: form.phone,
      role: form.role,
    });
    setLoading(false);

    if (res?.success) {
      navigate(roleRedirects[res.user.role] || '/login');
    }
  };

  return (
    <div className="min-h-screen bg-[#f6f7f7] text-[#101517] flex flex-col justify-between font-sans">
      
      {/* Top Header */}
      <header className="bg-[#006088] text-white px-6 py-3.5 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center ring-1 ring-white/20">
            <Heart className="w-4 h-4 text-white" fill="currentColor" />
          </div>
          <span className="font-bold text-lg tracking-tight">CareSync.com</span>
        </div>
        <Link to="/login" className="text-sm font-medium text-white hover:text-cyan-200 transition-colors">
          Sign In
        </Link>
      </header>

      {/* Main Area */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-[480px]">
          
          <h1 className="text-2xl sm:text-[28px] font-normal text-center text-[#101517] mb-6 tracking-tight">
            Create your account.
          </h1>

          <div className="bg-white border border-[#dcdcde] rounded-md shadow-sm p-6 sm:p-8">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#101517] mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full bg-white border border-[#8c8f94] focus:border-[#006088] focus:ring-1 focus:ring-[#006088] rounded px-3.5 py-2.5 text-sm text-[#101517] outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-[#101517] mb-1.5">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="name@mail.com"
                    className="w-full bg-white border border-[#8c8f94] focus:border-[#006088] focus:ring-1 focus:ring-[#006088] rounded px-3.5 py-2.5 text-sm text-[#101517] outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#101517] mb-1.5">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="9876543210"
                    className="w-full bg-white border border-[#8c8f94] focus:border-[#006088] focus:ring-1 focus:ring-[#006088] rounded px-3.5 py-2.5 text-sm text-[#101517] outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#101517] mb-1.5">
                  Select User Role
                </label>
                <select
                  name="role"
                  value={form.role}
                  onChange={handleChange}
                  className="w-full bg-white border border-[#8c8f94] focus:border-[#006088] focus:ring-1 focus:ring-[#006088] rounded px-3.5 py-2.5 text-sm text-[#101517] outline-none"
                >
                  <option value="PATIENT">Patient (Self Health & Appointments)</option>
                  <option value="DOCTOR">Doctor (Consultations & Prescriptions)</option>
                  <option value="RECEPTIONIST">Receptionist (Appointments & Bed Matrix)</option>
                </select>
                <p className="text-[11px] text-[#646970] mt-1">
                  * Note: Admin accounts can only be provisioned by an existing Hospital Administrator.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-[#101517] mb-1.5">
                    Password
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="At least 6 chars"
                    className="w-full bg-white border border-[#8c8f94] focus:border-[#006088] focus:ring-1 focus:ring-[#006088] rounded px-3.5 py-2.5 text-sm text-[#101517] outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#101517] mb-1.5">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    placeholder="Repeat password"
                    className="w-full bg-white border border-[#8c8f94] focus:border-[#006088] focus:ring-1 focus:ring-[#006088] rounded px-3.5 py-2.5 text-sm text-[#101517] outline-none"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 bg-[#0087be] hover:bg-[#0073aa] text-white font-semibold py-2.5 px-4 rounded text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm disabled:opacity-50"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <span>Create Account</span>
                )}
              </button>
            </form>
          </div>

          <div className="mt-5 text-center text-sm">
            <Link to="/login" className="text-[#006088] hover:underline flex items-center justify-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
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

export default Register;
