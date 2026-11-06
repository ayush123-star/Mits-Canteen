const mongoose = require('mongoose');

const ownerInvitationSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
  },
  canteenName: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    default: 'canteen_admin',
  },
  token: {
    type: String,
    required: true,
    unique: true,
  },
  status: {
    type: String,
    enum: ['PENDING', 'ACCEPTED', 'EXPIRED', 'REVOKED'],
    default: 'PENDING',
  },
  sentAt: {
    type: String,
    default: () => new Date().toLocaleString(),
  },
  expiresAt: {
    type: Number,
    required: true, // timestamp in ms (24 hours from creation)
  },
  invitedBy: {
    type: String,
    default: 'Super Admin Directorate',
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('OwnerInvitation', ownerInvitationSchema);
