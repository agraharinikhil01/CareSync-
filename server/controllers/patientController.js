const PatientProfile = require('../models/PatientProfile');
const Appointment = require('../models/Appointment');
const Prescription = require('../models/Prescription');
const Billing = require('../models/Billing');
const User = require('../models/User');

// @desc    Get patient profile details
// @route   GET /api/patients/profile
// @access  Private (Patient / Doctor / Admin / Receptionist)
const getPatientProfile = async (req, res, next) => {
  try {
    const targetUserId = req.query.patientId || req.user._id;

    const profile = await PatientProfile.findOne({ userId: targetUserId })
      .populate('userId', 'name email phone profilePic');

    if (!profile) {
      return res.status(404).json({ success: false, message: 'Patient profile not found' });
    }

    res.status(200).json({
      success: true,
      data: profile,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update patient profile
// @route   PUT /api/patients/profile
// @access  Private (Patient)
const updatePatientProfile = async (req, res, next) => {
  try {
    const { age, gender, bloodGroup, emergencyContact, address, allergies } = req.body;

    let profile = await PatientProfile.findOne({ userId: req.user._id });

    if (!profile) {
      profile = new PatientProfile({ userId: req.user._id });
    }

    if (age !== undefined) profile.age = age;
    if (gender) profile.gender = gender;
    if (bloodGroup) profile.bloodGroup = bloodGroup;
    if (emergencyContact) profile.emergencyContact = emergencyContact;
    if (address) profile.address = address;
    if (allergies) profile.allergies = allergies;

    await profile.save();

    res.status(200).json({
      success: true,
      message: 'Patient profile updated successfully',
      data: profile,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get patient dashboard summary
// @route   GET /api/patients/dashboard
// @access  Private (Patient)
const getPatientDashboard = async (req, res, next) => {
  try {
    const patientId = req.user._id;

    const appointments = await Appointment.find({ patientId })
      .populate({
        path: 'doctorId',
        select: 'name email phone',
      })
      .sort({ date: -1 });

    const upcomingAppointments = appointments.filter(
      app => ['Pending', 'Confirmed'].includes(app.status) && new Date(app.date) >= new Date(new Date().setHours(0, 0, 0, 0))
    );

    const prescriptions = await Prescription.find({ patientId })
      .populate('doctorId', 'name')
      .sort({ date: -1 });

    const invoices = await Billing.find({ patientId })
      .sort({ invoiceDate: -1 });

    const totalBills = invoices.reduce((acc, b) => acc + b.totalAmount, 0);
    const pendingBills = invoices.filter(b => b.paymentStatus === 'Pending').reduce((acc, b) => acc + b.totalAmount, 0);

    res.status(200).json({
      success: true,
      data: {
        metrics: {
          totalAppointments: appointments.length,
          upcomingCount: upcomingAppointments.length,
          totalPrescriptions: prescriptions.length,
          totalBills,
          pendingBills,
        },
        upcomingAppointments,
        recentPrescriptions: prescriptions.slice(0, 5),
        recentInvoices: invoices.slice(0, 5),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add medical record to patient profile (EHR)
// @route   POST /api/patients/:id/medical-records
// @access  Private (Doctor / Admin)
const addMedicalRecord = async (req, res, next) => {
  try {
    const { condition, notes, treatedBy } = req.body;
    const patientUserId = req.params.id;

    const profile = await PatientProfile.findOne({ userId: patientUserId });
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Patient profile not found' });
    }

    profile.medicalHistory.unshift({
      condition,
      diagnosedDate: new Date(),
      notes: notes || '',
      treatedBy: treatedBy || (req.user.role === 'doctor' ? `Dr. ${req.user.name}` : 'General Staff'),
    });

    await profile.save();

    res.status(201).json({
      success: true,
      message: 'Medical record added successfully',
      data: profile.medicalHistory,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Public Emergency Medical Profile (for QR Scans / Paramedics)
// @route   GET /api/patients/emergency/:patientId
// @access  Public (Emergency QR scan)
const getEmergencyProfile = async (req, res, next) => {
  try {
    const { patientId } = req.params;

    let profile = await PatientProfile.findOne({
      $or: [{ userId: patientId }, { _id: patientId }],
    }).populate('userId', 'name email phone');

    if (!profile) {
      const user = await User.findById(patientId);
      if (user) {
        profile = await PatientProfile.findOne({ userId: user._id }).populate('userId', 'name email phone');
      }
    }

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Emergency medical profile not found. Please verify QR link.',
      });
    }

    res.status(200).json({
      success: true,
      data: {
        patientId: profile.userId?._id || profile.userId,
        name: profile.userId?.name || 'CareSync Patient',
        age: profile.age,
        gender: profile.gender,
        bloodGroup: profile.bloodGroup || 'Unknown',
        allergies: profile.allergies || [],
        chronicConditions: profile.medicalHistory || [],
        emergencyContact: profile.emergencyContact || { name: 'Emergency Helpline', phone: '+1 (555) 010-9999', relationship: 'Hospital' },
        address: profile.address || {},
        hospitalHelpline: '+1 (555) 010-9999',
        verifiedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPatientProfile,
  updatePatientProfile,
  getPatientDashboard,
  addMedicalRecord,
  getEmergencyProfile,
};

