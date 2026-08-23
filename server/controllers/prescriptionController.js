const Prescription = require('../models/Prescription');
const Appointment = require('../models/Appointment');
const PatientProfile = require('../models/PatientProfile');
const User = require('../models/User');
const { evaluatePrescriptionSafety } = require('../config/drugInteractionData');

// @desc    Clinical Decision Support: Check Drug Allergies & Drug-Drug Interactions
// @route   POST /api/prescriptions/check-safety
// @access  Private (Doctor / Receptionist)
const checkDrugSafety = async (req, res, next) => {
  try {
    const { patientId, medicines } = req.body;

    let patientAllergies = [];
    if (patientId) {
      // Check both by userId and by _id
      const patientProfile = await PatientProfile.findOne({
        $or: [{ userId: patientId }, { _id: patientId }],
      });

      if (patientProfile && patientProfile.allergies) {
        patientAllergies = patientProfile.allergies;
      }
    }

    const safetyReport = evaluatePrescriptionSafety(patientAllergies, medicines || []);

    res.status(200).json({
      success: true,
      data: {
        ...safetyReport,
        patientAllergies,
      },
    });
  } catch (error) {
    next(error);
  }
};


// @desc    Generate a new Electronic Prescription
// @route   POST /api/prescriptions
// @access  Private (Doctor only)
const createPrescription = async (req, res, next) => {
  try {
    const { appointmentId, patientId, diagnosis, symptoms, medicines, tests, advice, followUpDate } = req.body;
    const doctorId = req.user._id;

    if (!appointmentId || !patientId || !diagnosis || !medicines || medicines.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide appointment, patient, diagnosis and at least one medicine',
      });
    }

    const prescription = await Prescription.create({
      appointmentId,
      doctorId,
      patientId,
      diagnosis,
      symptoms: symptoms || '',
      medicines,
      tests: tests || [],
      advice: advice || 'Follow instructions and complete full medicine course.',
      followUpDate: followUpDate || null,
      date: new Date(),
    });

    // Mark appointment as Completed
    await Appointment.findByIdAndUpdate(appointmentId, { status: 'Completed' });

    // Automatically update Patient's EHR Medical History
    const patientProfile = await PatientProfile.findOne({ userId: patientId });
    if (patientProfile) {
      patientProfile.medicalHistory.unshift({
        condition: diagnosis,
        diagnosedDate: new Date(),
        notes: `Prescribed ${medicines.length} medications by Dr. ${req.user.name}. ${advice || ''}`,
        treatedBy: `Dr. ${req.user.name}`,
      });
      await patientProfile.save();
    }

    const populatedPrescription = await Prescription.findById(prescription._id)
      .populate('doctorId', 'name email phone')
      .populate('patientId', 'name email phone')
      .populate('appointmentId');

    res.status(201).json({
      success: true,
      message: 'Prescription generated successfully',
      data: populatedPrescription,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get prescriptions (Role filtered)
// @route   GET /api/prescriptions
// @access  Private
const getPrescriptions = async (req, res, next) => {
  try {
    let query = {};

    if (req.user.role === 'patient') {
      query.patientId = req.user._id;
    } else if (req.user.role === 'doctor') {
      query.doctorId = req.user._id;
    } else if (req.query.patientId) {
      query.patientId = req.query.patientId;
    }

    const prescriptions = await Prescription.find(query)
      .populate('doctorId', 'name email phone')
      .populate('patientId', 'name email phone')
      .populate('appointmentId')
      .sort({ date: -1 });

    res.status(200).json({
      success: true,
      count: prescriptions.length,
      data: prescriptions,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single prescription by ID
// @route   GET /api/prescriptions/:id
// @access  Private
const getPrescriptionById = async (req, res, next) => {
  try {
    const prescription = await Prescription.findById(req.params.id)
      .populate('doctorId', 'name email phone')
      .populate('patientId', 'name email phone')
      .populate('appointmentId');

    if (!prescription) {
      return res.status(404).json({ success: false, message: 'Prescription not found' });
    }

    res.status(200).json({
      success: true,
      data: prescription,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createPrescription,
  getPrescriptions,
  getPrescriptionById,
  checkDrugSafety,
};
