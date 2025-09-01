const express = require('express');
const router = express.Router();
const Payment = require('../models/Payment');
const Order = require('../models/Order');
const { protect, requireRole } = require('../middlewares/authMiddleware');
const Razorpay = require('razorpay');
const crypto = require('crypto');

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// Get payment details for an order
router.get('/order/:orderId', protect, async (req, res) => {
  try {
    const payment = await Payment.findOne({ 
      orderId: req.params.orderId,
      userId: req.user._id 
    }).populate('orderId');
    
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }
    
    res.json(payment);
  } catch (error) {
    console.error('Payment fetch error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all payments for admin
router.get('/admin/all', protect, requireRole('admin'), async (req, res) => {
  try {
    const payments = await Payment.find()
      .populate('orderId')
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });
    
    res.json(payments);
  } catch (error) {
    console.error('Payments fetch error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Refund payment
router.post('/:paymentId/refund', protect, requireRole('admin'), async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.paymentId);
    
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }
    
    if (payment.paymentMethod !== 'razorpay') {
      return res.status(400).json({ message: 'Only Razorpay payments can be refunded' });
    }
    
    if (payment.status !== 'completed') {
      return res.status(400).json({ message: 'Only completed payments can be refunded' });
    }
    
    // Process refund through Razorpay
    const refund = await razorpay.payments.refund(
      payment.razorpayPaymentId,
      { amount: payment.amount * 100 } // Convert to paise
    );
    
    // Update payment status
    payment.status = 'refunded';
    payment.refundDate = new Date();
    await payment.save();
    
    // Update order status
    await Order.findByIdAndUpdate(payment.orderId, { status: 'refunded' });
    
    res.json({ 
      message: 'Refund processed successfully',
      refundId: refund.id 
    });
  } catch (error) {
    console.error('Refund error:', error);
    res.status(500).json({ message: 'Refund processing failed' });
  }
});

module.exports = router;