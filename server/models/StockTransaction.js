const mongoose = require('mongoose');

const stockTransactionSchema = new mongoose.Schema({
  timestamp: {
    type: String,
    default: () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  },
  inventoryItem: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['STOCK_IN', 'RECIPE_DEDUCTION', 'MANUAL_ADJUSTMENT'],
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
  unit: {
    type: String,
    required: true,
  },
  balanceAfter: {
    type: Number,
    required: true,
  },
  reference: {
    type: String,
    default: 'Manual Entry',
  },
  actor: {
    type: String,
    default: 'Inventory Supervisor',
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('StockTransaction', stockTransactionSchema);
