const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
const connectDB = require('../config/db');
const User = require('../models/User');
const Hospital = require('../models/Hospital');

const INDIA_HOSPITALS = [
  // --- DELHI NCR ---
  {
    name: 'All India Institute of Medical Sciences (AIIMS)',
    email: 'info@aiims.edu',
    phone: '+91 11 2658 8500',
    emergencyPhone: '+91 11 2658 9999',
    address: 'Sri Aurobindo Marg, Ansari Nagar East',
    city: 'New Delhi',
    state: 'Delhi',
    pincode: '110029',
    location: { type: 'Point', coordinates: [77.2090, 28.5672] },
    hospitalType: 'Government / Apex',
    verificationStatus: 'VERIFIED',
    emergencyAvailable: true,
    ambulanceAvailable: true,
    bloodBankAvailable: true,
    operatingHours: '24/7 Open',
    departments: ['Cardiology', 'Neurology', 'Orthopedics', 'Pediatrics', 'Emergency Medicine', 'Oncology', 'Nephrology', 'Pulmonology'],
    services: ['Level 1 Trauma', 'Cath Lab', 'MRI 3T', 'Robotic Surgery', 'Organ Transplant', 'Blood Bank'],
    capacitySummary: {
      general: { total: 450, available: 48 },
      icu: { total: 60, available: 8 },
      emergency: { total: 30, available: 7 }
    },
    rating: 4.9,
    totalReviews: 1250,
    isDemo: true
  },
  {
    name: 'Safdarjung Hospital & VMMC',
    email: 'contact@safdarjunghospital.gov.in',
    phone: '+91 11 2616 5060',
    emergencyPhone: '+91 11 2616 8888',
    address: 'Ring Road, Opposite AIIMS, Ansari Nagar West',
    city: 'New Delhi',
    state: 'Delhi',
    pincode: '110029',
    location: { type: 'Point', coordinates: [77.2065, 28.5694] },
    hospitalType: 'Government',
    verificationStatus: 'VERIFIED',
    emergencyAvailable: true,
    ambulanceAvailable: true,
    bloodBankAvailable: true,
    operatingHours: '24/7 Open',
    departments: ['Emergency Medicine', 'General Surgery', 'Burns & Plastic Surgery', 'Pediatrics', 'Orthopedics'],
    services: ['Regional Burn Center', 'Trauma ICU', 'Hemodialysis', '24/7 Blood Bank'],
    capacitySummary: {
      general: { total: 320, available: 25 },
      icu: { total: 45, available: 4 },
      emergency: { total: 25, available: 5 }
    },
    rating: 4.6,
    totalReviews: 820,
    isDemo: true
  },
  {
    name: 'Max Super Speciality Hospital Saket',
    email: 'care@maxhealthcare.com',
    phone: '+91 11 2651 5050',
    emergencyPhone: '+91 11 4055 4055',
    address: '1, 2 Press Enclave Marg, Saket',
    city: 'New Delhi',
    state: 'Delhi',
    pincode: '110017',
    location: { type: 'Point', coordinates: [77.2135, 28.5283] },
    hospitalType: 'Super-Specialty',
    verificationStatus: 'VERIFIED',
    emergencyAvailable: true,
    ambulanceAvailable: true,
    bloodBankAvailable: true,
    operatingHours: '24/7 Open',
    departments: ['Cardiology', 'Oncology', 'Neurosciences', 'Orthopedics', 'Obstetrics & Gynecology'],
    services: ['Da Vinci Robotic Surgery', 'TrueBeam Radiotherapy', 'Advanced Cath Lab', 'Air Ambulance'],
    capacitySummary: {
      general: { total: 280, available: 38 },
      icu: { total: 40, available: 6 },
      emergency: { total: 20, available: 4 }
    },
    rating: 4.8,
    totalReviews: 940,
    isDemo: true
  },
  {
    name: 'Medanta - The Medicity',
    email: 'info@medanta.org',
    phone: '+91 124 414 1414',
    emergencyPhone: '+91 124 414 9999',
    address: 'CH Bakhtawar Singh Road, Sector 38',
    city: 'Gurugram',
    state: 'Haryana',
    pincode: '122001',
    location: { type: 'Point', coordinates: [77.0422, 28.4395] },
    hospitalType: 'Super-Specialty',
    verificationStatus: 'VERIFIED',
    emergencyAvailable: true,
    ambulanceAvailable: true,
    bloodBankAvailable: true,
    operatingHours: '24/7 Open',
    departments: ['Heart Institute', 'Cancer Institute', 'Neurosciences', 'Liver Transplant', 'Critical Care'],
    services: ['CyberKnife', 'Hybrid OT', 'Liver & Heart Transplant', 'Level 1 Trauma'],
    capacitySummary: {
      general: { total: 350, available: 65 },
      icu: { total: 55, available: 12 },
      emergency: { total: 25, available: 8 }
    },
    rating: 4.9,
    totalReviews: 1100,
    isDemo: true
  },
  {
    name: 'Jaypee Hospital Noida',
    email: 'helpdesk@jaypeehealthcare.com',
    phone: '+91 120 412 2222',
    emergencyPhone: '+91 120 412 9999',
    address: 'Sector 128, Wish Town, Expressway',
    city: 'Noida',
    state: 'Uttar Pradesh',
    pincode: '201304',
    location: { type: 'Point', coordinates: [77.3688, 28.5147] },
    hospitalType: 'Super-Specialty',
    verificationStatus: 'VERIFIED',
    emergencyAvailable: true,
    ambulanceAvailable: true,
    bloodBankAvailable: true,
    operatingHours: '24/7 Open',
    departments: ['Cardiac Sciences', 'Orthopedics', 'Neurosciences', 'Nephrology', 'Critical Care'],
    services: ['Biplane Cath Lab', 'Dialysis 24/7', 'Trauma ICU', 'Emergency Ambulance'],
    capacitySummary: {
      general: { total: 200, available: 42 },
      icu: { total: 30, available: 7 },
      emergency: { total: 15, available: 6 }
    },
    rating: 4.7,
    totalReviews: 610,
    isDemo: true
  },

  // --- UTTAR PRADESH (UP) ---
  {
    name: "King George's Medical University (KGMU)",
    email: 'info@kgmcindia.edu',
    phone: '+91 522 225 7540',
    emergencyPhone: '+91 522 225 8888',
    address: 'Shah Mina Road, Chowk',
    city: 'Lucknow',
    state: 'Uttar Pradesh',
    pincode: '226003',
    location: { type: 'Point', coordinates: [80.9168, 26.8688] },
    hospitalType: 'Government / University Hospital',
    verificationStatus: 'VERIFIED',
    emergencyAvailable: true,
    ambulanceAvailable: true,
    bloodBankAvailable: true,
    operatingHours: '24/7 Open',
    departments: ['Trauma Surgery', 'Cardiology', 'Neurology', 'Pediatrics', 'Obstetrics & Gynecology', 'General Medicine'],
    services: ['State Trauma Center', 'Ventilator ICU', '24/7 Pharmacy', 'Rotary Blood Bank'],
    capacitySummary: {
      general: { total: 380, available: 52 },
      icu: { total: 50, available: 9 },
      emergency: { total: 35, available: 11 }
    },
    rating: 4.8,
    totalReviews: 1420,
    isDemo: true
  },
  {
    name: 'SGPGI (Sanjay Gandhi Postgraduate Institute)',
    email: 'director@sgpgi.ac.in',
    phone: '+91 522 266 8004',
    emergencyPhone: '+91 522 266 8700',
    address: 'Raebareli Road',
    city: 'Lucknow',
    state: 'Uttar Pradesh',
    pincode: '226014',
    location: { type: 'Point', coordinates: [80.9422, 26.7485] },
    hospitalType: 'Government / Autonomous',
    verificationStatus: 'VERIFIED',
    emergencyAvailable: true,
    ambulanceAvailable: true,
    bloodBankAvailable: true,
    operatingHours: '24/7 Open',
    departments: ['Endocrinology', 'Gastroenterology', 'Cardiology', 'Nephrology', 'Medical Genetics', 'Neurology'],
    services: ['Apex Trauma Center', 'Kidney & Liver Transplant', 'Interventional Radiology', 'Advanced ICU'],
    capacitySummary: {
      general: { total: 300, available: 45 },
      icu: { total: 45, available: 7 },
      emergency: { total: 20, available: 5 }
    },
    rating: 4.9,
    totalReviews: 980,
    isDemo: true
  },
  {
    name: 'Medanta Super Specialty Hospital Lucknow',
    email: 'info.lucknow@medanta.org',
    phone: '+91 522 450 5050',
    emergencyPhone: '+91 522 450 9999',
    address: 'Sector B, Pocket 1, Amar Shaheed Path',
    city: 'Lucknow',
    state: 'Uttar Pradesh',
    pincode: '226030',
    location: { type: 'Point', coordinates: [80.9852, 26.7931] },
    hospitalType: 'Super-Specialty',
    verificationStatus: 'VERIFIED',
    emergencyAvailable: true,
    ambulanceAvailable: true,
    bloodBankAvailable: true,
    operatingHours: '24/7 Open',
    departments: ['Heart Institute', 'Cancer Institute', 'Neurosciences', 'Orthopedics', 'Critical Care'],
    services: ['Cath Lab 24/7', 'Linear Accelerator', 'NICU/PICU', 'Emergency Ambulance'],
    capacitySummary: {
      general: { total: 240, available: 36 },
      icu: { total: 35, available: 8 },
      emergency: { total: 18, available: 6 }
    },
    rating: 4.8,
    totalReviews: 540,
    isDemo: true
  },
  {
    name: 'Sir Sunderlal Hospital (IMS BHU)',
    email: 'medicalsuperintendent@bhu.ac.in',
    phone: '+91 542 236 8555',
    emergencyPhone: '+91 542 236 9999',
    address: 'Banaras Hindu University Campus, Lanka',
    city: 'Varanasi',
    state: 'Uttar Pradesh',
    pincode: '221005',
    location: { type: 'Point', coordinates: [82.9995, 25.2677] },
    hospitalType: 'Government / Central University',
    verificationStatus: 'VERIFIED',
    emergencyAvailable: true,
    ambulanceAvailable: true,
    bloodBankAvailable: true,
    operatingHours: '24/7 Open',
    departments: ['General Medicine', 'Cardiology', 'General Surgery', 'Pediatrics', 'Trauma Center', 'Ayurveda & Modern Medicine'],
    services: ['Apex Trauma Center Eastern UP', 'Dialysis Center', 'Component Blood Bank', 'Free Triage'],
    capacitySummary: {
      general: { total: 350, available: 58 },
      icu: { total: 40, available: 6 },
      emergency: { total: 25, available: 9 }
    },
    rating: 4.7,
    totalReviews: 1200,
    isDemo: true
  },
  {
    name: 'Heritage Hospitals Lanka',
    email: 'contact@heritagehospitals.com',
    phone: '+91 542 236 8888',
    emergencyPhone: '+91 542 236 9111',
    address: 'Lanka, Near BHU Gate',
    city: 'Varanasi',
    state: 'Uttar Pradesh',
    pincode: '221005',
    location: { type: 'Point', coordinates: [82.9950, 25.2750] },
    hospitalType: 'Multi-Specialty',
    verificationStatus: 'VERIFIED',
    emergencyAvailable: true,
    ambulanceAvailable: true,
    bloodBankAvailable: true,
    operatingHours: '24/7 Open',
    departments: ['Cardiology', 'Orthopedics', 'Critical Care', 'Gastroenterology', 'General Surgery'],
    services: ['Cardiac ICU', 'CT/MRI Diagnostic Center', '24/7 Pharmacy', 'Emergency Ambulance'],
    capacitySummary: {
      general: { total: 160, available: 22 },
      icu: { total: 24, available: 4 },
      emergency: { total: 12, available: 3 }
    },
    rating: 4.5,
    totalReviews: 430,
    isDemo: true
  },
  {
    name: 'GSVM Medical College & Hallet Hospital',
    email: 'principal@gsvm.ac.in',
    phone: '+91 512 253 5483',
    emergencyPhone: '+91 512 253 9999',
    address: 'Swaroop Nagar',
    city: 'Kanpur',
    state: 'Uttar Pradesh',
    pincode: '208002',
    location: { type: 'Point', coordinates: [80.3167, 26.4833] },
    hospitalType: 'Government Medical College',
    verificationStatus: 'VERIFIED',
    emergencyAvailable: true,
    ambulanceAvailable: true,
    bloodBankAvailable: true,
    operatingHours: '24/7 Open',
    departments: ['Emergency Medicine', 'Cardiology', 'General Surgery', 'Orthopedics', 'Pediatrics'],
    services: ['Emergency Trauma Unit', 'Blood Bank', 'Central Pathology', 'ICU'],
    capacitySummary: {
      general: { total: 280, available: 34 },
      icu: { total: 32, available: 5 },
      emergency: { total: 20, available: 7 }
    },
    rating: 4.6,
    totalReviews: 760,
    isDemo: true
  },
  {
    name: 'Regency Hospital Sarvodaya Nagar',
    email: 'care@regencyhealthcare.in',
    phone: '+91 512 308 1111',
    emergencyPhone: '+91 512 308 9999',
    address: 'A-2, Sarvodaya Nagar',
    city: 'Kanpur',
    state: 'Uttar Pradesh',
    pincode: '208005',
    location: { type: 'Point', coordinates: [80.3015, 26.4789] },
    hospitalType: 'Super-Specialty',
    verificationStatus: 'VERIFIED',
    emergencyAvailable: true,
    ambulanceAvailable: true,
    bloodBankAvailable: true,
    operatingHours: '24/7 Open',
    departments: ['Cardiology', 'Renal Sciences', 'Oncology', 'Gastroenterology', 'Critical Care'],
    services: ['Cardiac Cath Lab', 'Hemodialysis Unit', 'Trauma Emergency', 'Modular OTs'],
    capacitySummary: {
      general: { total: 180, available: 28 },
      icu: { total: 26, available: 5 },
      emergency: { total: 14, available: 4 }
    },
    rating: 4.7,
    totalReviews: 520,
    isDemo: true
  },
  {
    name: 'AIIMS Gorakhpur',
    email: 'info@aiimsgorakhpur.edu.in',
    phone: '+91 551 220 5501',
    emergencyPhone: '+91 551 220 9999',
    address: 'Kunraghat',
    city: 'Gorakhpur',
    state: 'Uttar Pradesh',
    pincode: '273008',
    location: { type: 'Point', coordinates: [83.4215, 26.7538] },
    hospitalType: 'Government / Apex',
    verificationStatus: 'VERIFIED',
    emergencyAvailable: true,
    ambulanceAvailable: true,
    bloodBankAvailable: true,
    operatingHours: '24/7 Open',
    departments: ['General Medicine', 'General Surgery', 'Pediatrics', 'Orthopedics', 'Emergency Medicine'],
    services: ['24/7 Emergency Care', 'Advanced ICU', 'CT/MRI', 'Blood Storage Center'],
    capacitySummary: {
      general: { total: 250, available: 45 },
      icu: { total: 30, available: 6 },
      emergency: { total: 18, available: 5 }
    },
    rating: 4.8,
    totalReviews: 690,
    isDemo: true
  },
  {
    name: 'Swaroop Rani Nehru (SRN) Hospital',
    email: 'info@mlnmc.in',
    phone: '+91 532 225 6075',
    emergencyPhone: '+91 532 225 9999',
    address: 'MG Marg, George Town',
    city: 'Prayagraj',
    state: 'Uttar Pradesh',
    pincode: '211001',
    location: { type: 'Point', coordinates: [81.8540, 25.4468] },
    hospitalType: 'Government Medical College',
    verificationStatus: 'VERIFIED',
    emergencyAvailable: true,
    ambulanceAvailable: true,
    bloodBankAvailable: true,
    operatingHours: '24/7 Open',
    departments: ['Emergency Trauma', 'Cardiology', 'Orthopedics', 'General Surgery', 'Pediatrics'],
    services: ['Level 2 Trauma Center', 'Blood Bank', 'Dialysis', 'ICU'],
    capacitySummary: {
      general: { total: 260, available: 31 },
      icu: { total: 28, available: 4 },
      emergency: { total: 16, available: 5 }
    },
    rating: 4.5,
    totalReviews: 580,
    isDemo: true
  },

  // --- MAHARASHTRA ---
  {
    name: 'KEM Hospital Mumbai',
    email: 'info@kem.edu',
    phone: '+91 22 2410 7000',
    emergencyPhone: '+91 22 2413 6051',
    address: 'Acharya Donde Marg, Parel',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '400012',
    location: { type: 'Point', coordinates: [72.8436, 18.9986] },
    hospitalType: 'Government / Municipal',
    verificationStatus: 'VERIFIED',
    emergencyAvailable: true,
    ambulanceAvailable: true,
    bloodBankAvailable: true,
    operatingHours: '24/7 Open',
    departments: ['Cardiology', 'Neurology', 'Pediatrics', 'Emergency Medicine', 'Nephrology'],
    services: ['24/7 Casualty & Trauma', 'Blood Bank', 'Organ Transplant', 'ICU'],
    capacitySummary: {
      general: { total: 400, available: 42 },
      icu: { total: 50, available: 7 },
      emergency: { total: 30, available: 8 }
    },
    rating: 4.7,
    totalReviews: 1350,
    isDemo: true
  },
  {
    name: 'Lilavati Hospital & Research Centre',
    email: 'info@lilavatihospital.com',
    phone: '+91 22 2675 1000',
    emergencyPhone: '+91 22 2656 8000',
    address: 'A-791, Bandra Reclamation, Bandra West',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '400050',
    location: { type: 'Point', coordinates: [72.8295, 19.0518] },
    hospitalType: 'Super-Specialty',
    verificationStatus: 'VERIFIED',
    emergencyAvailable: true,
    ambulanceAvailable: true,
    bloodBankAvailable: true,
    operatingHours: '24/7 Open',
    departments: ['Cardiac Surgery', 'Oncology', 'Neurology', 'Orthopedics', 'Critical Care'],
    services: ['Cath Lab', 'Advanced ICU', 'Ambulance 24/7', 'Blood Bank'],
    capacitySummary: {
      general: { total: 220, available: 29 },
      icu: { total: 32, available: 5 },
      emergency: { total: 15, available: 4 }
    },
    rating: 4.8,
    totalReviews: 890,
    isDemo: true
  },
  {
    name: 'Ruby Hall Clinic',
    email: 'info@rubyhall.com',
    phone: '+91 20 6645 5100',
    emergencyPhone: '+91 20 2616 3391',
    address: '40, Sassoon Road',
    city: 'Pune',
    state: 'Maharashtra',
    pincode: '411001',
    location: { type: 'Point', coordinates: [73.8783, 18.5284] },
    hospitalType: 'Super-Specialty',
    verificationStatus: 'VERIFIED',
    emergencyAvailable: true,
    ambulanceAvailable: true,
    bloodBankAvailable: true,
    operatingHours: '24/7 Open',
    departments: ['Cardiology', 'Cancer Center', 'Neurosciences', 'Organ Transplant', 'Trauma Care'],
    services: ['Linear Accelerator', 'Coronary Care Unit', 'Trauma ICU', '24/7 Blood Bank'],
    capacitySummary: {
      general: { total: 260, available: 35 },
      icu: { total: 36, available: 6 },
      emergency: { total: 18, available: 5 }
    },
    rating: 4.8,
    totalReviews: 780,
    isDemo: true
  },

  // --- KARNATAKA ---
  {
    name: 'Manipal Hospital Old Airport Road',
    email: 'info@manipalhospitals.com',
    phone: '+91 80 2502 4444',
    emergencyPhone: '+91 80 2502 3333',
    address: '98, HAL Old Airport Road, Kodihalli',
    city: 'Bengaluru',
    state: 'Karnataka',
    pincode: '560017',
    location: { type: 'Point', coordinates: [77.6517, 12.9592] },
    hospitalType: 'Super-Specialty',
    verificationStatus: 'VERIFIED',
    emergencyAvailable: true,
    ambulanceAvailable: true,
    bloodBankAvailable: true,
    operatingHours: '24/7 Open',
    departments: ['Cardiology', 'Oncology', 'Neurology', 'Organ Transplant', 'Critical Care'],
    services: ['24/7 Emergency Care', 'Robotic Surgery', 'ECMO Support', 'Blood Bank'],
    capacitySummary: {
      general: { total: 300, available: 41 },
      icu: { total: 42, available: 8 },
      emergency: { total: 20, available: 6 }
    },
    rating: 4.8,
    totalReviews: 1150,
    isDemo: true
  },
  {
    name: 'Narayana Health City',
    email: 'info.nhcity@narayanahealth.org',
    phone: '+91 80 7122 2222',
    emergencyPhone: '+91 80 7122 2100',
    address: '258/A, Bommasandra Industrial Area, Anekal Taluk',
    city: 'Bengaluru',
    state: 'Karnataka',
    pincode: '560099',
    location: { type: 'Point', coordinates: [77.6912, 12.8126] },
    hospitalType: 'Super-Specialty',
    verificationStatus: 'VERIFIED',
    emergencyAvailable: true,
    ambulanceAvailable: true,
    bloodBankAvailable: true,
    operatingHours: '24/7 Open',
    departments: ['Cardiac Sciences', 'Cancer Care', 'Pediatric Cardiology', 'Neurology', 'Orthopedics'],
    services: ['Heart Transplant', 'Bone Marrow Transplant', 'Level 1 Trauma', '24/7 Ambulance'],
    capacitySummary: {
      general: { total: 380, available: 60 },
      icu: { total: 50, available: 11 },
      emergency: { total: 24, available: 7 }
    },
    rating: 4.9,
    totalReviews: 1480,
    isDemo: true
  },

  // --- TAMIL NADU ---
  {
    name: 'Apollo Hospitals Greams Road',
    email: 'info@apollohospitals.com',
    phone: '+91 44 2829 0200',
    emergencyPhone: '+91 44 2829 3333',
    address: '21, Greams Lane, Off Greams Road, Thousand Lights',
    city: 'Chennai',
    state: 'Tamil Nadu',
    pincode: '600006',
    location: { type: 'Point', coordinates: [80.2518, 13.0604] },
    hospitalType: 'Super-Specialty',
    verificationStatus: 'VERIFIED',
    emergencyAvailable: true,
    ambulanceAvailable: true,
    bloodBankAvailable: true,
    operatingHours: '24/7 Open',
    departments: ['Cardiology', 'Oncology', 'Organ Transplant', 'Neurology', 'Emergency Medicine'],
    services: ['Proton Therapy', 'Cardiac Cath Lab', '24/7 Trauma Unit', 'Air Ambulance'],
    capacitySummary: {
      general: { total: 340, available: 46 },
      icu: { total: 48, available: 9 },
      emergency: { total: 22, available: 7 }
    },
    rating: 4.9,
    totalReviews: 1300,
    isDemo: true
  },

  // --- TELANGANA ---
  {
    name: 'Yashoda Hospitals Secunderabad',
    email: 'info@yashodahospitals.com',
    phone: '+91 40 4567 4567',
    emergencyPhone: '+91 40 4567 9999',
    address: 'Alexander Road, Secunderabad',
    city: 'Hyderabad',
    state: 'Telangana',
    pincode: '500003',
    location: { type: 'Point', coordinates: [78.5011, 17.4399] },
    hospitalType: 'Super-Specialty',
    verificationStatus: 'VERIFIED',
    emergencyAvailable: true,
    ambulanceAvailable: true,
    bloodBankAvailable: true,
    operatingHours: '24/7 Open',
    departments: ['Heart Institute', 'Cancer Institute', 'Neurosciences', 'Emergency Medicine', 'Critical Care'],
    services: ['Cath Lab 24/7', 'Trauma Emergency', 'Liver Transplant', 'Blood Bank'],
    capacitySummary: {
      general: { total: 270, available: 39 },
      icu: { total: 38, available: 8 },
      emergency: { total: 18, available: 5 }
    },
    rating: 4.8,
    totalReviews: 920,
    isDemo: true
  },

  // --- WEST BENGAL ---
  {
    name: 'SSKM Hospital & IPGMER',
    email: 'ms@ipgmer.gov.in',
    phone: '+91 33 2223 1589',
    emergencyPhone: '+91 33 2223 9999',
    address: '244, AJC Bose Road, Bhowanipore',
    city: 'Kolkata',
    state: 'West Bengal',
    pincode: '700020',
    location: { type: 'Point', coordinates: [88.3426, 22.5393] },
    hospitalType: 'Government / Premier Teaching',
    verificationStatus: 'VERIFIED',
    emergencyAvailable: true,
    ambulanceAvailable: true,
    bloodBankAvailable: true,
    operatingHours: '24/7 Open',
    departments: ['Cardiology', 'Neurology', 'Nephrology', 'General Surgery', 'Pediatrics', 'Trauma Care'],
    services: ['Apex Trauma Center', 'Renal Transplant', '24/7 Blood Bank', 'Emergency Triage'],
    capacitySummary: {
      general: { total: 360, available: 44 },
      icu: { total: 44, available: 7 },
      emergency: { total: 25, available: 8 }
    },
    rating: 4.7,
    totalReviews: 1100,
    isDemo: true
  },

  // --- GUJARAT ---
  {
    name: 'Civil Hospital Ahmedabad',
    email: 'info@civilhospitalahmedabad.org',
    phone: '+91 79 2268 3721',
    emergencyPhone: '+91 79 2268 9999',
    address: 'Asarwa, Near Haripura',
    city: 'Ahmedabad',
    state: 'Gujarat',
    pincode: '380016',
    location: { type: 'Point', coordinates: [72.5975, 23.0538] },
    hospitalType: 'Government / Apex Regional',
    verificationStatus: 'VERIFIED',
    emergencyAvailable: true,
    ambulanceAvailable: true,
    bloodBankAvailable: true,
    operatingHours: '24/7 Open',
    departments: ['Emergency Medicine', 'Cardiology', 'General Surgery', 'Orthopedics', 'Pediatrics', 'Oncology'],
    services: ['State Trauma Facility', 'Kidney Disease Institute', '24/7 Central Blood Bank', 'Dialysis'],
    capacitySummary: {
      general: { total: 420, available: 62 },
      icu: { total: 52, available: 10 },
      emergency: { total: 30, available: 9 }
    },
    rating: 4.8,
    totalReviews: 1400,
    isDemo: true
  },

  // --- RAJASTHAN ---
  {
    name: 'Sawai Man Singh (SMS) Hospital',
    email: 'ms.smshospital@rajasthan.gov.in',
    phone: '+91 141 251 8380',
    emergencyPhone: '+91 141 251 9999',
    address: 'JLN Marg, Ashok Nagar',
    city: 'Jaipur',
    state: 'Rajasthan',
    pincode: '302004',
    location: { type: 'Point', coordinates: [75.8185, 26.8997] },
    hospitalType: 'Government Medical College',
    verificationStatus: 'VERIFIED',
    emergencyAvailable: true,
    ambulanceAvailable: true,
    bloodBankAvailable: true,
    operatingHours: '24/7 Open',
    departments: ['Trauma Care', 'Cardiology', 'Neurology', 'Orthopedics', 'General Medicine'],
    services: ['Super Trauma Center', 'Free Emergency Medicine', '24/7 Blood Bank', 'ICU'],
    capacitySummary: {
      general: { total: 370, available: 49 },
      icu: { total: 46, available: 8 },
      emergency: { total: 28, available: 7 }
    },
    rating: 4.7,
    totalReviews: 1280,
    isDemo: true
  },

  // --- BIHAR ---
  {
    name: 'AIIMS Patna',
    email: 'info@aiimspatna.org',
    phone: '+91 612 245 1070',
    emergencyPhone: '+91 612 245 9999',
    address: 'Phulwari Sharif',
    city: 'Patna',
    state: 'Bihar',
    pincode: '801507',
    location: { type: 'Point', coordinates: [85.0440, 25.5606] },
    hospitalType: 'Government / Apex',
    verificationStatus: 'VERIFIED',
    emergencyAvailable: true,
    ambulanceAvailable: true,
    bloodBankAvailable: true,
    operatingHours: '24/7 Open',
    departments: ['Emergency Medicine', 'Cardiology', 'Neurology', 'Oncology', 'Pediatrics'],
    services: ['Trauma Center', 'Cardiac ICU', 'Advanced Dialysis', 'Blood Storage'],
    capacitySummary: {
      general: { total: 300, available: 47 },
      icu: { total: 40, available: 7 },
      emergency: { total: 22, available: 6 }
    },
    rating: 4.8,
    totalReviews: 890,
    isDemo: true
  },

  // --- MADHYA PRADESH ---
  {
    name: 'AIIMS Bhopal',
    email: 'info@aiimsbhopal.edu.in',
    phone: '+91 755 267 2355',
    emergencyPhone: '+91 755 267 9999',
    address: 'Saket Nagar',
    city: 'Bhopal',
    state: 'Madhya Pradesh',
    pincode: '462020',
    location: { type: 'Point', coordinates: [77.4520, 23.2064] },
    hospitalType: 'Government / Apex',
    verificationStatus: 'VERIFIED',
    emergencyAvailable: true,
    ambulanceAvailable: true,
    bloodBankAvailable: true,
    operatingHours: '24/7 Open',
    departments: ['Emergency Medicine', 'Cardiology', 'General Surgery', 'Orthopedics', 'Pediatrics'],
    services: ['Level 1 Trauma Unit', '24/7 Emergency Ambulance', 'Advanced Cath Lab', 'Blood Bank'],
    capacitySummary: {
      general: { total: 310, available: 43 },
      icu: { total: 38, available: 6 },
      emergency: { total: 20, available: 5 }
    },
    rating: 4.8,
    totalReviews: 820,
    isDemo: true
  },

  // --- KERALA ---
  {
    name: 'Amrita Institute of Medical Sciences',
    email: 'aims@amrita.edu',
    phone: '+91 484 285 1234',
    emergencyPhone: '+91 484 285 8888',
    address: 'Ponekkara, Edappally',
    city: 'Kochi',
    state: 'Kerala',
    pincode: '682041',
    location: { type: 'Point', coordinates: [76.2894, 10.0326] },
    hospitalType: 'Super-Specialty',
    verificationStatus: 'VERIFIED',
    emergencyAvailable: true,
    ambulanceAvailable: true,
    bloodBankAvailable: true,
    operatingHours: '24/7 Open',
    departments: ['Heart Institute', 'Center for Neurosciences', 'Organ Transplant', 'Oncology', 'Critical Care'],
    services: ['Hand & Face Transplant', 'Robotic Surgery', '24/7 Emergency Ambulance', 'Blood Bank'],
    capacitySummary: {
      general: { total: 330, available: 50 },
      icu: { total: 45, available: 9 },
      emergency: { total: 22, available: 6 }
    },
    rating: 4.9,
    totalReviews: 1180,
    isDemo: true
  },

  // --- CHANDIGARH / PUNJAB ---
  {
    name: 'PGIMER Chandigarh',
    email: 'director@pgimer.edu.in',
    phone: '+91 172 274 6018',
    emergencyPhone: '+91 172 274 7777',
    address: 'Sector 12',
    city: 'Chandigarh',
    state: 'Chandigarh',
    pincode: '160012',
    location: { type: 'Point', coordinates: [76.7766, 30.7644] },
    hospitalType: 'Government / Premier National Institute',
    verificationStatus: 'VERIFIED',
    emergencyAvailable: true,
    ambulanceAvailable: true,
    bloodBankAvailable: true,
    operatingHours: '24/7 Open',
    departments: ['Advanced Cardiac Center', 'Advanced Trauma Center', 'Pediatric Medicine', 'Neurology', 'Oncology'],
    services: ['Level 1 Trauma', 'Cardiac Cath Lab', 'Apex Blood Bank', 'Organ Transplant'],
    capacitySummary: {
      general: { total: 420, available: 55 },
      icu: { total: 54, available: 9 },
      emergency: { total: 30, available: 8 }
    },
    rating: 4.9,
    totalReviews: 1520,
    isDemo: true
  },

  // --- ODISHA ---
  {
    name: 'AIIMS Bhubaneswar',
    email: 'info@aiimsbhubaneswar.edu.in',
    phone: '+91 674 247 6789',
    emergencyPhone: '+91 674 247 9999',
    address: 'Sijua, Patrapada',
    city: 'Bhubaneswar',
    state: 'Odisha',
    pincode: '751019',
    location: { type: 'Point', coordinates: [85.7765, 20.2312] },
    hospitalType: 'Government / Apex',
    verificationStatus: 'VERIFIED',
    emergencyAvailable: true,
    ambulanceAvailable: true,
    bloodBankAvailable: true,
    operatingHours: '24/7 Open',
    departments: ['Emergency Medicine', 'Cardiology', 'General Surgery', 'Orthopedics', 'Pediatrics'],
    services: ['24/7 Trauma Unit', 'Advanced ICU', 'CT/MRI', 'Blood Bank'],
    capacitySummary: {
      general: { total: 290, available: 42 },
      icu: { total: 36, available: 7 },
      emergency: { total: 20, available: 5 }
    },
    rating: 4.8,
    totalReviews: 760,
    isDemo: true
  }
];

const runSeed = async () => {
  try {
    await connectDB();
    console.log('✅ Connected to MongoDB Atlas');

    const admin = await User.findOne({ role: 'HOSPITAL_ADMIN' });

    let inserted = 0;
    let updated = 0;

    for (const h of INDIA_HOSPITALS) {
      h.lastStatusUpdate = new Date();
      h.adminUser = admin ? admin._id : null;

      const existing = await Hospital.findOne({ name: h.name, city: h.city });
      if (existing) {
        await Hospital.updateOne({ _id: existing._id }, { $set: h });
        updated++;
      } else {
        await Hospital.create(h);
        inserted++;
      }
    }

    console.log(`🎉 Seed complete: ${inserted} new hospitals added, ${updated} updated across India!`);
    const total = await Hospital.countDocuments();
    console.log(`📊 Total Hospitals in CareSync Database: ${total}`);
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding error:', err);
    process.exit(1);
  }
};

runSeed();
