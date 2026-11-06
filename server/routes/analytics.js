const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const FoodItem = require('../models/FoodItem');
const User = require('../models/User');
const { protect, adminOnly } = require('../middleware/auth');

let isRushHourActive = false;

// @route   GET /api/analytics/dashboard
// @desc    Admin high-level stats & metrics
router.get('/dashboard', protect, adminOnly, async (req, res) => {
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const [
      totalOrders,
      todayOrders,
      pendingOrders,
      completedOrders,
      cancelledOrders,
      totalStudents,
      totalMenuItems,
    ] = await Promise.all([
      Order.countDocuments(),
      Order.find({ createdAt: { $gte: startOfDay } }),
      Order.countDocuments({ status: { $in: ['Placed', 'Accepted', 'Preparing'] } }),
      Order.countDocuments({ status: 'Completed' }),
      Order.countDocuments({ status: 'Cancelled' }),
      User.countDocuments({ role: 'student' }),
      FoodItem.countDocuments(),
    ]);

    const todayRevenue = todayOrders
      .filter(o => o.status !== 'Cancelled')
      .reduce((sum, o) => sum + (o.finalAmount || 0), 0);

    const totalRevenue = (await Order.find({ status: { $ne: 'Cancelled' } }))
      .reduce((sum, o) => sum + (o.finalAmount || 0), 0);

    // Calculate hourly breakdown for today
    const hourlyOrders = new Array(12).fill(0); // 8 AM to 7 PM
    todayOrders.forEach(o => {
      const hour = new Date(o.createdAt).getHours();
      if (hour >= 8 && hour <= 19) {
        hourlyOrders[hour - 8] += 1;
      }
    });

    // Top selling items
    const topItems = await Order.aggregate([
      { $unwind: '$items' },
      { $group: { _id: '$items.name', count: { $sum: '$items.quantity' }, totalSales: { $sum: { $multiply: ['$items.price', '$items.quantity'] } } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    res.json({
      success: true,
      stats: {
        totalOrders,
        todayOrdersCount: todayOrders.length,
        todayRevenue,
        totalRevenue,
        pendingOrders,
        completedOrders,
        cancelledOrders,
        totalStudents,
        totalMenuItems,
        isRushHourActive,
        averageOrderValue: todayOrders.length > 0 ? Math.round(todayRevenue / todayOrders.length) : 0,
      },
      charts: {
        hourlyLabels: ['8am', '9am', '10am', '11am', '12pm', '1pm', '2pm', '3pm', '4pm', '5pm', '6pm', '7pm'],
        hourlyOrders,
        topItems,
      }
    });
  } catch (err) {
    console.error('Analytics error:', err);
    res.status(500).json({ message: 'Error retrieving analytics data' });
  }
});

// @route   POST /api/analytics/toggle-rush-hour
// @desc    Admin toggle rush hour mode
router.post('/toggle-rush-hour', protect, adminOnly, (req, res) => {
  isRushHourActive = !isRushHourActive;
  const io = req.app.get('socketio');
  if (io) {
    io.emit('rush_hour_status', { isRushHourActive });
  }
  res.json({ success: true, isRushHourActive });
});

// @route   GET /api/analytics/rush-hour
// @desc    Get rush hour state
router.get('/rush-hour', (req, res) => {
  res.json({ success: true, isRushHourActive });
});

module.exports = router;
