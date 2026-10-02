const mongoose = require('mongoose');

const EmailOtpSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    otp: {
      type: String,
      required: true,
    },
    purpose: {
      type: String,
      enum: ['LOGIN', 'REGISTER', 'VERIFY', 'PASSWORD_RESET', 'login', 'register', 'verify', 'password_reset'],
      default: 'LOGIN',
      set: (v) => (v ? v.toString().toUpperCase() : 'LOGIN'),
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 },
    },
    attempts: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('EmailOtp', EmailOtpSchema);
