const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const FoodItem = require('../models/FoodItem');
const { ownerOrAdminAuth } = require('../middleware/auth');

// Helper to query by either 24-character MongoDB ObjectId, custom string ID (e.g. food-1), or dish name
const findFoodQuery = (rawId) => {
  if (!rawId) return { _id: null };
  const isMongoId = mongoose.Types.ObjectId.isValid(rawId);
  if (isMongoId) {
    return { $or: [{ _id: rawId }, { id: rawId }] };
  }
  return { $or: [{ id: String(rawId) }, { name: String(rawId) }] };
};

// @route   GET /api/food
// @desc    Get all food items with optional filters
router.get('/', async (req, res) => {
  try {
    const { category, search, isVeg, availableOnly } = req.query;
    let query = {};

    if (category && category !== 'All') {
      query.category = { $regex: new RegExp(`^${category}$`, 'i') };
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
    const query = findFoodQuery(req.params.id);
    const item = await FoodItem.findOne(query);
    if (!item) {
      return res.status(404).json({ message: 'Food item not found' });
    }
    res.json({ success: true, data: item });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching item details' });
  }
});

// @route   POST /api/food
// @desc    Add a new food item (Owner / Admin)
router.post('/', ownerOrAdminAuth, async (req, res) => {
  try {
    const {
      id,
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
      id: id || 'food-' + Date.now(),
      name: name?.trim(),
      description: description?.trim() || '',
      price: Number(price) || 0,
      category: category?.trim() || 'Fast Food',
      isVeg: isVeg !== undefined ? Boolean(isVeg) : true,
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
      io.emit('food:created', newItem);
      io.emit('menu:item_added', newItem);
      io.emit('menu:updated', { action: 'created', item: newItem });
    }

    res.status(201).json({ success: true, data: newItem });
  } catch (err) {
    console.error('Create food item error:', err);
    res.status(400).json({ message: err.message || 'Error creating food item' });
  }
});

// @route   PUT /api/food/:id
// @desc    Update food item (Owner / Admin)
router.put('/:id', ownerOrAdminAuth, async (req, res) => {
  try {
    const query = findFoodQuery(req.params.id);
    const updatedItem = await FoodItem.findOneAndUpdate(
      query,
      req.body,
      { new: true, runValidators: true }
    );

    if (!updatedItem) {
      return res.status(404).json({ message: 'Food item not found' });
    }

    const io = req.app.get('socketio');
    if (io) {
      io.emit('food:updated', updatedItem);
      io.emit('menu:item_updated', updatedItem);
      io.emit('menu:updated', { action: 'updated', item: updatedItem });
    }

    res.json({ success: true, data: updatedItem });
  } catch (err) {
    console.error('Update food item error:', err);
    res.status(400).json({ message: err.message || 'Error updating food item' });
  }
});

// @route   PATCH /api/food/:id/toggle-stock
// @desc    Toggle Available / Out of stock (Owner / Admin)
router.patch('/:id/toggle-stock', ownerOrAdminAuth, async (req, res) => {
  try {
    const query = findFoodQuery(req.params.id);
    const item = await FoodItem.findOne(query);
    if (!item) {
      return res.status(404).json({ message: 'Food item not found' });
    }

    item.isAvailable = !item.isAvailable;
    await item.save();

    const io = req.app.get('socketio');
    if (io) {
      io.emit('food:availabilityChanged', {
        id: item._id,
        _id: item._id,
        isAvailable: item.isAvailable,
        name: item.name,
      });
      io.emit('food:updated', item);
      io.emit('menu:stock_changed', {
        id: item._id,
        _id: item._id,
        isAvailable: item.isAvailable,
        name: item.name,
      });
      io.emit('menu:updated', { action: 'stock_changed', item });
    }

    res.json({ success: true, data: item });
  } catch (err) {
    console.error('Toggle stock error:', err);
    res.status(500).json({ message: 'Error toggling stock' });
  }
});

// @route   DELETE /api/food/:id
// @desc    Delete food item (Owner / Admin)
router.delete('/:id', ownerOrAdminAuth, async (req, res) => {
  try {
    const query = findFoodQuery(req.params.id);
    const item = await FoodItem.findOneAndDelete(query);
    if (!item) {
      return res.status(404).json({ message: 'Food item not found' });
    }

    const io = req.app.get('socketio');
    if (io) {
      io.emit('food:deleted', { id: item.id || item._id, _id: item._id, name: item.name });
      io.emit('menu:item_deleted', { id: item.id || item._id, _id: item._id });
      io.emit('menu:updated', { action: 'deleted', id: item.id || item._id, _id: item._id });
    }

    res.json({ success: true, message: 'Food item deleted successfully', deletedId: item.id || item._id });
  } catch (err) {
    console.error('Delete food item error:', err);
    res.status(500).json({ message: 'Error deleting food item' });
  }
});

module.exports = router;
