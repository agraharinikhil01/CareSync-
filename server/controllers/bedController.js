const Bed = require('../models/Bed');
const User = require('../models/User');
const PatientProfile = require('../models/PatientProfile');

// @desc    Get all beds with optional filtering
// @route   GET /api/beds
// @access  Private (All roles)
const getBeds = async (req, res, next) => {
  try {
    const { type, isOccupied, search } = req.query;
    let query = {};

    if (type && type !== 'All') {
      query.type = type;
    }

    if (isOccupied !== undefined && isOccupied !== 'All') {
      query.isOccupied = isOccupied === 'true';
    }

    if (search) {
      query.$or = [
        { bedNumber: new RegExp(search, 'i') },
        { ward: new RegExp(search, 'i') },
      ];
    }

    const beds = await Bed.find(query)
      .populate('patientId', 'name email phone')
      .sort({ bedNumber: 1 });

    const totalBeds = await Bed.countDocuments();
    const occupiedCount = await Bed.countDocuments({ isOccupied: true });
    const availableCount = totalBeds - occupiedCount;

    res.status(200).json({
      success: true,
      summary: {
        total: totalBeds,
        occupied: occupiedCount,
        available: availableCount,
      },
      count: beds.length,
      data: beds,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add new bed to inventory
// @route   POST /api/beds
// @access  Private (Admin)
const createBed = async (req, res, next) => {
  try {
    const { bedNumber, type, ward, dailyRate, features, notes } = req.body;

    const existingBed = await Bed.findOne({ bedNumber });
    if (existingBed) {
      return res.status(400).json({ success: false, message: `Bed ${bedNumber} already exists` });
    }

    const bed = await Bed.create({
      bedNumber,
      type: type || 'General Ward',
      ward: ward || 'Floor 1 - General',
      dailyRate: dailyRate || 1000,
      features: features || ['Oxygen Supply', 'Adjustable Height'],
      notes: notes || '',
    });

    res.status(201).json({
      success: true,
      message: 'Bed created successfully',
      data: bed,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Allocate bed to a patient
// @route   PATCH /api/beds/:id/allocate
// @access  Private (Receptionist, Admin, Doctor, Patient)
const allocateBed = async (req, res, next) => {
  try {
    let patientId = req.body.patientId;
    if (req.user.role === 'patient') {
      patientId = req.user._id;
    }

    const bed = await Bed.findById(req.params.id);

    if (!bed) {
      return res.status(404).json({ success: false, message: 'Bed not found' });
    }

    if (bed.isOccupied) {
      return res.status(400).json({ success: false, message: 'This bed is currently occupied' });
    }

    let patient = await User.findOne({ _id: patientId, role: 'patient' });
    if (!patient) {
      const prof = await PatientProfile.findById(patientId);
      if (prof && prof.userId) {
        patient = await User.findById(prof.userId);
        patientId = prof.userId;
      }
    }

    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient not found' });
    }

    // Check if patient is already admitted in another bed
    const existingBed = await Bed.findOne({ patientId, isOccupied: true });
    if (existingBed) {
      return res.status(400).json({
        success: false,
        message: `${patient.name} is already admitted in Bed ${existingBed.bedNumber}. Please discharge them from ${existingBed.bedNumber} first before allocating another bed.`,
      });
    }

    bed.isOccupied = true;
    bed.patientId = patientId;
    bed.assignedAt = new Date();

    await bed.save();

    const updated = await Bed.findById(bed._id).populate('patientId', 'name email phone');

    res.status(200).json({
      success: true,
      message: `Bed ${bed.bedNumber} allocated successfully to ${patient.name}`,
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Release / Discharge bed
// @route   PATCH /api/beds/:id/release
// @access  Private (Receptionist, Admin, Patient)
const releaseBed = async (req, res, next) => {
  try {
    const bed = await Bed.findById(req.params.id);

    if (!bed) {
      return res.status(404).json({ success: false, message: 'Bed not found' });
    }

    if (req.user.role === 'patient') {
      if (!bed.patientId || bed.patientId.toString() !== req.user._id.toString()) {
        return res.status(403).json({ success: false, message: 'You can only release your own booked bed' });
      }
    }

    bed.isOccupied = false;
    bed.patientId = null;
    bed.assignedAt = null;

    await bed.save();

    res.status(200).json({
      success: true,
      message: `Bed ${bed.bedNumber} released and marked available`,
      data: bed,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete bed
// @route   DELETE /api/beds/:id
// @access  Private (Admin)
const deleteBed = async (req, res, next) => {
  try {
    const bed = await Bed.findById(req.params.id);

    if (!bed) {
      return res.status(404).json({ success: false, message: 'Bed not found' });
    }

    if (bed.isOccupied) {
      return res.status(400).json({ success: false, message: 'Cannot delete an occupied bed. Please release it first.' });
    }

    await Bed.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Bed removed from inventory',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getBeds,
  createBed,
  allocateBed,
  releaseBed,
  deleteBed,
};
