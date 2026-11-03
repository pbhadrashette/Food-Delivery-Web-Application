const Review = require('../models/Review');
const Order = require('../models/Order');
const Restaurant = require('../models/Restaurant');

// @desc   Create review
// @route  POST /api/reviews
exports.createReview = async (req, res, next) => {
  try {
    const { orderId, restaurantId, foodRating, deliveryRating, restaurantRating, comment } = req.body;

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });
    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized.' });
    }
    if (order.status !== 'DELIVERED') {
      return res.status(400).json({ success: false, message: 'You can only review delivered orders.' });
    }
    if (order.isReviewed) {
      return res.status(400).json({ success: false, message: 'You have already reviewed this order.' });
    }
    if (order.restaurant.toString() !== restaurantId) {
      return res.status(400).json({ success: false, message: 'Review restaurant does not match the order.' });
    }

    const review = await Review.create({
      user: req.user._id, order: orderId, restaurant: restaurantId,
      foodRating, deliveryRating, restaurantRating, comment,
    });

    // Update order
    await Order.findByIdAndUpdate(orderId, { isReviewed: true });

    // Update restaurant average rating
    const allReviews = await Review.find({ restaurant: restaurantId });
    const avgRating = allReviews.reduce((acc, r) => acc + r.restaurantRating, 0) / allReviews.length;
    await Restaurant.findByIdAndUpdate(restaurantId, {
      rating: Math.round(avgRating * 10) / 10,
      totalRatings: allReviews.length,
    });

    const populated = await review.populate('user', 'name profileImage');
    res.status(201).json({ success: true, message: 'Review submitted. Thank you!', review: populated });
  } catch (error) { next(error); }
};

// @desc   Get public reviews for homepage
// @route  GET /api/reviews/public
exports.getPublicReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ isApproved: true })
      .populate('user', 'name profileImage')
      .populate('restaurant', 'name city logo coverImage')
      .sort({ createdAt: -1 })
      .limit(8);
    res.json({ success: true, reviews });
  } catch (error) { next(error); }
};

// @desc   Get reviews for restaurant
// @route  GET /api/reviews/:restaurantId
exports.getRestaurantReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ restaurant: req.params.restaurantId, isApproved: true })
      .populate('user', 'name profileImage')
      .sort({ createdAt: -1 })
      .limit(20);
    res.json({ success: true, reviews });
  } catch (error) { next(error); }
};

// @desc   Delete review (admin)
// @route  DELETE /api/reviews/:id
exports.deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findByIdAndDelete(req.params.id);
    if (!review) return res.status(404).json({ success: false, message: 'Review not found.' });
    const reviews = await Review.find({ restaurant: review.restaurant });
    const rating = reviews.length
      ? Math.round((reviews.reduce((sum, item) => sum + item.restaurantRating, 0) / reviews.length) * 10) / 10
      : 0;
    await Restaurant.findByIdAndUpdate(review.restaurant, { rating, totalRatings: reviews.length });
    res.json({ success: true, message: 'Review deleted.' });
  } catch (error) { next(error); }
};

// @desc   Get all reviews (admin)
// @route  GET /api/reviews
exports.getAllReviews = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;
    const [reviews, total] = await Promise.all([
      Review.find()
        .populate('user', 'name email')
        .populate('restaurant', 'name city')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Review.countDocuments(),
    ]);
    res.json({ success: true, total, reviews });
  } catch (error) { next(error); }
};
