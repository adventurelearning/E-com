const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  items: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
      quantity: Number,
    }
  ],
  shippingAddress: {
    label: { type: String, required: false },
    fullName: { type: String, required: true },
    phone: { type: String, required: true },
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    postalCode: { type: String, required: true },
    country: { type: String, default: 'India' },
    isDefault: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
  },
  paymentMethod: String,
  status: { type: String, default: 'pending' },
  trackingId: String,
  trackingCourier: String,
  total: { type: Number, required: true },
  // New field to track status history
  statusHistory: [{
    status: String,
    changedAt: { type: Date, default: Date.now },
    changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    note: String,
    trackingId: String,
    trackingCourier: String
  }]
}, { timestamps: true });



module.exports = mongoose.model('Order', orderSchema);