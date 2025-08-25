const mongoose = require('mongoose');

const attributeSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['text', 'number', 'boolean', 'select', 'multiselect', 'date', 'textarea'],
    default: 'text'
  },
  isRequired: {
    type: Boolean,
    default: false
  },
  isFilterable: {
    type: Boolean,
    default: false
  },
  isComparable: {
    type: Boolean,
    default: false
  },
  options: [{
    value: String,
    label: String
  }],
  validation: {
    min: Number,
    max: Number,
    pattern: String
  }
}, { timestamps: true });

module.exports = mongoose.model('Attribute', attributeSchema);