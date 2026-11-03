const Food = require('../models/Food');
const Category = require('../models/Category');
const mongoose = require('mongoose');

const foodFields = ['name', 'description', 'price', 'discountPrice', 'category', 'restaurant', 'isVeg', 'isAvailable', 'preparationTime', 'tags', 'menuSection', 'isFeatured'];
const pickFoodFields = (body) => Object.fromEntries(
  foodFields.filter((field) => body[field] !== undefined).map((field) => [field, body[field]])
);

// @desc   Get all foods
// @route  GET /api/foods
exports.getFoods = async (req, res, next) => {
  try {
    const { restaurant, category, search, isVeg, featured, sort, page = 1, limit = 20 } = req.query;
    const query = { isAvailable: true };
    if (restaurant) query.restaurant = restaurant;
    if (category) {
      if (mongoose.Types.ObjectId.isValid(category)) {
        query.category = category;
      } else {
        const cat = await Category.findOne({ name: new RegExp(`^${category}$`, 'i') });
        if (cat) query.category = cat._id;
        else query.category = new mongoose.Types.ObjectId(); // No matches if category not found
      }
    }
    if (isVeg === 'true') query.isVeg = true;
    if (featured === 'true') query.isFeatured = true;
    if (search) query.$or = [{ name: new RegExp(search, 'i') }, { description: new RegExp(search, 'i') }];

    let sortOption = { createdAt: -1 };
    if (sort === 'popular') sortOption = { totalOrders: -1, rating: -1 };
    else if (sort === 'rating') sortOption = { rating: -1 };
    else if (sort === 'newest') sortOption = { createdAt: -1 };
    else if (sort === 'price-low') sortOption = { price: 1 };
    else if (sort === 'price-high') sortOption = { price: -1 };

    const skip = (Number(page) - 1) * Number(limit);
    const [foods, total] = await Promise.all([
      Food.find(query)
        .populate('category', 'name image icon')
        .populate('restaurant', 'name city logo coverImage')
        .sort(sortOption)
        .skip(skip)
        .limit(Number(limit)),
      Food.countDocuments(query),
    ]);
    res.json({ success: true, total, foods });
  } catch (error) {
    next(error);
  }
};

// @desc   Get single food
// @route  GET /api/foods/:id
exports.getFood = async (req, res, next) => {
  try {
    const food = await Food.findById(req.params.id).populate('category', 'name').populate('restaurant', 'name city logo');
    if (!food) return res.status(404).json({ success: false, message: 'Food item not found.' });
    res.json({ success: true, food });
  } catch (error) {
    next(error);
  }
};

// @desc   Create food (admin)
// @route  POST /api/foods
exports.createFood = async (req, res, next) => {
  try {
    const data = pickFoodFields(req.body);
    if (req.file) data.image = `/uploads/foods/${req.file.filename}`;
    if (data.isVeg === 'true') data.isVeg = true;
    else if (data.isVeg === 'false') data.isVeg = false;
    const food = await Food.create(data);
    const populated = await food.populate('category', 'name');
    res.status(201).json({ success: true, message: 'Food item created.', food: populated });
  } catch (error) {
    next(error);
  }
};

// @desc   Update food (admin)
// @route  PUT /api/foods/:id
exports.updateFood = async (req, res, next) => {
  try {
    const data = pickFoodFields(req.body);
    if (req.file) data.image = `/uploads/foods/${req.file.filename}`;
    if (data.isVeg === 'true') data.isVeg = true;
    else if (data.isVeg === 'false') data.isVeg = false;
    if (data.isAvailable === 'true') data.isAvailable = true;
    else if (data.isAvailable === 'false') data.isAvailable = false;
    const food = await Food.findByIdAndUpdate(req.params.id, data, { new: true, runValidators: true }).populate('category', 'name');
    if (!food) return res.status(404).json({ success: false, message: 'Food item not found.' });
    res.json({ success: true, message: 'Food item updated.', food });
  } catch (error) {
    next(error);
  }
};

// @desc   Delete food (admin)
// @route  DELETE /api/foods/:id
exports.deleteFood = async (req, res, next) => {
  try {
    const food = await Food.findByIdAndDelete(req.params.id);
    if (!food) return res.status(404).json({ success: false, message: 'Food item not found.' });
    res.json({ success: true, message: 'Food item deleted.' });
  } catch (error) {
    next(error);
  }
};

// @desc   Get every menu item for administration, including unavailable ones
// @route  GET /api/foods/manage
exports.getFoodsForAdmin = async (req, res, next) => {
  try {
    const { restaurant, category, search, page = 1, limit = 100 } = req.query;
    const query = {};
    if (restaurant) query.restaurant = restaurant;
    if (category) query.category = category;
    if (search) query.$or = [{ name: new RegExp(search, 'i') }, { description: new RegExp(search, 'i') }];
    const skip = (Number(page) - 1) * Number(limit);
    const [foods, total] = await Promise.all([
      Food.find(query).populate('category', 'name').populate('restaurant', 'name city').sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      Food.countDocuments(query),
    ]);
    res.json({ success: true, total, foods });
  } catch (error) {
    next(error);
  }
};
