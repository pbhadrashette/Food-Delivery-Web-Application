const mongoose = require('mongoose');

const restaurantSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    logo: { type: String, default: '' },
    coverImage: { type: String, default: '' },
    owner: { type: String, default: '' },
    phone: { type: String, required: true },
    email: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    cuisine: [{ type: String }],
    openingTime: { type: String, default: '09:00' },
    closingTime: { type: String, default: '22:00' },
    deliveryFee: { type: Number, default: 30 },
    minimumOrder: { type: Number, default: 100 },
    deliveryTime: { type: String, default: '30-45' },
    priceForTwo: { type: Number, default: 400 },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    totalRatings: { type: Number, default: 0 },
    isVeg: { type: Boolean, default: false },
    discount: { type: String, default: '' },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
    featured: { type: Boolean, default: false },
    tags: [{ type: String }],
  },
  { timestamps: true }
);

restaurantSchema.index({ name: 'text', description: 'text', cuisine: 'text', city: 'text' });
restaurantSchema.index({ status: 1 });
restaurantSchema.index({ rating: -1 });

module.exports = mongoose.model('Restaurant', restaurantSchema);
