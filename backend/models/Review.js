const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
    restaurant: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true },
    foodRating: { type: Number, required: true, min: 1, max: 5 },
    deliveryRating: { type: Number, required: true, min: 1, max: 5 },
    restaurantRating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, trim: true, maxlength: 500 },
    images: [{ type: String }],
    isApproved: { type: Boolean, default: true },
  },
  { timestamps: true }
);

reviewSchema.index({ restaurant: 1, createdAt: -1 });
reviewSchema.index({ user: 1 });

module.exports = mongoose.model('Review', reviewSchema);
