const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  food: { type: mongoose.Schema.Types.ObjectId, ref: 'Food', required: true },
  name: { type: String, required: true },
  image: { type: String },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 },
  isVeg: { type: Boolean, default: false },
});

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      unique: true,
      default: () => 'ORD' + Date.now() + Math.floor(Math.random() * 1000),
    },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    restaurant: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true },
    items: [orderItemSchema],
    deliveryAddress: {
      fullName: String,
      phone: String,
      houseFlat: String,
      street: String,
      area: String,
      city: String,
      state: String,
      division: String,
      pincode: String,
      landmark: String,
      addressType: String,
    },
    subtotal: { type: Number, required: true },
    deliveryFee: { type: Number, required: true, default: 30 },
    taxes: { type: Number, required: true, default: 0 },
    platformFee: { type: Number, default: 5 },
    discount: { type: Number, default: 0 },
    couponCode: { type: String, default: null },
    totalAmount: { type: Number, required: true },
    paymentMethod: { type: String, enum: ['COD', 'ONLINE'], required: true },
    paymentStatus: { type: String, enum: ['PENDING', 'PAID', 'FAILED', 'REFUNDED'], default: 'PENDING' },
    paymentId: { type: String, default: null },
    status: {
      type: String,
      enum: ['PLACED', 'CONFIRMED', 'PREPARING', 'READY_FOR_PICKUP', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'],
      default: 'PLACED',
    },
    statusHistory: [
      {
        status: String,
        timestamp: { type: Date, default: Date.now },
        note: String,
      },
    ],
    estimatedDeliveryTime: { type: Date },
    deliveredAt: { type: Date },
    cancelReason: { type: String },
    specialInstructions: { type: String },
    isReviewed: { type: Boolean, default: false },
  },
  { timestamps: true }
);

orderSchema.pre('save', async function () {
  if (!this.orderNumber) {
    this.orderNumber = 'ORD' + Date.now() + Math.floor(Math.random() * 1000);
  }
});

orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ restaurant: 1, createdAt: -1 });
orderSchema.index({ status: 1 });

module.exports = mongoose.model('Order', orderSchema);
