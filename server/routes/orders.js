const express = require('express');
const router = express.Router();
const QRCode = require('qrcode');
const Order = require('../models/Order');
const FoodItem = require('../models/FoodItem');
const NotificationLog = require('../models/NotificationLog');
const { protect, adminOnly } = require('../middleware/auth');
const {
  sendOrderPlacedNotification,
  sendOrderStatusNotification,
  notifyOwnerNewOrder,
} = require('../services/whatsappService');

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
// @desc    Place a new food order
router.post('/', protect, async (req, res) => {
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

    // Calculate totals & prep time
    let totalAmount = 0;
    let maxPrepTime = 8;
    let primaryCounter = 1;
    const populatedItems = [];

    for (const item of items) {
      const food = await FoodItem.findById(item.foodItemId || item._id);
      if (!food) {
        return res.status(400).json({ message: `Item not found: ${item.name}` });
      }
      if (!food.isAvailable) {
        return res.status(400).json({ message: `${food.name} is currently out of stock` });
      }

      const qty = Number(item.quantity) || 1;
      const itemSubtotal = food.price * qty;
      totalAmount += itemSubtotal;

      if (food.preparationTime > maxPrepTime) {
        maxPrepTime = food.preparationTime;
      }
      primaryCounter = food.counter || primaryCounter;

      populatedItems.push({
        foodItem: food._id,
        name: food.name,
        price: food.price,
        quantity: qty,
        image: food.image,
        isVeg: food.isVeg,
        counter: food.counter || 1,
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

    // Generate secure QR Code data payload
    const qrPayload = JSON.stringify({
      token: tokenNumber,
      orderId: '', // will attach after creation
      user: req.user.name,
      amount: finalAmount,
      itemsCount: populatedItems.length,
      createdAt: new Date().toISOString(),
    });

    const qrCodeData = await QRCode.toDataURL(qrPayload);

    const order = await Order.create({
      tokenNumber,
      user: req.user._id,
      studentName: req.user.name || 'Campus Student',
      studentPhone: req.user.phone || '+91 98765 43210',
      studentRoll: req.user.studentId || 'STU-CAMPUS',
      studentDepartment: req.user.department || 'Campus Department',
      whatsappOptIn: req.body.whatsappOptIn !== undefined ? Boolean(req.body.whatsappOptIn) : (req.user.whatsappOptIn !== false),
      items: populatedItems,
      totalAmount,
      discountAmount,
      finalAmount,
      couponCode: couponCode || '',
      paymentMethod: paymentMethod || 'UPI',
      paymentStatus: paymentMethod === 'UPI' ? 'Completed' : 'Pending', // simulated or counter
      paymentDetails: {
        transactionId: paymentMethod === 'UPI' ? `UPI-TXN-${Date.now()}` : 'CASH-COUNTER',
        upiId: paymentMethod === 'UPI' ? `${req.user.studentId || 'campus'}@okaxis` : '',
        paidAt: paymentMethod === 'UPI' ? new Date() : null,
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

    // Populate user details for broadcast
    const populatedOrder = await Order.findById(order._id).populate('user', 'name email studentId phone whatsappOptIn');

    // Real-time broadcast to Admin Dashboard and Live Token Screens
    const io = req.app.get('socketio');
    if (io) {
      io.emit('order:new', populatedOrder);
      io.emit('tokens:refresh');
    }

    // 1. Automated Meta WhatsApp Notification: Order Placed to student
    let whatsappNotification = null;
    try {
      whatsappNotification = await sendOrderPlacedNotification(populatedOrder, req.user, io);
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
// @desc    PUBLIC endpoint for Canteen TV Display / Kiosk
router.get('/live-tokens', async (req, res) => {
  try {
    const preparing = await Order.find({
      status: { $in: ['Accepted', 'Preparing'] },
    })
      .select('tokenNumber estimatedPrepMinutes estimatedReadyTime assignedCounter status createdAt')
      .sort({ createdAt: 1 })
      .limit(16);

    const ready = await Order.find({
      status: 'Ready for Pickup',
    })
      .select('tokenNumber assignedCounter status updatedAt')
      .sort({ updatedAt: -1 })
      .limit(16);

    const recentlyCompleted = await Order.find({
      status: 'Completed',
    })
      .select('tokenNumber assignedCounter updatedAt')
      .sort({ updatedAt: -1 })
      .limit(6);

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
// @desc    Admin: get all orders with filtering and search
router.get('/all', protect, adminOnly, async (req, res) => {
  try {
    const { status, search, limit = 50, page = 1 } = req.query;
    let query = {};

    if (status && status !== 'All') {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { tokenNumber: { $regex: search, $options: 'i' } },
        { couponCode: { $regex: search, $options: 'i' } },
      ];
    }

    const orders = await Order.find(query)
      .populate('user', 'name email studentId phone department')
      .populate('items.foodItem', 'name price image')
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
    res.status(500).json({ message: 'Error fetching admin orders' });
  }
});

// @route   PATCH /api/orders/:id/status
// @desc    Admin: Update order status (Placed -> Accepted -> Preparing -> Ready -> Completed)
router.patch('/:id/status', protect, adminOnly, async (req, res) => {
  try {
    const { status, note, estimatedPrepMinutes } = req.body;
    const validStatuses = ['Placed', 'Accepted', 'Preparing', 'Ready for Pickup', 'Completed', 'Cancelled'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const order = await Order.findById(req.params.id).populate('user', 'name email studentId phone');
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
        status: order.status,
        tokenNumber: order.tokenNumber,
        assignedCounter: order.assignedCounter,
        estimatedPrepMinutes: order.estimatedPrepMinutes,
        estimatedReadyTime: order.estimatedReadyTime,
        order,
      });

      io.emit('tokens:refresh');

      // 2. Special audio / chime event when food is ready
      if (status === 'Ready for Pickup') {
        io.emit('token:ready', {
          tokenNumber: order.tokenNumber,
          counter: order.assignedCounter,
          studentName: order.user?.name || order.studentName,
        });
      }
    }

    // Automated Meta WhatsApp Notification for status change:
    // (Accepted, Preparing, Ready for Pickup, Completed, Cancelled)
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
