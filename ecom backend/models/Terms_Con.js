const mongoose=require('mongoose');

const Terms_Con=mongoose.Schema({
    title:{type:String,required:true},
    description:{type:String,required:true},
    createdAt:{type:Date,default:Date.now}
})

module.exports=mongoose.model('Terms_Con',Terms_Con);