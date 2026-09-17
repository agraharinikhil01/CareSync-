const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
const connectDB = require('../config/db');
const User = require('../models/User');
const Hospital = require('../models/Hospital');
const BedInventory = require('../models/BedInventory');
const Department = require('../models/Department');
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');

const seedHospitals = async () => {
  try {
    await connectDB();
    console.log('🌱 Connected to MongoDB for HospitalRadar Seeding...');

    // 1. Create or Find Hospital Admin User
    let hospAdmin = await User.findOne({ email: 'hospital@caresync.com' });
    if (!hospAdmin) {
      hospAdmin = await User.create({
        name: 'Dr. Rajesh Sharma (Hospital Director)',
        email: 'hospital@caresync.com',
        password: 'Hospital@123',
        role: 'HOSPITAL_ADMIN',
        phone: '+91 98112 34567',
      });
      console.log('✅ Created Hospital Admin User: hospital@caresync.com');
    }

    // 2. Clear previous demo hospitals
    await Hospital.deleteMany({ isDemo: true });

    // Realistic demo hospitals centered in Delhi NCR with varying availability (Green, Yellow, Red)
    const demoHospitals = [
      {
        name: 'CareSync Metro Super-Specialty Hospital',
        email: 'info@metrohospital.org',
        phone: '+91 11 2658 8500',
        emergencyPhone: '+91 11 2658 9999',
        address: 'Sri Aurobindo Marg, Ansari Nagar East',
        city: 'New Delhi',
        state: 'Delhi',
        pincode: '110029',
        location: {
          type: 'Point',
          coordinates: [77.2090, 28.5672], // Near AIIMS Delhi
        },
        hospitalType: 'Super-Specialty',
        verificationStatus: 'VERIFIED',
        emergencyAvailable: true,
        ambulanceAvailable: true,
        bloodBankAvailable: true,
        operatingHours: '24/7 Open',
        departments: ['Cardiology', 'Neurology', 'Orthopedics', 'Pediatrics', 'Emergency Medicine', 'Oncology'],
        services: ['Cath Lab', 'MRI 3T', 'Trauma ICU', 'Level 1 Trauma', 'Robotic Surgery', 'Blood Bank'],
        capacitySummary: {
          general: { total: 120, available: 32 }, // 🟢 Good availability
          icu: { total: 24, available: 6 },
          emergency: { total: 16, available: 5 },
        },
        adminUser: hospAdmin._id,
        rating: 4.9,
        totalReviews: 340,
        isDemo: true,
        lastStatusUpdate: new Date(), // Live (< 5 min)
      },
      {
        name: 'City Care Trauma & Multi-Specialty Hospital',
        email: 'contact@citycarehospital.in',
        phone: '+91 11 4155 7788',
        emergencyPhone: '+91 11 4155 9111',
        address: 'Pusa Road, Karol Bagh',
        city: 'New Delhi',
        state: 'Delhi',
        pincode: '110005',
        location: {
          type: 'Point',
          coordinates: [77.1906, 28.6448], // Karol Bagh / Central Delhi
        },
        hospitalType: 'Multi-Specialty',
        verificationStatus: 'VERIFIED',
        emergencyAvailable: true,
        ambulanceAvailable: true,
        bloodBankAvailable: true,
        operatingHours: '24/7 Open',
        departments: ['Emergency Medicine', 'General Surgery', 'Pulmonology', 'Gastroenterology'],
        services: ['Dialysis Unit', 'CT Scan 128 Slice', 'NICU / PICU', 'Emergency Ambulance'],
        capacitySummary: {
          general: { total: 80, available: 4 }, // 🟡 Limited availability
          icu: { total: 12, available: 1 },
          emergency: { total: 10, available: 2 },
        },
        rating: 4.6,
        totalReviews: 180,
        isDemo: true,
        lastStatusUpdate: new Date(Date.now() - 15 * 60 * 1000), // ~15 mins ago (Recent)
      },
      {
        name: 'Apex Apex Heart & Critical Care Institute',
        email: 'admissions@apexheartcare.com',
        phone: '+91 11 2923 1122',
        emergencyPhone: '+91 11 2923 9900',
        address: 'Outer Ring Road, Nehru Place',
        city: 'New Delhi',
        state: 'Delhi',
        pincode: '110019',
        location: {
          type: 'Point',
          coordinates: [77.2514, 28.5494], // South Delhi
        },
        hospitalType: 'Trauma Center',
        verificationStatus: 'VERIFIED',
        emergencyAvailable: false, // 🔴 Red: Emergency Full
        ambulanceAvailable: false,
        bloodBankAvailable: true,
        operatingHours: '24/7 Emergency',
        departments: ['Cardiology', 'Cardiac Surgery', 'Critical Care', 'Vascular Surgery'],
        services: ['ECMO Support', 'Heart Transplant', 'Cardiac Cath Lab', 'Intensive Coronary Care'],
        capacitySummary: {
          general: { total: 60, available: 0 }, // Full
          icu: { total: 16, available: 0 }, // Full
          emergency: { total: 8, available: 0 },
        },
        rating: 4.8,
        totalReviews: 210,
        isDemo: true,
        lastStatusUpdate: new Date(Date.now() - 2 * 60 * 1000), // 2 mins ago
      },
      {
        name: 'Greenfield Community Healthcare Center',
        email: 'help@greenfieldhealth.org',
        phone: '+91 11 2731 4455',
        emergencyPhone: '+91 11 2731 9999',
        address: 'Ring Road, Pitampura',
        city: 'New Delhi',
        state: 'Delhi',
        pincode: '110034',
        location: {
          type: 'Point',
          coordinates: [77.1332, 28.6989], // North-West Delhi
        },
        hospitalType: 'General Hospital',
        verificationStatus: 'VERIFIED',
        emergencyAvailable: true,
        ambulanceAvailable: true,
        bloodBankAvailable: false,
        operatingHours: '24/7 Open',
        departments: ['General Medicine', 'Pediatrics', 'Obstetrics & Gynaecology', 'Dermatology'],
        services: ['X-Ray & Ultrasound', 'Pathology Lab', 'Day Care Surgery', 'Maternity Ward'],
        capacitySummary: {
          general: { total: 50, available: 18 }, // 🟢 Good availability
          icu: { total: 6, available: 2 },
          emergency: { total: 6, available: 3 },
        },
        rating: 4.4,
        totalReviews: 95,
        isDemo: true,
        lastStatusUpdate: new Date(Date.now() - 85 * 60 * 1000), // ~85 mins ago (Stale)
      },
      {
        name: 'St. Jude District Memorial Hospital',
        email: 'admin@stjudedistrict.org',
        phone: '+91 120 240 1234',
        emergencyPhone: '+91 120 240 9911',
        address: 'Sector 62, Expressway Corridor',
        city: 'Noida',
        state: 'Uttar Pradesh',
        pincode: '201309',
        location: {
          type: 'Point',
          coordinates: [77.3639, 28.6280], // Noida
        },
        hospitalType: 'Government',
        verificationStatus: 'VERIFIED',
        emergencyAvailable: true,
        ambulanceAvailable: true,
        bloodBankAvailable: true,
        operatingHours: '24/7 Open',
        departments: ['Emergency Medicine', 'Orthopedics', 'General Surgery', 'Internal Medicine', 'ENT'],
        services: ['Free Emergency Care', 'Generic Pharmacy', 'Trauma Resuscitation', 'Burn Unit'],
        capacitySummary: {
          general: { total: 150, available: 45 },
          icu: { total: 20, available: 7 },
          emergency: { total: 14, available: 6 },
        },
        rating: 4.3,
        totalReviews: 410,
        isDemo: true,
        lastStatusUpdate: new Date(),
      },
    ];

    for (const hData of demoHospitals) {
      const createdHosp = await Hospital.create(hData);
      console.log(`🏥 Seeded Hospital: ${createdHosp.name}`);

      // Link Hospital Admin's hospitalId to the primary hospital
      if (hData.adminUser) {
        await User.findByIdAndUpdate(hData.adminUser, { hospitalId: createdHosp._id });
      }

      // Create Bed Inventory Breakdown for this hospital
      const bedTypes = [
        {
          category: 'GENERAL',
          total: hData.capacitySummary.general.total,
          occupied: hData.capacitySummary.general.total - hData.capacitySummary.general.available,
          reserved: 0,
          maintenance: 0,
        },
        {
          category: 'ICU',
          total: hData.capacitySummary.icu.total,
          occupied: hData.capacitySummary.icu.total - hData.capacitySummary.icu.available,
          reserved: 0,
          maintenance: 0,
        },
        {
          category: 'EMERGENCY',
          total: hData.capacitySummary.emergency.total,
          occupied: hData.capacitySummary.emergency.total - hData.capacitySummary.emergency.available,
          reserved: 0,
          maintenance: 0,
        },
        {
          category: 'ISOLATION',
          total: 8,
          occupied: 3,
          reserved: 1,
          maintenance: 0,
        },
        {
          category: 'PRIVATE',
          total: 15,
          occupied: 10,
          reserved: 2,
          maintenance: 0,
        },
      ];

      for (const b of bedTypes) {
        await BedInventory.create({
          hospitalId: createdHosp._id,
          category: b.category,
          total: b.total,
          occupied: b.occupied,
          reserved: b.reserved,
          maintenance: b.maintenance,
          available: Math.max(0, b.total - (b.occupied + b.reserved + b.maintenance)),
        });
      }

      // Create Departments
      for (const deptName of hData.departments) {
        await Department.create({
          hospitalId: createdHosp._id,
          name: deptName,
          description: `Specialized ${deptName} Department providing 24/7 tertiary clinical care.`,
          headDoctor: `Dr. Consultant (${deptName})`,
          services: [`Inpatient ${deptName}`, `Outpatient Consultation`, 'Diagnostic Screening'],
        });
      }
    }

    console.log('✨ All Demo Hospitals & Bed Inventories Seeded Successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  }
};

seedHospitals();
