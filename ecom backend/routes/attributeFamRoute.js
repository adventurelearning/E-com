// routes/admin/attributeFamilies.js
const express = require('express');
const router = express.Router();
const AttributeFamily = require('../models/AttributeFamily');
const Attribute = require('../models/Attribute');

// Get all attribute families
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, pagination = 1 } = req.query;
    
    let query = {};
    let options = {
      page: parseInt(page),
      limit: parseInt(limit),
      populate: 'attributes.attribute',
      sort: { createdAt: -1 }
    };
    
    if (pagination === '0') {
      const families = await AttributeFamily.find(query)
        .populate('attributes.attribute')
        .sort({ createdAt: -1 });
      return res.json({ data: families });
    }
    
    const families = await AttributeFamily.paginate(query, options);
    res.json({
      data: families.docs,
      pagination: {
        currentPage: families.page,
        totalPages: families.totalPages,
        totalItems: families.totalDocs,
        itemsPerPage: families.limit
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get attribute family by ID
router.get('/:id', async (req, res) => {
  try {
    const family = await AttributeFamily.findById(req.params.id)
      .populate('attributes.attribute')
    
    if (!family) {
      return res.status(404).json({ message: 'Attribute family not found' });
    }
    
    res.json({ data: family });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create attribute family
router.post('/', async (req, res) => {
  try {
    const { name, code, status, groups, attributes } = req.body;
    
    // Check if code is unique
    const existingFamily = await AttributeFamily.findOne({ code });
    if (existingFamily) {
      return res.status(400).json({ message: 'Attribute family code must be unique' });
    }
    
    // Validate groups and attributes
    for (const group of groups) {
      if (!group.name || !group.code) {
        return res.status(400).json({ message: 'All groups must have a name and code' });
      }
    }
    
    const attributeFamily = new AttributeFamily({
      name,
      code,
      status,
      groups,
      attributes
    });
    
    const savedFamily = await attributeFamily.save();
    const populatedFamily = await AttributeFamily.findById(savedFamily._id)
      .populate('attributes.attribute')
    
    res.status(201).json({ data: populatedFamily });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update attribute family
router.put('/:id', async (req, res) => {
  try {
    const { name, status, groups, attributes } = req.body;
    
    const family = await AttributeFamily.findById(req.params.id);
    if (!family) {
      return res.status(404).json({ message: 'Attribute family not found' });
    }
    
    if (family.isSystem) {
      return res.status(400).json({ message: 'System attribute families cannot be modified' });
    }
    
    // Validate groups
    for (const group of groups) {
      if (!group.name || !group.code) {
        return res.status(400).json({ message: 'All groups must have a name and code' });
      }
    }
    
    family.name = name;
    family.status = status;
    family.groups = groups;
    family.attributes = attributes;
    
    const updatedFamily = await family.save();
    const populatedFamily = await AttributeFamily.findById(updatedFamily._id)
      .populate('attributes.attribute')
    
    res.json({ data: populatedFamily });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete attribute family
router.delete('/:id', async (req, res) => {
  try {
    const family = await AttributeFamily.findById(req.params.id);
    
    if (!family) {
      return res.status(404).json({ message: 'Attribute family not found' });
    }
    
    if (family.isSystem) {
      return res.status(400).json({ message: 'System attribute families cannot be deleted' });
    }
    
    // Check if any products use this family
    const Product = require('../../models/Product');
    const productCount = await Product.countDocuments({ attributeFamily: req.params.id });
    
    if (productCount > 0) {
      return res.status(400).json({ 
        message: `Cannot delete attribute family. It is used by ${productCount} product(s).` 
      });
    }
    
    await AttributeFamily.findByIdAndDelete(req.params.id);
    res.json({ message: 'Attribute family deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;