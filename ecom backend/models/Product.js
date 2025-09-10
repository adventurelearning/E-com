const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  // Basic identification
  sku: {
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
  description: {
    type: String,
    required: true
  },
  
  // Pricing
  originalPrice: {
    type: Number,
    required: true,
    min: 0
  },
  discountPrice: {
    type: Number,
    min: 0,
    default: 0
  },
  discountPercent: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  specialPrice: {
    type: Number,
    min: 0,
    default: 0
  },
  specialPriceStart: {
    type: Date
  },
  specialPriceEnd: {
    type: Date
  },
  
  // Categorization
  category: {
    type: String,
    required: true
  },
  subcategory: {
    type: String,
    required: true
  },
  brand: {
    type: String,
    required: true
  },

  
  // Inventory
  stock: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  
  // Attribute family reference
  attributeFamily: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AttributeFamily',
    // required: true
  },
  
  // Dynamic attributes - stored as a nested structure
  attributes: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
    default: {}
  },
  
  // Grouping
  groupId: {
    type: String,
    index: true
  },
  
  // Media
  images: [{
    type: String,
    required: true,
    validate: {
      validator: function(v) {
        return v.length > 0;
      },
      message: 'At least one image is required'
    }
  }],
  
  // Meta details for SEO
  metaTitle: {
    type: String,
    trim: true
  },
  metaKeywords: {
    type: String,
    trim: true
  },
  metaDescription: {
    type: String,
    trim: true
  },
  
  // References
  addedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AdminUser'
  },
  reviews: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Review'
  }],
    ratingAttributes: {
    type: [String],
    default: ['Quality', 'Color', 'Design', 'Size']
  },
  // Metadata
  averageRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for checking if special price is active
productSchema.virtual('isSpecialPriceActive').get(function() {
  const now = new Date();
  return this.specialPrice > 0 && 
         this.specialPriceStart <= now && 
         this.specialPriceEnd >= now;
});

// Indexes
productSchema.index({ attributeFamily: 1 });
productSchema.index({ sku: 1 });
productSchema.index({ groupId: 1 });
productSchema.index({ category: 1, subcategory: 1 });
productSchema.index({ brand: 1 });
productSchema.index({ createdAt: -1 });

// Pre-save middleware to calculate discount percent
productSchema.pre('save', function(next) {
  if (this.originalPrice > 0 && this.discountPrice > 0 && this.discountPrice < this.originalPrice) {
    this.discountPercent = Math.round(((this.originalPrice - this.discountPrice) / this.originalPrice) * 100);
  } else {
    this.discountPercent = 0;
  }
  next();
});

module.exports = mongoose.model('Product', productSchema);