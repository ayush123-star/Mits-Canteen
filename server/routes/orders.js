const express = require('express');
const router = express.Router();
const QRCode = require('qrcode');
const Order = require('../models/Order');
const FoodItem = require('../models/FoodItem');
const NotificationLog = require('../models/NotificationLog');
const { protect, adminOnly, optionalAuth } = require('../middleware/auth');
const {
  sendOrderPlacedNotification,
  sendOrderStatusNotification,
  notifyOwnerNewOrder,
} = require('../services/whatsappService');

// Helper to generate next sequential, guaranteed unique campus token
const generateCampusToken = async () => {
  try {
    const allTokens = await Order.find({}, 'tokenNumber');
    let maxNumber = 100;

    allTokens.forEach((o) => {
      if (o.tokenNumber) {
        const m = String(o.tokenNumber).match(/\d+/);
        if (m) {
          const val = parseInt(m[0], 10);
          if (!isNaN(val) && val > maxNumber) {
            maxNumber = val;
          }
        }
      }
    });

    const countAll = await Order.countDocuments({});
    let candidateSeq = Math.max(maxNumber, 100 + countAll, 114) + 1;

    let candidateToken = `TK-${candidateSeq}`;
    while (await Order.findOne({ tokenNumber: candidateToken })) {
      candidateSeq += 1;
      candidateToken = `TK-${candidateSeq}`;
    }

    return candidateToken;
  } catch (err) {
    const fallbackSeq = 115 + Math.floor(Math.random() * 800);
    return `TK-${fallbackSeq}`;
  }
};

// @route   POST /api/orders
// @desc    Place a new food order
router.post('/', optionalAuth, async (req, res) => {
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
      let food = null;
      try {
        if (item.foodItemId && String(item.foodItemId).length === 24) {
          food = await FoodItem.findById(item.foodItemId);
        }
      } catch (e) {}

      const name = food ? food.name : (item.name || 'Campus Food Item');
      const price = food ? food.price : (Number(item.price) || 50);
      const prepTime = food ? food.preparationTime : 8;
      const isVeg = food ? food.isVeg : (item.isVeg !== undefined ? item.isVeg : true);
      const counter = food ? (food.counter || 1) : (item.counter || 1);

      const qty = Number(item.quantity) || 1;
      const itemSubtotal = price * qty;
      totalAmount += itemSubtotal;

      if (prepTime > maxPrepTime) {
        maxPrepTime = prepTime;
      }
      primaryCounter = counter || primaryCounter;

      populatedItems.push({
        foodItem: food ? food._id : undefined,
        name,
        price,
        quantity: qty,
        image: food ? food.image : (item.image || '/assets/campus/cravings/burger.jpg'),
        isVeg,
        counter,
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
      orderId: `ORD-2026-${tokenNumber.replace('TK-', '')}`,
      tokenNumber,
      user: req.user._id,
      studentName: req.body.studentName || req.user.name || 'Campus Student',
      studentEmail: req.body.studentEmail || req.user.email || '',
      studentPhone: req.body.studentPhone || req.user.phone || '+91 98765 43210',
      studentRoll: req.body.studentRoll || req.user.studentId || 'STU-CAMPUS',
      studentDepartment: req.body.studentDepartment || req.user.department || 'Campus Department',
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
          note: 'Your order has been successfully placed. Waiting for canteen confirmation.',
        },
      ],
    });

    // Create database in-app notification record
    try {
      await NotificationLog.create({
        order: order._id,
        orderStatus: 'Placed',
        tokenNumber: order.tokenNumber,
        studentName: order.studentName,
        recipientPhone: order.studentPhone,
        channel: 'IN_APP',
        message: 'Your order has been successfully placed. Waiting for canteen confirmation.',
        deliveryStatus: 'DELIVERED',
        statusTimestamps: { sentAt: new Date(), deliveredAt: new Date() },
      });
    } catch (_) {}

    // Populate user details for broadcast
    let populatedOrder = null;
    try {
      populatedOrder = await Order.findById(order._id).populate('user', 'name email studentId phone whatsappOptIn');
    } catch (_) {
      populatedOrder = order;
    }
    const orderDataToBroadcast = populatedOrder || order;

    // Real-time broadcast to Admin Dashboard, Live Token Screens, and All Connected Clients
    const io = req.app.get('socketio');
    if (io) {
      io.emit('order:created', orderDataToBroadcast);
      io.emit('order:new', orderDataToBroadcast);
      io.emit('token:generated', {
        tokenNumber: order.tokenNumber,
        orderId: order._id,
        order: orderDataToBroadcast,
        assignedCounter: order.assignedCounter,
      });
      io.emit('tokens:refresh');
    }

    // Cross-Device Cloud Broadcast for deployed mobile / laptop sync
    try {
      fetch('https://ntfy.sh/mits_campus_canteen_sync_prod_2026', {
        method: 'POST',
        headers: { Title: 'NEW_ORDER' },
        body: JSON.stringify({ type: 'NEW_ORDER', newOrder: orderDataToBroadcast }),
      }).catch(() => {});
    } catch (_) {}

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

