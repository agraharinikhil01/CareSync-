const Bed = require('../models/Bed');
const User = require('../models/User');

// GET /api/beds
const getBeds = async (req, res) => {
  try {
    const { floor, status } = req.query;
    let query = {};
    if (floor) query.floor = Number(floor);
    if (status) query.status = status.toUpperCase();

    const beds = await Bed.find(query).populate('patient', 'name email phone gender').sort({ bedNumber: 1 });
    res.json({ success: true, data: beds });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/beds/stats
const getBedStats = async (req, res) => {
  try {
    const [available, occupied, maintenance] = await Promise.all([
      Bed.countDocuments({ status: 'AVAILABLE' }),
      Bed.countDocuments({ status: 'OCCUPIED' }),
      Bed.countDocuments({ status: 'MAINTENANCE' }),
    ]);

    const floorBreakdown = await Bed.aggregate([
      {
        $group: {
          _id: { floor: '$floor', status: '$status' },
          count: { $sum: 1 },
        },
      },
    ]);

    res.json({
      success: true,
      data: {
        total: available + occupied + maintenance,
        available,
        occupied,
        maintenance,
        floorBreakdown,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/beds/:id/assign (Receptionist or Admin only)
const assignBed = async (req, res) => {
  try {
    const { patientId } = req.body;
    const bed = await Bed.findById(req.params.id);

    if (!bed) return res.status(404).json({ success: false, message: 'Bed not found' });

    if (bed.status === 'OCCUPIED') {
      return res.status(400).json({ success: false, message: `Bed ${bed.bedNumber} is already occupied by another patient` });
    }

    const patient = await User.findOne({ _id: patientId, role: 'PATIENT' });
    if (!patient) return res.status(404).json({ success: false, message: 'Patient not found' });

    // Ensure patient isn't currently in another bed
    const currentOccupied = await Bed.findOne({ patient: patientId, status: 'OCCUPIED' });
    if (currentOccupied && currentOccupied._id.toString() !== bed._id.toString()) {
      return res.status(400).json({
        success: false,
        message: `Patient ${patient.name} is already admitted in Bed ${currentOccupied.bedNumber} (Floor ${currentOccupied.floor}). Please transfer or discharge first.`,
      });
    }

    bed.status = 'OCCUPIED';
    bed.patient = patientId;
    bed.assignedAt = new Date();
    bed.dischargedAt = null;

    await bed.save();
    await bed.populate('patient', 'name email phone gender');

    res.json({ success: true, message: `Patient admitted to Bed ${bed.bedNumber}`, data: bed });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/beds/:id/transfer (Receptionist or Admin)
const transferBed = async (req, res) => {
  try {
    const { targetBedId } = req.body;
    const currentBed = await Bed.findById(req.params.id);
    const targetBed = await Bed.findById(targetBedId);

    if (!currentBed || !targetBed) {
      return res.status(404).json({ success: false, message: 'Bed not found' });
    }

    if (targetBed.status !== 'AVAILABLE') {
      return res.status(400).json({ success: false, message: `Target Bed ${targetBed.bedNumber} is not available for transfer` });
    }

    const patientId = currentBed.patient;

    // Release current bed
    currentBed.status = 'AVAILABLE';
    currentBed.patient = null;
    currentBed.dischargedAt = new Date();
    await currentBed.save();

    // Occupy target bed
    targetBed.status = 'OCCUPIED';
    targetBed.patient = patientId;
    targetBed.assignedAt = new Date();
    targetBed.dischargedAt = null;
    await targetBed.save();

    await targetBed.populate('patient', 'name email phone');

    res.json({
      success: true,
      message: `Patient transferred from Bed ${currentBed.bedNumber} to Bed ${targetBed.bedNumber}`,
      data: targetBed,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/beds/:id/discharge (Receptionist or Admin only)
const dischargeBed = async (req, res) => {
  try {
    const bed = await Bed.findById(req.params.id);
    if (!bed) return res.status(404).json({ success: false, message: 'Bed not found' });

    bed.status = 'AVAILABLE';
    bed.patient = null;
    bed.dischargedAt = new Date();
    await bed.save();

    res.json({ success: true, message: `Patient discharged from Bed ${bed.bedNumber}. Bed is now available.`, data: bed });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PATCH /api/beds/:id/maintenance
const toggleMaintenance = async (req, res) => {
  try {
    const bed = await Bed.findById(req.params.id);
    if (!bed) return res.status(404).json({ success: false, message: 'Bed not found' });

    if (bed.status === 'OCCUPIED') {
      return res.status(400).json({ success: false, message: 'Cannot mark occupied bed as maintenance' });
    }

    bed.status = bed.status === 'MAINTENANCE' ? 'AVAILABLE' : 'MAINTENANCE';
    await bed.save();

    res.json({ success: true, message: `Bed status updated to ${bed.status}`, data: bed });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  getBeds,
  getBedStats,
  assignBed,
  transferBed,
  dischargeBed,
  toggleMaintenance,
};
