const express = require('express');
const router = express.Router();
const { getCategories, getAllCategories, createCategory, updateCategory, deleteCategory } = require('../controllers/categoryController');
const { protect, adminOnly } = require('../middleware/auth');
const { uploadCategory } = require('../middleware/upload');

router.get('/', getCategories);
router.get('/all', protect, adminOnly, getAllCategories);
router.post('/', protect, adminOnly, uploadCategory.single('image'), createCategory);
router.put('/:id', protect, adminOnly, uploadCategory.single('image'), updateCategory);
router.delete('/:id', protect, adminOnly, deleteCategory);

module.exports = router;
