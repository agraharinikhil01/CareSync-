const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const DoctorProfile = require('../models/DoctorProfile');
const PatientProfile = require('../models/PatientProfile');
const Appointment = require('../models/Appointment');
const Prescription = require('../models/Prescription');
const Billing = require('../models/Billing');
const Bed = require('../models/Bed');

dotenv.config({ path: __dirname + '/../.env' });

const seedDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/hospital_management';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB for Seeding...');

    // Clear existing data
    await User.deleteMany();
    await DoctorProfile.deleteMany();
    await PatientProfile.deleteMany();
    await Appointment.deleteMany();
    await Prescription.deleteMany();
    await Billing.deleteMany();
    await Bed.deleteMany();
    console.log('Cleared existing collections.');

    // 1. Create Admin
    const admin = await User.create({
      name: 'Dr. Robert Vance (Chief Admin)',
      email: 'admin@hospital.com',
      password: 'Admin@123',
      role: 'admin',
      phone: '+1 (555) 019-2834',
    });

    // 2. Create Receptionist / Billing Staff
    const receptionist = await User.create({
      name: 'Sarah Jenkins',
      email: 'receptionist@hospital.com',
      password: 'Staff@123',
      role: 'receptionist',
      phone: '+1 (555) 014-9821',
    });

    // 3. Create Doctors
    const doc1User = await User.create({
      name: 'Dr. Rajesh Sharma',
      email: 'doctor.sharma@hospital.com',
      password: 'Doctor@123',
      role: 'doctor',
      phone: '+1 (555) 018-3412',
    });

    const doc1Profile = await DoctorProfile.create({
      userId: doc1User._id,
      specialization: 'Cardiologist',
      department: 'Cardiology & Heart Care',
      qualifications: ['MD (Cardiology)', 'MBBS', 'FACC'],
      experienceYears: 14,
      consultationFee: 800,
      roomNumber: 'Cardio Suite 204',
      biography: 'Senior Interventional Cardiologist specializing in adult cardiac care and angioplasty.',
      availableSlots: [
        { day: 'Monday', startTime: '09:00', endTime: '16:00' },
        { day: 'Wednesday', startTime: '09:00', endTime: '16:00' },
        { day: 'Friday', startTime: '09:00', endTime: '16:00' },
      ],
    });

    const doc2User = await User.create({
      name: 'Dr. Emily Watson',
      email: 'doctor.watson@hospital.com',
      password: 'Doctor@123',
      role: 'doctor',
      phone: '+1 (555) 012-7744',
    });

    const doc2Profile = await DoctorProfile.create({
      userId: doc2User._id,
      specialization: 'Neurologist',
      department: 'Neurology & Brain Institute',
      qualifications: ['DM (Neurology)', 'MBBS'],
      experienceYears: 10,
      consultationFee: 950,
      roomNumber: 'Neuro Care 302',
      biography: 'Expert in cognitive disorders, stroke management, and chronic migraines.',
      availableSlots: [
        { day: 'Tuesday', startTime: '10:00', endTime: '17:00' },
        { day: 'Thursday', startTime: '10:00', endTime: '17:00' },
        { day: 'Saturday', startTime: '10:00', endTime: '14:00' },
      ],
    });

    const doc3User = await User.create({
      name: 'Dr. Ananya Iyer',
      email: 'doctor.ananya@hospital.com',
      password: 'Doctor@123',
      role: 'doctor',
      phone: '+1 (555) 017-5521',
    });

    const doc3Profile = await DoctorProfile.create({
      userId: doc3User._id,
      specialization: 'Pediatrician',
      department: 'Pediatrics & Child Care',
      qualifications: ['MD (Pediatrics)', 'DCH'],
      experienceYears: 8,
      consultationFee: 600,
      roomNumber: 'Pediatric Wing 105',
      biography: 'Dedicated pediatric specialist focused on child growth, nutrition, and neonatal care.',
      availableSlots: [
        { day: 'Monday', startTime: '08:30', endTime: '15:00' },
        { day: 'Wednesday', startTime: '08:30', endTime: '15:00' },
        { day: 'Friday', startTime: '08:30', endTime: '15:00' },
      ],
    });

    // 4. Create Patients
    const patient1User = await User.create({
      name: 'Rahul Verma',
      email: 'patient.rahul@gmail.com',
      password: 'Patient@123',
      role: 'patient',
      phone: '+1 (555) 093-1102',
    });

    const patient1Profile = await PatientProfile.create({
      userId: patient1User._id,
      age: 38,
      gender: 'Male',
      bloodGroup: 'B+',
      emergencyContact: {
        name: 'Sunita Verma',
        phone: '+1 (555) 093-1109',
        relationship: 'Spouse',
      },
      address: {
        street: '42 Greenway Blvd',
        city: 'Metropolis',
        state: 'NY',
        zipCode: '10001',
      },
      allergies: ['Penicillin', 'Sulfa drugs'],
      medicalHistory: [
        {
          condition: 'Hypertension Stage 1',
          diagnosedDate: new Date('2024-01-15'),
          notes: 'Advised low sodium diet and regular aerobic activity',
          treatedBy: 'Dr. Rajesh Sharma',
        },
      ],
    });

    const patient2User = await User.create({
      name: 'Priya Patel',
      email: 'patient.priya@gmail.com',
      password: 'Patient@123',
      role: 'patient',
      phone: '+1 (555) 088-2911',
    });

    const patient2Profile = await PatientProfile.create({
      userId: patient2User._id,
      age: 29,
      gender: 'Female',
      bloodGroup: 'O+',
      emergencyContact: {
        name: 'Amit Patel',
        phone: '+1 (555) 088-2919',
        relationship: 'Brother',
      },
      address: {
        street: '120 Pinecrest Ave',
        city: 'Metropolis',
        state: 'NY',
        zipCode: '10003',
      },
      allergies: ['Dust mites'],
      medicalHistory: [
        {
          condition: 'Migraine with aura',
          diagnosedDate: new Date('2024-03-20'),
          notes: 'Frequent headaches triggered by fatigue',
          treatedBy: 'Dr. Emily Watson',
        },
      ],
    });

    // 5. Create Beds
    const beds = await Bed.insertMany([
      {
        bedNumber: 'ICU-101',
        type: 'ICU',
        ward: 'Floor 3 - Critical Care ICU',
        isOccupied: true,
        patientId: patient1User._id,
        assignedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        dailyRate: 4500,
        features: ['24/7 Multi-para Monitor', 'Ventilator Backup', 'Oxygen Pipeline', 'Defibrillator Access'],
      },
      {
        bedNumber: 'ICU-102',
        type: 'ICU',
        ward: 'Floor 3 - Critical Care ICU',
        isOccupied: false,
        dailyRate: 4500,
        features: ['24/7 Multi-para Monitor', 'Ventilator Backup', 'Oxygen Pipeline'],
      },
      {
        bedNumber: 'WARD-201',
        type: 'General Ward',
        ward: 'Floor 2 - East Wing Ward',
        isOccupied: false,
        dailyRate: 1200,
        features: ['Nurse Call Button', 'Adjustable Bed', 'Overbed Table'],
      },
      {
        bedNumber: 'WARD-202',
        type: 'General Ward',
        ward: 'Floor 2 - East Wing Ward',
        isOccupied: false,
        dailyRate: 1200,
        features: ['Nurse Call Button', 'Adjustable Bed', 'Overbed Table'],
      },
      {
        bedNumber: 'PRIV-301',
        type: 'Private Room',
        ward: 'Floor 4 - Executive Suite',
        isOccupied: true,
        patientId: patient2User._id,
        assignedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        dailyRate: 3000,
        features: ['Private Bathroom', 'Attendant Sofa Bed', 'Smart TV', 'Wi-Fi', 'Individual AC'],
      },
      {
        bedNumber: 'PRIV-302',
        type: 'Private Room',
        ward: 'Floor 4 - Executive Suite',
        isOccupied: false,
        dailyRate: 3000,
        features: ['Private Bathroom', 'Attendant Sofa Bed', 'Smart TV', 'Wi-Fi'],
      },
      {
        bedNumber: 'EMERG-01',
        type: 'Emergency',
        ward: 'Ground Floor - Trauma Center',
        isOccupied: false,
        dailyRate: 2000,
        features: ['Rapid Response Kit', 'Oxygen Supply', 'Suction Machine'],
      },
    ]);

    // 6. Create Appointments
    const app1 = await Appointment.create({
      patientId: patient1User._id,
      doctorId: doc1User._id,
      date: new Date(),
      timeSlot: '10:00 AM',
      status: 'Confirmed',
      reason: 'Chest tightness and mild palpitation during morning walks',
      type: 'General Consultation',
      notes: 'Patient requested Dr. Sharma for cardiac consultation',
    });

    const app2 = await Appointment.create({
      patientId: patient2User._id,
      doctorId: doc2User._id,
      date: new Date(),
      timeSlot: '11:30 AM',
      status: 'Pending',
      reason: 'Recurring throbbing headaches on the right temple with light sensitivity',
      type: 'Follow-up',
    });

    const app3 = await Appointment.create({
      patientId: patient1User._id,
      doctorId: doc3User._id,
      date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      timeSlot: '02:00 PM',
      status: 'Completed',
      reason: 'Pediatric checkup for toddler',
      type: 'Routine Checkup',
    });

    // 7. Create Prescriptions
    const presc1 = await Prescription.create({
      appointmentId: app3._id,
      doctorId: doc3User._id,
      patientId: patient1User._id,
      diagnosis: 'Seasonal Viral Pharyngitis & Mild Upper Respiratory Infection',
      symptoms: 'Fever (100.4 F), sore throat, slight dry cough',
      medicines: [
        {
          name: 'Paracetamol Suspension (120mg/5ml)',
          dosage: '5 ml',
          frequency: 'Thrice a day as needed',
          duration: '3 days',
          instructions: 'After meals when temperature exceeds 99.5 F',
        },
        {
          name: 'Cetirizine Syrup (5mg/5ml)',
          dosage: '2.5 ml',
          frequency: 'Once daily at night',
          duration: '5 days',
          instructions: 'Before bedtime',
        },
      ],
      tests: ['Complete Blood Count (CBC) if fever persists > 3 days'],
      advice: 'Ensure adequate oral hydration, warm salt water gargle, and rest.',
      date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    });

    // 8. Create Invoices
    await Billing.create({
      invoiceNumber: 'INV-100201',
      patientId: patient1User._id,
      doctorId: doc3User._id,
      appointmentId: app3._id,
      items: [
        {
          description: 'Consultation Fee - Dr. Ananya Iyer (Pediatrics)',
          quantity: 1,
          unitPrice: 600,
          amount: 600,
        },
        {
          description: 'Pediatric Health Wellness Charting',
          quantity: 1,
          unitPrice: 150,
          amount: 150,
        },
      ],
      subTotal: 750,
      taxAmount: 38,
      discountAmount: 0,
      totalAmount: 788,
      paymentStatus: 'Paid',
      paymentMethod: 'UPI/Online',
      transactionId: 'TXN-984729104',
      invoiceDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    });

    await Billing.create({
      invoiceNumber: 'INV-100202',
      patientId: patient1User._id,
      doctorId: doc1User._id,
      appointmentId: app1._id,
      items: [
        {
          description: 'Cardiology Consultation - Dr. Rajesh Sharma',
          quantity: 1,
          unitPrice: 800,
          amount: 800,
        },
        {
          description: 'ICU Bed Charges (2 Days @ $4500/day)',
          quantity: 2,
          unitPrice: 4500,
          amount: 9000,
        },
      ],
      subTotal: 9800,
      taxAmount: 490,
      discountAmount: 290,
      totalAmount: 10000,
      paymentStatus: 'Pending',
      paymentMethod: 'Pending Selection',
      invoiceDate: new Date(),
    });

    console.log('====================================================');
    console.log('✅ DATABASE SEEDING COMPLETED SUCCESSFULLY!');
    console.log('====================================================');
    console.log('Sample Demo Accounts:');
    console.log('1. Admin:         admin@hospital.com         | Admin@123');
    console.log('2. Doctor:        doctor.sharma@hospital.com | Doctor@123');
    console.log('3. Receptionist:  receptionist@hospital.com  | Staff@123');
    console.log('4. Patient:       patient.rahul@gmail.com    | Patient@123');
    console.log('====================================================');

    process.exit(0);
  } catch (error) {
    console.error('Seeding Error:', error);
    process.exit(1);
  }
};

seedDB();
