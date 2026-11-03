const Cart = require('../models/Cart');
const Food = require('../models/Food');
const Restaurant = require('../models/Restaurant');

// @desc   Get user cart
// @route  GET /api/cart
exports.getCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id })
      .populate('restaurant', 'name logo coverImage deliveryFee minimumOrder')
      .populate('items.food', 'name price image isVeg isAvailable');
    res.json({ success: true, cart: cart || { items: [], restaurant: null } });
  } catch (error) { next(error); }
};

// @desc   Add item to cart
// @route  POST /api/cart
exports.addToCart = async (req, res, next) => {
  try {
    const { foodId, quantity = 1 } = req.body;
    if (!Number.isInteger(Number(quantity)) || Number(quantity) < 1 || Number(quantity) > 50) {
      return res.status(400).json({ success: false, message: 'Quantity must be a whole number between 1 and 50.' });
    }
    const food = await Food.findById(foodId);
    if (!food) return res.status(404).json({ success: false, message: 'Food item not found.' });
    if (!food.isAvailable) return res.status(400).json({ success: false, message: 'This item is currently unavailable.' });

    const restaurant = await Restaurant.findById(food.restaurant);
    if (!restaurant || restaurant.status !== 'active') {
      return res.status(400).json({ success: false, message: 'Restaurant is not accepting orders.' });
    }

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      cart = new Cart({ user: req.user._id, restaurant: food.restaurant, items: [] });
    }

    // Check if different restaurant
    if (cart.restaurant && cart.restaurant.toString() !== food.restaurant.toString() && cart.items.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Your cart has items from another restaurant. Clear it to add from this restaurant.',
        cartRestaurant: cart.restaurant,
      });
    }

    cart.restaurant = food.restaurant;
    const existingItem = cart.items.find((i) => i.food.toString() === foodId);
    if (existingItem) {
      existingItem.quantity += Number(quantity);
    } else {
      cart.items.push({
        food: foodId,
        quantity: Number(quantity),
        price: food.discountPrice || food.price,
        name: food.name,
        image: food.image,
      });
    }
    await cart.save();
    const populated = await Cart.findById(cart._id)
      .populate('restaurant', 'name logo coverImage deliveryFee minimumOrder')
      .populate('items.food', 'name price image isVeg isAvailable');
    res.json({ success: true, message: 'Item added to cart.', cart: populated });
  } catch (error) { next(error); }
};

// @desc   Update item quantity
// @route  PUT /api/cart/:itemId
exports.updateCartItem = async (req, res, next) => {
  try {
    const { quantity } = req.body;
    if (!Number.isInteger(Number(quantity)) || Number(quantity) < 0 || Number(quantity) > 50) {
      return res.status(400).json({ success: false, message: 'Quantity must be a whole number between 0 and 50.' });
    }
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ success: false, message: 'Cart not found.' });

    const item = cart.items.id(req.params.itemId);
    if (!item) return res.status(404).json({ success: false, message: 'Item not found in cart.' });

    if (Number(quantity) <= 0) {
      cart.items = cart.items.filter((i) => i._id.toString() !== req.params.itemId);
    } else {
      item.quantity = Number(quantity);
    }
    if (cart.items.length === 0) cart.restaurant = null;
    await cart.save();

    const populated = await Cart.findById(cart._id)
      .populate('restaurant', 'name logo coverImage deliveryFee minimumOrder')
      .populate('items.food', 'name price image isVeg isAvailable');

    res.json({ success: true, cart: populated || { items: [], restaurant: null } });
  } catch (error) { next(error); }
};

// @desc   Remove item from cart
// @route  DELETE /api/cart/:itemId
exports.removeCartItem = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ success: false, message: 'Cart not found.' });
    cart.items = cart.items.filter((i) => i._id.toString() !== req.params.itemId);
    if (cart.items.length === 0) cart.restaurant = null;
    await cart.save();

    const populated = await Cart.findById(cart._id)
      .populate('restaurant', 'name logo coverImage deliveryFee minimumOrder')
      .populate('items.food', 'name price image isVeg isAvailable');

    res.json({ success: true, message: 'Item removed.', cart: populated || { items: [], restaurant: null } });
  } catch (error) { next(error); }
};

// @desc   Clear cart
// @route  DELETE /api/cart
exports.clearCart = async (req, res, next) => {
  try {
    await Cart.findOneAndUpdate(
      { user: req.user._id },
      { items: [], restaurant: null, couponCode: null, couponDiscount: 0 }
    );
    res.json({ success: true, message: 'Cart cleared.' });
  } catch (error) { next(error); }
};
