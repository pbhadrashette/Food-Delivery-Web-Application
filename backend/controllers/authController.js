const User = require('../models/User');
const { generateToken } = require('../middleware/auth');

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

// @desc   Register user
// @route  POST /api/auth/register
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, phone } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email and password are required.' });
    }
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Email already registered.' });
    }
    const user = await User.create({ name, email, password, phone });
    const token = generateToken(user._id);
    res.cookie('token', token, cookieOptions);
    res.status(201).json({
      success: true,
      message: 'Registration successful.',
      token,
      user: { _id: user._id, name: user.name, email: user.email, phone: user.phone, role: user.role, profileImage: user.profileImage },
    });
  } catch (error) {
    next(error);
  }
};

const authenticate = async (req, res, next, adminOnly = false) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }
    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'Your account has been deactivated.' });
    }
    if (adminOnly && user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied. Admin only.' });
    }
    const token = generateToken(user._id);
    res.cookie('token', token, cookieOptions);
    res.json({
      success: true,
      message: adminOnly ? 'Admin login successful.' : 'Login successful.',
      token,
      user: { _id: user._id, name: user.name, email: user.email, phone: user.phone, role: user.role, profileImage: user.profileImage },
    });
  } catch (error) {
    next(error);
  }
};

// @desc   Login user
// @route  POST /api/auth/login
exports.login = (req, res, next) => authenticate(req, res, next);

// @desc   Login administrator
// @route  POST /api/auth/admin/login
exports.adminLogin = (req, res, next) => authenticate(req, res, next, true);

// @desc   Logout user
// @route  POST /api/auth/logout
exports.logout = (req, res) => {
  res.cookie('token', '', { ...cookieOptions, maxAge: 0 });
  res.json({ success: true, message: 'Logged out successfully.' });
};

// @desc   Get current user
// @route  GET /api/auth/me
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('favoriteRestaurants', 'name logo coverImage rating totalRatings city deliveryTime deliveryFee priceForTwo cuisine isVeg discount')
      .populate('favoriteFoods', 'name image price discountPrice isVeg rating restaurant');
    res.json({ success: true, user });
  } catch (error) {
    next(error);
  }
};
