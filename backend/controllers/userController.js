const User = require('../models/User');
const bcrypt = require('bcryptjs');

// @desc   Get user profile
// @route  GET /api/users/profile
exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('favoriteRestaurants', 'name logo coverImage rating totalRatings city deliveryTime deliveryFee priceForTwo cuisine isVeg discount')
      .populate('favoriteFoods', 'name image price discountPrice isVeg rating restaurant');
    res.json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

// @desc   Update user profile
// @route  PUT /api/users/profile
exports.updateProfile = async (req, res, next) => {
  try {
    const { name, phone } = req.body;
    const updateData = {};
    if (name) updateData.name = name;
    if (phone) updateData.phone = phone;
    if (req.file) updateData.profileImage = `/uploads/users/${req.file.filename}`;

    const user = await User.findByIdAndUpdate(req.user._id, updateData, { new: true, runValidators: true });
    res.json({ success: true, message: 'Profile updated successfully.', user });
  } catch (error) {
    next(error);
  }
};

// @desc   Change password
// @route  PUT /api/users/change-password
exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Current and new password are required.' });
    }
    const user = await User.findById(req.user._id).select('+password');
    if (!(await user.comparePassword(currentPassword))) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect.' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'New password must be at least 6 characters.' });
    }
    user.password = newPassword;
    await user.save();
    res.json({ success: true, message: 'Password changed successfully.' });
  } catch (error) {
    next(error);
  }
};

// @desc   Add address
// @route  POST /api/users/addresses
exports.addAddress = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (req.body.isDefault) {
      user.addresses.forEach((a) => (a.isDefault = false));
    }
    user.addresses.push(req.body);
    await user.save();
    res.status(201).json({ success: true, message: 'Address added.', addresses: user.addresses });
  } catch (error) {
    next(error);
  }
};

// @desc   Update address
// @route  PUT /api/users/addresses/:addressId
exports.updateAddress = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    const address = user.addresses.id(req.params.addressId);
    if (!address) return res.status(404).json({ success: false, message: 'Address not found.' });
    if (req.body.isDefault) user.addresses.forEach((a) => (a.isDefault = false));
    Object.assign(address, req.body);
    await user.save();
    res.json({ success: true, message: 'Address updated.', addresses: user.addresses });
  } catch (error) {
    next(error);
  }
};

// @desc   Delete address
// @route  DELETE /api/users/addresses/:addressId
exports.deleteAddress = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    user.addresses = user.addresses.filter((a) => a._id.toString() !== req.params.addressId);
    await user.save();
    res.json({ success: true, message: 'Address deleted.', addresses: user.addresses });
  } catch (error) {
    next(error);
  }
};

// @desc   Toggle favorite restaurant
// @route  POST /api/users/favorites/restaurants/:id
exports.toggleFavoriteRestaurant = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    const restaurantId = req.params.id;
    const idx = user.favoriteRestaurants.findIndex((r) => r.toString() === restaurantId);
    if (idx > -1) {
      user.favoriteRestaurants.splice(idx, 1);
    } else {
      user.favoriteRestaurants.push(restaurantId);
    }
    await user.save();
    res.json({ success: true, isFavorite: idx === -1, favoriteRestaurants: user.favoriteRestaurants });
  } catch (error) {
    next(error);
  }
};

// @desc   Toggle favorite food
// @route  POST /api/users/favorites/foods/:id
exports.toggleFavoriteFood = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    const foodId = req.params.id;
    const idx = user.favoriteFoods.findIndex((f) => f.toString() === foodId);
    if (idx > -1) {
      user.favoriteFoods.splice(idx, 1);
    } else {
      user.favoriteFoods.push(foodId);
    }
    await user.save();
    res.json({ success: true, isFavorite: idx === -1, favoriteFoods: user.favoriteFoods });
  } catch (error) {
    next(error);
  }
};
