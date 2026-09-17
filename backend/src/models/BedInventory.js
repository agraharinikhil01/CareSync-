const mongoose = require('mongoose');

const BedInventorySchema = new mongoose.Schema(
  {
    hospitalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hospital',
      required: [true, 'Please provide hospital ID'],
      index: true,
    },
    category: {
      type: String,
      enum: ['GENERAL', 'ICU', 'EMERGENCY', 'ISOLATION', 'PRIVATE', 'SEMI_PRIVATE'],
      required: true,
    },
    total: {
      type: Number,
      default: 0,
      min: [0, 'Total beds cannot be negative'],
    },
    occupied: {
      type: Number,
      default: 0,
      min: [0, 'Occupied beds cannot be negative'],
    },
    reserved: {
      type: Number,
      default: 0,
      min: [0, 'Reserved beds cannot be negative'],
    },
    maintenance: {
      type: Number,
      default: 0,
      min: [0, 'Maintenance beds cannot be negative'],
    },
    available: {
      type: Number,
      default: 0,
      min: [0, 'Available beds cannot be negative'],
    },
    notes: {
      type: String,
      default: '',
      trim: true,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

// Auto calculate available beds before saving
BedInventorySchema.pre('save', function () {
  const computed = this.total - (this.occupied + this.reserved + this.maintenance);
  this.available = Math.max(0, computed);
});

module.exports = mongoose.model('BedInventory', BedInventorySchema);
