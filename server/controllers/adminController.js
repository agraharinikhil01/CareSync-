const User = require('../models/User');
const Appointment = require('../models/Appointment');
const Bed = require('../models/Bed');
const Bill = require('../models/Bill');
const Prescription = require('../models/Prescription');
const DoctorProfile = require('../models/DoctorProfile');

// GET /api/admin/stats
const getDashboardStats = async (req, res) => {
  try {
    const [totalPatients, totalDoctors, totalAppointments, bedStats, revenueData] = await Promise.all([
      User.countDocuments({ role: 'patient', isActive: true }),
      User.countDocuments({ role: 'doctor', isActive: true }),
      Appointment.countDocuments(),
      Bed.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
      Bill.aggregate([{ $match: { isPaid: true } }, { $group: { _id: null, total: { $sum: '$totalAmount' } } }]),
    ]);

    const occupiedBeds = bedStats.find(b => b._id === 'occupied')?.count || 0;
    const availableBeds = bedStats.find(b => b._id === 'available')?.count || 0;

    res.json({
      success: true,
      data: {
        totalPatients,
        totalDoctors,
        totalAppointments,
        occupiedBeds,
        availableBeds,
        totalRevenue: revenueData[0]?.total || 0,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/admin/users (all users)
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json({ success: true, data: users });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PATCH /api/admin/users/:id/toggle
const toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    user.isActive = !user.isActive;
    await user.save();
    res.json({ success: true, data: user, message: `User ${user.isActive ? 'activated' : 'deactivated'}` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/admin/users/:id
const deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getDashboardStats, getAllUsers, toggleUserStatus, deleteUser };
