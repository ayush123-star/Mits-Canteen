const express = require('express');
const router = express.Router();
const Feedback = require('../models/Feedback');

// @route   GET /api/feedback
// @desc    Get all dish reviews and ratings
router.get('/', async (req, res) => {
  try {
    const reviews = await Feedback.find().sort({ createdAt: -1 });
    res.json({ success: true, data: reviews });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch reviews' });
  }
});

// @route   POST /api/feedback
// @desc    Submit student review
router.post('/', async (req, res) => {
  try {
    const { studentId, studentName, foodItemId, foodName, rating, comment, tags } = req.body;

    const review = await Feedback.create({
      studentId,
      studentName,
      foodItemId,
      foodName,
      rating: Number(rating),
      comment,
      tags: tags || [],
    });

    res.status(201).json({ success: true, data: review });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to submit review', error: err.message });
  }
});

// @route   DELETE /api/feedback/:id
// @desc    Delete review
router.delete('/:id', async (req, res) => {
  try {
    await Feedback.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Review removed' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to delete review' });
  }
});

module.exports = router;
