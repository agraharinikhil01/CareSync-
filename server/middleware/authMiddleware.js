const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const JWT_SECRET = process.env.JWT_SECRET || 'caresync_super_secret_jwt_key_2026_change_this';
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
      if (!req.user) return res.status(401).json({ success: false, message: 'User not found' });
      if (!req.user.isActive) return res.status(403).json({ success: false, message: 'Account deactivated' });
      return next();
    } catch (err) {
      return res.status(401).json({ success: false, message: 'Not authorized, invalid token' });
    }
  }
  return res.status(401).json({ success: false, message: 'No token provided' });
};

const authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ success: false, message: `Role '${req.user.role}' is not allowed` });
  }
  next();
};

module.exports = { protect, authorize };
