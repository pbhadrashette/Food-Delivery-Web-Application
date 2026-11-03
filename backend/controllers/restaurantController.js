const Restaurant = require('../models/Restaurant');
const Food = require('../models/Food');

const restaurantFields = ['name', 'description', 'phone', 'email', 'address', 'city', 'cuisine', 'openingTime', 'closingTime', 'deliveryFee', 'minimumOrder', 'deliveryTime', 'priceForTwo', 'isVeg', 'discount', 'status', 'featured', 'tags'];
const pickRestaurantFields = (body) => Object.fromEntries(
  restaurantFields.filter((field) => body[field] !== undefined).map((field) => [field, body[field]])
);

// @desc   Get all restaurants (with filters)
// @route  GET /api/restaurants
exports.getRestaurants = async (req, res, next) => {
  try {
    const { search, cuisine, city, rating, sort, page = 1, limit = 12, featured } = req.query;
    const query = { status: 'active' };

    if (search) {
      const regex = new RegExp(search, 'i');
      query.$or = [{ name: regex }, { description: regex }, { cuisine: regex }, { city: regex }];
    }
    if (cuisine) query.cuisine = { $in: [new RegExp(cuisine, 'i')] };
    if (city) query.city = new RegExp(city, 'i');
    if (rating) query.rating = { $gte: Number(rating) };
    if (featured === 'true') query.featured = true;
    if (req.query.isVeg === 'true' || req.query.veg === 'true') query.isVeg = true;

    let sortOption = { createdAt: -1 };
    if (sort === 'rating') sortOption = { rating: -1 };
    if (sort === 'deliveryTime') sortOption = { deliveryTime: 1 };
    if (sort === 'deliveryFee') sortOption = { deliveryFee: 1 };

    const skip = (Number(page) - 1) * Number(limit);
    const [restaurants, total] = await Promise.all([
      Restaurant.find(query).sort(sortOption).skip(skip).limit(Number(limit)),
      Restaurant.countDocuments(query),
    ]);

    res.json({
      success: true,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      restaurants,
    });
  } catch (error) {
    next(error);
  }
};

// @desc   Get single restaurant with menu
// @route  GET /api/restaurants/:id
exports.getRestaurant = async (req, res, next) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) return res.status(404).json({ success: false, message: 'Restaurant not found.' });

    const foods = await Food.find({ restaurant: req.params.id, isAvailable: true })
      .populate('category', 'name')
      .sort({ menuSection: 1, name: 1 });

    // Group by menu section
    const menu = {};
    foods.forEach((food) => {
      const section = food.menuSection || 'Other';
      if (!menu[section]) menu[section] = [];
      menu[section].push(food);
    });

    res.json({ success: true, restaurant, menu, foods });
  } catch (error) {
    next(error);
  }
};

// @desc   Create restaurant (admin)
// @route  POST /api/restaurants
exports.createRestaurant = async (req, res, next) => {
  try {
    const data = pickRestaurantFields(req.body);
    if (req.files) {
      if (req.files.logo) data.logo = `/uploads/restaurants/${req.files.logo[0].filename}`;
      if (req.files.coverImage) data.coverImage = `/uploads/restaurants/${req.files.coverImage[0].filename}`;
    }
    if (typeof data.cuisine === 'string') data.cuisine = data.cuisine.split(',').map((c) => c.trim());
    const restaurant = await Restaurant.create(data);
    res.status(201).json({ success: true, message: 'Restaurant created.', restaurant });
  } catch (error) {
    next(error);
  }
};

// @desc   Update restaurant (admin)
// @route  PUT /api/restaurants/:id
exports.updateRestaurant = async (req, res, next) => {
  try {
    const data = pickRestaurantFields(req.body);
    if (req.files) {
      if (req.files.logo) data.logo = `/uploads/restaurants/${req.files.logo[0].filename}`;
      if (req.files.coverImage) data.coverImage = `/uploads/restaurants/${req.files.coverImage[0].filename}`;
    }
    if (typeof data.cuisine === 'string') data.cuisine = data.cuisine.split(',').map((c) => c.trim());
    const restaurant = await Restaurant.findByIdAndUpdate(req.params.id, data, { new: true, runValidators: true });
    if (!restaurant) return res.status(404).json({ success: false, message: 'Restaurant not found.' });
    res.json({ success: true, message: 'Restaurant updated.', restaurant });
  } catch (error) {
    next(error);
  }
};

// @desc   Delete restaurant (admin)
// @route  DELETE /api/restaurants/:id
exports.deleteRestaurant = async (req, res, next) => {
  try {
    const restaurant = await Restaurant.findByIdAndDelete(req.params.id);
    if (!restaurant) return res.status(404).json({ success: false, message: 'Restaurant not found.' });
    await Food.deleteMany({ restaurant: req.params.id });
    res.json({ success: true, message: 'Restaurant and its menu deleted.' });
  } catch (error) {
    next(error);
  }
};

// @desc   Get all restaurants for administration, including inactive records
// @route  GET /api/restaurants/manage
exports.getRestaurantsForAdmin = async (req, res, next) => {
  try {
    const { search, page = 1, limit = 50 } = req.query;
    const query = search ? { $text: { $search: search } } : {};
    const skip = (Number(page) - 1) * Number(limit);
    const [restaurants, total] = await Promise.all([
      Restaurant.find(query).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      Restaurant.countDocuments(query),
    ]);
    res.json({ success: true, total, page: Number(page), restaurants });
  } catch (error) {
    next(error);
  }
};

// @desc   Search restaurants + foods
// @route  GET /api/restaurants/search
exports.searchAll = async (req, res, next) => {
  try {
    const { q } = req.query;
    if (!q) return res.json({ success: true, restaurants: [], foods: [] });

    const regex = new RegExp(q, 'i');
    const [restaurants, foods] = await Promise.all([
      Restaurant.find({ status: 'active', $or: [{ name: regex }, { cuisine: regex }, { city: regex }] }).limit(10),
      Food.find({ isAvailable: true, $or: [{ name: regex }, { description: regex }, { tags: regex }] })
        .populate('restaurant', 'name city')
        .limit(10),
    ]);

    res.json({ success: true, restaurants, foods });
  } catch (error) {
    next(error);
  }
};
