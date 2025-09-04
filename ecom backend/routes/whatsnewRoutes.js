const WhatsNew=require('../models/Whatsnew');
const express=require('express');
const router=express.Router();

router.get('/',async(req,res)=>{
  try {
    const policies=await WhatsNew.find();
    res.json(policies);
  } catch (error) {
    res.status(500).json({message:'Error fetching whats new'});
  }
});

router.post('/',async(req,res)=>{
  try {
    const newPolicy=new WhatsNew(req.body);
    await newPolicy.save();
    res.status(201).json(newPolicy);
  } catch (error) {
    res.status(500).json({message:'Error creating whats new'});
  }
});

router.put('/:id',async(req,res)=>{
  try {
    const { id } = req.params;
    const updatedPolicy = await WhatsNew.findByIdAndUpdate(id, req.body, { new: true });
    if (!updatedPolicy) {
      return res.status(404).json({ message: 'Whats new not found' });
    }
    res.json(updatedPolicy);
  } catch (error) {
    res.status(500).json({ message: 'Error updating whats new' });
  }
});

module.exports=router;
