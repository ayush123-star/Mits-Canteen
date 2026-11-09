const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  foodItem: {
    type: mongoose.Schema.Types.Mixed,
    ref: 'FoodItem',
    required: false,
  },
  name: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  image: String,
  isVeg: Boolean,
  counter: {
    type: Number,
    default: 1,
  },
  specialInstructions: {
    type: String,
    default: '',
  },
  tokenNumber: {
    type: String,
    default: '',
  },
  itemToken: {
    type: String,
    default: '',
  },
});

const orderSchema = new mongoose.Schema({
  orderId: {
    type: String,
    index: true,
  },
  tokenNumber: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  tokens: [{
    type: String,
  }],
  user: {
    type: mongoose.Schema.Types.Mixed,
    ref: 'User',
    required: false,
  },
  items: [orderItemSchema],
  totalAmount: {
    type: Number,
    required: true,
  },
  discountAmount: {
    type: Number,
    default: 0,
  },
  finalAmount: {
    type: Number,
    required: true,
  },
  couponCode: {
    type: String,
    default: '',
  },
  paymentMethod: {
    type: String,
    enum: ['UPI', 'CASH_AT_COUNTER'],
    default: 'UPI',
  },
  paymentStatus: {
    type: String,
    enum: ['Pending', 'Completed', 'Failed', 'PAID', 'UNPAID'],
    default: 'Pending',
  },
  studentName: {
    type: String,
    default: '',
  },
  studentEmail: {
    type: String,
    default: '',
  },
  studentRoll: {
    type: String,
    default: '',
  },
  studentPhone: {
    type: String,
    default: '',
  },
  studentDepartment: {
    type: String,
    default: '',
  },
  whatsappOptIn: {
    type: Boolean,
    default: true,
  },
  stockDeducted: {
    type: Boolean,
    default: false,
  },
  paymentDetails: {
    transactionId: String,
    upiId: String,
    paidAt: Date,
  },
  status: {
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
    ],
    default: 'Placed',
    index: true,
  },
  rejectionReason: {
    type: String,
    default: '',
  },
  cancellationReason: {
    type: String,
    default: '',
  },
  pickupOption: {
    type: String,
    enum: ['ASAP', 'Scheduled'],
    default: 'ASAP',
  },
  scheduledPickupTime: {
    type: String,
    default: 'ASAP (Immediate)',
  },
  estimatedPrepMinutes: {
    type: Number,
    default: 10,
  },
  estimatedReadyTime: {
    type: Date,
  },
  assignedCounter: {
    type: Number,
    default: 1,
  },
  qrCodeData: {
    type: String,
  },
  orderNotes: {
    type: String,
    default: '',
  },
  timeline: [{
    status: {
      type: String,
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    note: String,
  }],
}, {
  timestamps: true,
});

module.exports = mongoose.model('Order', orderSchema);
