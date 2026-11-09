const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const InventoryItem = require('../models/InventoryItem');
const StockTransaction = require('../models/StockTransaction');
const { ownerOrAdminAuth } = require('../middleware/auth');

/**
 * Helper to match either 24-character MongoDB ObjectId (_id) or custom string ID (id)
 */
const findInventoryQuery = (rawId) => {
  if (!rawId) return { _id: null };
  const clean = String(rawId).trim();
  if (mongoose.Types.ObjectId.isValid(clean) && String(new mongoose.Types.ObjectId(clean)) === clean) {
    return { $or: [{ _id: clean }, { id: clean }] };
  }
  return { id: clean };
};

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

// @route   POST /api/inventory
// @desc    Add / Create a new raw material item in inventory
router.post('/', ownerOrAdminAuth, async (req, res) => {
  try {
    const {
      id,
      name,
      category,
      currentQuantity = 0,
      unit = 'kg',
      minimumStockLevel = 5,
      reorderQuantity = 20,
      supplier = 'Campus Wholesale Mart',
    } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Material name is required' });
    }

    const customId = id || 'inv-' + Date.now();
    const qty = Number(currentQuantity) || 0;
    const minLevel = Number(minimumStockLevel) || 5;
    const status = qty <= minLevel ? 'Low Stock' : 'Optimal';

    const newItem = await InventoryItem.create({
      id: customId,
      name: name.trim(),
      category: category ? category.trim() : 'General',
      currentQuantity: qty,
      unit: unit ? unit.trim() : 'kg',
      minimumStockLevel: minLevel,
      reorderQuantity: Number(reorderQuantity) || 20,
      status,
      supplier: supplier ? supplier.trim() : 'Campus Wholesale Mart',
      lastRestocked: new Date().toLocaleDateString(),
    });

    // Record initial ledger transaction
    try {
      await StockTransaction.create({
        inventoryItem: newItem.name,
        type: 'INITIAL_STOCK',
        quantity: qty,
        unit: newItem.unit,
        balanceAfter: qty,
        reference: `Initial SKU registration (${supplier || 'Campus Wholesale Mart'})`,
        actor: req.user?.name || 'Inventory Admin',
      });
    } catch (_) {}

    // Real-time Socket.IO Broadcast
    try {
      const io = req.app.get('io');
      if (io) {
        io.emit('inventory:created', newItem);
        io.emit('inventory:sync');
      }
    } catch (_) {}

    res.status(201).json({ success: true, data: newItem, message: 'Raw material created successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to create inventory item', error: err.message });
  }
});

// @route   PUT /api/inventory/:id
// @desc    Update an existing raw material item
router.put('/:id', ownerOrAdminAuth, async (req, res) => {
  try {
    const item = await InventoryItem.findOne(findInventoryQuery(req.params.id));
    if (!item) {
      return res.status(404).json({ success: false, message: 'Inventory item not found' });
    }

    const {
      name,
      category,
      currentQuantity,
      unit,
      minimumStockLevel,
      reorderQuantity,
      supplier,
    } = req.body;

    if (name) item.name = name.trim();
    if (category) item.category = category.trim();
    if (unit) item.unit = unit.trim();
    if (minimumStockLevel !== undefined) item.minimumStockLevel = Number(minimumStockLevel);
    if (reorderQuantity !== undefined) item.reorderQuantity = Number(reorderQuantity);
    if (supplier !== undefined) item.supplier = supplier.trim();

    if (currentQuantity !== undefined) {
      const prevQty = item.currentQuantity;
      const nextQty = Number(currentQuantity);
      item.currentQuantity = Math.max(0, nextQty);
      item.status = item.currentQuantity <= item.minimumStockLevel ? 'Low Stock' : 'Optimal';

      // If quantity changed directly in edit, log calibration transaction
      if (prevQty !== nextQty) {
        try {
          await StockTransaction.create({
            inventoryItem: item.name,
            type: 'MANUAL_ADJUSTMENT',
            quantity: nextQty - prevQty,
            unit: item.unit,
            balanceAfter: item.currentQuantity,
            reference: 'Direct Stock Count Update via CMS Edit',
            actor: req.user?.name || 'Inventory Manager',
          });
        } catch (_) {}
      }
    } else {
      item.status = item.currentQuantity <= item.minimumStockLevel ? 'Low Stock' : 'Optimal';
    }

    await item.save();

    // Real-time Socket.IO Broadcast
    try {
      const io = req.app.get('io');
      if (io) {
        io.emit('inventory:updated', item);
        io.emit('inventory:sync');
      }
    } catch (_) {}

    res.json({ success: true, data: item, message: 'Inventory item updated successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update inventory item', error: err.message });
  }
});

// @route   DELETE /api/inventory/:id
// @desc    Delete a raw material item from stock
router.delete('/:id', ownerOrAdminAuth, async (req, res) => {
  try {
    const item = await InventoryItem.findOneAndDelete(findInventoryQuery(req.params.id));
    if (!item) {
      return res.status(404).json({ success: false, message: 'Inventory item not found' });
    }

    // Log deletion transaction
    try {
      await StockTransaction.create({
        inventoryItem: item.name,
        type: 'ITEM_DELETED',
        quantity: -item.currentQuantity,
        unit: item.unit,
        balanceAfter: 0,
        reference: `Material SKU permanently removed from inventory ledger`,
        actor: req.user?.name || 'Inventory Manager',
      });
    } catch (_) {}

    // Real-time Socket.IO Broadcast
    try {
      const io = req.app.get('io');
      if (io) {
        io.emit('inventory:deleted', { id: item.id || item._id, name: item.name });
        io.emit('inventory:sync');
      }
    } catch (_) {}

    res.json({ success: true, message: 'Inventory item deleted successfully', deletedId: item.id || item._id });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to delete inventory item', error: err.message });
  }
});

// @route   POST /api/inventory/add-stock
// @desc    Add inward stock / restock entry
router.post('/add-stock', ownerOrAdminAuth, async (req, res) => {
  try {
    const { inventoryId, quantity, supplier, price, notes } = req.body;
    const qty = Number(quantity);

    const item = await InventoryItem.findOne(findInventoryQuery(inventoryId));
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
      actor: req.user?.name || 'Inventory Inward Receiver',
    });

    // Real-time Socket.IO Broadcast
    try {
      const io = req.app.get('io');
      if (io) {
        io.emit('inventory:updated', item);
        io.emit('inventory:restocked', { item, transaction: tx });
      }
    } catch (_) {}

    res.json({ success: true, data: item, transaction: tx });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to add stock', error: err.message });
  }
});

// @route   POST /api/inventory/adjust
// @desc    Manual stock calibration / spoilage
router.post('/adjust', ownerOrAdminAuth, async (req, res) => {
  try {
    const { inventoryId, quantity, reason, notes, actor } = req.body;
    const qtyDelta = Number(quantity);

    const item = await InventoryItem.findOne(findInventoryQuery(inventoryId));
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
      actor: actor || req.user?.name || 'Inventory Audit Manager',
    });

    // Real-time Socket.IO Broadcast
    try {
      const io = req.app.get('io');
      if (io) {
        io.emit('inventory:updated', item);
        io.emit('inventory:adjusted', { item, transaction: tx });
      }
    } catch (_) {}

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
