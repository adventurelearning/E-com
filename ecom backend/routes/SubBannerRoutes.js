const express = require('express');
const router = express.Router();
const SubBanner = require('../models/SubBanner');

// Create Product
router.post('/', async (req, res) => {
    try {
        const { title, subtitle, price, buttonText, isFeatured, link, imageUrl } = req.body;
        
        if (!imageUrl) {
            return res.status(400).json({ error: 'Image URL is required' });
        }

        const product = new SubBanner({
            title,
            subtitle,
            price,
            imageUrl,
            buttonText: buttonText || 'SHOP NOW',
            isFeatured: isFeatured === 'true',
            link: link || ''
        });

        await product.save();
        res.status(201).json(product);
    } catch (error) {
        console.error('Error creating product:', error);
        res.status(500).json({ 
            error: 'Failed to create product',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Get All Products
router.get('/', async (req, res) => {
    try {
        const products = await SubBanner.find().sort({ createdAt: -1 });
        res.json(products);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get Single Product
router.get('/:id', async (req, res) => {
    try {
        const product = await SubBanner.findById(req.params.id);
        if (!product) return res.status(404).json({ error: 'Banner not found' });
        res.json(product);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update Product
router.put('/:id', async (req, res) => {
    try {
        const { title, subtitle, price, buttonText, isFeatured, link, imageUrl } = req.body;
        
        let updateData = { 
            title, 
            subtitle, 
            price, 
            buttonText, 
            isFeatured: isFeatured === 'true',
            link: link || ''
        };

        // Only update imageUrl if a new one was provided
        if (imageUrl) {
            updateData.imageUrl = imageUrl;
        }

        const product = await SubBanner.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true }
        );

        if (!product) return res.status(404).json({ error: 'Banner not found' });
        res.json(product);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete Product
router.delete('/:id', async (req, res) => {
    try {
        const product = await SubBanner.findByIdAndDelete(req.params.id);
        if (!product) return res.status(404).json({ error: 'Banner not found' });
        res.json({ message: 'Banner deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;