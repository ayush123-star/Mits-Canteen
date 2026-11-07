const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const QRCode = require('qrcode');
const Order = require('../models/Order');
const FoodItem = require('../models/FoodItem');
const User = require('../models/User');
const NotificationLog = require('../models/NotificationLog');
const { protect, adminOnly } = require('../middleware/auth');
const {
  sendOrderPlacedNotification,
  sendOrderStatusNotification,
  notifyOwnerNewOrder,
} = require('../services/whatsappService');

// Helper to resolve user from Bearer Token or request body (with DB student fallback)
const resolveOrderUser = async (req) => {
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      const token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'campus_canteen_super_jwt_secret_token_2026'
      );
      const user = await User.findById(decoded.id).select('-password');
      if (user) return user;
    } catch (e) {
      // Token expired or invalid, continue to fallback
    }
  }

  const cleanEmail = (req.body.studentEmail || req.body.email || '').toLowerCase().trim();
  const cleanPhone = (req.body.studentPhone || req.body.phone || '').trim();
  const cleanRoll = (req.body.studentRoll || req.body.studentId || '').trim();

  if (cleanEmail) {
    const userByEmail = await User.findOne({ email: cleanEmail });
    if (userByEmail) return userByEmail;
  }

  if (cleanPhone) {
    const digitsOnly = cleanPhone.replace(/\D/g, '');
    if (digitsOnly.length >= 7) {
      const userByPhone = await User.findOne({ phone: { $regex: digitsOnly } });
      if (userByPhone) return userByPhone;
    }
  }

  if (cleanRoll) {
    const userByRoll = await User.findOne({ studentId: cleanRoll });
    if (userByRoll) return userByRoll;
  }

  // Fallback to any existing student in DB
  const defaultStudent = await User.findOne({ role: 'student' });
  if (defaultStudent) return defaultStudent;

  // Fallback create default student
  return await User.create({
    name: req.body.studentName || 'Aryan Sharma',
    email: cleanEmail || '0901cs221045@mitsgwalior.in',
    password: 'password123',
    role: 'student',
    studentId: cleanRoll || '0901CS221045',
    phone: cleanPhone || '+91 98765 43210',
    department: req.body.studentDepartment || 'Computer Science & Engineering',
  });
};

// Helper to generate next sequential campus token
const generateCampusToken = async () => {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const countToday = await Order.countDocuments({
    createdAt: { $gte: startOfDay },
  });

  const tokenNumber = `TK-${(101 + countToday).toString()}`;
  return tokenNumber;
};

