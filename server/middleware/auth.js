const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'campus_canteen_super_jwt_secret_token_2026'
      );
      req.user = await User.findById(decoded.id).select('-password');
      if (!req.user) {
        return res.status(401).json({ message: 'User not found for this token' });
      }
      return next();
    } catch (error) {
      console.error('Token verification error:', error.message);
      return res.status(401).json({ message: 'Not authorized, invalid token' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token provided' });
  }
};

const adminOnly = (req, res, next) => {
  if (
    req.user &&
    (req.user.role === 'canteen_admin' ||
      req.user.role === 'admin' ||
      req.user.role === 'staff' ||
      req.user.role === 'super_admin')
  ) {
    next();
  } else {
    res.status(403).json({ message: 'Access denied: Admin or Canteen Owner privileges required' });
  }
};

const optionalAuth = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'campus_canteen_super_jwt_secret_token_2026'
      );
      req.user = await User.findById(decoded.id).select('-password');
    } catch (error) {
      console.debug('Optional token verification skipped');
    }
  }

  if (!req.user) {
    req.user = {
      _id: req.body.studentId && req.body.studentId.length === 24 ? req.body.studentId : '650c00000000000000000001',
      name: req.body.studentName || 'Student Diner',
      studentId: req.body.studentRoll || 'BTET25O1039',
      phone: req.body.studentPhone || '+91 98765 43210',
      role: 'student',
    };
  }
  return next();
};

module.exports = { protect, adminOnly, optionalAuth };
