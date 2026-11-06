const mongoose = require('mongoose');

const recipeIngredientSchema = new mongoose.Schema({
  inventoryId: {
    type: String,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 0.001,
  },
  unit: {
    type: String,
    required: true,
  },
});

const recipeSchema = new mongoose.Schema({
  menuItemId: {
    type: String,
    required: true,
    unique: true,
  },
  menuItemName: {
    type: String,
    required: true,
  },
  ingredients: [recipeIngredientSchema],
  prepInstructions: {
    type: String,
    default: '',
  },
  lastUpdatedBy: {
    type: String,
    default: 'Chef Manager',
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Recipe', recipeSchema);
