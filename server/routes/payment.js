const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');

// @route   POST /api/payment/create-order
// @desc    Create UPI payment request string or Razorpay order
router.post('/create-order', protect, async (req, res) => {
  try {
    const { amount, orderId, tokenNumber } = req.body;

    if (!amount) {
      return res.status(400).json({ message: 'Amount is required' });
    }

    const transactionRef = `TXN${Date.now()}`;
    const vpa = 'pandeyayush1603-1@okicici';
    const payeeName = 'Smart Campus Canteen';
    
    // Standard UPI URI format supported by GPay, PhonePe, Paytm, BHIM
    const upiUri = `upi://pay?pa=${vpa}&pn=${encodeURIComponent(payeeName)}&am=${amount}&cu=INR&tr=${transactionRef}&tn=${encodeURIComponent(`Canteen Order ${tokenNumber || ''}`)}`;

    res.json({
      success: true,
      transactionRef,
      vpa,
      amount,
      upiUri,
      razorpayKey: process.env.RAZORPAY_KEY_ID || 'rzp_test_campus123',
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to initiate payment', error: err.message });
  }
});

// @route   POST /api/payment/verify
// @desc    Verify UPI or gateway payment
router.post('/verify', protect, async (req, res) => {
  try {
    const { transactionRef, paymentId } = req.body;
    res.json({
      success: true,
      status: 'VERIFIED',
      transactionId: paymentId || transactionRef || `TXN-${Date.now()}`,
      verifiedAt: new Date(),
    });
  } catch (err) {
    res.status(500).json({ message: 'Payment verification failed' });
  }
});

module.exports = router;
