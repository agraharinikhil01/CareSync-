const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
const mongoose = require('mongoose');

const User = require('../models/User');
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');
const Prescription = require('../models/Prescription');
const Bed = require('../models/Bed');
const Bill = require('../models/Bill');
const connectDB = require('../config/db');

const seedData = async () => {
  try {
    console.log('⏳ Connecting to MongoDB Atlas for seed operation...');
    await connectDB();

    console.log('🧹 Cleaning existing collections and resetting indexes...');
    try { await mongoose.connection.collection('users').drop(); } catch (e) {}
    try { await mongoose.connection.collection('patients').drop(); } catch (e) {}
    try { await mongoose.connection.collection('doctors').drop(); } catch (e) {}
    try { await mongoose.connection.collection('appointments').drop(); } catch (e) {}
    try { await mongoose.connection.collection('prescriptions').drop(); } catch (e) {}
    try { await mongoose.connection.collection('beds').drop(); } catch (e) {}
    try { await mongoose.connection.collection('bills').drop(); } catch (e) {}

    // 1. Create 1 Admin
    console.log('👤 Creating Admin user...');
    const admin = await User.create({
      name: 'System Admin',
      email: 'admin@caresync.com',
      password: 'Admin@123',
      role: 'ADMIN',
      phone: '9999000001',
    });

    // 2. Create 2 Doctors
    console.log('🩺 Creating 2 Doctors...');
    const docUser1 = await User.create({
      name: 'Dr. Rahul Sharma',
      email: 'doctor1@caresync.com',
      password: 'Doctor@123',
      role: 'DOCTOR',
      phone: '9999000002',
    });
    const docUser2 = await User.create({
      name: 'Dr. Priya Singh',
      email: 'doctor2@caresync.com',
      password: 'Doctor@123',
      role: 'DOCTOR',
      phone: '9999000003',
    });

    const doc1 = await Doctor.create({
      user: docUser1._id,
      specialization: 'Cardiology',
      experience: 12,
      qualification: 'MBBS, MD (Cardiology)',
      consultationFee: 800,
      availability: true,
    });
    const doc2 = await Doctor.create({
      user: docUser2._id,
      specialization: 'Neurology',
      experience: 9,
      qualification: 'MBBS, DM (Neurology)',
      consultationFee: 900,
      availability: true,
    });

    // 3. Create 2 Receptionists
    console.log('🏥 Creating 2 Receptionists...');
    const recUser1 = await User.create({
      name: 'Neha Gupta',
      email: 'receptionist@caresync.com',
      password: 'Staff@123',
      role: 'RECEPTIONIST',
      phone: '9999000004',
    });
    const recUser2 = await User.create({
      name: 'Pooja Verma',
      email: 'receptionist2@caresync.com',
      password: 'Staff@123',
      role: 'RECEPTIONIST',
      phone: '9999000005',
    });

    // 4. Create 5 Patients
    console.log('🧑 Creating 5 Patients...');
    const patientUsers = await Promise.all([
      User.create({ name: 'Raj Kumar', email: 'patient1@caresync.com', password: 'Patient@123', role: 'PATIENT', phone: '9876500001' }),
      User.create({ name: 'Sunita Devi', email: 'patient2@caresync.com', password: 'Patient@123', role: 'PATIENT', phone: '9876500002' }),
      User.create({ name: 'Amit Patel', email: 'patient3@caresync.com', password: 'Patient@123', role: 'PATIENT', phone: '9876500003' }),
      User.create({ name: 'Meera Nair', email: 'patient4@caresync.com', password: 'Patient@123', role: 'PATIENT', phone: '9876500004' }),
      User.create({ name: 'Vikram Singh', email: 'patient5@caresync.com', password: 'Patient@123', role: 'PATIENT', phone: '9876500005' }),
    ]);

    const patients = await Promise.all([
      Patient.create({ user: patientUsers[0]._id, gender: 'Male', bloodGroup: 'O+', address: 'New Delhi', medicalHistory: ['Hypertension'] }),
      Patient.create({ user: patientUsers[1]._id, gender: 'Female', bloodGroup: 'B+', address: 'Mumbai', medicalHistory: ['Migraine'] }),
      Patient.create({ user: patientUsers[2]._id, gender: 'Male', bloodGroup: 'A+', address: 'Ahmedabad', medicalHistory: ['Asthma'] }),
      Patient.create({ user: patientUsers[3]._id, gender: 'Female', bloodGroup: 'AB+', address: 'Bengaluru', medicalHistory: [] }),
      Patient.create({ user: patientUsers[4]._id, gender: 'Male', bloodGroup: 'O-', address: 'Kolkata', medicalHistory: ['Type 2 Diabetes'] }),
    ]);

    // 5. Create 20 Beds (5 per floor across 4 floors)
    console.log('🛏️ Creating 20 Ward Beds across 4 Floors...');
    const floorTypes = { 1: 'General', 2: 'ICU', 3: 'Private', 4: 'Semi-Private' };
    const beds = [];

    for (let floor = 1; floor <= 4; floor++) {
      for (let num = 1; num <= 5; num++) {
        const bedNumber = `${floor}0${num}`;
        const isOccupied = floor === 1 && num === 1; // 1 bed occupied as demo
        beds.push({
          bedNumber,
          floor,
          room: `Ward-${floor}`,
          type: floorTypes[floor],
          status: isOccupied ? 'OCCUPIED' : num === 5 ? 'MAINTENANCE' : 'AVAILABLE',
          patient: isOccupied ? patientUsers[0]._id : null,
          assignedAt: isOccupied ? new Date() : null,
        });
      }
    }
    const createdBeds = await Bed.insertMany(beds);

    // 6. Create 10 Appointments
    console.log('📅 Creating 10 Appointments...');
    const appointmentsData = [
      { patient: patientUsers[0]._id, doctor: docUser1._id, date: new Date(), time: '09:30 AM', reason: 'High blood pressure checkup', status: 'CONFIRMED' },
      { patient: patientUsers[1]._id, doctor: docUser2._id, date: new Date(), time: '10:00 AM', reason: 'Persistent migraine headache', status: 'CONFIRMED' },
      { patient: patientUsers[2]._id, doctor: docUser1._id, date: new Date(), time: '11:00 AM', reason: 'Chest tightness evaluation', status: 'COMPLETED' },
      { patient: patientUsers[3]._id, doctor: docUser2._id, date: new Date(), time: '11:30 AM', reason: 'Nerve numbness in fingers', status: 'PENDING' },
      { patient: patientUsers[4]._id, doctor: docUser1._id, date: new Date(), time: '02:00 PM', reason: 'ECG Review and cardiac check', status: 'PENDING' },
      { patient: patientUsers[0]._id, doctor: docUser2._id, date: new Date(Date.now() + 86400000), time: '10:00 AM', reason: 'Follow-up consultation', status: 'CONFIRMED' },
      { patient: patientUsers[1]._id, doctor: docUser1._id, date: new Date(Date.now() + 86400000), time: '11:00 AM', reason: 'Routine heart check', status: 'PENDING' },
      { patient: patientUsers[2]._id, doctor: docUser2._id, date: new Date(Date.now() + 172800000), time: '03:00 PM', reason: 'Sleep disorder review', status: 'CONFIRMED' },
      { patient: patientUsers[3]._id, doctor: docUser1._id, date: new Date(Date.now() - 86400000), time: '04:00 PM', reason: 'Post-op review', status: 'COMPLETED' },
      { patient: patientUsers[4]._id, doctor: docUser2._id, date: new Date(Date.now() - 172800000), time: '05:00 PM', reason: 'Dizziness and vertigo', status: 'COMPLETED' },
    ];
    const createdAppointments = await Appointment.insertMany(appointmentsData);

    // 7. Create 10 Prescriptions
    console.log('💊 Creating 10 Prescriptions...');
    const prescriptions = [];
    for (let i = 0; i < 10; i++) {
      const pIdx = i % 5;
      const dIdx = i % 2;
      const docUser = dIdx === 0 ? docUser1 : docUser2;
      prescriptions.push({
        patient: patientUsers[pIdx]._id,
        doctor: docUser._id,
        appointment: createdAppointments[i]._id,
        diagnosis: i % 2 === 0 ? 'Essential Hypertension & Tachycardia' : 'Migraine & Tension Headache',
        medicines: [
          { name: 'Amlodipine 5mg', dosage: '5mg', frequency: '1-0-0', duration: '30 Days', instructions: 'After breakfast' },
          { name: 'Paracetamol 500mg', dosage: '500mg', frequency: '1-0-1', duration: '5 Days', instructions: 'After meals' },
          { name: 'Pantoprazole 40mg', dosage: '40mg', frequency: '1-0-0', duration: '15 Days', instructions: 'Before food' },
        ],
        instructions: 'Monitor blood pressure twice daily. Maintain low salt diet.',
        notes: 'Follow up in 30 days if symptoms persist.',
        verificationHash: `caresync-rx-hash-${i}-${Date.now()}`,
      });
    }
    await Prescription.insertMany(prescriptions);

    // 8. Create 5 Bills
    console.log('💵 Creating 5 Bills...');
    const billsData = [
      {
        patient: patientUsers[0]._id,
        appointment: createdAppointments[0]._id,
        bed: createdBeds[0]._id,
        appointmentCharge: 800,
        bedCharge: 1500,
        otherServices: [{ name: 'ECG Test', amount: 500 }, { name: 'Blood Panel', amount: 700 }],
        discount: 200,
        tax: 150,
        totalAmount: 3450,
        paymentStatus: 'PAID',
        paidAt: new Date(),
        paymentMethod: 'Credit Card',
      },
      {
        patient: patientUsers[1]._id,
        appointment: createdAppointments[1]._id,
        appointmentCharge: 900,
        bedCharge: 0,
        otherServices: [{ name: 'MRI Brain Scan', amount: 4500 }],
        discount: 500,
        tax: 250,
        totalAmount: 5150,
        paymentStatus: 'PAID',
        paidAt: new Date(),
        paymentMethod: 'UPI',
      },
      {
        patient: patientUsers[2]._id,
        appointment: createdAppointments[2]._id,
        appointmentCharge: 800,
        bedCharge: 0,
        otherServices: [{ name: 'Chest X-Ray', amount: 600 }],
        discount: 100,
        tax: 50,
        totalAmount: 1350,
        paymentStatus: 'PAID',
        paidAt: new Date(),
        paymentMethod: 'Cash',
      },
      {
        patient: patientUsers[3]._id,
        appointment: createdAppointments[3]._id,
        appointmentCharge: 900,
        bedCharge: 0,
        otherServices: [{ name: 'Blood Sugar Fasting', amount: 300 }],
        discount: 0,
        tax: 50,
        totalAmount: 1250,
        paymentStatus: 'UNPAID',
      },
      {
        patient: patientUsers[4]._id,
        appointment: createdAppointments[4]._id,
        appointmentCharge: 800,
        bedCharge: 0,
        otherServices: [{ name: 'Lipid Profile', amount: 650 }],
        discount: 50,
        tax: 50,
        totalAmount: 1450,
        paymentStatus: 'UNPAID',
      },
    ];
    await Bill.insertMany(billsData);

    console.log('✅ DATABASE SEED COMPLETE!');
    console.log('----------------------------------------------------');
    console.log('📋 DEMO CREDENTIALS:');
    console.log('👑 Admin:        admin@caresync.com        / Admin@123');
    console.log('🩺 Doctor 1:     doctor1@caresync.com      / Doctor@123');
    console.log('🩺 Doctor 2:     doctor2@caresync.com      / Doctor@123');
    console.log('🏥 Receptionist: receptionist@caresync.com / Staff@123');
    console.log('🧑 Patient 1:    patient1@caresync.com     / Patient@123');
    console.log('----------------------------------------------------');

    process.exit(0);
  } catch (err) {
    console.error('❌ Database seed error:', err);
    process.exit(1);
  }
};

seedData();
