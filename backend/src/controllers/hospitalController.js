const Hospital = require('../models/Hospital');
const BedInventory = require('../models/BedInventory');
const Department = require('../models/Department');
const Doctor = require('../models/Doctor');
const User = require('../models/User');
const { broadcastHospitalUpdate } = require('../utils/socket');

// Department clinical mapping for rich doctor & disease discovery
const DEPARTMENT_SPECIALIST_TEMPLATES = {
  Cardiology: {
    title: 'Senior Interventional Cardiologist',
    diseases: 'Heart Attacks, Chest Pain, High Blood Pressure, Angina & Arrhythmia',
    qualification: 'MBBS, MD (Medicine), DM (Cardiology)',
    fee: 600,
    exp: 14,
  },
  'Emergency Medicine': {
    title: 'Emergency & Critical Care Specialist',
    diseases: 'Accidents, Trauma, Acute Breathing Distress, Shock & Poisoning',
    qualification: 'MBBS, MEM (Emergency Medicine)',
    fee: 400,
    exp: 10,
  },
  'General Medicine': {
    title: 'Senior Consultant Physician',
    diseases: 'Viral Fever, Typhoid, Diabetes, Hypertension, Infections & General Health',
    qualification: 'MBBS, MD (General Medicine)',
    fee: 350,
    exp: 12,
  },
  'General Surgery': {
    title: 'Chief Laparoscopic & General Surgeon',
    diseases: 'Appendicitis, Hernia, Gallbladder Stones, Piles, Cysts & Trauma Care',
    qualification: 'MBBS, MS (General Surgery), FIAGES',
    fee: 550,
    exp: 15,
  },
  Orthopedics: {
    title: 'Senior Orthopedic & Joint Surgeon',
    diseases: 'Bone Fractures, Arthritis, Joint Replacement, Spine & Back Pain',
    qualification: 'MBBS, MS (Orthopedics)',
    fee: 500,
    exp: 11,
  },
  Pediatrics: {
    title: 'Consultant Pediatrician & Neonatologist',
    diseases: 'Childhood Infections, Newborn Care, Vaccination, Pediatric Fever & Asthma',
    qualification: 'MBBS, MD (Pediatrics), DCH',
    fee: 400,
    exp: 9,
  },
  'Obstetrics & Gynecology': {
    title: 'Senior Gynecologist & Obstetrician',
    diseases: 'Pregnancy Care, Normal/C-Section Delivery, PCOD, Infertility & Fibroids',
    qualification: 'MBBS, MS (Obs & Gynae), DGO',
    fee: 500,
    exp: 13,
  },
  Obstetrics: {
    title: 'Consultant Obstetrician',
    diseases: 'Antenatal Checkups, Safe Delivery, Maternal Nutrition & Newborn Care',
    qualification: 'MBBS, DGO',
    fee: 400,
    exp: 8,
  },
  Neurology: {
    title: 'Consultant Neurologist',
    diseases: 'Brain Stroke, Migraine, Epilepsy/Seizures, Paralysis & Nerve Disorders',
    qualification: 'MBBS, MD, DM (Neurology)',
    fee: 700,
    exp: 12,
  },
  Pulmonology: {
    title: 'Chest & Respiratory Specialist',
    diseases: 'Asthma, COPD, Pneumonia, Tuberculosis, Chronic Cough & Allergies',
    qualification: 'MBBS, MD (Pulmonary Medicine)',
    fee: 450,
    exp: 10,
  },
  'Intensive Care': {
    title: 'ICU & Critical Care Intensivist',
    diseases: 'Sepsis, Multi-Organ Failure, Ventilator Care & Coma Management',
    qualification: 'MBBS, IDCCM, FNB (Critical Care)',
    fee: 600,
    exp: 11,
  },
};

