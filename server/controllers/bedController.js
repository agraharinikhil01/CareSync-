const Bed = require('../models/Bed');

// GET /api/beds
const getBeds = async (req, res) => {
  try {
    const beds = await Bed.find().populate('patient', 'name age gender phone');
    res.json({ success: true, data: beds });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PATCH /api/beds/:id/admit
const admitPatient = async (req, res) => {
  try {
    const { patientId } = req.body;
    const bed = await Bed.findById(req.params.id);
    if (!bed) return res.status(404).json({ success: false, message: 'Bed not found' });
    if (bed.status === 'occupied') return res.status(400).json({ success: false, message: 'Bed is already occupied' });

    bed.status = 'occupied';
    bed.patient = patientId;
    bed.admittedAt = new Date();
    await bed.save();
    await bed.populate('patient', 'name age gender phone');
    res.json({ success: true, data: bed });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PATCH /api/beds/:id/discharge
const dischargePatient = async (req, res) => {
  try {
    const bed = await Bed.findById(req.params.id);
    if (!bed) return res.status(404).json({ success: false, message: 'Bed not found' });

    bed.status = 'available';
    bed.patient = null;
    bed.admittedAt = null;
    await bed.save();
    res.json({ success: true, data: bed, message: 'Patient discharged successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getBeds, admitPatient, dischargePatient };
