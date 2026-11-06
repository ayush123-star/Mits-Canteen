const express = require('express');
const router = express.Router();
const InventoryItem = require('../models/InventoryItem');
const StockTransaction = require('../models/StockTransaction');

// @route   GET /api/inventory
// @desc    Get all inventory raw materials
router.get('/', async (req, res) => {
  try {
    const items = await InventoryItem.find().sort({ currentQuantity: 1 });
    res.json({ success: true, data: items });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch inventory' });
  }
});

// @route   POST /api/inventory/add-stock
// @desc    Add inward stock / restock entry
router.post('/add-stock', async (req, res) => {
  try {
    const { inventoryId, quantity, supplier, price, notes } = req.body;
    const qty = Number(quantity);

    const item = await InventoryItem.findById(inventoryId);
    if (!item) return res.status(404).json({ success: false, message: 'Item not found' });

    item.currentQuantity += qty;
    item.status = item.currentQuantity > item.minimumStockLevel ? 'Optimal' : 'Low Stock';
    item.lastRestocked = new Date().toLocaleDateString();
    if (supplier) item.supplier = supplier;
    await item.save();

    // Log transaction
    const tx = await StockTransaction.create({
      inventoryItem: item.name,
      type: 'STOCK_IN',
      quantity: qty,
      unit: item.unit,
      balanceAfter: item.currentQuantity,
      reference: notes || `Wholesale Restock (${supplier || 'Vendor'})`,
      actor: 'Inventory Inward Receiver',
    });

    res.json({ success: true, data: item, transaction: tx });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to add stock', error: err.message });
  }
});

// @route   POST /api/inventory/adjust
// @desc    Manual stock calibration / spoilage
router.post('/adjust', async (req, res) => {
  try {
    const { inventoryId, quantity, reason, notes, actor } = req.body;
    const qtyDelta = Number(quantity);

    const item = await InventoryItem.findById(inventoryId);
    if (!item) return res.status(404).json({ success: false, message: 'Item not found' });

    item.currentQuantity = Math.max(0, item.currentQuantity + qtyDelta);
    item.status = item.currentQuantity > item.minimumStockLevel ? 'Optimal' : 'Low Stock';
    await item.save();

    const tx = await StockTransaction.create({
      inventoryItem: item.name,
      type: 'MANUAL_ADJUSTMENT',
      quantity: qtyDelta,
      unit: item.unit,
      balanceAfter: item.currentQuantity,
      reference: `${reason} - ${notes || 'Audit Calibration'}`,
      actor: actor || 'Inventory Audit Manager',
    });

    res.json({ success: true, data: item, transaction: tx });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to adjust stock', error: err.message });
  }
});

// @route   GET /api/inventory/transactions
// @desc    Get stock history transactions ledger
router.get('/transactions', async (req, res) => {
  try {
    const txs = await StockTransaction.find().sort({ createdAt: -1 });
    res.json({ success: true, data: txs });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch transactions' });
  }
});

module.exports = router;
