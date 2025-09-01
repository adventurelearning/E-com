const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const { protect, requireRole } = require('../middlewares/authMiddleware');
const mongoose = require('mongoose');
const User = require('../models/User');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const Razorpay = require('razorpay');
const crypto = require('crypto');

// Initialize Razorpay
let razorpay;
try {
  razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
  });
  
  console.log('Razorpay initialized successfully');
} catch (error) {
  console.error('Razorpay initialization failed:', error.message);
}

// Create Razorpay order
router.post('/create-razorpay-order', async (req, res) => {
  try {
    const { amount = 100, currency = 'INR' } = req.body;
    
    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid amount is required'
      });
    }

    const options = {
      amount: Math.round(amount), // Already in paise from frontend
      currency,
      receipt: `receipt_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      payment_capture: 1
    };

    const order = await razorpay.orders.create(options);
    
    res.json({
      success: true,
      order: {
        id: order.id,
        amount: order.amount,
        currency: order.currency
      }
    });
  } catch (error) {
    console.error('Razorpay order creation error:', error);
    
    if (error.error && error.error.description) {
      return res.status(400).json({
        success: false,
        message: error.error.description
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to create payment order'
    });
  }
});

// Verify Razorpay payment
router.post('/update-razorpay-payment', protect, async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: 'Missing payment verification data'
      });
    }

    const generated_signature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest('hex');

    if (generated_signature === razorpay_signature) {
      res.json({ 
        success: true, 
        message: 'Payment verified successfully' 
      });
    } else {
      res.status(400).json({ 
        success: false, 
        message: 'Invalid payment signature' 
      });
    }
  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Payment verification failed' 
    });
  }
});

// Place order
router.post('/', protect, async (req, res) => {
  const { shippingAddress, paymentMethod, mode, productId, total, quantity, razorpayPaymentId, razorpay_order_id } = req.body;
  const userId = req.user._id;

  try {
    const user = await User.findById(userId);
    let cart = await Cart.findOne({ user: userId });

    // Validate payment for Razorpay
    if (paymentMethod === 'razorpay' && !razorpayPaymentId) {
      return res.status(400).json({ message: 'Razorpay payment ID required' });
    }

    // Address validation
    if (!shippingAddress || 
      !shippingAddress.fullName || 
      !shippingAddress.phone ||
      !shippingAddress.street || 
      !shippingAddress.city || 
      !shippingAddress.state || 
      !shippingAddress.postalCode) {
      return res.status(400).json({ message: 'Missing required shipping address fields' });
    }

    // Check for duplicate address using correct fields
    const isDuplicate = user.addresses.some(addr =>
      addr.street === shippingAddress.street &&
      addr.city === shippingAddress.city &&
      addr.postalCode === shippingAddress.postalCode
    );

    // Create new address with correct structure
    if (!isDuplicate) {
      user.addresses.forEach(addr => (addr.isDefault = false));

      user.addresses.push({
        label: shippingAddress.label || 'Shipping',
        fullName: shippingAddress.fullName,
        phone: shippingAddress.phone,
        street: shippingAddress.street,
        city: shippingAddress.city,
        state: shippingAddress.state,
        postalCode: shippingAddress.postalCode,
        country: shippingAddress.country || 'India',
        isDefault: true,
      });

      await user.save();
    }

    let items = [];
    if (mode === 'buy-now') {
      if (!productId || !quantity) {
        return res.status(400).json({ message: 'Missing product or quantity for buy-now' });
      }
      items = [{ productId, quantity: Number(quantity) }];
    } else {
      if (!cart || cart.items.length === 0) {
        return res.status(400).json({ message: 'Cart is empty' });
      }
      items = cart.items;
    }

    // Order creation - ADD razorpay_order_id HERE
    const order = new Order({
      user: userId,
      items: items.map(item => ({
        productId: item.productId,
        quantity: item.quantity
      })),
      shippingAddress: {
        label: shippingAddress.label || 'Shipping',
        fullName: shippingAddress.fullName,
        phone: shippingAddress.phone,
        street: shippingAddress.street,
        city: shippingAddress.city,
        state: shippingAddress.state,
        postalCode: shippingAddress.postalCode,
        country: shippingAddress.country || 'India',
        isDefault: false
      },
      paymentMethod,
      status: 'pending',
      total: total,
      statusHistory: [{
        status: 'pending',
        changedAt: new Date(),
        changedBy: userId,
        note: 'Order created'
      }],
      razorpayPaymentId: paymentMethod === 'razorpay' ? razorpayPaymentId : null,
      razorpay_order_id: paymentMethod === 'razorpay' ? razorpay_order_id : null // Add this line
    });

    await order.save();

    // Cart cleanup
    if (mode === 'buy-now') {
      if (cart) {
        const cartItemIndex = cart.items.findIndex(i => i.productId.toString() === productId);
        if (cartItemIndex !== -1) {
          const cartItem = cart.items[cartItemIndex];
          const cartQty = Number(cartItem.quantity);
          const buyQty = Number(quantity);

          if (cartQty > buyQty) {
            cart.items[cartItemIndex].quantity = cartQty - buyQty;
            await cart.save();
          } else {
            cart.items.splice(cartItemIndex, 1);
            if (cart.items.length > 0) {
              await cart.save();
            } else {
              await Cart.deleteOne({ _id: cart._id });
            }
          }
        }
      }
    } else {
      if (cart) {
        await Cart.deleteOne({ _id: cart._id });
      }
    }

    res.status(201).json({
      message: 'Order created successfully',
      orderId: order._id,
      shippingAddress: order.shippingAddress
    });

  } catch (error) {
    console.error('Order creation error:', error);
    res.status(500).json({ message: 'Server error during order creation' });
  }
});

router.get('/', protect, async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).populate('items.productId').sort({ createdAt: -1 });
  res.json(orders);
});

router.get('/admin/:id', protect, requireRole('admin'), async (req, res) => {
  const order = await Order.findById(req.params.id).populate('user');
  if (!order) return res.status(404).json({ message: 'Order not found' });
  res.json(order);
});

// 👤 Get a specific order (only owner can see it)
router.get('/:id', protect, async (req, res) => {
  const order = await Order.findOne({ _id: req.params.id, user: req.user._id }).populate('items.productId');
  if (!order) return res.status(404).json({ message: 'Order not found' });
  res.json(order);
});

// 🔐 Admin: Get all orders
router.get('/userOrders/all', protect, requireRole('admin'), async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('user')                // Populate user info
      .populate('items.productId')     // Populate each product in the items array
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// 🔐 Admin: Update order status
router.put('/admin/:id', protect, requireRole('admin'), async (req, res) => {
  const { status, trackingId } = req.body;
  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ message: 'Order not found' });

  order.status = status || order.status;
  if (trackingId) order.trackingId = trackingId;
  await order.save();

  res.json(order);
});


// Get user orders
router.get('/users/:id/orders', protect, requireRole('admin'), async (req, res) => {
  try {
    console.log("Fetching orders for user ID:", req.params.id);

    const orders = await Order.find({ user: req.params.id })
      .populate('items.productId') // 👈 Populate the product details
      .sort('-createdAt')
      .limit(5)
      .lean();

    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user stats
router.get('/users/:id/stats', protect, requireRole('admin'), async (req, res) => {
  try {
    console.log("Fetching stats for user ID:", req.params.id);

    const stats = await Order.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(req.params.id) } },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalSpent: { $sum: '$total' },
          avgOrderValue: { $avg: '$total' },
          lastOrder: { $max: '$createdAt' }
        }
      }
    ]);

    const result = stats[0] || {
      totalOrders: 0,
      totalSpent: 0,
      avgOrderValue: 0,
      lastOrder: null
    };

    res.json(result);
  } catch (err) {
    console.error('Stats error:', err); // helpful log
    res.status(500).json({ message: 'Server error' });
  }
});

// 📄 Download invoice for an order
router.get('/:id/invoice', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email phone')
      .populate('items.productId');

    // Validate order ownership
    if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to access this invoice' });
    }

    // Create PDF with larger page size for better layout
    const doc = new PDFDocument({
      size: 'A4',
      margin: 40,
      bufferPages: true,
      info: {
        Title: `Invoice ${order._id}`,
        Author: 'Your Ecommerce Store'
      }
    });

    const filename = `invoice-${order._id}.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    doc.pipe(res);

    // ====== DESIGN VARIABLES ======
    const primaryColor = '#2d7ff9';
    const accentColor = '#ff6b6b';
    const lightColor = '#f8f9fa';
    const darkColor = '#212529';
    const borderColor = '#dee2e6';

    // ====== HEADER SECTION ======
    // Decorative header background
    doc.rect(0, 0, doc.page.width, 120)
      .fill(primaryColor);

    // Company logo and info
    doc.fillColor('#fff')
      .fontSize(24)
      .text('ProShopify', 50, 40, { link: 'https://yourbrand.com' });

    doc.fillColor('rgba(255,255,255,0.7)')
      .fontSize(10)
      .text('123 Premium Plaza', 50, 70)
      .text('Mumbai, Maharashtra 400001', 50, 85)
      .text('GSTIN: 27ABCDE1234F1Z0', 50, 100);

    // Invoice title
    doc.fillColor('#fff')
      .fontSize(28)
      .font('Helvetica-Bold')
      .text('INVOICE', doc.page.width - 200, 70, { align: 'right' });

    doc.fillColor('rgba(255,255,255,0.7)')
      .fontSize(12)
      .text(`#${order._id}`, doc.page.width - 200, 100, { align: 'right' });

    // ====== CLIENT & DETAILS SECTION ======
    let y = 150;

    // Client details box
    doc.roundedRect(50, y, 240, 100, 5)
      .fill(lightColor);

    doc.fillColor(darkColor)
      .fontSize(14)
      .font('Helvetica-Bold')
      .text('BILLED TO:', 65, y + 20);

    doc.font('Helvetica')
      .fillColor(darkColor)
      .fontSize(11)
      .text(order.shippingAddress.fullName, 65, y + 40)
      .text(order.shippingAddress.street, 65, y + 55)
      .text(`${order.shippingAddress.city}, ${order.shippingAddress.state} - ${order.shippingAddress.postalCode}`, 65, y + 70)
      .text(`Phone: ${order.shippingAddress.phone}`, 65, y + 85);

    // Invoice details box
    doc.roundedRect(310, y, 240, 100, 5)
      .fill(lightColor);

    doc.font('Helvetica-Bold')
      .text('INVOICE DETAILS:', 325, y + 20);

    doc.font('Helvetica')
      .text(`Date: ${new Date(order.createdAt).toLocaleDateString('en-IN')}`, 325, y + 40)
      .text(`Status: ${order.status.toUpperCase()}`, 325, y + 55)
      .text(`Payment: ${order.paymentMethod.toUpperCase()}`, 325, y + 70)
      .text(`Order ID: ${order._id}`, 325, y + 85);

    y += 130;

    // ====== PRODUCTS TABLE ======
    // Table header
    doc.fillColor(darkColor)
      .font('Helvetica-Bold')
      .fontSize(10)
      .text('PRODUCT', 50, y)
      .text('PRICE', 350, y)
      .text('QTY', 430, y)
      .text('TOTAL', 480, y);

    // Header underline
    doc.moveTo(50, y + 10)
      .lineTo(doc.page.width - 50, y + 10)
      .lineWidth(1)
      .stroke(borderColor);

    y += 20;

    // Products list
    let subtotal = 0;
    order.items.forEach((item, index) => {
      if (index > 0) y += 5;

      // Alternate row background
      if (index % 2 === 0) {
        doc.rect(50, y - 5, doc.page.width - 100, 25)
          .fill(lightColor);
      }

      const productTotal = item.productId.discountPrice * item.quantity;
      subtotal += productTotal;

      doc.fillColor(darkColor)
        .font('Helvetica')
        .fontSize(10)
        .text(item.productId.name, 55, y, { width: 280 })
        .text(`₹${item.productId.discountPrice.toFixed(2)}`, 350, y)
        .text(item.quantity.toString(), 430, y)
        .text(`₹${productTotal.toFixed(2)}`, 480, y);

      y += 25;
    });

    // Table bottom border
    doc.moveTo(50, y)
      .lineTo(doc.page.width - 50, y)
      .lineWidth(1)
      .stroke(borderColor);

    y += 20;

    // ====== TOTALS SECTION ======
    const shipping = order.shippingPrice || 0;
    const tax = order.taxPrice || 0;
    const total = subtotal + shipping + tax;

    // Totals box
    doc.roundedRect(350, y, 200, 140, 5)
      .fill(lightColor);

    doc.font('Helvetica')
      .fillColor(darkColor)
      .fontSize(11)
      .text('Subtotal:', 360, y + 20)
      .text(`₹${subtotal.toFixed(2)}`, 460, y + 20, { align: 'right' })
      .text('Shipping:', 360, y + 40)
      .text(`₹${shipping.toFixed(2)}`, 460, y + 40, { align: 'right' })
      .text('Tax:', 360, y + 60)
      .text(`₹${tax.toFixed(2)}`, 460, y + 60, { align: 'right' });

    doc.moveTo(360, y + 80)
      .lineTo(490, y + 80)
      .stroke(borderColor);

    doc.font('Helvetica-Bold')
      .fillColor(primaryColor)
      .fontSize(12)
      .text('GRAND TOTAL:', 360, y + 95)
      .text(`₹${total.toFixed(2)}`, 460, y + 95, { align: 'right' });

    y += 160;

    // ====== FOOTER ======
    doc.fillColor('#6c757d')
      .fontSize(9)
      .text('Thank you for your business!', 50, y, { align: 'center' })
      .text('Terms: Goods sold are non-refundable | All prices include GST', 50, y + 15, { align: 'center' })
      .text('Need help? contact@yourbrand.com | +91 1234567890', 50, y + 30, { align: 'center' });

    // Watermark
    // doc.fillColor('rgba(45, 127, 249, 0.05)')
    //    .fontSize(72)
    //    .font('Helvetica-Bold')
    //    .text('PAID', doc.page.width/2 - 50, doc.page.height/2 - 20, { 
    //      align: 'center',
    //      oblique: 15
    //    });

    // Page numbers
    const pages = doc.bufferedPageRange();
    for (let i = 0; i < pages.count; i++) {
      doc.switchToPage(i);
      doc.fillColor('#6c757d')
        .fontSize(8)
        .text(`Page ${i + 1} of ${pages.count}`, doc.page.width - 50, doc.page.height - 20);
    }

    doc.end();
  } catch (error) {
    console.error('Invoice generation error:', error);
    res.status(500).json({ message: 'Failed to generate invoice' });
  }
});

module.exports = router;