// @route   GET /api/orders
// @desc    Get all active & recent orders for real-time synchronization across devices
router.get('/', async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('user', 'name studentId phone')
      .sort({ createdAt: -1 })
      .limit(100);
    res.json({ success: true, count: orders.length, orders });
  } catch (err) {
    res.json({ success: true, count: 0, orders: [] });
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
router.patch('/:id/status', async (req, res) => {
  try {
    let { status, note, reason, estimatedPrepMinutes } = req.body;
    const validStatuses = [
      'Placed',
      'Pending Acceptance',
      'Accepted',
      'Preparing',
      'Ready for Pickup',
      'Completed',
      'Collected',
      'Rejected',
      'Cancelled',
    ];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: `Invalid status: ${status}` });
    }

    // Normalize synonyms
    if (status === 'Pending Acceptance') status = 'Placed';
    if (status === 'Collected') status = 'Completed';

    const mongoose = require('mongoose');
    let order = null;
    const rawId = req.params.id;

    if (mongoose.Types.ObjectId.isValid(rawId)) {
      try {
        order = await Order.findById(rawId).populate('user', 'name email studentId phone');
      } catch (_) {}
    }

    if (!order) {
      order = await Order.findOne({
        $or: [
          { tokenNumber: rawId },
          { tokenNumber: `#${rawId}` },
          { orderId: rawId },
          { _id: mongoose.Types.ObjectId.isValid(rawId) ? rawId : null },
          { 'paymentDetails.transactionId': rawId },
        ],
      }).populate('user', 'name email studentId phone');
    }

    if (!order) {
      return res.status(404).json({ message: `Order not found for identifier ${rawId}` });
    }

    // Cancellation policy: Cannot cancel if food is already in preparation or ready
    if (status === 'Cancelled') {
      if (['Preparing', 'Ready for Pickup', 'Completed'].includes(order.status)) {
        return res.status(400).json({
          message: 'Order cannot be cancelled after kitchen preparation has already started.',
        });
      }
      order.cancellationReason = reason || note || 'Cancelled by customer';
    }

    // Rejection handling
    if (status === 'Rejected') {
      order.rejectionReason = reason || note || 'Ingredients or kitchen capacity temporarily unavailable';
    }

    order.status = status;

    if (status === 'Accepted') {
      if (estimatedPrepMinutes) {
        order.estimatedPrepMinutes = Number(estimatedPrepMinutes);
      }
      const prepMins = order.estimatedPrepMinutes || 15;
      order.estimatedReadyTime = new Date(Date.now() + prepMins * 60 * 1000);
    }

    // Customer Notification Message Mapping
    let customerNotificationMessage = '';
    if (status === 'Accepted') {
      customerNotificationMessage =
        'Your order has been accepted by MITS Main Canteen! Our kitchen is preparing your food.';
    } else if (status === 'Preparing') {
      customerNotificationMessage = 'Your order is now being freshly prepared by our kitchen.';
    } else if (status === 'Ready for Pickup') {
      customerNotificationMessage =
        'Great news! Your MITS Canteen order is READY FOR PICKUP. Please visit your assigned counter with your token.';
    } else if (status === 'Completed') {
      customerNotificationMessage = 'Your order has been collected. Thank you for dining with MITS Canteen!';
    } else if (status === 'Rejected') {
      customerNotificationMessage = `Sorry! Your order could not be accepted by MITS Main Canteen. (${order.rejectionReason})`;
    } else if (status === 'Cancelled') {
      customerNotificationMessage = `Order cancelled. (${order.cancellationReason})`;
    } else {
      customerNotificationMessage = `Order status updated to ${status}.`;
    }

    order.timeline.push({
      status,
      timestamp: new Date(),
      note: note || customerNotificationMessage,
    });

    if (status === 'Completed' && order.paymentMethod === 'CASH_AT_COUNTER') {
      order.paymentStatus = 'Completed';
    }

    await order.save();

    // Create database in-app notification record
    try {
      await NotificationLog.create({
        order: order._id,
        orderStatus: status,
        tokenNumber: order.tokenNumber,
        studentName: order.studentName,
        recipientPhone: order.studentPhone,
        channel: 'IN_APP',
        message: customerNotificationMessage,
        deliveryStatus: 'DELIVERED',
        statusTimestamps: { sentAt: new Date(), deliveredAt: new Date() },
      });
    } catch (_) {}

    let whatsappNotification = null;
    const io = req.app.get('socketio');

    if (io) {
      const eventPayload = {
        orderId: order._id,
        id: order._id,
        status: order.status,
        tokenNumber: order.tokenNumber,
        orderNumber: order.orderId || `ORD-2026-${order.tokenNumber.replace('TK-', '')}`,
        assignedCounter: order.assignedCounter,
        estimatedPrepMinutes: order.estimatedPrepMinutes,
        estimatedReadyTime: order.estimatedReadyTime,
        rejectionReason: order.rejectionReason,
        cancellationReason: order.cancellationReason,
        notificationMessage: customerNotificationMessage,
        order,
      };

      // 1. General status update events for Admin Dashboard, Customer Portal, and TV Screens
      io.emit('order:updated', eventPayload);
      io.emit('order:status_updated', eventPayload);
      io.emit('token:updated', {
        tokenNumber: order.tokenNumber,
        status: order.status,
        assignedCounter: order.assignedCounter,
        order,
      });
      io.emit(`order:${order._id}:status`, eventPayload);
      io.emit('tokens:refresh');

      // 2. Lifecycle specific events matching exact specifications
      if (status === 'Accepted') {
        io.emit('order:accepted', eventPayload);
      } else if (status === 'Preparing') {
        io.emit('order:preparing', eventPayload);
      } else if (status === 'Ready for Pickup') {
        io.emit('order:ready', {
          tokenNumber: order.tokenNumber,
          counter: order.assignedCounter,
          orderId: order._id,
          studentName: order.user?.name || order.studentName,
          order,
        });
        io.emit('token:ready', {
          tokenNumber: order.tokenNumber,
          counter: order.assignedCounter,
          studentName: order.user?.name || order.studentName,
          order,
        });
      } else if (status === 'Completed') {
        io.emit('order:collected', {
          tokenNumber: order.tokenNumber,
          orderId: order._id,
          order,
        });
        io.emit('order:completed', eventPayload);
      } else if (status === 'Rejected') {
        io.emit('order:rejected', {
          tokenNumber: order.tokenNumber,
          orderId: order._id,
          reason: order.rejectionReason,
          order,
        });
      } else if (status === 'Cancelled') {
        io.emit('order:cancelled', {
          tokenNumber: order.tokenNumber,
          orderId: order._id,
          reason: order.cancellationReason,
          order,
        });
      }
    }

    // Cross-Device Cloud Broadcast for deployed mobile / laptop sync
    try {
      fetch('https://ntfy.sh/mits_campus_canteen_sync_prod_2026', {
        method: 'POST',
        headers: { Title: 'STATUS_UPDATED' },
        body: JSON.stringify({
          type: 'STATUS_UPDATED',
          orderId: order._id,
          tokenNumber: order.tokenNumber,
          newStatus: status,
          reason: order.rejectionReason || order.cancellationReason,
          updatedOrder: order,
        }),
      }).catch(() => {});
    } catch (_) {}
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

// @route   GET /api/orders/customer-notifications
// @desc    Get in-app notifications for customer order tracking
router.get('/customer-notifications', optionalAuth, async (req, res) => {
  try {
    const logs = await NotificationLog.find()
      .sort({ createdAt: -1 })
      .limit(20);
    res.json({ success: true, count: logs.length, notifications: logs });
  } catch (err) {
    res.json({ success: true, count: 0, notifications: [] });
  }
});

module.exports = router;