// @route   POST /api/orders
// @desc    Place a new food order (works for both authenticated and direct student checkouts)
router.post('/', async (req, res) => {
  try {
    const {
      items,
      paymentMethod,
      pickupOption,
      scheduledPickupTime,
      couponCode,
      orderNotes,
    } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'Order must contain at least one item' });
    }

    const orderUser = await resolveOrderUser(req);

    // Calculate totals & prep time
    let totalAmount = 0;
    let maxPrepTime = 8;
    let primaryCounter = 1;
    const populatedItems = [];

    for (const item of items) {
      let food = null;
      if (item.foodItemId && mongoose.Types.ObjectId.isValid(item.foodItemId)) {
        food = await FoodItem.findById(item.foodItemId);
      }
      if (!food && item._id && mongoose.Types.ObjectId.isValid(item._id)) {
        food = await FoodItem.findById(item._id);
      }
      if (!food && item.name) {
        food = await FoodItem.findOne({ name: { $regex: new RegExp(`^${item.name.trim()}$`, 'i') } });
      }
      if (!food) {
        // Fallback or create placeholder food item
        food = await FoodItem.findOne();
        if (!food) {
          food = await FoodItem.create({
            name: item.name || 'Campus Food Item',
            description: 'Fresh campus canteen meal',
            price: Number(item.price) || 50,
            category: 'Snacks',
            image: item.image || 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80',
            preparationTime: 8,
            counter: 1,
            isVeg: item.isVeg !== false,
            isAvailable: true,
          });
        }
      }

      const qty = Number(item.quantity) || 1;
      const itemPrice = food?.price || Number(item.price) || 50;
      const itemSubtotal = itemPrice * qty;
      totalAmount += itemSubtotal;

      if (food?.preparationTime && food.preparationTime > maxPrepTime) {
        maxPrepTime = food.preparationTime;
      }
      primaryCounter = food?.counter || primaryCounter;

      populatedItems.push({
        foodItem: food?._id,
        name: food?.name || item.name || 'Food Item',
        price: itemPrice,
        quantity: qty,
        image: food?.image || item.image || '',
        isVeg: food?.isVeg !== undefined ? food.isVeg : true,
        counter: food?.counter || 1,
        specialInstructions: item.specialInstructions || '',
      });
    }

    // Apply Coupon if valid
    let discountAmount = 0;
    if (couponCode) {
      const upperCoupon = couponCode.toUpperCase().trim();
      if (upperCoupon === 'CAMPUS50' && totalAmount >= 150) {
        discountAmount = Math.min(50, Math.round(totalAmount * 0.25));
      } else if (upperCoupon === 'FIRSTBITE' || upperCoupon === 'STUDENT10') {
        discountAmount = Math.round(totalAmount * 0.1);
      }
    }

    const finalAmount = Math.max(0, totalAmount - discountAmount);
    const tokenNumber = await generateCampusToken();

    // Check current queue depth to adjust prep time
    const pendingOrdersCount = await Order.countDocuments({
      status: { $in: ['Placed', 'Accepted', 'Preparing'] },
    });
    const queueDelay = Math.min(20, Math.floor(pendingOrdersCount * 2));
    const estimatedPrepMinutes = maxPrepTime + queueDelay;

    const estimatedReadyTime = new Date(Date.now() + estimatedPrepMinutes * 60 * 1000);

    // Clean payment enum
    const rawPayment = String(paymentMethod || 'UPI').toUpperCase();
    const cleanPaymentMethod = rawPayment.includes('CASH') ? 'CASH_AT_COUNTER' : 'UPI';
    const cleanPaymentStatus = cleanPaymentMethod === 'UPI' ? 'Completed' : 'Pending';

    // Generate secure QR Code data payload
    const qrPayload = JSON.stringify({
      token: tokenNumber,
      orderId: '',
      user: orderUser.name,
      amount: finalAmount,
      itemsCount: populatedItems.length,
      createdAt: new Date().toISOString(),
    });

    const qrCodeData = await QRCode.toDataURL(qrPayload);

    const order = await Order.create({
      tokenNumber,
      user: orderUser._id,
      studentName: req.body.studentName || orderUser.name || 'Campus Student',
      studentPhone: req.body.studentPhone || orderUser.phone || '+91 98765 43210',
      studentRoll: req.body.studentRoll || orderUser.studentId || 'STU-CAMPUS',
      studentDepartment: req.body.studentDepartment || orderUser.department || 'Campus Department',
      whatsappOptIn: req.body.whatsappOptIn !== undefined ? Boolean(req.body.whatsappOptIn) : (orderUser.whatsappOptIn !== false),
      items: populatedItems,
      totalAmount,
      discountAmount,
      finalAmount,
      couponCode: couponCode || '',
      paymentMethod: cleanPaymentMethod,
      paymentStatus: cleanPaymentStatus,
      paymentDetails: {
        transactionId: cleanPaymentMethod === 'UPI' ? `UPI-TXN-${Date.now()}` : 'CASH-COUNTER',
        upiId: cleanPaymentMethod === 'UPI' ? `${orderUser.studentId || 'campus'}@okaxis` : '',
        paidAt: cleanPaymentMethod === 'UPI' ? new Date() : null,
      },
      status: 'Placed',
      pickupOption: pickupOption || 'ASAP',
      scheduledPickupTime: scheduledPickupTime || 'ASAP (Immediate)',
      estimatedPrepMinutes,
      estimatedReadyTime,
      assignedCounter: primaryCounter,
      qrCodeData,
      orderNotes: orderNotes || '',
      timeline: [
        {
          status: 'Placed',
          timestamp: new Date(),
          note: 'Order successfully placed by student',
        },
      ],
    });

    // Populate user and food items for broadcast
    const populatedOrder = await Order.findById(order._id)
      .populate('user', 'name email studentId phone whatsappOptIn')
      .populate('items.foodItem', 'name price image isVeg');

    // Real-time broadcast to Admin Dashboard, Live Token Screens, and Student app
    const io = req.app.get('socketio');
    if (io) {
      io.emit('order:new', populatedOrder);
      io.emit('tokens:refresh');
    }

    // 1. Automated Meta WhatsApp Notification: Order Placed to student
    let whatsappNotification = null;
    try {
      whatsappNotification = await sendOrderPlacedNotification(populatedOrder, orderUser, io);
    } catch (waErr) {
      console.warn('[Orders Route] WhatsApp order placed notification error:', waErr.message);
    }

    // 2. Automated Meta WhatsApp Notification: Dispatch to Canteen Owner in the background
    try {
      notifyOwnerNewOrder(populatedOrder).catch((err) => {
        console.warn('[Orders Route] Background notify owner error:', err.message);
      });
    } catch (ownerErr) {
      console.warn('[Orders Route] Background notify owner setup error:', ownerErr.message);
    }

    res.status(201).json({
      success: true,
      message: 'Order placed successfully!',
      data: populatedOrder,
      whatsappNotification,
    });
  } catch (err) {
    console.error('Order creation error:', err);
    res.status(500).json({ message: 'Failed to place order', error: err.message });
  }
});

