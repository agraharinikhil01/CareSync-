const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const User = require('../models/User');
const DoctorProfile = require('../models/DoctorProfile');
const PatientProfile = require('../models/PatientProfile');
const Bed = require('../models/Bed');

const connectDB = require('../config/db');

const seed = async () => {
  await connectDB();

  // Drop old collections to ensure old schema indexes (like userId_1) are cleared
  try { await mongoose.connection.collection('users').drop(); } catch (e) {}
  try { await mongoose.connection.collection('doctorprofiles').drop(); } catch (e) {}
  try { await mongoose.connection.collection('patientprofiles').drop(); } catch (e) {}
  try { await mongoose.connection.collection('beds').drop(); } catch (e) {}
  try { await mongoose.connection.collection('appointments').drop(); } catch (e) {}
  try { await mongoose.connection.collection('bills').drop(); } catch (e) {}
  try { await mongoose.connection.collection('prescriptions').drop(); } catch (e) {}
  console.log('🧹 Cleared all existing collections & stale indexes');

  // Create Admin
  const admin = await User.create({ name: 'Admin User', email: 'admin@caresync.com', password: 'Admin@123', role: 'admin', phone: '9999000001' });

  // Create Doctors
  const doc1 = await User.create({ name: 'Dr. Rahul Sharma', email: 'doctor1@caresync.com', password: 'Doctor@123', role: 'doctor', phone: '9999000002', gender: 'Male', age: 40 });
  const doc2 = await User.create({ name: 'Dr. Priya Singh', email: 'doctor2@caresync.com', password: 'Doctor@123', role: 'doctor', phone: '9999000003', gender: 'Female', age: 35 });
  const doc3 = await User.create({ name: 'Dr. Amit Verma', email: 'doctor3@caresync.com', password: 'Doctor@123', role: 'doctor', phone: '9999000004', gender: 'Male', age: 45 });

  await DoctorProfile.create({ user: doc1._id, specialization: 'Cardiology', department: 'Heart', consultationFee: 800 });
  await DoctorProfile.create({ user: doc2._id, specialization: 'Neurology', department: 'Brain', consultationFee: 900 });
  await DoctorProfile.create({ user: doc3._id, specialization: 'Orthopedics', department: 'Bones', consultationFee: 700 });

  // Create Receptionist
  const receptionist = await User.create({ name: 'Neha Gupta', email: 'receptionist@caresync.com', password: 'Staff@123', role: 'receptionist', phone: '9999000005' });

  // Create Patients
  const pat1 = await User.create({ name: 'Raj Kumar', email: 'patient1@caresync.com', password: 'Patient@123', role: 'patient', phone: '9999000006', gender: 'Male', age: 30, bloodGroup: 'O+' });
  const pat2 = await User.create({ name: 'Sunita Devi', email: 'patient2@caresync.com', password: 'Patient@123', role: 'patient', phone: '9999000007', gender: 'Female', age: 25, bloodGroup: 'B+' });

  await PatientProfile.create({ user: pat1._id, bloodGroup: 'O+', allergies: ['Penicillin'] });
  await PatientProfile.create({ user: pat2._id, bloodGroup: 'B+' });

  // Seed 40 Beds across 4 floors
  const wards = { 1: 'General Ward', 2: 'ICU', 3: 'Private Ward', 4: 'Semi-Private' };
  const types = { 1: 'General', 2: 'ICU', 3: 'Private', 4: 'Semi-Private' };
  const beds = [];
  for (let floor = 1; floor <= 4; floor++) {
    for (let num = 1; num <= 10; num++) {
      beds.push({ bedNumber: `${floor}0${num}`, floor, ward: wards[floor], type: types[floor] });
    }
  }
  await Bed.insertMany(beds);

  console.log('✅ Seed complete!');
  console.log('');
  console.log('📋 Demo Login Credentials:');
  console.log('👑 Admin        → admin@caresync.com     / Admin@123');
  console.log('🩺 Doctor 1     → doctor1@caresync.com   / Doctor@123');
  console.log('🩺 Doctor 2     → doctor2@caresync.com   / Doctor@123');
  console.log('🏥 Receptionist → receptionist@caresync.com / Staff@123');
  console.log('🧑 Patient 1    → patient1@caresync.com  / Patient@123');
  console.log('🧑 Patient 2    → patient2@caresync.com  / Patient@123');

  process.exit(0);
};

seed().catch(err => { console.error(err); process.exit(1); });
