const mongoose = require('mongoose');

const inventoryItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Raw material name is required'],
    trim: true,
  },
  category: {
    type: String,
    required: true,
    enum: ['Dairy', 'Bakery', 'Vegetables', 'Pantry & Spices', 'Condiments', 'Packaging', 'Beverages'],
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
    enum: ['kg', 'L', 'pcs', 'packets', 'cans'],
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
    enum: ['Optimal', 'Low Stock', 'Out of Stock'],
    default: 'Optimal',
  },
  supplier: {
    type: String,
    default: 'Campus Wholesale Mart',
  },
  lastRestocked: {
    type: String,
    default: () => new Date().toLocaleDateString(),
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('InventoryItem', inventoryItemSchema);
