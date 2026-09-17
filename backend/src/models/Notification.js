const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema(
  {
    recipientUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    recipientHospital: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hospital',
    },
    type: {
      type: String,
      enum: ['CAPACITY_UPDATE', 'EMERGENCY_ALERT', 'TRANSFER_REQUEST', 'APPOINTMENT', 'SYSTEM'],
      default: 'SYSTEM',
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    link: {
      type: String,
      default: '',
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Notification', NotificationSchema);
