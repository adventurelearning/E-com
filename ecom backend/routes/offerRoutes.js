const express = require('express');
const router = express.Router();
const Offer = require('../models/Offer');

// Create a new offer
router.post('/offers', async (req, res) => {
  try {
    const { title, subtitle, price, discountPrice, link, bannerImage } = req.body;

    if (!bannerImage) {
      return res.status(400).json({ message: 'Banner image is required' });
    }
    
    const offer = new Offer({
      title,
      subtitle,
      price,
      discountPrice,
      link,
      bannerImage,
    });

    await offer.save();
    res.status(201).json(offer);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get all offers
router.get('/offers', async (req, res) => {
  try {
    const offers = await Offer.find({ isActive: true });
    res.json(offers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get offer by ID
router.get('/offers/:id', async (req, res) => {
  try {
    const offer = await Offer.findById(req.params.id);
    if (!offer) {
      return res.status(404).json({ message: 'Offer not found' });
    }
    res.json(offer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update offer
router.put('/offers/:id', async (req, res) => {
  try {
    const { title, subtitle, price, discountPrice, link, bannerImage } = req.body;
    const updateData = {
      title,
      subtitle,
      price,
      discountPrice,
      link
    };

    // Only update bannerImage if a new one was provided
    if (bannerImage) {
      updateData.bannerImage = bannerImage;
    }

    const offer = await Offer.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!offer) {
      return res.status(404).json({ message: 'Offer not found' });
    }
    res.json(offer);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete offer
router.delete('/offers/:id', async (req, res) => {
  try {
    const offer = await Offer.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!offer) {
      return res.status(404).json({ message: 'Offer not found' });
    }
    res.json({ message: 'Offer deactivated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;