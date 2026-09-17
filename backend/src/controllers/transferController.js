const TransferRequest = require('../models/TransferRequest');
const Hospital = require('../models/Hospital');
const { emitTransferUpdate } = require('../utils/socket');

// @desc    Get all transfer requests for current user or hospital
// @route   GET /api/transfers
// @access  Private
exports.getTransfers = async (req, res) => {
  try {
    const query = {};
    const { hospitalId, status, type } = req.query;

    const targetHospId = hospitalId || req.user.hospitalId;

    if (req.user.role === 'ADMIN') {
      if (hospitalId) query.$or = [{ fromHospital: hospitalId }, { toHospital: hospitalId }];
    } else if (targetHospId) {
      if (type === 'incoming') {
        query.toHospital = targetHospId;
      } else if (type === 'outgoing') {
        query.fromHospital = targetHospId;
      } else {
        query.$or = [{ fromHospital: targetHospId }, { toHospital: targetHospId }];
      }
    } else if (req.user.role === 'PATIENT') {
      query.patientId = req.user._id;
    }

    if (status) query.status = status;

    const transfers = await TransferRequest.find(query)
      .populate('fromHospital', 'name city phone emergencyPhone')
      .populate('toHospital', 'name city phone emergencyPhone')
      .populate('requestedBy', 'name role')
      .populate('handledBy', 'name role')
      .sort({ createdAt: -1 })
      .lean();

    res.json({ success: true, count: transfers.length, data: transfers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create new inter-hospital transfer request
// @route   POST /api/transfers
// @access  Private (HOSPITAL_ADMIN, DOCTOR, RECEPTIONIST, ADMIN)
exports.createTransfer = async (req, res) => {
  try {
    const {
      patientName,
      patientAge,
      patientGender,
      patientId,
      fromHospital,
      toHospital,
      requiredDepartment,
      requiredBedType,
      priority,
      reason,
      clinicalSummary,
    } = req.body;

    const sendingHospId = fromHospital || req.user.hospitalId;

    if (!sendingHospId || !toHospital) {
      return res.status(400).json({ success: false, message: 'Both sending and receiving hospitals are required' });
    }

    if (sendingHospId.toString() === toHospital.toString()) {
      return res.status(400).json({ success: false, message: 'Sending and receiving hospitals cannot be the same' });
    }

    const transfer = await TransferRequest.create({
      patientName,
      patientAge: parseInt(patientAge, 10),
      patientGender: patientGender || 'Male',
      patientId: patientId || null,
      fromHospital: sendingHospId,
      toHospital,
      requiredDepartment,
      requiredBedType: requiredBedType || 'ICU',
      priority: priority || 'URGENT',
      reason,
      clinicalSummary: clinicalSummary || '',
      requestedBy: req.user._id,
      status: 'PENDING',
    });

    const populated = await TransferRequest.findById(transfer._id)
      .populate('fromHospital', 'name city phone')
      .populate('toHospital', 'name city phone');

    // Emit Socket notification to receiving and sending hospitals
    emitTransferUpdate(populated);

    res.status(201).json({
      success: true,
      message: 'Transfer request submitted successfully',
      data: populated,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update transfer request status (Accept, Reject, In Transit, Completed)
// @route   PATCH /api/transfers/:id
// @access  Private (HOSPITAL_ADMIN, DOCTOR, RECEPTIONIST, ADMIN)
exports.updateTransferStatus = async (req, res) => {
  try {
    const { status, rejectionReason } = req.body;
    let transfer = await TransferRequest.findById(req.params.id);

    if (!transfer) {
      return res.status(404).json({ success: false, message: 'Transfer request not found' });
    }

    transfer.status = status;
    if (rejectionReason) transfer.rejectionReason = rejectionReason;
    transfer.handledBy = req.user._id;

    await transfer.save();

    const populated = await TransferRequest.findById(transfer._id)
      .populate('fromHospital', 'name city phone')
      .populate('toHospital', 'name city phone')
      .populate('handledBy', 'name role');

    // Emit Socket notification
    emitTransferUpdate(populated);

    res.json({
      success: true,
      message: `Transfer request marked as ${status}`,
      data: populated,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