const DOCTOR_NAMES = [
  'Dr. R.K. Srivastava',
  'Dr. Ananya Mishra',
  'Dr. Arvind Patel',
  'Dr. Sunita Chaudhary',
  'Dr. Vivek Sharma',
  'Dr. Priya Gupta',
  'Dr. Alok Verma',
  'Dr. Meenakshi Singh',
];

const generateDepartmentDoctors = (hospital) => {
  const depts = hospital.departments && hospital.departments.length > 0
    ? hospital.departments
    : ['General Medicine', 'Emergency Medicine', 'Pediatrics'];

  return depts.slice(0, 6).map((dept, index) => {
    const template = DEPARTMENT_SPECIALIST_TEMPLATES[dept] || {
      title: `${dept} Specialist`,
      diseases: `Treatment for acute and chronic conditions in ${dept}`,
      qualification: 'MBBS, MD',
      fee: 450,
      exp: 10,
    };

    const docName = DOCTOR_NAMES[index % DOCTOR_NAMES.length];

    return {
      _id: `roster-${hospital._id}-${index}`,
      hospital: hospital._id,
      specialization: dept,
      designation: template.title,
      treatedConditions: template.diseases,
      qualification: template.qualification,
      experience: template.exp,
      consultationFee: template.fee,
      availability: true,
      availabilityLabel: 'Available Today (OPD Open)',
      phone: hospital.phone || '+91 94508 22100',
      schedule: [
        { day: 'Monday', startTime: '09:00 AM', endTime: '02:00 PM' },
        { day: 'Tuesday', startTime: '09:00 AM', endTime: '02:00 PM' },
        { day: 'Wednesday', startTime: '09:00 AM', endTime: '02:00 PM' },
        { day: 'Thursday', startTime: '09:00 AM', endTime: '02:00 PM' },
        { day: 'Friday', startTime: '09:00 AM', endTime: '02:00 PM' },
        { day: 'Saturday', startTime: '09:00 AM', endTime: '01:00 PM' },
      ],
      user: {
        _id: `user-${hospital._id}-${index}`,
        name: docName,
        email: `doctor.${dept.toLowerCase().replace(/[^a-z0-9]/g, '')}@caresync.org`,
        phone: hospital.phone,
        role: 'DOCTOR',
      },
    };
  });
};

// Calculate real-time freshness state based on last update timestamp
const calculateFreshness = (date) => {
  if (!date) return { state: 'outdated', label: 'Data may be outdated', minutesAgo: 999 };
  const diffMs = Date.now() - new Date(date).getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));

  if (diffMins < 5) return { state: 'live', label: 'Live', minutesAgo: diffMins };
  if (diffMins <= 30) return { state: 'recent', label: `${diffMins}m ago`, minutesAgo: diffMins };
  if (diffMins <= 120) return { state: 'stale', label: `${diffMins}m ago (stale)`, minutesAgo: diffMins };
  return { state: 'outdated', label: `${Math.floor(diffMins / 60)}h ago (outdated)`, minutesAgo: diffMins };
};

