const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 6,
  },
  role: {
    type: String,
    enum: ['student', 'admin', 'canteen_admin', 'super_admin', 'staff'],
    default: 'student',
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  requiresPasswordChange: {
    type: Boolean,
    default: false,
  },
  canteenId: {
    type: String,
    default: '',
  },
  canteenName: {
    type: String,
    default: '',
  },
  staffId: {
    type: String,
    default: '',
  },
  avatar: {
    type: String,
    default: '',
  },
  userType: {
    type: String,
    enum: ['student', 'faculty'],
    default: 'student',
  },
  googleId: {
    type: String,
    default: '',
  },
  studentId: {
    type: String,
    trim: true,
    default: '',
  },
  department: {
    type: String,
    default: 'Computer Science',
  },
  phone: {
    type: String,
    default: '',
  },
  whatsappOptIn: {
    type: Boolean,
    default: true,
  },
  favorites: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FoodItem',
  }],
}, {
  timestamps: true,
});

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
