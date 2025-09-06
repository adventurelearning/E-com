const paymentPolicySchema=require('../models/PaymentPolicy');
const express=require('express');
const router=express.Router();

router.get('/',async(req,res)=>{
  try {
    const policies=await paymentPolicySchema.find();
    res.json(policies);
  } catch (error) {
    res.status(500).json({message:'Error fetching payment policies'});
  }
});

router.post('/',async(req,res)=>{
  try {
    const newPolicy=new paymentPolicySchema(req.body);
    await newPolicy.save();
    res.status(201).json(newPolicy);
  } catch (error) {
    res.status(500).json({message:'Error creating payment policy'});
  }
});

router.put('/:id',async(req,res)=>{
  try {
    const { id } = req.params;
    const updatedPolicy = await paymentPolicySchema.findByIdAndUpdate(id, req.body, { new: true });
    if (!updatedPolicy) {
      return res.status(404).json({ message: 'Payment policy not found' });
    }
    res.json(updatedPolicy);
  } catch (error) {
    res.status(500).json({ message: 'Error updating payment policy' });
  }
});

module.exports=router;