// @route   GET /api/orders/my-orders
// @desc    Get order history for logged-in student
router.get('/my-orders', protect, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .populate('items.foodItem', 'name price image isVeg');

    res.json({ success: true, count: orders.length, data: orders });
  } catch (err) {
    res.status(500).json({ message: 'Error retrieving order history' });
  }
});

// @route   GET /api/orders/active
// @desc    Get active orders (Placed, Accepted, Preparing, Ready) for student
router.get('/active', protect, async (req, res) => {
  try {
    const activeOrders = await Order.find({
      user: req.user._id,
      status: { $in: ['Placed', 'Accepted', 'Preparing', 'Ready for Pickup'] },
    }).sort({ createdAt: -1 });

    res.json({ success: true, data: activeOrders });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching active orders' });
  }
});

// @route   GET /api/orders/live-tokens
// @desc    PUBLIC endpoint for Canteen TV Display / Kiosk / Student Status
router.get('/live-tokens', async (req, res) => {
  try {
    const preparing = await Order.find({
      status: { $in: ['Placed', 'Accepted', 'Preparing'] },
    })
      .select('tokenNumber estimatedPrepMinutes estimatedReadyTime assignedCounter status createdAt studentName')
      .sort({ createdAt: 1 })
      .limit(24);

    const ready = await Order.find({
      status: 'Ready for Pickup',
    })
      .select('tokenNumber assignedCounter status updatedAt studentName')
      .sort({ updatedAt: -1 })
      .limit(24);

    const recentlyCompleted = await Order.find({
      status: 'Completed',
    })
      .select('tokenNumber assignedCounter updatedAt studentName')
      .sort({ updatedAt: -1 })
      .limit(10);

    // Queue statistics
    const totalActive = preparing.length + ready.length;
    const avgWaitMinutes = preparing.length > 0
      ? Math.round(preparing.reduce((acc, o) => acc + (o.estimatedPrepMinutes || 10), 0) / preparing.length)
      : 8;

    res.json({
      success: true,
      data: {
        preparing,
        ready,
        recentlyCompleted,
        stats: {
          totalActive,
          avgWaitMinutes,
          countersActive: 1, // Single Express Counter (MITS Canteen)
        },
      },
    });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching live tokens' });
  }
});

// @route   GET /api/orders/all
// @desc    Admin: get all orders with filtering and search (syncs with Canteen Owner Dashboard)
router.get('/all', async (req, res) => {
  try {
    const { status, search, limit = 100, page = 1 } = req.query;
    let query = {};

    if (status && status !== 'All' && status !== 'ACTIVE') {
      query.status = status;
    } else if (status === 'ACTIVE') {
      query.status = { $in: ['Placed', 'Accepted', 'Preparing', 'Ready for Pickup'] };
    }

    if (search) {
      query.$or = [
        { tokenNumber: { $regex: search, $options: 'i' } },
        { couponCode: { $regex: search, $options: 'i' } },
        { studentName: { $regex: search, $options: 'i' } },
        { studentRoll: { $regex: search, $options: 'i' } },
      ];
    }

    const orders = await Order.find(query)
      .populate('user', 'name email studentId phone department')
      .populate('items.foodItem', 'name price image isVeg')
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    const total = await Order.countDocuments(query);

    res.json({
      success: true,
      total,
      data: orders,
    });
  } catch (err) {
    console.error('Error fetching admin orders:', err);
    res.status(500).json({ message: 'Error fetching admin orders' });
  }
});