// @desc    Get nearby hospitals with RailRadar live capacity metrics
// @route   GET /api/hospitals/nearby
// @access  Public
exports.getNearbyHospitals = async (req, res) => {
  try {
    const {
      lat,
      lng,
      radius = 25, // km
      specialty,
      emergencyOnly,
      minBeds,
      minIcu,
      search,
    } = req.query;

    const query = { verificationStatus: { $in: ['VERIFIED', 'PENDING'] } };

    if (search && search.trim()) {
      query.$or = [
        { name: { $regex: search.trim(), $options: 'i' } },
        { city: { $regex: search.trim(), $options: 'i' } },
        { departments: { $regex: search.trim(), $options: 'i' } },
        { services: { $regex: search.trim(), $options: 'i' } },
      ];
    }

    if (specialty) {
      query.departments = { $regex: specialty.trim(), $options: 'i' };
    }

    if (emergencyOnly === 'true') {
      query.emergencyAvailable = true;
    }

    let hospitals = [];

    if (lat && lng && !isNaN(parseFloat(lat)) && !isNaN(parseFloat(lng))) {
      const userLat = parseFloat(lat);
      const userLng = parseFloat(lng);
      const maxDistanceMeters = parseFloat(radius) * 1000;

      // MongoDB geospatial search using $near
      query.location = {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [userLng, userLat],
          },
          $maxDistance: maxDistanceMeters,
        },
      };

      hospitals = await Hospital.find(query).limit(50).lean();

      // If no hospitals within strict radius, search across India and find the nearest facilities
      if (hospitals.length === 0) {
        const fallbackQuery = { ...query };
        delete fallbackQuery.location;
        hospitals = await Hospital.find(fallbackQuery).lean();
      }

      // Compute exact distance and driving time for each hospital
      hospitals = hospitals.map((h) => {
        const [hLng, hLat] = h.location.coordinates;
        // Haversine formula (straight-line distance)
        const R = 6371; // km
        const dLat = ((hLat - userLat) * Math.PI) / 180;
        const dLng = ((hLng - userLng) * Math.PI) / 180;
        const a =
          Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos((userLat * Math.PI) / 180) *
            Math.cos((hLat * Math.PI) / 180) *
            Math.sin(dLng / 2) *
            Math.sin(dLng / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const straightLineKm = R * c;

        // Apply road distance correction factor (Indian roads avg 1.3x straight line)
        // For very short distances (<0.2km) use 1.1x, for others use 1.3x
        const correctionFactor = straightLineKm < 0.2 ? 1.1 : 1.3;
        const roadDistanceKm = straightLineKm * correctionFactor;

        // Round to 1 decimal place (e.g., 0.9 km, 1.2 km)
        const distanceKm = Math.round(roadDistanceKm * 10) / 10;

        // Realistic travel time: local Indian town speed ~20-25 km/h
        // < 200m = 1 min, else calculate based on 20 km/h average
        const estTravelMinutes =
          distanceKm < 0.2 ? 1 :
          distanceKm < 1.0 ? Math.max(2, Math.round(distanceKm * 3)) :
          Math.max(3, Math.round(distanceKm * 2.5));

        const freshness = calculateFreshness(h.lastStatusUpdate);

        // Transparent match reasons
        const matchReasons = [];
        const distLabel =
          distanceKm < 0.1 ? 'Nearby (< 100 m)' :
          distanceKm < 1.0 ? `${distanceKm} km away (road est.)` :
          `${distanceKm} km away (road est.)`;
        matchReasons.push(`${distLabel} (~${estTravelMinutes} min)`);
        if (h.capacitySummary?.icu?.available > 0) {
          matchReasons.push(`${h.capacitySummary.icu.available} ICU beds available`);
        }
        if (h.emergencyAvailable) {
          matchReasons.push('24/7 Emergency Active');
        }
        if (specialty && h.departments?.some((d) => d.toLowerCase().includes(specialty.toLowerCase()))) {
          matchReasons.push(`${specialty} Department on duty`);
        }

        return {
          ...h,
          distanceKm,
          estTravelMinutes,
          freshness,
          matchReasons,
        };
      }).sort((a, b) => (a.distanceKm ?? 999) - (b.distanceKm ?? 999)).slice(0, 50);

    } else {
      // Fallback if no location coordinates provided
      hospitals = await Hospital.find(query).sort({ rating: -1 }).limit(50).lean();
      hospitals = hospitals.map((h) => ({
        ...h,
        distanceKm: null,
        estTravelMinutes: null,
        freshness: calculateFreshness(h.lastStatusUpdate),
        matchReasons: [
          h.emergencyAvailable ? 'Emergency Available' : 'Routine Care',
          `${h.capacitySummary?.general?.available || 0} General Beds Available`,
        ],
      }));
    }

    // Filter by min beds/ICU if requested
    if (minBeds) {
      const minB = parseInt(minBeds, 10);
      hospitals = hospitals.filter((h) => (h.capacitySummary?.general?.available || 0) >= minB);
    }
    if (minIcu) {
      const minI = parseInt(minIcu, 10);
      hospitals = hospitals.filter((h) => (h.capacitySummary?.icu?.available || 0) >= minI);
    }

    res.json({
      success: true,
      count: hospitals.length,
      data: hospitals,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all hospitals with pagination & filters
// @route   GET /api/hospitals
// @access  Public
exports.getHospitals = async (req, res) => {
  try {
    const { city, status, search, page = 1, limit = 20 } = req.query;
    const query = {};

    if (city) query.city = { $regex: city, $options: 'i' };
    if (status) query.verificationStatus = status;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { city: { $regex: search, $options: 'i' } },
        { address: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const total = await Hospital.countDocuments(query);
    const hospitals = await Hospital.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit, 10))
      .lean();

    const formatted = hospitals.map((h) => ({
      ...h,
      freshness: calculateFreshness(h.lastStatusUpdate),
    }));

    res.json({
      success: true,
      count: formatted.length,
      total,
      page: parseInt(page, 10),
      pages: Math.ceil(total / limit),
      data: formatted,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Fast Autocomplete & Nationwide Hospital Search
// @route   GET /api/hospitals/search
// @access  Public
exports.searchHospitals = async (req, res) => {
  try {
    const { q, lat, lng, limit = 12 } = req.query;

    if (!q || !q.trim()) {
      return res.json({ success: true, data: [] });
    }

    const term = q.trim();
    const regex = new RegExp(term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');

    const query = {
      verificationStatus: { $in: ['VERIFIED', 'PENDING'] },
      $or: [
        { name: regex },
        { city: regex },
        { state: regex },
        { address: regex },
        { departments: regex },
        { hospitalType: regex },
      ],
    };

    let hospitals = await Hospital.find(query)
      .limit(parseInt(limit, 10) || 12)
      .lean();

    const userLat = lat && !isNaN(parseFloat(lat)) ? parseFloat(lat) : null;
    const userLng = lng && !isNaN(parseFloat(lng)) ? parseFloat(lng) : null;

    hospitals = hospitals.map((h) => {
      let distanceKm = null;
      let estTravelMinutes = null;

      if (userLat !== null && userLng !== null && h.location?.coordinates?.length >= 2) {
        const [hLng, hLat] = h.location.coordinates;
        const R = 6371; // km
        const dLat = ((hLat - userLat) * Math.PI) / 180;
        const dLng = ((hLng - userLng) * Math.PI) / 180;
        const a =
          Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos((userLat * Math.PI) / 180) *
            Math.cos((hLat * Math.PI) / 180) *
            Math.sin(dLng / 2) *
            Math.sin(dLng / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const straightLineKm = R * c;
        const correctionFactor = straightLineKm < 0.2 ? 1.1 : 1.3;
        distanceKm = Math.round(straightLineKm * correctionFactor * 10) / 10;
        estTravelMinutes =
          distanceKm < 0.2 ? 1 :
          distanceKm < 1.0 ? Math.max(2, Math.round(distanceKm * 3)) :
          Math.max(3, Math.round(distanceKm * 2.5));
      }

      return {
        ...h,
        distanceKm,
        estTravelMinutes,
        freshness: calculateFreshness(h.lastStatusUpdate),
      };
    });

    // Sort: prefix name matches first, then nearest distance
    hospitals.sort((a, b) => {
      const aStarts = a.name?.toLowerCase().startsWith(term.toLowerCase());
      const bStarts = b.name?.toLowerCase().startsWith(term.toLowerCase());
      if (aStarts && !bStarts) return -1;
      if (!aStarts && bStarts) return 1;
      if (a.distanceKm !== null && b.distanceKm !== null) {
        return a.distanceKm - b.distanceKm;
      }
      return 0;
    });

    res.json({
      success: true,
      count: hospitals.length,
      data: hospitals,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single hospital profile with beds, departments, doctors
// @route   GET /api/hospitals/:id
// @access  Public
exports.getHospitalById = async (req, res) => {
  try {
    const hospital = await Hospital.findById(req.params.id).lean();
    if (!hospital) {
      return res.status(404).json({ success: false, message: 'Hospital not found' });
    }

    // Compute road distance and ETA if client provides coordinates
    let distanceKm = null;
    let estTravelMinutes = null;
    if (req.query.lat && req.query.lng && hospital.location?.coordinates?.length >= 2) {
      const userLat = parseFloat(req.query.lat);
      const userLng = parseFloat(req.query.lng);
      const [hLng, hLat] = hospital.location.coordinates;
      const R = 6371; // km
      const dLat = ((hLat - userLat) * Math.PI) / 180;
      const dLng = ((hLng - userLng) * Math.PI) / 180;
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((userLat * Math.PI) / 180) *
          Math.cos((hLat * Math.PI) / 180) *
          Math.sin(dLng / 2) *
          Math.sin(dLng / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const straightLineKm = R * c;
      const correctionFactor = straightLineKm < 0.2 ? 1.1 : 1.3;
      distanceKm = Math.round(straightLineKm * correctionFactor * 10) / 10;
      estTravelMinutes =
        distanceKm < 0.2 ? 1 :
        distanceKm < 1.0 ? Math.max(2, Math.round(distanceKm * 3)) :
        Math.max(3, Math.round(distanceKm * 2.5));
    }

    // Fetch detailed bed inventory
    const bedInventories = await BedInventory.find({ hospitalId: hospital._id }).lean();

    // Fetch active departments
    let departments = await Department.find({ hospitalId: hospital._id, isActive: true }).lean();
    if (!departments || departments.length === 0) {
      // Fallback to hospital's departments array
      departments = (hospital.departments || []).map((d, i) => ({
        _id: `dept-${hospital._id}-${i}`,
        name: d,
        description: `Department of ${d} at ${hospital.name}`,
        isActive: true,
      }));
    }

    // Fetch doctors affiliated with this hospital (either via Doctor.hospital or User.hospitalId)
    let doctors = await Doctor.find({ hospital: hospital._id })
      .populate('user', 'name email phone profileImage')
      .lean();

    if (!doctors || doctors.length === 0) {
      const hospitalUsers = await User.find({ hospitalId: hospital._id }).select('_id');
      if (hospitalUsers.length > 0) {
        doctors = await Doctor.find({ user: { $in: hospitalUsers.map((u) => u._id) } })
          .populate('user', 'name email phone profileImage')
          .lean();
      }
    }

    // If still no doctors in database, provide department-mapped clinical specialist roster
    if (!doctors || doctors.length === 0) {
      doctors = generateDepartmentDoctors(hospital);
    } else {
      // Enhance existing doctors with disease specializations if missing
      doctors = doctors.map((doc) => {
        const template = DEPARTMENT_SPECIALIST_TEMPLATES[doc.specialization] || {};
        return {
          ...doc,
          designation: doc.designation || template.title || `${doc.specialization} Specialist`,
          treatedConditions: doc.treatedConditions || template.diseases || `Treatment for ${doc.specialization}`,
          availabilityLabel: doc.availability ? 'Available Today (OPD Open)' : 'On Call / Shift ended',
        };
      });
    }

    res.json({
      success: true,
      data: {
        ...hospital,
        distanceKm,
        estTravelMinutes,
        freshness: calculateFreshness(hospital.lastStatusUpdate),
        bedInventories,
        departments,
        doctors,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Register a new hospital (Public onboarding)
// @route   POST /api/hospitals
// @access  Public / Auth
exports.createHospital = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      emergencyPhone,
      address,
      city,
      state,
      pincode,
      latitude,
      longitude,
      hospitalType,
      licenseNumber,
      emergencyAvailable,
      ambulanceAvailable,
      departments = [],
      services = [],
      generalBeds = 50,
      icuBeds = 10,
      emergencyBeds = 8,
    } = req.body;

    if (!latitude || !longitude) {
      return res.status(400).json({ success: false, message: 'Hospital latitude and longitude are required' });
    }

    const hospital = await Hospital.create({
      name,
      email,
      phone,
      emergencyPhone: emergencyPhone || phone,
      address,
      city,
      state,
      pincode,
      location: {
        type: 'Point',
        coordinates: [parseFloat(longitude), parseFloat(latitude)],
      },
      hospitalType: hospitalType || 'Multi-Specialty',
      licenseNumber,
      verificationStatus: req.user?.role === 'ADMIN' ? 'VERIFIED' : 'PENDING',
      emergencyAvailable: emergencyAvailable !== undefined ? emergencyAvailable : true,
      ambulanceAvailable: ambulanceAvailable !== undefined ? ambulanceAvailable : true,
      departments: Array.isArray(departments) ? departments : departments.split(',').map((s) => s.trim()),
      services: Array.isArray(services) ? services : services.split(',').map((s) => s.trim()),
      capacitySummary: {
        general: { total: generalBeds, available: Math.floor(generalBeds * 0.4) },
        icu: { total: icuBeds, available: Math.floor(icuBeds * 0.3) },
        emergency: { total: emergencyBeds, available: Math.floor(emergencyBeds * 0.5) },
      },
      adminUser: req.user ? req.user._id : null,
      lastStatusUpdate: new Date(),
    });

    // Create default bed inventories
    const bedCategories = [
      { category: 'GENERAL', total: generalBeds, occupied: generalBeds - Math.floor(generalBeds * 0.4) },
      { category: 'ICU', total: icuBeds, occupied: icuBeds - Math.floor(icuBeds * 0.3) },
      { category: 'EMERGENCY', total: emergencyBeds, occupied: emergencyBeds - Math.floor(emergencyBeds * 0.5) },
      { category: 'ISOLATION', total: 6, occupied: 2 },
      { category: 'PRIVATE', total: 15, occupied: 8 },
      { category: 'SEMI_PRIVATE', total: 20, occupied: 12 },
    ];

    for (const b of bedCategories) {
      await BedInventory.create({
        hospitalId: hospital._id,
        category: b.category,
        total: b.total,
        occupied: b.occupied,
        reserved: 0,
        maintenance: 0,
        available: Math.max(0, b.total - b.occupied),
        updatedBy: req.user ? req.user._id : null,
      });
    }

    res.status(201).json({
      success: true,
      message: 'Hospital registered successfully. It is currently in Pending Verification status.',
      data: hospital,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update hospital details
// @route   PATCH /api/hospitals/:id
// @access  Private (Hospital Admin / System Admin)
exports.updateHospital = async (req, res) => {
  try {
    let hospital = await Hospital.findById(req.params.id);
    if (!hospital) {
      return res.status(404).json({ success: false, message: 'Hospital not found' });
    }

    // Role check: Only admin or the hospital's own admin can update
    if (
      req.user.role !== 'ADMIN' &&
      req.user.hospitalId?.toString() !== hospital._id.toString() &&
      hospital.adminUser?.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ success: false, message: 'Unauthorized to manage this hospital' });
    }

    const updates = { ...req.body };
    if (req.body.latitude && req.body.longitude) {
      updates.location = {
        type: 'Point',
        coordinates: [parseFloat(req.body.longitude), parseFloat(req.body.latitude)],
      };
    }
    updates.lastStatusUpdate = new Date();

    hospital = await Hospital.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });

    // Emit Socket.IO live update
    broadcastHospitalUpdate(hospital._id, {
      hospitalName: hospital.name,
      capacitySummary: hospital.capacitySummary,
      emergencyAvailable: hospital.emergencyAvailable,
    });

    res.json({ success: true, data: hospital });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get hospital beds breakdown
// @route   GET /api/hospitals/:id/beds
// @access  Public / Auth
exports.getHospitalBeds = async (req, res) => {
  try {
    const beds = await BedInventory.find({ hospitalId: req.params.id }).sort({ category: 1 });
    res.json({ success: true, data: beds });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update hospital bed category capacity (Live Bed Manager)
// @route   PATCH /api/hospitals/:id/beds
// @access  Private (HOSPITAL_ADMIN, RECEPTIONIST, ADMIN)
exports.updateHospitalBeds = async (req, res) => {
  try {
    const { category, total, occupied, reserved = 0, maintenance = 0, notes } = req.body;

    if (!category) {
      return res.status(400).json({ success: false, message: 'Bed category is required' });
    }

    const totalNum = Math.max(0, parseInt(total || 0, 10));
    const occNum = Math.max(0, parseInt(occupied || 0, 10));
    const resNum = Math.max(0, parseInt(reserved || 0, 10));
    const maintNum = Math.max(0, parseInt(maintenance || 0, 10));
    const availNum = Math.max(0, totalNum - (occNum + resNum + maintNum));

    const bed = await BedInventory.findOneAndUpdate(
      { hospitalId: req.params.id, category },
      {
        total: totalNum,
        occupied: occNum,
        reserved: resNum,
        maintenance: maintNum,
        available: availNum,
        notes: notes || '',
        updatedBy: req.user._id,
      },
      { new: true, upsert: true }
    );

    // Recompute total capacity summary for Hospital map pin
    const allBeds = await BedInventory.find({ hospitalId: req.params.id });
    let generalTot = 0,
      generalAvail = 0;
    let icuTot = 0,
      icuAvail = 0;
    let emergTot = 0,
      emergAvail = 0;

    allBeds.forEach((b) => {
      if (b.category === 'ICU') {
        icuTot += b.total;
        icuAvail += b.available;
      } else if (b.category === 'EMERGENCY') {
        emergTot += b.total;
        emergAvail += b.available;
      } else {
        generalTot += b.total;
        generalAvail += b.available;
      }
    });

    const hospital = await Hospital.findByIdAndUpdate(
      req.params.id,
      {
        'capacitySummary.general.total': generalTot,
        'capacitySummary.general.available': generalAvail,
        'capacitySummary.icu.total': icuTot,
        'capacitySummary.icu.available': icuAvail,
        'capacitySummary.emergency.total': emergTot,
        'capacitySummary.emergency.available': emergAvail,
        lastStatusUpdate: new Date(),
      },
      { new: true }
    );

    // Emit Real-Time Socket.IO update across all connected patient maps
    broadcastHospitalUpdate(hospital._id, {
      hospitalId: hospital._id,
      hospitalName: hospital.name,
      capacitySummary: hospital.capacitySummary,
      updatedBed: bed,
      lastStatusUpdate: hospital.lastStatusUpdate,
    });

    res.json({
      success: true,
      message: 'Bed capacity updated and broadcasted in real-time!',
      data: { bed, capacitySummary: hospital.capacitySummary },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get hospital departments
// @route   GET /api/hospitals/:id/departments
// @access  Public
exports.getHospitalDepartments = async (req, res) => {
  try {
    const departments = await Department.find({ hospitalId: req.params.id, isActive: true });
    res.json({ success: true, data: departments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add hospital department
// @route   POST /api/hospitals/:id/departments
// @access  Private (HOSPITAL_ADMIN, ADMIN)
exports.createHospitalDepartment = async (req, res) => {
  try {
    const { name, description, headDoctor, services } = req.body;
    const department = await Department.create({
      hospitalId: req.params.id,
      name,
      description,
      headDoctor,
      services: Array.isArray(services) ? services : (services || '').split(',').map((s) => s.trim()),
    });

    // Also push to Hospital.departments list if not already there
    await Hospital.findByIdAndUpdate(req.params.id, {
      $addToSet: { departments: name },
    });

    res.status(201).json({ success: true, data: department });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
