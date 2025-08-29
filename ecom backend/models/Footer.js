const mongoose = require('mongoose');

const footerSchema = new mongoose.Schema({
  // Contact Us Section
  companyName: {
    type: String,
    required: true,
  },
  addressLine1: {
    type: String,
    required: true,
  },
  addressLine2: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  chatButtonText: {
    type: String,
    required: true,
  },

  // Products Links (now with titles)
  productsSections: [{
    title: String,
    links: [{
      text: String,
      url: String
    }]
  }],
  
  // Social Media Links with Images
  socialLinks: [{
    platform: String,
    url: String,
    imageUrl: String
  }],
  
  // Copyright Text
  copyrightText: {
    type: String,
    required: true,
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Footer', footerSchema);