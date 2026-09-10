const User = require('../models/User');
const Patient = require('../models/Patient');
const { generatePatientIdQR } = require('../services/qrService');

// GET /api/patients (Admin, Doctor, Receptionist)
const getPatients = async (req, res) => {
  try {
    const { search, gender, bloodGroup } = req.query;
    let query = {};

    if (search) {
      const userMatches = await User.find({
        role: 'PATIENT',
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { phone: { $regex: search, $options: 'i' } },
        ],
      }).select('_id');
      query.user = { $in: userMatches.map((u) => u._id) };
    }

    if (gender) query.gender = gender;
    if (bloodGroup) query.bloodGroup = bloodGroup;

    const patients = await Patient.find(query)
      .populate('user', 'name email phone profileImage createdAt')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: patients });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/patients/:id
const getPatientById = async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id).populate('user', '-password');
    if (!patient) return res.status(404).json({ success: false, message: 'Patient not found' });

    const qrCode = await generatePatientIdQR(patient._id.toString(), patient.user?.name);

    res.json({ success: true, data: { ...patient.toObject(), qrCode } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/patients/me/profile
const getMyPatientProfile = async (req, res) => {
  try {
    let patient = await Patient.findOne({ user: req.user._id }).populate('user', '-password');
    if (!patient) {
      patient = await Patient.create({ user: req.user._id });
      await patient.populate('user', '-password');
    }

    const qrCode = await generatePatientIdQR(patient._id.toString(), patient.user?.name);

    res.json({ success: true, data: { ...patient.toObject(), qrCode } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/patients (Admin only)
const createPatient = async (req, res) => {
  try {
    const { name, email, password, phone, dob, gender, bloodGroup, address, emergencyContact } = req.body;

    const existing = await User.findOne({ email: email?.toLowerCase() });
    if (existing) return res.status(400).json({ success: false, message: 'Email already in use' });

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: password || 'Patient@123',
      phone,
      role: 'PATIENT',
    });

    const patient = await Patient.create({
      user: user._id,
      dob,
      gender: gender || 'Male',
      bloodGroup: bloodGroup || 'O+',
      address,
      emergencyContact,
    });

    await patient.populate('user', '-password');
    res.status(201).json({ success: true, message: 'Patient added successfully', data: patient });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/patients/:id (Admin or Patient owner)
const updatePatient = async (req, res) => {
  try {
    const { name, phone, dob, gender, bloodGroup, address, emergencyContact, medicalHistory } = req.body;

    const patient = await Patient.findById(req.params.id);
    if (!patient) return res.status(404).json({ success: false, message: 'Patient record not found' });

    // Ensure authorized
    if (req.user.role === 'PATIENT' && patient.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    if (name || phone) {
      await User.findByIdAndUpdate(patient.user, { name, phone });
    }

    patient.dob = dob || patient.dob;
    patient.gender = gender || patient.gender;
    patient.bloodGroup = bloodGroup || patient.bloodGroup;
    patient.address = address || patient.address;
    if (emergencyContact) patient.emergencyContact = emergencyContact;
    if (medicalHistory) patient.medicalHistory = medicalHistory;

    await patient.save();
    await patient.populate('user', '-password');

    res.json({ success: true, message: 'Patient details updated', data: patient });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/patients/:id (Admin only)
const deletePatient = async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id);
    if (!patient) return res.status(404).json({ success: false, message: 'Patient not found' });

    await User.findByIdAndDelete(patient.user);
    await Patient.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: 'Patient record deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  getPatients,
  getPatientById,
  getMyPatientProfile,
  createPatient,
  updatePatient,
  deletePatient,
};
