const mongoose = require('mongoose');

const homepageConfigSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      default: 'main_homepage_config',
      unique: true,
    },
    cravingsTitle: {
      type: String,
      default: 'Popular Campus Cravings',
    },
    cravingsSubtitle: {
      type: String,
      default: 'Top rated and most ordered items across campus this week.',
    },
    featuredCravingsIds: {
      type: [String],
      default: ['food-1', 'food-2', 'food-3', 'food-5'],
    },
    dailyDiscounts: {
      type: mongoose.Schema.Types.Mixed,
      default: {
        Monday: { percent: 10, title: 'Monday Kickstart', active: true },
        Tuesday: { percent: 15, title: 'Tasty Tuesday Feast', active: true },
        Wednesday: { percent: 10, title: 'Mid-Week Hunger Buster', active: true },
        Thursday: { percent: 20, title: 'Thursday Campus Special', active: true },
        Friday: { percent: 15, title: 'Friday Weekend Prep', active: true },
        Saturday: { percent: 25, title: 'Super Saturday Mega Saver', active: true },
        Sunday: { percent: 20, title: 'Sunday Campus Brunch', active: true },
      },
    },
    specialOfferBanner: {
      type: mongoose.Schema.Types.Mixed,
      default: {
        badge: 'Campus Exclusive Daily Offers',
        heading: 'Get Flat Day Discount On Campus Cravings!',
        subtitle: 'Canteen owner daily offer active! Use promo code below for instant savings at checkout.',
        promoCode: 'CAMPUSDAY',
        minOrderValue: 99,
      },
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('HomepageConfig', homepageConfigSchema);
