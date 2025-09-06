const CustomerserviceSchema=require('../models/Customerservice');
const express=require('express');
const router=express.Router();

router.get('/',async(req,res)=>{
  try {
    const policies=await CustomerserviceSchema.find();
    res.json(policies);
  } catch (error) {
    res.status(500).json({message:'Error fetching customer service'});
  }
});

router.post('/',async(req,res)=>{
  try {
    const newPolicy=new CustomerserviceSchema(req.body);
    await newPolicy.save();
    res.status(201).json(newPolicy);
  } catch (error) {
    res.status(500).json({message:'Error creating customer service'});
  }
});

router.put('/:id',async(req,res)=>{
  try {
    const { id } = req.params;
    const updatedPolicy = await CustomerserviceSchema.findByIdAndUpdate(id, req.body, { new: true });
    if (!updatedPolicy) {
      return res.status(404).json({ message: 'Customer service not found' });
    }
    res.json(updatedPolicy);
  } catch (error) {
    res.status(500).json({ message: 'Error updating customer service' });
  }
});

module.exports=router;
