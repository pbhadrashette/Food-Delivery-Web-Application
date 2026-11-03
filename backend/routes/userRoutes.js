const express = require('express');
const router = express.Router();
const { getProfile, updateProfile, changePassword, addAddress, updateAddress, deleteAddress, toggleFavoriteRestaurant, toggleFavoriteFood } = require('../controllers/userController');
const { protect } = require('../middleware/auth');
const { uploadUser } = require('../middleware/upload');

router.use(protect);
router.get('/profile', getProfile);
router.put('/profile', uploadUser.single('profileImage'), updateProfile);
router.put('/change-password', changePassword);
router.post('/addresses', addAddress);
router.put('/addresses/:addressId', updateAddress);
router.delete('/addresses/:addressId', deleteAddress);
router.post('/favorites/restaurants/:id', toggleFavoriteRestaurant);
router.post('/favorites/foods/:id', toggleFavoriteFood);

module.exports = router;
