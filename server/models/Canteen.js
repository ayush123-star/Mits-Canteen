const mongoose = require('mongoose');

const canteenSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Canteen name is required'],
    trim: true,
  },
  code: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  location: {
    type: String,
    default: 'MITS Main Canteen, Counter, MITS Gwalior',
  },
  isOpen: {
    type: Boolean,
    default: true,
  },
  status: {
    type: String,
    enum: ['Operational', 'Maintenance', 'Closed'],
    default: 'Operational',
  },
  openingTime: {
    type: String,
    default: '08:00 AM',
  },
  closingTime: {
    type: String,
    default: '07:30 PM',
  },
  activeCounters: {
    type: Number,
    default: 1, // Single Express Counter
  },
  managerName: {
    type: String,
    default: 'MITS Canteen Incharge',
  },
  managerPhone: {
    type: String,
    default: '+91 98765 43210',
  },
  rating: {
    type: Number,
    default: 4.8,
  },
  todayOrdersCount: {
    type: Number,
    default: 0,
  },
  todayRevenue: {
    type: Number,
    default: 0,
  },
  rushHourActive: {
    type: Boolean,
    default: false,
  },
  qrCodeImage: {
    type: String, // Base64 image data URL or hosted link
    default: '',
  },
  upiId: {
    type: String,
    default: 'smartcampus.canteen@okhdfcbank',
  },
  upiMerchantName: {
    type: String,
    default: 'Smart Campus Canteen',
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Canteen', canteenSchema);
