const express = require('express');
const router = express.Router();
const Category = require('../models/Category');
const { ownerOrAdminAuth } = require('../middleware/auth');

const DEFAULT_CATEGORIES = [
  { name: 'Breakfast', icon: 'SunMedium', displayOrder: 1 },
  { name: 'Lunch', icon: 'Utensils', displayOrder: 2 },
  { name: 'Snacks', icon: 'Cookie', displayOrder: 3 },
  { name: 'Beverages', icon: 'Coffee', displayOrder: 4 },
  { name: 'Fast Food', icon: 'Flame', displayOrder: 5 },
  { name: 'Combos', icon: 'Layers', displayOrder: 6 },
];

// @route   GET /api/categories
// @desc    Get all categories (seeds defaults if empty)
router.get('/', async (req, res) => {
  try {
    let categories = await Category.find({ isActive: true }).sort({ displayOrder: 1, name: 1 });
    if (categories.length === 0) {
      await Category.insertMany(DEFAULT_CATEGORIES);
      categories = await Category.find({ isActive: true }).sort({ displayOrder: 1, name: 1 });
    }
    res.json({ success: true, count: categories.length, data: categories });
  } catch (err) {
    console.error('Fetch categories error:', err);
    res.status(500).json({ message: 'Error retrieving categories' });
  }
});

// @route   POST /api/categories
// @desc    Create new category (Admin / Owner only)
router.post('/', ownerOrAdminAuth, async (req, res) => {
  try {
    const { name, icon, description, displayOrder } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Category name is required' });
    }

    const newCategory = await Category.create({
      name: name.trim(),
      icon: icon || 'Utensils',
      description: description || '',
      displayOrder: Number(displayOrder) || 0,
      isActive: true,
    });

    const io = req.app.get('socketio');
    if (io) {
      io.emit('category:created', newCategory);
      io.emit('category:updated', newCategory);
    }

    res.status(201).json({ success: true, data: newCategory });
  } catch (err) {
    console.error('Create category error:', err);
    res.status(400).json({ message: err.message || 'Error creating category' });
  }
});

// @route   PUT /api/categories/:id
// @desc    Update category (Admin / Owner only)
router.put('/:id', ownerOrAdminAuth, async (req, res) => {
  try {
    const updatedCategory = await Category.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!updatedCategory) {
      return res.status(404).json({ message: 'Category not found' });
    }

    const io = req.app.get('socketio');
    if (io) {
      io.emit('category:updated', updatedCategory);
    }

    res.json({ success: true, data: updatedCategory });
  } catch (err) {
    console.error('Update category error:', err);
    res.status(400).json({ message: err.message || 'Error updating category' });
  }
});

// @route   DELETE /api/categories/:id
// @desc    Delete / deactivate category (Admin / Owner only)
router.delete('/:id', ownerOrAdminAuth, async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    const io = req.app.get('socketio');
    if (io) {
      io.emit('category:deleted', { id: req.params.id, name: category.name });
    }

    res.json({ success: true, message: 'Category deleted successfully' });
  } catch (err) {
    console.error('Delete category error:', err);
    res.status(500).json({ message: 'Error deleting category' });
  }
});

module.exports = router;
