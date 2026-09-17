const mongoose = require('mongoose');

const DepartmentSchema = new mongoose.Schema(
  {
    hospitalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hospital',
      required: [true, 'Please provide hospital ID'],
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Department name is required'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    headDoctor: {
      type: String,
      default: '',
      trim: true,
    },
    services: [
      {
        type: String,
        trim: true,
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Department', DepartmentSchema);