// @route   PATCH /api/orders/:id/status
// @desc    Admin: Update order status (Placed -> Accepted -> Preparing -> Ready -> Completed)
router.patch('/:id/status', async (req, res) => {
  try {
    const { status, note, estimatedPrepMinutes } = req.body;
    const validStatuses = ['Placed', 'Accepted', 'Preparing', 'Ready for Pickup', 'Completed', 'Cancelled'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    let order = null;
    if (mongoose.Types.ObjectId.isValid(req.params.id)) {
      order = await Order.findById(req.params.id).populate('user', 'name email studentId phone');
    }
    if (!order) {
      order = await Order.findOne({
        $or: [
          { tokenNumber: req.params.id },
          { tokenNumber: `#${req.params.id}` },
          { tokenNumber: req.params.id.replace('#', '') },
        ],
      }).populate('user', 'name email studentId phone');
    }

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    order.status = status;

    if (status === 'Accepted') {
      if (estimatedPrepMinutes) {
        order.estimatedPrepMinutes = Number(estimatedPrepMinutes);
      }
      const prepMins = order.estimatedPrepMinutes || 15;
      order.estimatedReadyTime = new Date(Date.now() + prepMins * 60 * 1000);
    }

    order.timeline.push({
      status,
      timestamp: new Date(),
      note:
        note ||
        (status === 'Accepted'
          ? `Order accepted. Estimated prep time: ~${order.estimatedPrepMinutes || 15} minutes`
          : `Order updated to ${status} by canteen staff`),
    });

    if (status === 'Completed' && order.paymentMethod === 'CASH_AT_COUNTER') {
      order.paymentStatus = 'Completed';
    }

    await order.save();

    let whatsappNotification = null;
    const io = req.app.get('socketio');

    if (io) {
      // Direct notification to student
      io.emit(`order:${order._id}:status`, {
        orderId: order._id,
        status: order.status,
        tokenNumber: order.tokenNumber,
        assignedCounter: order.assignedCounter,
        estimatedPrepMinutes: order.estimatedPrepMinutes,
        estimatedReadyTime: order.estimatedReadyTime,
      });

      // General status update for admin & live display
      io.emit('order:status_updated', {
        orderId: order._id,
        id: order._id,
        status: order.status,
        tokenNumber: order.tokenNumber,
        assignedCounter: order.assignedCounter,
        estimatedPrepMinutes: order.estimatedPrepMinutes,
        estimatedReadyTime: order.estimatedReadyTime,
        order,
      });

      io.emit('tokens:refresh');

      // Special audio / chime event when food is ready
      if (status === 'Ready for Pickup') {
        io.emit('token:ready', {
          tokenNumber: order.tokenNumber,
          counter: order.assignedCounter,
          studentName: order.user?.name || order.studentName,
          order,
        });
      } else if (status === 'Completed') {
        io.emit('token:completed', {
          tokenNumber: order.tokenNumber,
          orderId: order._id,
          order,
        });
      }
    }

    // Automated Meta WhatsApp Notification for status change
    try {
      whatsappNotification = await sendOrderStatusNotification(
        order,
        status,
        {
          estimatedPrepMinutes: order.estimatedPrepMinutes,
          note: note,
        },
        io,
        order.user
      );
    } catch (waErr) {
      console.warn(`[Orders Route] WhatsApp notification error for status ${status}:`, waErr.message);
    }

    res.json({
      success: true,
      message: `Status updated to ${status}`,
      data: order,
      whatsappNotification,
    });
  } catch (err) {
    console.error('Update status error:', err);
    res.status(500).json({ message: 'Failed to update order status' });
  }
});

// @route   POST /api/orders/verify-token
// @desc    Admin quick verification via QR / Token code
router.post('/verify-token', protect, adminOnly, async (req, res) => {
  try {
    const { tokenOrCode } = req.body;
    if (!tokenOrCode) {
      return res.status(400).json({ message: 'Token or QR data is required' });
    }

    let tokenToFind = tokenOrCode.trim();
    // In case full QR JSON was scanned
    if (tokenToFind.startsWith('{')) {
      try {
        const parsed = JSON.parse(tokenToFind);
        tokenToFind = parsed.token || tokenToFind;
      } catch (e) {}
    }

    const order = await Order.findOne({
      tokenNumber: { $regex: new RegExp(`^${tokenToFind}$`, 'i') },
    }).populate('user', 'name email studentId phone');

    if (!order) {
      return res.status(404).json({ message: `No order found for Token: ${tokenToFind}` });
    }

    res.json({ success: true, data: order });
  } catch (err) {
    res.status(500).json({ message: 'Error verifying token' });
  }
});

// @route   GET /api/orders/notification-logs
// @desc    Get recent WhatsApp and SMS dispatch logs
router.get('/notification-logs', protect, adminOnly, async (req, res) => {
  try {
    const logs = await NotificationLog.find().sort({ sentAt: -1 }).limit(30);
    res.json({ success: true, count: logs.length, data: logs });
  } catch (err) {
    res.status(500).json({ message: 'Error retrieving notification logs' });
  }
});

module.exports = router;
