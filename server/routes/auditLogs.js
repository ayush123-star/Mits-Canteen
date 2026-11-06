const express = require('express');
const router = express.Router();
const AuditLog = require('../models/AuditLog');

// @route   GET /api/audit-logs
// @desc    Get immutable security audit logs
router.get('/', async (req, res) => {
  try {
    const logs = await AuditLog.find().sort({ createdAt: -1 }).limit(100);
    res.json({ success: true, data: logs });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch audit logs' });
  }
});

// @route   POST /api/audit-logs
// @desc    Append audit log
router.post('/', async (req, res) => {
  try {
    const { actor, action, module, details, ip } = req.body;
    const log = await AuditLog.create({
      actor,
      action,
      module,
      details,
      ip: ip || req.ip || '127.0.0.1',
    });
    res.status(201).json({ success: true, data: log });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to record audit log' });
  }
});

module.exports = router;
