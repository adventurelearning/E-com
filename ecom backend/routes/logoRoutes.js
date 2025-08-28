const express=require('express');

const router=express.Router();
const Logo = require('../models/Logo');
router.post('/',(req,res)=>{
    const { imageUrl, altText } = req.body;

    const newLogo = new Logo({
        imageUrl,
        altText
    });

    newLogo.save()
        .then(logo => res.status(201).json(logo))
        .catch(err => res.status(500).json({ error: err.message }));
});

router.get('/',(req,res)=>{
    Logo.find()
        .then(logos => res.status(200).json(logos))
        .catch(err => res.status(500).json({ error: err.message }));
});

module.exports=router;