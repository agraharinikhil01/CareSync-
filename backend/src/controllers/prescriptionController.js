const crypto = require('crypto');
const Prescription = require('../models/Prescription');
const Patient = require('../models/Patient');
const { generatePrescriptionPDF } = require('../services/pdfService');
const { generatePrescriptionVerificationQR } = require('../services/qrService');

// POST /api/prescriptions (Doctor, Receptionist, Patient, Admin)
const Doctor = require('../models/Doctor');
const User = require('../models/User');

const createPrescription = async (req, res) => {
  try {
    const {
      patient,
      doctor,
      appointment,
      diagnosis,
      symptoms,
      medicines,
      advice,
      instructions,
      notes,
      labTests,
      followUpDate,
      scannedImage,
      source,
    } = req.body;

    // Determine target patient user ID
    let patientUserId = patient;
    if (req.user.role === 'PATIENT') {
      patientUserId = req.user._id;
    } else if (patient) {
      const patientDoc = await Patient.findById(patient);
      if (patientDoc && patientDoc.user) {
        patientUserId = patientDoc.user;
      }
    }

    if (!patientUserId) {
      return res.status(400).json({ success: false, message: 'Please specify target patient' });
    }

    if (!diagnosis || !medicines || medicines.length === 0) {
      return res.status(400).json({ success: false, message: 'Please provide diagnosis and at least one medicine' });
    }

    // Determine doctor user ID
    let doctorUserId = doctor;
    if (req.user.role === 'DOCTOR') {
      doctorUserId = req.user._id;
    } else if (!doctorUserId) {
      // Auto-assign to available doctor or hospital staff doctor
      const anyDoctor = await Doctor.findOne().populate('user');
      if (anyDoctor && anyDoctor.user) {
        doctorUserId = anyDoctor.user._id || anyDoctor.user;
      } else {
        const docUser = await User.findOne({ role: 'DOCTOR' });
        doctorUserId = docUser ? docUser._id : req.user._id;
      }
    }

    const verificationHash = crypto
      .createHash('sha256')
      .update(`${patientUserId}-${doctorUserId}-${diagnosis}-${Date.now()}`)
      .digest('hex');

    const prescription = new Prescription({
      patient: patientUserId,
      doctor: doctorUserId,
      appointment: appointment || null,
      diagnosis,
      symptoms: Array.isArray(symptoms) ? symptoms : typeof symptoms === 'string' ? [symptoms] : [],
      medicines,
      advice: advice || instructions || '',
      instructions: instructions || advice || '',
      notes: notes || '',
      labTests: Array.isArray(labTests) ? labTests : [],
      followUpDate: followUpDate || null,
      verificationHash,
      scannedImage: scannedImage || '',
      source: source || (scannedImage ? 'ClinicOCR' : 'Manual'),
    });

    const qrCode = await generatePrescriptionVerificationQR(prescription._id.toString(), verificationHash);
    prescription.qrCode = qrCode || '';

    await prescription.save();
    await prescription.populate(['patient', 'doctor']);

    res.status(201).json({ success: true, message: 'Prescription created successfully', data: prescription });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/prescriptions
const getPrescriptions = async (req, res) => {
  try {
    let filter = {};
    if (req.user.role === 'PATIENT') filter.patient = req.user._id;
    if (req.user.role === 'DOCTOR') filter.doctor = req.user._id;

    const rawPrescriptions = await Prescription.find(filter)
      .populate('patient', 'name email phone')
      .populate('doctor', 'name email phone')
      .sort({ createdAt: -1 });

    const prescriptions = await Promise.all(
      rawPrescriptions.map(async (rx) => {
        const obj = rx.toObject();
        if (!obj.qrCode) {
          obj.qrCode = await generatePrescriptionVerificationQR(
            obj._id.toString(),
            obj.verificationHash || obj._id.toString()
          );
        }
        return obj;
      })
    );

    res.json({ success: true, data: prescriptions });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/prescriptions/:id
const getPrescriptionById = async (req, res) => {
  try {
    const prescription = await Prescription.findById(req.params.id)
      .populate('patient', 'name email phone')
      .populate('doctor', 'name email phone');

    if (!prescription) return res.status(404).json({ success: false, message: 'Prescription not found' });

    let qrCode = prescription.qrCode;
    if (!qrCode) {
      qrCode = await generatePrescriptionVerificationQR(prescription._id.toString(), prescription.verificationHash);
    }

    res.json({ success: true, data: { ...prescription.toObject(), qrCode } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/prescriptions/:id/pdf (Download PDF)
const downloadPrescriptionPDF = async (req, res) => {
  try {
    const prescription = await Prescription.findById(req.params.id)
      .populate('patient', 'name email phone')
      .populate('doctor', 'name email phone');

    if (!prescription) return res.status(404).json({ success: false, message: 'Prescription not found' });

    generatePrescriptionPDF(prescription, res);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/prescriptions/verify/:hash (Public verification)
const verifyPrescription = async (req, res) => {
  try {
    const prescription = await Prescription.findOne({ verificationHash: req.params.hash })
      .populate('patient', 'name')
      .populate('doctor', 'name');

    if (!prescription) {
      return res.json({
        success: false,
        genuine: false,
        message: 'Invalid or counterfeit prescription record.',
      });
    }

    res.json({
      success: true,
      genuine: true,
      message: 'Verified authentic prescription issued by CareSync Hospital.',
      data: prescription,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  createPrescription,
  getPrescriptions,
  getPrescriptionById,
  downloadPrescriptionPDF,
  verifyPrescription,
};
