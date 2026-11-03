const express = require('express');
const router = express.Router();
const { createReview, getRestaurantReviews, deleteReview, getAllReviews, getPublicReviews } = require('../controllers/reviewController');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/public', getPublicReviews);
router.post('/', protect, createReview);
router.get('/', protect, adminOnly, getAllReviews);
router.get('/:restaurantId', getRestaurantReviews);
router.delete('/:id', protect, adminOnly, deleteReview);

module.exports = router;
