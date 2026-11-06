const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  foodItem: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FoodItem',
    required: true,
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
});

const orderSchema = new mongoose.Schema({
  tokenNumber: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
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
    enum: ['Placed', 'Accepted', 'Preparing', 'Ready for Pickup', 'Completed', 'Cancelled'],
    default: 'Placed',
    index: true,
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
