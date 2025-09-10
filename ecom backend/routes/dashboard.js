// routes/dashboard.js
const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const User = require('../models/User');
const { protect, requireRole } = require('../middlewares/authMiddleware');

// Get dashboard statistics
router.get('/stats', protect, requireRole('admin'), async (req, res) => {
  try {
    // Get total users
    const totalUsers = await User.countDocuments();
    
    // Get total orders and revenue
    const orderStats = await Order.aggregate([
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: '$total' },
          avgOrderValue: { $avg: '$total' }
        }
      }
    ]);

    // Get recent orders
    const recentOrders = await Order.find()
      .populate('user', 'name email')
      .populate('items.productId', 'name price')
      .sort({ createdAt: -1 })
      .limit(10);

    // Get monthly revenue
    const monthlyRevenue = await Order.aggregate([
      {
        $group: {
          _id: { 
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          revenue: { $sum: '$total' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    res.json({
      totalUsers,
      totalOrders: orderStats[0]?.totalOrders || 0,
      totalRevenue: orderStats[0]?.totalRevenue || 0,
      avgOrderValue: orderStats[0]?.avgOrderValue || 0,
      recentOrders,
      monthlyRevenue
    });

  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ message: 'Server error fetching dashboard stats' });
  }
});

// Get revenue by category
router.get('/revenue-by-category', protect, requireRole('admin'), async (req, res) => {
  try {
    const revenueByCategory = await Order.aggregate([
      { $unwind: '$items' },
      {
        $lookup: {
          from: 'products',
          localField: 'items.productId',
          foreignField: '_id',
          as: 'product'
        }
      },
      { $unwind: '$product' },
      {
        $group: {
          _id: '$product.category',
          totalRevenue: { 
            $sum: { 
              $multiply: ['$items.quantity', '$product.discountPrice'] 
            } 
          }
        }
      },
      { $sort: { totalRevenue: -1 } }
    ]);

    res.json(revenueByCategory);
  } catch (error) {
    console.error('Revenue by category error:', error);
    res.status(500).json({ message: 'Server error fetching category revenue' });
  }
});

module.exports = router;