const returnPolicySchema=require('../models/Returnpolicy');
const express=require('express');
const router=express.Router();

router.get('/',async(req,res)=>{
  try {
    const policies=await returnPolicySchema.find();
    res.json(policies);
  } catch (error) {
    res.status(500).json({message:'Error fetching return policies'});
  }
});

router.post('/',async(req,res)=>{
  try {
    const newPolicy=new returnPolicySchema(req.body);
    await newPolicy.save();
    res.status(201).json(newPolicy);
  } catch (error) {
    res.status(500).json({message:'Error creating return policy'});
  }
});

router.put('/:id',async(req,res)=>{
  try {
    const { id } = req.params;
    const updatedPolicy = await returnPolicySchema.findByIdAndUpdate(id, req.body, { new: true });
    if (!updatedPolicy) {
      return res.status(404).json({ message: 'Return policy not found' });
    }
    res.json(updatedPolicy);
  } catch (error) {
    res.status(500).json({ message: 'Error updating return policy' });
  }
});

module.exports=router;
