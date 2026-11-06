const express = require('express');
const router = express.Router();
const FoodItem = require('../models/FoodItem');
const { protect, adminOnly } = require('../middleware/auth');

// @route   GET /api/food
// @desc    Get all food items with optional filters
router.get('/', async (req, res) => {
  try {
    const { category, search, isVeg, availableOnly } = req.query;
    let query = {};

    if (category && category !== 'All') {
      query.category = category;
    }

    if (isVeg === 'true') {
      query.isVeg = true;
    } else if (isVeg === 'false') {
      query.isVeg = false;
    }

    if (availableOnly === 'true') {
      query.isAvailable = true;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } },
      ];
    }

    const items = await FoodItem.find(query).sort({ rating: -1, createdAt: -1 });
    res.json({ success: true, count: items.length, data: items });
  } catch (err) {
    console.error('Fetch food error:', err);
    res.status(500).json({ message: 'Error retrieving food items' });
  }
});

// @route   GET /api/food/popular
// @desc    Get top rated & popular items
router.get('/popular', async (req, res) => {
  try {
    const popular = await FoodItem.find({ isAvailable: true })
      .sort({ rating: -1, reviewCount: -1 })
      .limit(6);
    res.json({ success: true, data: popular });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching popular items' });
  }
});

// @route   GET /api/food/:id
// @desc    Get single food item details
router.get('/:id', async (req, res) => {
  try {
    const item = await FoodItem.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Food item not found' });
    }
    res.json({ success: true, data: item });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching item details' });
  }
});

// @route   POST /api/food
// @desc    Add a new food item (Admin only)
router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      category,
      isVeg,
      image,
      preparationTime,
      calories,
      tags,
      counter,
      stockCount,
    } = req.body;

    const newItem = await FoodItem.create({
      name,
      description,
      price: Number(price),
      category,
      isVeg: Boolean(isVeg),
      image: image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80',
      preparationTime: Number(preparationTime) || 10,
      calories: Number(calories) || 250,
      tags: Array.isArray(tags) ? tags : (tags ? tags.split(',').map(t => t.trim()) : ['Campus Favorite']),
      counter: Number(counter) || 1,
      stockCount: Number(stockCount) || 50,
      isAvailable: true,
    });

    // Broadcast menu update via socket
    const io = req.app.get('socketio');
    if (io) {
      io.emit('menu:item_added', newItem);
    }

    res.status(201).json({ success: true, data: newItem });
  } catch (err) {
    console.error('Create food item error:', err);
    res.status(400).json({ message: err.message || 'Error creating food item' });
  }
});

// @route   PUT /api/food/:id
// @desc    Update food item (Admin only)
router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const updatedItem = await FoodItem.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!updatedItem) {
      return res.status(404).json({ message: 'Food item not found' });
    }

    const io = req.app.get('socketio');
    if (io) {
      io.emit('menu:item_updated', updatedItem);
    }

    res.json({ success: true, data: updatedItem });
  } catch (err) {
    res.status(400).json({ message: err.message || 'Error updating food item' });
  }
});

// @route   PATCH /api/food/:id/toggle-stock
// @desc    Toggle Available / Out of stock (Admin only)
router.patch('/:id/toggle-stock', protect, adminOnly, async (req, res) => {
  try {
    const item = await FoodItem.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Food item not found' });
    }

    item.isAvailable = !item.isAvailable;
    await item.save();

    const io = req.app.get('socketio');
    if (io) {
      io.emit('menu:stock_changed', {
        id: item._id,
        isAvailable: item.isAvailable,
        name: item.name,
      });
    }

    res.json({ success: true, data: item });
  } catch (err) {
    res.status(500).json({ message: 'Error toggling stock' });
  }
});

// @route   DELETE /api/food/:id
// @desc    Delete food item (Admin only)
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const item = await FoodItem.findByIdAndDelete(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Food item not found' });
    }

    const io = req.app.get('socketio');
    if (io) {
      io.emit('menu:item_deleted', { id: req.params.id });
    }

    res.json({ success: true, message: 'Food item deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting food item' });
  }
});

module.exports = router;
