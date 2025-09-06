const mongoose=require('mongoose');

const paymentPolicySchema=mongoose.Schema({
    title:{type:String,required:true},
    description:{type:String,required:true},
    createdAt:{type:Date,default:Date.now}
})

module.exports=mongoose.model('PaymentPolicy',paymentPolicySchema);