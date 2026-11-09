const mongoose = require('mongoose');

const inventoryItemSchema = new mongoose.Schema({
  id: {
    type: String,
    trim: true,
  },
  name: {
    type: String,
    required: [true, 'Raw material name is required'],
    trim: true,
  },
  category: {
    type: String,
    required: true,
    trim: true,
    default: 'General',
  },
  currentQuantity: {
    type: Number,
    required: true,
    default: 0,
    min: 0,
  },
  unit: {
    type: String,
    required: true,
    trim: true,
    default: 'kg',
  },
  minimumStockLevel: {
    type: Number,
    required: true,
    default: 5,
  },
  reorderQuantity: {
    type: Number,
    default: 20,
  },
  status: {
    type: String,
    default: 'Optimal',
  },
  supplier: {
    type: String,
    default: 'Campus Wholesale Mart',
    trim: true,
  },
  lastRestocked: {
    type: String,
    default: () => new Date().toLocaleDateString(),
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('InventoryItem', inventoryItemSchema);
