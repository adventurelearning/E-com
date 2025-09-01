const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  orderId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Order', 
    required: true 
  },
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  paymentMethod: { 
    type: String, 
    required: true,
    enum: ['cod', 'razorpay'] 
  },
  amount: { 
    type: Number, 
    required: true 
  },
  status: { 
    type: String, 
    required: true,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  razorpayPaymentId: { 
    type: String, 
    default: null 
  },
  razorpayOrderId: { 
    type: String, 
    default: null 
  },
  razorpaySignature: { 
    type: String, 
    default: null 
  },
  paymentDate: { 
    type: Date, 
    default: Date.now 
  },
  refundDate: { 
    type: Date, 
    default: null 
  }
}, { timestamps: true });

module.exports = mongoose.model('Payment', paymentSchema);