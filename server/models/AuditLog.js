const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  timestamp: {
    type: String,
    default: () => new Date().toLocaleString(),
  },
  actor: {
    type: String,
    required: true,
  },
  action: {
    type: String,
    required: true,
  },
  module: {
    type: String,
    required: true,
    enum: ['AUTH', 'ORDERS', 'INVENTORY', 'RECIPES', 'CANTEENS', 'PAYMENTS', 'SETTINGS'],
  },
  details: {
    type: String,
    required: true,
  },
  ip: {
    type: String,
    default: '127.0.0.1',
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('AuditLog', auditLogSchema);
