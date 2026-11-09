const express = require('express');
const router = express.Router();
const HomepageConfig = require('../models/HomepageConfig');
const { protect, adminOnly } = require('../middleware/auth');

// Helper to get or create singleton config
async function getOrCreateConfig() {
  let config = await HomepageConfig.findOne({ key: 'main_homepage_config' });
  if (!config) {
    config = await HomepageConfig.create({ key: 'main_homepage_config' });
  }
  return config;
}

// @route   GET /api/homepage
// @desc    Get current homepage configuration (cravings, offers, banners)
router.get('/', async (req, res) => {
  try {
    const config = await getOrCreateConfig();
    res.json({ success: true, data: config });
  } catch (err) {
    console.error('Fetch homepage config error:', err);
    res.status(500).json({ message: 'Error retrieving homepage config' });
  }
});

// @route   PUT /api/homepage
// @desc    Update homepage configuration (Admin / Owner only)
router.put('/', protect, adminOnly, async (req, res) => {
  try {
    const {
      cravingsTitle,
      cravingsSubtitle,
      featuredCravingsIds,
      dailyDiscounts,
      specialOfferBanner,
    } = req.body;

    const config = await getOrCreateConfig();

    if (cravingsTitle !== undefined) config.cravingsTitle = cravingsTitle;
    if (cravingsSubtitle !== undefined) config.cravingsSubtitle = cravingsSubtitle;
    if (featuredCravingsIds !== undefined) config.featuredCravingsIds = featuredCravingsIds;
    if (dailyDiscounts !== undefined) config.dailyDiscounts = dailyDiscounts;
    if (specialOfferBanner !== undefined) config.specialOfferBanner = specialOfferBanner;

    await config.save();

    const io = req.app.get('socketio');
    if (io) {
      io.emit('homepage:updated', config);
      io.emit('offer:updated', {
        dailyDiscounts: config.dailyDiscounts,
        specialOfferBanner: config.specialOfferBanner,
      });
    }

    res.json({ success: true, message: 'Homepage config updated successfully', data: config });
  } catch (err) {
    console.error('Update homepage config error:', err);
    res.status(400).json({ message: err.message || 'Error updating homepage config' });
  }
});

// Also allow POST for flexibility
router.post('/', protect, adminOnly, async (req, res) => {
  req.method = 'PUT';
  router.handle(req, res);
});

module.exports = router;
