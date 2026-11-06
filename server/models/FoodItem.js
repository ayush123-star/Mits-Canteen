const mongoose = require('mongoose');

const foodItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Food name is required'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price must be positive'],
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['Breakfast', 'Lunch', 'Snacks', 'Beverages', 'Fast Food', 'Combos'],
  },
  isVeg: {
    type: Boolean,
    default: true,
  },
  isAvailable: {
    type: Boolean,
    default: true,
  },
  image: {
    type: String,
    required: [true, 'Image URL is required'],
  },
  preparationTime: {
    type: Number, // in minutes
    default: 10,
    min: 1,
  },
  calories: {
    type: Number,
    default: 250,
  },
  tags: [{
    type: String,
    trim: true,
  }],
  rating: {
    type: Number,
    default: 4.8,
    min: 1,
    max: 5,
  },
  reviewCount: {
    type: Number,
    default: 24,
  },
  counter: {
    type: Number,
    default: 1,
  },
  stockCount: {
    type: Number,
    default: 50,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('FoodItem', foodItemSchema);
