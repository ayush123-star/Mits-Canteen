const mongoose = require('mongoose');

const notificationLogSchema = new mongoose.Schema({
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true,
    index: true,
  },
  orderStatus: {
    type: String,
    enum: [
      'Placed',
      'Pending Acceptance',
      'Accepted',
      'Preparing',
      'Ready for Pickup',
      'Completed',
      'Collected',
      'Rejected',
      'Cancelled',
      'CUSTOM',
    ],
    required: true,
    index: true,
  },
  tokenNumber: {
    type: String,
    required: true,
  },
  studentName: {
    type: String,
    required: true,
  },
  recipientPhone: {
    type: String,
    required: true,
  },
  channel: {
    type: String,
    enum: ['WHATSAPP', 'SMS', 'IN_APP'],
    default: 'WHATSAPP',
  },
  message: {
    type: String,
    required: true,
  },
  waMessageId: {
    type: String,
    index: true,
    default: null,
  },
  deliveryStatus: {
    type: String,
    enum: ['QUEUED', 'SENT', 'DELIVERED', 'READ', 'FAILED'],
    default: 'QUEUED',
    index: true,
  },
  statusTimestamps: {
    sentAt: Date,
    deliveredAt: Date,
    readAt: Date,
    failedAt: Date,
  },
  errorMessage: {
    type: String,
    default: null,
  },
  templateName: {
    type: String,
    default: null,
  },
  counter: {
    type: Number,
    default: 1,
  },
  sentAt: {
    type: Date,
    default: Date.now,
  },
  rawResponse: {
    type: mongoose.Schema.Types.Mixed,
    default: null,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('NotificationLog', notificationLogSchema);
