// routes/admin/attributes.js
const express = require('express');
const router = express.Router();
const Attribute = require('../models/Attribute');
const AttributeFamily = require('../models/AttributeFamily');

// Get all attributes
router.get('/', async (req, res) => {
  try {
    const attributes = await Attribute.find().sort({ 'configuration.sortOrder': 1 });
    res.json(attributes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new attribute
router.post('/', async (req, res) => {
  try {
    const attribute = new Attribute(req.body);
    const savedAttribute = await attribute.save();
    res.status(201).json(savedAttribute);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update attribute
router.put('/:id', async (req, res) => {
  try {
    const attribute = await Attribute.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    res.json(attribute);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete attribute
router.delete('/:id', async (req, res) => {
  try {
    // Check if attribute is used in any family
    const families = await AttributeFamily.find({ 
      'attributes.attribute': req.params.id 
    });
    
    if (families.length > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete attribute as it is used in attribute families' 
      });
    }
    
    await Attribute.findByIdAndDelete(req.params.id);
    res.json({ message: 'Attribute deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;