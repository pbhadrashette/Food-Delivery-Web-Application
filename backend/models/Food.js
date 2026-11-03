const mongoose = require('mongoose');

const foodSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    discountPrice: { type: Number, default: null },
    image: { type: String, default: '' },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    restaurant: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true },
    isVeg: { type: Boolean, default: false },
    isAvailable: { type: Boolean, default: true },
    preparationTime: { type: Number, default: 20 }, // in minutes
    rating: { type: Number, default: 0, min: 0, max: 5 },
    totalRatings: { type: Number, default: 0 },
    tags: [{ type: String }],
    menuSection: { type: String, default: 'Main Course' },
    isFeatured: { type: Boolean, default: false },
    totalOrders: { type: Number, default: 0 },
  },
  { timestamps: true }
);

foodSchema.index({ name: 'text', description: 'text', tags: 'text' });
foodSchema.index({ restaurant: 1, isAvailable: 1 });
foodSchema.index({ category: 1 });

module.exports = mongoose.model('Food', foodSchema);
