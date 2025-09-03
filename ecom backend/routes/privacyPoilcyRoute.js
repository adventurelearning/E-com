const privacyPolicySchema=require('../models/Privacypolicy');
const express=require('express');
const router=express.Router();

router.get('/',async(req,res)=>{
  try {
    const policies=await privacyPolicySchema.find();
    res.json(policies);
  } catch (error) {
    res.status(500).json({message:'Error fetching privacy policies'});
  }
});

router.post('/',async(req,res)=>{
  try {
    const newPolicy=new privacyPolicySchema(req.body);
    await newPolicy.save();
    res.status(201).json(newPolicy);
  } catch (error) {
    res.status(500).json({message:'Error creating privacy policy'});
  }
});

router.put('/:id',async(req,res)=>{
  try {
    const { id } = req.params;
    const updatedPolicy = await privacyPolicySchema.findByIdAndUpdate(id, req.body, { new: true });
    if (!updatedPolicy) {
      return res.status(404).json({ message: 'Privacy policy not found' });
    }
    res.json(updatedPolicy);
  } catch (error) {
    res.status(500).json({ message: 'Error updating privacy policy' });
  }
});

module.exports=router;
