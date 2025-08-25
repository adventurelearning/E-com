// models/Product.js
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    maxlength: [100, 'Product name cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Product description is required'],
    maxlength: [5000, 'Description cannot exceed 5000 characters'] // Increased character limit
  },
  originalPrice: {
    type: Number,
    required: [true, 'Original price is required'],
    min: [0.01, 'Price must be at least 0.01']
  },
  discountPrice: {
    type: Number,
    min: [0.01, 'Discount price must be at least 0.01'],
    default: 0
  },
  discountPercent: {
    type: Number,
    min: [0, 'Discount percent must be >= 0'],
    max: [100, 'Discount percent must be <= 100'],
    default: 0
  },
  specialPrice: {
    type: Number,
    min: [0.01, 'Special price must be at least 0.01'],
    default: 0
  },
  specialPriceStart: {
    type: Date,
    default: null
  },
  specialPriceEnd: {
    type: Date,
    default: null
  },
  category: {
    type: String,
    required: [true, 'Product category is required']
  },
  subcategory: {
    type: String,
    required: [true, 'Product subcategory is required']
  },
  brand: {
    type: String,
    required: [true, 'Brand name is required'],
    trim: true
  },
  images: {
    type: [String], // Array of image URLs
    default: [],
    validate: {
      validator: function (v) {
        return v.length > 0;
      },
      message: 'At least one image is required'
    }
  },
  colors: {
    type: [String], // e.g., ["Red", "Blue", "Black"]
    default: []
  },
  sizeChart: {
    type: [
      {
        label: { type: String }, // e.g., "M", "28", "XL"
        stock: { type: Number, min: 0 }

      }
    ],
    default: []
  },
  stock: {
    type: Number,
    required: [true, 'Total stock quantity is required'],
    min: [0, 'Stock cannot be negative'],
    default: 0
  },
  addedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AdminUser',
    // required: true
  },
  specifications: [{
    key: { type: String, required: true },
    value: { type: String, required: true }
  }],
  featureDescriptions: [{
    title: { type: String },
    description: { type: String, required: true },
    image: { type: String } // URL for feature image
  }],
  averageRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  reviews: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Review'
  }],
  ratingAttributes: {
    type: [String],
    default: ['Quality', 'Color', 'Design', 'Size']
  },
  groupId: {
    type: String,
    index: true
  }
}, { timestamps: true });

// Pre-save hook to calculate discount percent
productSchema.pre('save', function (next) {
  if (this.isModified('originalPrice') || this.isModified('discountPrice')) {
    if (this.discountPrice > 0 && this.originalPrice > this.discountPrice) {
      this.discountPercent = Math.round(
        ((this.originalPrice - this.discountPrice) / this.originalPrice) * 100
      );
    } else {
      this.discountPercent = 0;
    }
  }
  next();
});

// Indexes for better query performance
productSchema.index({ category: 1, subcategory: 1 });
productSchema.index({ createdAt: -1 });
productSchema.index({ brand: 1 });

module.exports = mongoose.model('Product', productSchema);