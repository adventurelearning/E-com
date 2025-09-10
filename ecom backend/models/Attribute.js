const mongoose = require('mongoose');

const attributeSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    uppercase: true,
    match: [/^[A-Z0-9_]+$/, 'Attribute code must contain only uppercase letters, numbers and underscores']
  },
  label: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  type: {
    type: String,
    required: true,
    enum: [
      'text', 'textarea', 'price', 'boolean', 
      'select', 'multiselect', 'datetime', 'date',
      'image', 'file', 'color', 'MCE Editer','keyvalue'
    ]
  },
  options: [{
    value: String,
    label: String,
    sortOrder: Number
  }],
  validation: {
    isRequired: { type: Boolean, default: false },
    minLength: Number,
    maxLength: Number,
    minValue: Number,
    maxValue: Number,
    regex: String
  },
  configuration: {
    isFilterable: { type: Boolean, default: false },
    isComparable: { type: Boolean, default: false },
    isVisible: { type: Boolean, default: true },
    isSearchable: { type: Boolean, default: false },
    sortOrder: { type: Number, default: 0 }
  }
}, { timestamps: true });

// Index for better query performance
attributeSchema.index({ code: 1 });
attributeSchema.index({ type: 1 });

module.exports = mongoose.model('Attribute', attributeSchema);