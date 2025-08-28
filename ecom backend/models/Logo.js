const mongoose=require('mongoose');


const Schema=mongoose.Schema({
    imageUrl: {
        type: String,
        required: true
    },
    altText: {
        type: String,
    }
})

module.exports=mongoose.model('Logo',Schema);