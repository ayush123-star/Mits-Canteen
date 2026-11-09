const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Recipe = require('../models/Recipe');
const { ownerOrAdminAuth } = require('../middleware/auth');

// @route   GET /api/recipes
// @desc    Get all dish recipes
router.get('/', async (req, res) => {
  try {
    const recipes = await Recipe.find();
    res.json({ success: true, data: recipes });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch recipes' });
  }
});

// @route   POST /api/recipes
// @desc    Save or update dish formula
router.post('/', ownerOrAdminAuth, async (req, res) => {
  try {
    const { menuItemId, menuItemName, ingredients, prepInstructions, lastUpdatedBy } = req.body;

    let recipe = await Recipe.findOne({
      $or: [
        { menuItemId: menuItemId },
        ...(mongoose.Types.ObjectId.isValid(menuItemId) ? [{ _id: menuItemId }] : []),
      ],
    });

    if (recipe) {
      recipe.ingredients = ingredients;
      recipe.menuItemName = menuItemName || recipe.menuItemName;
      recipe.prepInstructions = prepInstructions !== undefined ? prepInstructions : recipe.prepInstructions;
      recipe.lastUpdatedBy = lastUpdatedBy || req.user?.name || 'Chef Manager';
      await recipe.save();
    } else {
      recipe = await Recipe.create({
        menuItemId,
        menuItemName,
        ingredients,
        prepInstructions: prepInstructions || '',
        lastUpdatedBy: lastUpdatedBy || req.user?.name || 'Chef Manager',
      });
    }

    try {
      const io = req.app.get('io');
      if (io) {
        io.emit('recipe:saved', recipe);
        io.emit('recipe:sync');
      }
    } catch (_) {}

    res.json({ success: true, data: recipe, message: 'Recipe formula saved' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to save recipe', error: err.message });
  }
});

// @route   DELETE /api/recipes/:id
// @desc    Delete dish recipe formula
router.delete('/:id', ownerOrAdminAuth, async (req, res) => {
  try {
    const rawId = req.params.id;
    const recipe = await Recipe.findOneAndDelete({
      $or: [
        { menuItemId: rawId },
        ...(mongoose.Types.ObjectId.isValid(rawId) ? [{ _id: rawId }] : []),
      ],
    });

    if (!recipe) {
      return res.status(404).json({ success: false, message: 'Recipe not found' });
    }

    try {
      const io = req.app.get('io');
      if (io) {
        io.emit('recipe:deleted', { menuItemId: recipe.menuItemId, _id: recipe._id });
        io.emit('recipe:sync');
      }
    } catch (_) {}

    res.json({ success: true, message: 'Recipe formula deleted successfully', menuItemId: recipe.menuItemId });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to delete recipe', error: err.message });
  }
});

module.exports = router;
