const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.Mixed, required: true },
  items: [
    {
      productId: { type: mongoose.Schema.Types.Mixed },
      name: { type: String },
      image: { type: String },
      imageUrl: { type: String },
      qty: { type: Number, required: true, default: 1 },
      price: { type: Number, required: true, default: 0 }
    }
  ],
  totalAmount: { type: Number, required: true },
  address: {
    fullName: { type: String, default: 'Customer' },
    street: { type: String, default: 'Standard Delivery' },
    city: { type: String, default: 'Online Order' },
    postalCode: { type: String, default: '000000' },
    country: { type: String, default: 'India' }
  },
  paymentId: { type: String },
  status: { type: String, enum: ['Pending', 'Shipped', 'Delivered'], default: 'Pending' },
  returnStatus: { 
    type: String, 
    enum: ['None', 'Requested', 'Approved', 'Picked Up', 'Refunded', 'Rejected', 'Cancelled'], 
    default: 'None' 
  },
  returnReason: { type: String },
  returnComments: { type: String },
  refundMethod: { type: String, default: 'Original Payment Method' },
  rmaCode: { type: String },
  returnItems: [
    {
      productId: { type: String },
      name: { type: String },
      qty: { type: Number, default: 1 },
      price: { type: Number }
    }
  ],
  returnRequestedAt: { type: Date },
  returnResolvedAt: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
