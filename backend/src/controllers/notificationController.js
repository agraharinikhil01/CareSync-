const Notification = require('../models/Notification');

exports.getNotifications = async (req, res) => {
  try {
    const query = {
      $or: [
        { recipientUser: req.user._id },
        ...(req.user.hospitalId ? [{ recipientHospital: req.user.hospitalId }] : []),
      ],
    };
    const notifications = await Notification.find(query).sort({ createdAt: -1 }).limit(30).lean();
    res.json({ success: true, count: notifications.length, data: notifications });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      {
        $or: [
          { recipientUser: req.user._id },
          ...(req.user.hospitalId ? [{ recipientHospital: req.user.hospitalId }] : []),
        ],
        isRead: false,
      },
      { isRead: true }
    );
    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
