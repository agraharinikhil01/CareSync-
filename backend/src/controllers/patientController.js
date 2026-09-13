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

      query.$or = [
        { user: { $in: userMatches.map((u) => u._id) } },
        { patientId: { $regex: search, $options: 'i' } },
      ];
    }

    if (gender) query.gender = gender;
    if (bloodGroup) query.bloodGroup = bloodGroup;

    const rawPatients = await Patient.find(query)
      .populate('user', 'name email phone profileImage createdAt')
      .sort({ createdAt: -1 });

    const patients = await Promise.all(
      rawPatients.map(async (p) => {
        const obj = p.toObject();
        if (!obj.patientId) {
          obj.patientId = `PAT-${obj._id.toString().slice(-6).toUpperCase()}`;
        }
        if (!obj.qrCode && obj.user) {
          obj.qrCode = await generatePatientIdQR(obj.patientId, obj.user?.name);
        }
        return obj;
      })
    );

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

    const obj = patient.toObject();
    if (!obj.patientId) {
      obj.patientId = `PAT-${obj._id.toString().slice(-6).toUpperCase()}`;
    }
    if (!obj.qrCode) {
      obj.qrCode = await generatePatientIdQR(obj.patientId, obj.user?.name);
    }

    res.json({ success: true, data: obj });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/patients/me/profile
const getMyPatientProfile = async (req, res) => {
  try {
    let patient = await Patient.findOne({ user: req.user._id }).populate('user', '-password');
    if (!patient) {
      patient = new Patient({
        user: req.user._id,
        patientId: `PAT-${Date.now().toString().slice(-6)}`,
      });
      await patient.save();
      await patient.populate('user', '-password');
    }

    const obj = patient.toObject();
    if (!obj.patientId) {
      obj.patientId = `PAT-${obj._id.toString().slice(-6).toUpperCase()}`;
    }
    if (!obj.qrCode) {
      obj.qrCode = await generatePatientIdQR(obj.patientId, obj.user?.name);
    }

    res.json({ success: true, data: obj });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/patients (Admin & Receptionist)
const createPatient = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      dob,
      gender,
      bloodGroup,
      address,
      emergencyContact,
      allergies,
      chronicDiseases,
      medicalHistory,
    } = req.body;

    const existing = await User.findOne({ email: email?.toLowerCase() });
    if (existing) return res.status(400).json({ success: false, message: 'Email already in use' });

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: password || 'Patient@123',
      phone,
      role: 'PATIENT',
    });

    const patientId = `PAT-${Date.now().toString().slice(-6)}`;
    const qrCode = (await generatePatientIdQR(patientId, name)) || '';

    let allergiesList = [];
    if (Array.isArray(allergies)) allergiesList = allergies;
    else if (typeof allergies === 'string') allergiesList = allergies.split(',').map((s) => s.trim()).filter(Boolean);

    let chronicList = [];
    if (Array.isArray(chronicDiseases)) chronicList = chronicDiseases;
    else if (typeof chronicDiseases === 'string') chronicList = chronicDiseases.split(',').map((s) => s.trim()).filter(Boolean);

    let medHist = [];
    if (Array.isArray(medicalHistory)) medHist = medicalHistory;
    else if (typeof medicalHistory === 'string') medHist = medicalHistory.split(',').map((s) => s.trim()).filter(Boolean);

    const patient = await Patient.create({
      patientId,
      user: user._id,
      dob: dob || null,
      gender: gender || 'Male',
      bloodGroup: bloodGroup || 'O+',
      address: address || '',
      emergencyContact: emergencyContact || {},
      allergies: allergiesList,
      chronicDiseases: chronicList,
      medicalHistory: medHist,
      qrCode,
    });

    await patient.populate('user', '-password');
    res.status(201).json({ success: true, message: 'Patient added successfully', data: patient });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/patients/:id (Admin, Receptionist, or Patient owner)
const updatePatient = async (req, res) => {
  try {
    const {
      name,
      phone,
      dob,
      gender,
      bloodGroup,
      address,
      emergencyContact,
      allergies,
      chronicDiseases,
      medicalHistory,
    } = req.body;

    const patient = await Patient.findById(req.params.id);
    if (!patient) return res.status(404).json({ success: false, message: 'Patient record not found' });

    // Ensure authorized
    if (req.user.role === 'PATIENT' && patient.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    if (name || phone) {
      await User.findByIdAndUpdate(patient.user, { name, phone });
    }

    if (dob) patient.dob = dob;
    if (gender) patient.gender = gender;
    if (bloodGroup) patient.bloodGroup = bloodGroup;
    if (address !== undefined) patient.address = address;
    if (emergencyContact) patient.emergencyContact = emergencyContact;

    // Handle nested medicalHistory object from frontend
    if (medicalHistory && typeof medicalHistory === 'object' && !Array.isArray(medicalHistory)) {
      if (medicalHistory.allergies) {
        patient.allergies = Array.isArray(medicalHistory.allergies)
          ? medicalHistory.allergies
          : medicalHistory.allergies.split(',').map((s) => s.trim()).filter(Boolean);
      }
      if (medicalHistory.chronicDiseases) {
        patient.chronicDiseases = Array.isArray(medicalHistory.chronicDiseases)
          ? medicalHistory.chronicDiseases
          : medicalHistory.chronicDiseases.split(',').map((s) => s.trim()).filter(Boolean);
      }
      if (medicalHistory.previousSurgeries) {
        patient.medicalHistory = Array.isArray(medicalHistory.previousSurgeries)
          ? medicalHistory.previousSurgeries
          : medicalHistory.previousSurgeries.split(',').map((s) => s.trim()).filter(Boolean);
      }
    } else {
      if (allergies) {
        patient.allergies = Array.isArray(allergies)
          ? allergies
          : allergies.split(',').map((s) => s.trim()).filter(Boolean);
      }
      if (chronicDiseases) {
        patient.chronicDiseases = Array.isArray(chronicDiseases)
          ? chronicDiseases
          : chronicDiseases.split(',').map((s) => s.trim()).filter(Boolean);
      }
      if (medicalHistory) {
        patient.medicalHistory = Array.isArray(medicalHistory)
          ? medicalHistory
          : medicalHistory.split(',').map((s) => s.trim()).filter(Boolean);
      }
    }

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
