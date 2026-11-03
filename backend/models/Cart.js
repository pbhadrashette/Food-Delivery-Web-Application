const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  food: { type: mongoose.Schema.Types.ObjectId, ref: 'Food', required: true },
  quantity: { type: Number, required: true, min: 1, default: 1 },
  price: { type: Number, required: true },
  name: { type: String, required: true },
  image: { type: String, default: '' },
});

const cartSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    restaurant: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant' },
    items: [cartItemSchema],
    couponCode: { type: String, default: null },
    couponDiscount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

cartSchema.virtual('subtotal').get(function () {
  return this.items.reduce((acc, item) => acc + item.price * item.quantity, 0);
});

module.exports = mongoose.model('Cart', cartSchema);
