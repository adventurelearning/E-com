const Terms_Con=require('../models/Terms_Con');
const express=require('express');
const router=express.Router();

router.get('/',async(req,res)=>{
  try {
    const policies=await Terms_Con.find();
    res.json(policies);
  } catch (error) {
    res.status(500).json({message:'Error fetching terms and conditions'});
  }
});

router.post('/',async(req,res)=>{
  try {
    const newPolicy=new Terms_Con(req.body);
    await newPolicy.save();
    res.status(201).json(newPolicy);
  } catch (error) {
    res.status(500).json({message:'Error creating terms and conditions'});
  }
});

router.put('/:id',async(req,res)=>{
  try {
    const { id } = req.params;
    const updatedPolicy = await Terms_Con.findByIdAndUpdate(id, req.body, { new: true });
    if (!updatedPolicy) {
      return res.status(404).json({ message: 'Terms and conditions not found' });
    }
    res.json(updatedPolicy);
  } catch (error) {
    res.status(500).json({ message: 'Error updating terms and conditions' });
  }
});

module.exports=router;
