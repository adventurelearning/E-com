const express = require('express');
const router = express.Router();
const Footer = require('../models/Footer');

// GET footer data
router.get('/', async (req, res) => {
  try {
    let footer = await Footer.findOne();
    
    if (!footer) {
      footer = new Footer({
        companyName: 'Your Company Name',
        addressLine1: '123 Main Street',
        addressLine2: 'City, State 12345',
        email: 'info@example.com',
        phone: '+1 (555) 123-4567',
        chatButtonText: 'Chat with us',
        copyrightText: '© {year} Your Company Name. All rights reserved.',
        productsSections: [],
        companySections: [],
        socialLinks: []
      });
      await footer.save();
    }
    
    res.json(footer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// UPDATE footer data
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updatedFooter = await Footer.findByIdAndUpdate(id, req.body, { new: true });
    
    if (!updatedFooter) {
      return res.status(404).json({ message: 'Footer not found' });
    }
    
    res.json(updatedFooter);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// CREATE footer data (POST)
router.post('/', async (req, res) => {
  try {
    // Check if footer already exists
    const existingFooter = await Footer.findOne();
    
    if (existingFooter) {
      return res.status(400).json({ message: 'Footer already exists. Use PUT to update.' });
    }
    
    const newFooter = new Footer(req.body);
    const savedFooter = await newFooter.save();
    
    res.status(201).json(savedFooter);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE footer data
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deletedFooter = await Footer.findByIdAndDelete(id);
    
    if (!deletedFooter) {
      return res.status(404).json({ message: 'Footer not found' });
    }
    
    res.json({ message: 'Footer deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;