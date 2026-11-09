const express = require('express');
const router = express.Router();
const Canteen = require('../models/Canteen');
const Order = require('../models/Order');
const User = require('../models/User');
const NotificationLog = require('../models/NotificationLog');
const { protect, adminOnly } = require('../middleware/auth');

// Super Admin guard middleware
const superAdminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'super_admin') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied: Super Admin / Owner privileges required' });
  }
};

// @route   GET /api/canteens
// @desc    PUBLIC: List all campus canteens and their live open/closed status
router.get('/', async (req, res) => {
  try {
    const canteens = await Canteen.find().sort({ createdAt: 1 });
    res.json({ success: true, count: canteens.length, data: canteens });
  } catch (err) {
    res.status(500).json({ message: 'Error retrieving canteens list' });
  }
});

// @route   GET /api/canteens/current
// @desc    Get primary campus canteen live status
router.get('/current', async (req, res) => {
  try {
    let canteen = await Canteen.findOne({ code: 'CANTEEN-01' });
    if (!canteen) {
      canteen = await Canteen.create({
        name: 'MITS Main Canteen',
        code: 'MITS-01',
        location: 'MITS Main Canteen, Counter, MITS Gwalior',
        isOpen: true,
        status: 'Operational',
        openingTime: '08:00 AM',
        closingTime: '07:30 PM',
        activeCounters: 1,
        managerName: 'MITS Canteen Incharge',
        managerPhone: '+91 98112 23344',
        rating: 4.9,
      });
    }
    res.json({ success: true, data: canteen });
  } catch (err) {
    res.status(500).json({ message: 'Error retrieving current canteen' });
  }
});

// @route   PATCH /api/canteens/:id/toggle-open
// @desc    Admin / Super Admin: Toggle Canteen Open or Closed
router.patch('/:id/toggle-open', protect, adminOnly, async (req, res) => {
  try {
    const canteen = await Canteen.findById(req.params.id);
    if (!canteen) {
      return res.status(404).json({ message: 'Canteen not found' });
    }

    canteen.isOpen = !canteen.isOpen;
    canteen.status = canteen.isOpen ? 'Operational' : 'Closed';
    await canteen.save();

    // Broadcast live socket event to all students and kiosks
    const io = req.app.get('socketio');
    if (io) {
      io.emit('canteen:status_changed', {
        id: canteen._id,
        name: canteen.name,
        isOpen: canteen.isOpen,
        status: canteen.status,
      });
      io.emit('canteen:updated', canteen);
    }

    res.json({ success: true, message: `Canteen is now ${canteen.isOpen ? 'OPEN' : 'CLOSED'}`, data: canteen });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update canteen status' });
  }
});

// @route   PATCH /api/canteens/:id/payment-qr
// @desc    CANTEEN OWNER ONLY: Upload or configure custom payment QR code & UPI VPA
router.patch('/:id/payment-qr', protect, adminOnly, async (req, res) => {
  try {
    const { qrCodeImage, upiId, upiMerchantName } = req.body;
    const canteen = await Canteen.findById(req.params.id);
    if (!canteen) {
      return res.status(404).json({ message: 'Canteen not found' });
    }

    if (qrCodeImage !== undefined) canteen.qrCodeImage = qrCodeImage;
    if (upiId) canteen.upiId = upiId.trim();
    if (upiMerchantName) canteen.upiMerchantName = upiMerchantName.trim();

    await canteen.save();

    // Broadcast live socket event so checkout & kiosk receive updated payment QR
    const io = req.app.get('socketio');
    if (io) {
      io.emit('canteen:payment_qr_updated', {
        id: canteen._id,
        name: canteen.name,
        qrCodeImage: canteen.qrCodeImage,
        upiId: canteen.upiId,
        upiMerchantName: canteen.upiMerchantName,
      });
      io.emit('canteen:updated', canteen);
    }

    res.json({
      success: true,
      message: 'Canteen Payment QR updated successfully',
      data: canteen,
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update payment QR', error: err.message });
  }
});

// @route   GET /api/canteens/super-admin/overview
// @desc    SUPER ADMIN / OWNER: Full multi-canteen registry & system health
router.get('/super-admin/overview', protect, superAdminOnly, async (req, res) => {
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const [
      allCanteens,
      totalOrders,
      todayOrders,
      allUsers,
      recentWhatsAppLogs,
    ] = await Promise.all([
      Canteen.find(),
      Order.countDocuments(),
      Order.find({ createdAt: { $gte: startOfDay } }),
      User.find().select('-password'),
      NotificationLog.find().sort({ sentAt: -1 }).limit(20),
    ]);

    const operationalCanteens = allCanteens.filter(c => c.isOpen && c.status === 'Operational').length;
    const todayRevenue = todayOrders
      .filter(o => o.status !== 'Cancelled')
      .reduce((sum, o) => sum + (o.finalAmount || 0), 0);

    const totalStudents = allUsers.filter(u => u.role === 'student').length;
    const totalStaff = allUsers.filter(u => u.role === 'admin' || u.role === 'staff').length;

    res.json({
      success: true,
      stats: {
        totalRegisteredCanteens: allCanteens.length,
        operationalCanteens,
        totalOrders,
        todayOrdersCount: todayOrders.length,
        todayRevenue,
        totalStudents,
        totalStaff,
        systemHealth: operationalCanteens > 0 ? 'Optimal (100% Online)' : 'Canteens Closed',
      },
      canteens: allCanteens,
      recentNotifications: recentWhatsAppLogs,
      users: allUsers,
    });
  } catch (err) {
    console.error('Super admin overview error:', err);
    res.status(500).json({ message: 'Failed to retrieve super admin overview' });
  }
});

// @route   POST /api/canteens
// @desc    SUPER ADMIN: Register a new canteen branch
router.post('/', protect, superAdminOnly, async (req, res) => {
  try {
    const { name, code, location, openingTime, closingTime, managerName, managerPhone } = req.body;
    if (!name || !code) {
      return res.status(400).json({ message: 'Canteen Name and Code are required' });
    }

    const existing = await Canteen.findOne({ code: code.toUpperCase() });
    if (existing) {
      return res.status(400).json({ message: 'A canteen with this code already exists' });
    }

    const newCanteen = await Canteen.create({
      name,
      code: code.toUpperCase(),
      location: location || 'Campus',
      openingTime: openingTime || '08:00 AM',
      closingTime: closingTime || '08:00 PM',
      managerName: managerName || 'Assigned Manager',
      managerPhone: managerPhone || '+91 98000 00000',
      isOpen: true,
      status: 'Operational',
    });

    res.status(201).json({ success: true, data: newCanteen });
  } catch (err) {
    res.status(400).json({ message: err.message || 'Failed to register canteen' });
  }
});

// @route   PATCH /api/canteens/users/:id/toggle-status
// @desc    SUPER ADMIN: Activate / Deactivate student or canteen manager
router.patch('/users/:id/toggle-status', protect, superAdminOnly, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.json({ success: true, message: `User is now ${user.isActive ? 'Active' : 'Deactivated'}`, data: user });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update user status' });
  }
});

module.exports = router;
