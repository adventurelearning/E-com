const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const Product = require('../models/Product');
const User = require('../models/User');
const { protect, requireRole } = require('../middlewares/authMiddleware');

// @desc    Create a review
// @route   POST /api/reviews
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { productId, rating, comment, images, detailedRatings } = req.body;
    
    // Get user details
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Convert detailedRatings object to Map
    const ratingsMap = new Map();
    if (detailedRatings) {
      for (const [key, value] of Object.entries(detailedRatings)) {
        ratingsMap.set(key, value);
      }
    }

    const review = new Review({
      product: productId,
      user: req.user.id,
      userDetails: {
        name: user.name,
        photoURL: user.photoURL || "",
        email: user.email,
        phone: user.phone || ""
      },
      rating,
      comment,
      images,
      detailedRatings: ratingsMap
    });
    
    await review.save();
    
    res.status(201).json(review);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @desc    Get reviews for a product
// @route   GET /api/reviews/product/:productId
// @access  Public
router.get('/product/:productId', async (req, res) => {
  try {
    let reviews = await Review.find({ product: req.params.productId })
      .populate('user', 'name photoURL') // try to populate
      .sort({ createdAt: -1 })
      .lean(); // return plain objects (so we can modify them easily)

    // Replace missing user with stored userDetails
    reviews = reviews.map(r => {
      if (!r.user) {
        r.user = { ...r.userDetails }; // fallback
      }
      return r;
    });

    res.json(reviews);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});


// @desc    Get all reviews (Admin)
// @route   GET /api/reviews/admin
// @access  Private/Admin
router.get('/admin', protect,requireRole('admin'),async (req, res) => {
    try {
      let reviews = await Review.find()
        .populate('user', 'name')       // try to populate
        .populate('product', 'name')    // populate product
        .sort({ createdAt: -1 })
        .lean(); // plain objects so we can safely modify

      // fallback user if deleted
      reviews = reviews.map(r => {
        if (!r.user) {
          r.user = { ...r.userDetails }; // fallback details
        }
        return r;
      });

      res.json(reviews);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server Error' });
    }
  }
);

// @desc    Add admin comment to review
// @route   PUT /api/reviews/admin-comment/:id
// @access  Private/Admin
router.put('/admin-comment/:id', protect, requireRole('admin'), async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    review.adminComment = req.body.adminComment;
    await review.save();

    res.json(review);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Delete a review (Admin)
// @route   DELETE /api/reviews/:id
// @access  Private/Admin
router.delete('/:id', protect, requireRole('admin'), async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    await review.deleteOne();
    res.json({ message: 'Review removed' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;