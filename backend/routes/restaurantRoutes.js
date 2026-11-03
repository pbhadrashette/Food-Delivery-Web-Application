const express = require('express');
const router = express.Router();
const { getRestaurants, getRestaurant, createRestaurant, updateRestaurant, deleteRestaurant, searchAll, getRestaurantsForAdmin } = require('../controllers/restaurantController');
const { protect, adminOnly } = require('../middleware/auth');
const { uploadRestaurant } = require('../middleware/upload');

router.get('/search', searchAll);
router.get('/manage', protect, adminOnly, getRestaurantsForAdmin);
router.get('/', getRestaurants);
router.get('/:id', getRestaurant);
router.post('/', protect, adminOnly, uploadRestaurant.fields([{ name: 'logo', maxCount: 1 }, { name: 'coverImage', maxCount: 1 }]), createRestaurant);
router.put('/:id', protect, adminOnly, uploadRestaurant.fields([{ name: 'logo', maxCount: 1 }, { name: 'coverImage', maxCount: 1 }]), updateRestaurant);
router.delete('/:id', protect, adminOnly, deleteRestaurant);

module.exports = router;
