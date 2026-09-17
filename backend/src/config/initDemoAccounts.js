const User = require('../models/User');
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const Hospital = require('../models/Hospital');

const DEMO_ACCOUNTS = [
  {
    name: 'CareSync System Administrator',
    email: 'admin@caresync.com',
    password: 'Admin@123',
    role: 'ADMIN',
    phone: '+91 99999 00001',
  },
  {
    name: 'Dr. Rajesh Sharma (Hospital Director)',
    email: 'hospital@caresync.com',
    password: 'Hospital@123',
    role: 'HOSPITAL_ADMIN',
    phone: '+91 98112 34567',
  },
  {
    name: 'Dr. Ananya Verma',
    email: 'doctor1@caresync.com',
    password: 'Doctor@123',
    role: 'DOCTOR',
    phone: '+91 98111 22334',
    specialization: 'Cardiology',
    qualification: 'MBBS, MD, DM (Cardiology)',
  },
  {
    name: 'Priya Sharma (Reception Lead)',
    email: 'receptionist@caresync.com',
    password: 'Staff@123',
    role: 'RECEPTIONIST',
    phone: '+91 98222 33445',
  },
  {
    name: 'Rahul Mehta',
    email: 'patient1@caresync.com',
    password: 'Patient@123',
    role: 'PATIENT',
    phone: '+91 98333 44556',
  },
];

const initDemoAccounts = async () => {
  try {
    const sampleHospital = await Hospital.findOne();

    for (const acc of DEMO_ACCOUNTS) {
      let user = await User.findOne({ email: acc.email }).select('+password');

      if (!user) {
        user = await User.create({
          name: acc.name,
          email: acc.email,
          password: acc.password,
          role: acc.role,
          phone: acc.phone,
          hospitalId: sampleHospital ? sampleHospital._id : null,
        });
        console.log(`✅ Provisioned demo user: ${acc.email} (${acc.role})`);
      } else {
        // Ensure password matches demo credentials
        const matches = await user.matchPassword(acc.password);
        if (!matches) {
          user.password = acc.password;
          await user.save();
          console.log(`🔄 Synced demo password for: ${acc.email}`);
        }
        if (!user.hospitalId && sampleHospital) {
          user.hospitalId = sampleHospital._id;
          await user.save();
        }
      }

      // Ensure profile documents exist
      if (user.role === 'PATIENT') {
        let patient = await Patient.findOne({ user: user._id });
        if (!patient) {
          await Patient.create({
            user: user._id,
            patientId: 'PAT-DEMO01',
            bloodGroup: 'O+',
            gender: 'Male',
          });
        }
      } else if (user.role === 'DOCTOR') {
        let doctor = await Doctor.findOne({ user: user._id });
        if (!doctor) {
          await Doctor.create({
            user: user._id,
            hospital: sampleHospital ? sampleHospital._id : null,
            specialization: acc.specialization || 'General Medicine',
            qualification: acc.qualification || 'MBBS, MD',
            consultationFee: 500,
            availability: true,
          });
        }
      }
    }
  } catch (err) {
    console.error('Demo accounts check note:', err.message);
  }
};

module.exports = initDemoAccounts;
