// routes/admin/products.js
const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const AttributeFamily = require('../models/AttributeFamily');
const { protect, requireRole } = require('../middlewares/authMiddleware');

// Get all products with pagination
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, family, category } = req.query;
    
    const query = {};
    if (family) query.attributeFamily = family;
    if (category) query.categories = category;
    
    const products = await Product.find(query)
      .populate('attributeFamily')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });
    
    const count = await Product.countDocuments(query);
    
    res.json({
      products,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get product by ID
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('addedBy', 'name email')
  .populate({
    path: 'attributeFamily',
    populate: [
      {
        path: 'attributes.attribute', // populate Attribute model
        // select: 'name code type inputType options' // choose fields you need
      }
    ]
  })  .populate('reviews');
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a new product
router.post('/', protect, requireRole('admin'), async (req, res) => {
  try {
    // Validate attribute family exists
    const family = await AttributeFamily.findById(req.body.attributeFamily);
    if (!family) {
      return res.status(400).json({ message: 'Invalid attribute family' });
    }
    
    // Create product with all data from request
    const product = new Product(req.body);
    const savedProduct = await product.save();
    
    // Return populated product data
    const populatedProduct = await Product.findById(savedProduct._id)
      .populate('attributeFamily');
    
    res.status(201).json(populatedProduct);
  } catch (error) {
    console.log("Error creating product:", error);
    res.status(400).json({ message: error.message });
  }
});

// Update product
router.put('/:id', protect, requireRole('admin'), async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
      .populate('attributeFamily')    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    res.json(product);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete product
router.delete('/:id', protect, requireRole('admin'), async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get product variants by group ID
router.get('/group/:groupId', async (req, res) => {
  try {
    const { groupId } = req.params;
    const variants = await Product.find({ groupId });
    res.json(variants);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;