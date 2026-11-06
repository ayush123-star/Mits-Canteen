const express = require('express');
const router = express.Router();
const Recipe = require('../models/Recipe');

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
router.post('/', async (req, res) => {
  try {
    const { menuItemId, menuItemName, ingredients, prepInstructions, lastUpdatedBy } = req.body;

    let recipe = await Recipe.findOne({ menuItemId });
    if (recipe) {
      recipe.ingredients = ingredients;
      recipe.menuItemName = menuItemName || recipe.menuItemName;
      recipe.prepInstructions = prepInstructions || recipe.prepInstructions;
      recipe.lastUpdatedBy = lastUpdatedBy || 'Chef Manager';
      await recipe.save();
    } else {
      recipe = await Recipe.create({
        menuItemId,
        menuItemName,
        ingredients,
        prepInstructions,
        lastUpdatedBy: lastUpdatedBy || 'Chef Manager',
      });
    }

    res.json({ success: true, data: recipe });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to save recipe', error: err.message });
  }
});

module.exports = router;
