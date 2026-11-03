const express = require('express');
const router = express.Router();
const { getFoods, getFood, createFood, updateFood, deleteFood, getFoodsForAdmin } = require('../controllers/foodController');
const { protect, adminOnly } = require('../middleware/auth');
const { uploadFood } = require('../middleware/upload');

router.get('/', getFoods);
router.get('/manage', protect, adminOnly, getFoodsForAdmin);
router.get('/:id', getFood);
router.post('/', protect, adminOnly, uploadFood.single('image'), createFood);
router.put('/:id', protect, adminOnly, uploadFood.single('image'), updateFood);
router.delete('/:id', protect, adminOnly, deleteFood);

module.exports = router;
