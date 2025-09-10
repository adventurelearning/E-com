// models/AttributeFamily.js
const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const attributeFamilySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  code: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    match: [/^[a-z0-9_-]+$/, 'Family code must contain only lowercase letters, numbers, hyphens and underscores']
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  },
  isSystem: {
    type: Boolean,
    default: false
  },
  groups: [{
    name: {
      type: String,
      required: true
    },
    code: {
      type: String,
      required: true
    },
    sortOrder: {
      type: Number,
      default: 0
    },
    isRepeatable: {  // NEW FIELD
      type: Boolean,
      default: false
    }
  }],
  attributes: [{
    attribute: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Attribute',
      required: true
    },
    sortOrder: {
      type: Number,
      default: 0
    },
    isRequired: {
      type: Boolean,
      default: false
    },
    group: {
      type: String,
      required: true
    }
  }]
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index for better performance
attributeFamilySchema.index({ code: 1 });
attributeFamilySchema.index({ status: 1 });
attributeFamilySchema.index({ isSystem: 1 });

// Virtual for getting attributes by group
attributeFamilySchema.virtual('groupedAttributes').get(function() {
  const grouped = {};
  
  this.groups.forEach(group => {
    grouped[group.code] = {
      name: group.name,
      attributes: this.attributes
        .filter(attr => attr.group === group.code)
        .sort((a, b) => a.sortOrder - b.sortOrder)
    };
  });
  
  return grouped;
});

attributeFamilySchema.plugin(mongoosePaginate);

module.exports = mongoose.model('AttributeFamily', attributeFamilySchema);