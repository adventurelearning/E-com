const mongoose = require('mongoose');

const attributeSetSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  attributes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Attribute'
  }]
}, { timestamps: true });

module.exports = mongoose.model('AttributeSet', attributeSet);