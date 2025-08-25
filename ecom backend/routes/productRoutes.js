// routes/productRoutes.js
const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { protect, requireRole } = require('../middlewares/authMiddleware');

// @desc    Get all products
// @route   GET /api/products
// @access  Public
router.get('/', async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('addedBy', 'name email')
      .populate('reviews');
      
    if (!product) return res.status(404).json({ message: 'Product not found' });
    
    res.json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin
router.post('/', protect, requireRole('admin'), async (req, res) => {
  try {
    const {
      name,
      description,
      originalPrice,
      discountPrice,
      category,
      subcategory,
      brand,
      images,
      colors,
      sizeChart,
      stock,
      specifications,
      featureDescriptions,
      ratingAttributes,
      groupId,
      specialPrice,
      specialPriceStart,
      specialPriceEnd
    } = req.body;
console.log(req.body);

    // Calculate discount percent
    let discountPercent = 0;
    if (discountPrice > 0 && originalPrice > discountPrice) {
      discountPercent = Math.round(
        ((originalPrice - discountPrice) / originalPrice) * 100
      );
    }

    const product = new Product({
      name,
      description,
      originalPrice,
      discountPrice,
      discountPercent,
      category,
      subcategory,
      brand,
      images: images || [],
      colors: colors || [],
      sizeChart: sizeChart || [],
      stock,
      addedBy: req.user._id,
      specifications,
      featureDescriptions,
      ratingAttributes,
      groupId,
      specialPrice,
      specialPriceStart: specialPriceStart ? new Date(specialPriceStart) : null,
      specialPriceEnd: specialPriceEnd ? new Date(specialPriceEnd) : null
    });

    const createdProduct = await product.save();
    res.status(201).json(createdProduct);
  } catch (err) {
    console.error(err);
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(val => val.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    res.status(500).json({ message: 'Server Error' });
  }
});

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
router.put('/:id', protect, requireRole('admin'), async (req, res) => {
  try {
    const {
      name,
      description,
      originalPrice,
      discountPrice,
      category,
      subcategory,
      brand,
      images,
      colors,
      sizeChart,
      stock,
      specifications,
      featureDescriptions,
      ratingAttributes,
      groupId,
      specialPrice,
      specialPriceStart,
      specialPriceEnd
    } = req.body;
console.log(req.body.specialPrice);

    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    // Calculate discount percent if prices change
    let discountPercent = product.discountPercent;
    if (originalPrice !== undefined || discountPrice !== undefined) {
      const orig = originalPrice !== undefined ? originalPrice : product.originalPrice;
      const disc = discountPrice !== undefined ? discountPrice : product.discountPrice;
      
      if (disc > 0 && orig > disc) {
        discountPercent = Math.round(((orig - disc) / orig) * 100);
      } else {
        discountPercent = 0;
      }
    }

    product.name = name || product.name;
    product.description = description || product.description;
    product.originalPrice = originalPrice !== undefined ? originalPrice : product.originalPrice;
    product.discountPrice = discountPrice !== undefined ? discountPrice : product.discountPrice;
    product.discountPercent = discountPercent;
    product.category = category || product.category;
    product.subcategory = subcategory || product.subcategory;
    product.brand = brand || product.brand;
    product.images = images || product.images;
    product.colors = colors || product.colors;
    
    if (sizeChart) {
      product.sizeChart = sizeChart.map(sz => ({
        label: sz.label,
        stock: sz.stock
      }));
    }
    
    product.stock = stock !== undefined ? stock : product.stock;
    product.specifications = specifications || product.specifications;
    product.featureDescriptions = featureDescriptions || product.featureDescriptions;
    product.ratingAttributes = ratingAttributes || product.ratingAttributes;
    product.groupId = groupId || product.groupId;
    product.specialPrice = specialPrice !== undefined ? specialPrice : product.specialPrice;
    product.specialPriceStart = specialPriceStart ? new Date(specialPriceStart) : product.specialPriceStart;
    product.specialPriceEnd = specialPriceEnd ? new Date(specialPriceEnd) : product.specialPriceEnd;

    const updatedProduct = await product.save();
    res.json(updatedProduct);
  } catch (err) {
    console.error(err);
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(val => val.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    res.status(500).json({ message: 'Server Error' });
  }
});

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
router.delete('/:id', protect, requireRole('admin'), async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    await product.deleteOne();
    res.json({ message: 'Product removed' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

// GET /products/group/:groupId
router.get('/group/:groupId', async (req, res) => {
  const { groupId } = req.params;
  try {
    const variants = await Product.find({ groupId });
    res.json(variants);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;