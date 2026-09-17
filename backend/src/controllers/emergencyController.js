const EmergencyRequest = require('../models/EmergencyRequest');
const Hospital = require('../models/Hospital');
const { emitEmergencyAlert } = require('../utils/socket');

// @desc    Submit emergency request / assistance dispatch
// @route   POST /api/emergency
// @access  Public / Auth
exports.createEmergencyRequest = async (req, res) => {
  try {
    const {
      patientName,
      contactPhone,
      emergencyType,
      priority = 'CRITICAL',
      latitude,
      longitude,
      address,
      targetHospitalId,
      notes,
    } = req.body;

    if (!patientName || !contactPhone) {
      return res.status(400).json({ success: false, message: 'Patient name and contact phone are required' });
    }

    let hospitalId = targetHospitalId;

    // If no hospital targeted, auto-route to closest hospital with emergency & ICU available
    if (!hospitalId && latitude && longitude) {
      const nearest = await Hospital.findOne({
        emergencyAvailable: true,
        location: {
          $near: {
            $geometry: { type: 'Point', coordinates: [parseFloat(longitude), parseFloat(latitude)] },
          },
        },
      });
      if (nearest) hospitalId = nearest._id;
    }

    // Fallback to first verified hospital if needed
    if (!hospitalId) {
      const anyHosp = await Hospital.findOne({ emergencyAvailable: true });
      if (anyHosp) hospitalId = anyHosp._id;
    }

    if (!hospitalId) {
      return res.status(400).json({ success: false, message: 'No hospital available for emergency routing' });
    }

    const emergency = await EmergencyRequest.create({
      patientName,
      contactPhone,
      patientUser: req.user ? req.user._id : null,
      emergencyType: emergencyType || 'OTHER',
      priority,
      location: {
        type: 'Point',
        coordinates: [parseFloat(longitude || 77.209), parseFloat(latitude || 28.6139)],
        address: address || '',
      },
      targetHospital: hospitalId,
      status: 'PENDING',
      notes: notes || '',
    });

    const populated = await EmergencyRequest.findById(emergency._id).populate('targetHospital', 'name phone emergencyPhone address');

    // Emit live Socket alert
    emitEmergencyAlert(hospitalId, populated);

    res.status(201).json({
      success: true,
      message: '🚨 Emergency request dispatched! Hospital alerted.',
      data: populated,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get emergency requests for hospital or user
// @route   GET /api/emergency
// @access  Private
exports.getEmergencyRequests = async (req, res) => {
  try {
    const query = {};
    const { hospitalId, status } = req.query;

    const targetHospId = hospitalId || req.user.hospitalId;

    if (req.user.role === 'ADMIN') {
      if (hospitalId) query.targetHospital = hospitalId;
    } else if (targetHospId) {
      query.targetHospital = targetHospId;
    } else if (req.user.role === 'PATIENT') {
      query.patientUser = req.user._id;
    }

    if (status) query.status = status;

    const requests = await EmergencyRequest.find(query)
      .populate('targetHospital', 'name phone emergencyPhone address')
      .sort({ createdAt: -1 })
      .lean();

    res.json({ success: true, count: requests.length, data: requests });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update emergency status
// @route   PATCH /api/emergency/:id
// @access  Private (HOSPITAL_ADMIN, DOCTOR, RECEPTIONIST, ADMIN)
exports.updateEmergencyStatus = async (req, res) => {
  try {
    const { status, notes } = req.body;
    const emergency = await EmergencyRequest.findByIdAndUpdate(
      req.params.id,
      { status, ...(notes && { notes }) },
      { new: true }
    ).populate('targetHospital', 'name phone emergencyPhone');

    if (!emergency) {
      return res.status(404).json({ success: false, message: 'Emergency request not found' });
    }

    emitEmergencyAlert(emergency.targetHospital._id, emergency);

    res.json({ success: true, data: emergency });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
