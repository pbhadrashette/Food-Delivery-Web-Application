const Order = require('../models/Order');
const User = require('../models/User');
const Restaurant = require('../models/Restaurant');
const Food = require('../models/Food');
const Review = require('../models/Review');
const CloudKitchen = require('../models/CloudKitchen');
const Manager = require('../models/Manager');
const DeliveryPartner = require('../models/DeliveryPartner');

// @desc   Admin dashboard stats
// @route  GET /api/admin/dashboard
exports.getDashboard = async (req, res, next) => {
  try {
    const [
      totalOrders, totalCustomers, totalRestaurants, totalRevenue,
      pendingOrders, deliveredOrders, cancelledOrders,
    ] = await Promise.all([
      Order.countDocuments(),
      User.countDocuments({ role: 'user' }),
      Restaurant.countDocuments(),
      Order.aggregate([{ $match: { status: 'DELIVERED' } }, { $group: { _id: null, total: { $sum: '$totalAmount' } } }]),
      Order.countDocuments({ status: { $in: ['PLACED', 'CONFIRMED', 'PREPARING'] } }),
      Order.countDocuments({ status: 'DELIVERED' }),
      Order.countDocuments({ status: 'CANCELLED' }),
    ]);

    // Revenue last 7 days
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const revenueByDay = await Order.aggregate([
      { $match: { status: 'DELIVERED', createdAt: { $gte: sevenDaysAgo } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, revenue: { $sum: '$totalAmount' }, orders: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);

    // Order status distribution
    const statusDistribution = await Order.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    // Top restaurants by orders
    const topRestaurants = await Order.aggregate([
      { $group: { _id: '$restaurant', totalOrders: { $sum: 1 }, totalRevenue: { $sum: '$totalAmount' } } },
      { $sort: { totalOrders: -1 } },
      { $limit: 5 },
      { $lookup: { from: 'restaurants', localField: '_id', foreignField: '_id', as: 'restaurant' } },
      { $unwind: '$restaurant' },
      { $project: { 'restaurant.name': 1, 'restaurant.logo': 1, totalOrders: 1, totalRevenue: 1 } },
    ]);

    // Top food items
    const topFoods = await Food.find().sort({ totalOrders: -1 }).limit(5).populate('restaurant', 'name');

    res.json({
      success: true,
      adminName: req.user?.name || 'Admin',
      stats: {
        totalOrders,
        totalCustomers,
        totalRestaurants,
        totalRevenue: totalRevenue[0]?.total || 0,
        pendingOrders,
        deliveredOrders,
        cancelledOrders,
      },
      revenueByDay,
      statusDistribution,
      topRestaurants,
      topFoods,
    });
  } catch (error) { next(error); }
};

// @desc   Admin get all orders
// @route  GET /api/admin/orders
exports.getOrders = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20, search } = req.query;
    const query = {};
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { orderNumber: new RegExp(search, 'i') },
      ];
    }
    const skip = (Number(page) - 1) * Number(limit);
    const [orders, total] = await Promise.all([
      Order.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .populate('user', 'name email phone')
        .populate('restaurant', 'name city'),
      Order.countDocuments(query),
    ]);
    res.json({ success: true, total, page: Number(page), pages: Math.ceil(total / Number(limit)), orders });
  } catch (error) { next(error); }
};

// @desc   Update order status (admin)
// @route  PUT /api/admin/orders/:id/status
exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { status, note } = req.body;
    const validStatuses = ['PLACED', 'CONFIRMED', 'PREPARING', 'READY_FOR_PICKUP', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status.' });
    }
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });
    order.status = status;
    order.statusHistory.push({ status, note: note || `Status updated to ${status}` });
    if (status === 'DELIVERED') {
      order.deliveredAt = new Date();
      order.paymentStatus = 'PAID';
    }
    await order.save();
    res.json({ success: true, message: `Order status updated to ${status}.`, order });
  } catch (error) { next(error); }
};

// @desc   Get all customers (admin)
// @route  GET /api/admin/customers
exports.getCustomers = async (req, res, next) => {
  try {
    const { search, page = 1, limit = 20, status } = req.query;
    const query = { role: 'user' };
    if (search) query.$or = [{ name: new RegExp(search, 'i') }, { email: new RegExp(search, 'i') }];
    if (status === 'active') query.isActive = true;
    else if (status === 'inactive') query.isActive = false;
    const skip = (Number(page) - 1) * Number(limit);
    const [customers, total] = await Promise.all([
      User.find(query).select('-password').sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      User.countDocuments(query),
    ]);
    res.json({ success: true, total, customers });
  } catch (error) { next(error); }
};

// @desc   Toggle customer active status (admin)
// @route  PUT /api/admin/customers/:id/status
exports.toggleCustomerStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
    user.isActive = !user.isActive;
    await user.save();
    res.json({ success: true, message: `User ${user.isActive ? 'activated' : 'deactivated'}.`, user });
  } catch (error) { next(error); }
};

// @desc   Get customer orders (admin)
// @route  GET /api/admin/customers/:id/orders
exports.getCustomerOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.params.id })
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('restaurant', 'name');
    res.json({ success: true, orders });
  } catch (error) { next(error); }
};

// @desc   Analytics
// @route  GET /api/admin/analytics
exports.getAnalytics = async (req, res, next) => {
  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const [monthlyRevenue, monthlyOrders, avgOrderValue, newCustomers, topFoods] = await Promise.all([
      Order.aggregate([
        { $match: { status: 'DELIVERED', createdAt: { $gte: thirtyDaysAgo } } },
        { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, revenue: { $sum: '$totalAmount' }, orders: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),
      Order.aggregate([
        { $match: { createdAt: { $gte: thirtyDaysAgo } } },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      Order.aggregate([
        { $match: { status: 'DELIVERED' } },
        { $group: { _id: null, avg: { $avg: '$totalAmount' } } },
      ]),
      User.countDocuments({ role: 'user', createdAt: { $gte: thirtyDaysAgo } }),
      Food.find().sort({ totalOrders: -1 }).limit(10).populate('restaurant', 'name'),
    ]);

    const cancellationRate = await Order.aggregate([
      { $group: { _id: null, total: { $sum: 1 }, cancelled: { $sum: { $cond: [{ $eq: ['$status', 'CANCELLED'] }, 1, 0] } } } },
    ]);

    // Revenue by payment method
    const paymentMethodStats = await Order.aggregate([
      { $match: { status: 'DELIVERED' } },
      { $group: { _id: '$paymentMethod', count: { $sum: 1 }, total: { $sum: '$totalAmount' } } },
    ]);

    // Top restaurants (30 days)
    const topRestaurants = await Order.aggregate([
      { $match: { status: 'DELIVERED', createdAt: { $gte: thirtyDaysAgo } } },
      { $group: { _id: '$restaurant', totalOrders: { $sum: 1 }, totalRevenue: { $sum: '$totalAmount' } } },
      { $sort: { totalRevenue: -1 } },
      { $limit: 5 },
      { $lookup: { from: 'restaurants', localField: '_id', foreignField: '_id', as: 'restaurant' } },
      { $unwind: '$restaurant' },
      { $project: { 'restaurant.name': 1, totalOrders: 1, totalRevenue: 1 } },
    ]);

    res.json({
      success: true,
      monthlyRevenue,
      monthlyOrders,
      avgOrderValue: Math.round(avgOrderValue[0]?.avg || 0),
      newCustomers,
      topFoods,
      topRestaurants,
      paymentMethodStats,
      cancellationRate: cancellationRate[0] ? Math.round((cancellationRate[0].cancelled / cancellationRate[0].total) * 100) : 0,
    });
  } catch (error) { next(error); }
};

// @desc   Get payments list (admin)
// @route  GET /api/admin/payments
exports.getPayments = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, paymentStatus, paymentMethod } = req.query;
    const query = {};
    if (paymentStatus) query.paymentStatus = paymentStatus;
    if (paymentMethod) query.paymentMethod = paymentMethod;
    const skip = (Number(page) - 1) * Number(limit);
    const [orders, total] = await Promise.all([
      Order.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .populate('user', 'name email phone')
        .populate('restaurant', 'name'),
      Order.countDocuments(query),
    ]);
    // Payment stats
    const stats = await Order.aggregate([
      { $group: { _id: null, totalRevenue: { $sum: { $cond: [{ $eq: ['$paymentStatus', 'PAID'] }, '$totalAmount', 0] } }, totalPaid: { $sum: { $cond: [{ $eq: ['$paymentStatus', 'PAID'] }, 1, 0] } }, totalPending: { $sum: { $cond: [{ $eq: ['$paymentStatus', 'PENDING'] }, 1, 0] } }, totalFailed: { $sum: { $cond: [{ $eq: ['$paymentStatus', 'FAILED'] }, 1, 0] } } } },
    ]);
    res.json({ success: true, total, page: Number(page), pages: Math.ceil(total / Number(limit)), orders, stats: stats[0] || {} });
  } catch (error) { next(error); }
};

// ─── CLOUD KITCHENS ───────────────────────────────────────────────────────────

// @desc   Get all cloud kitchens
// @route  GET /api/admin/kitchens
exports.getKitchens = async (req, res, next) => {
  try {
    const { search, manager, status, page = 1, limit = 20 } = req.query;
    const query = {};
    if (status) query.status = status;
    if (manager) query.manager = manager;
    if (search) {
      const regex = new RegExp(search, 'i');
      query.$or = [{ kitchenId: regex }, { state: regex }, { city: regex }, { division: regex }, { address: regex }];
    }
    const skip = (Number(page) - 1) * Number(limit);
    const [kitchens, total] = await Promise.all([
      CloudKitchen.find(query).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)).populate('manager', 'name email phone'),
      CloudKitchen.countDocuments(query),
    ]);
    res.json({ success: true, total, kitchens });
  } catch (error) { next(error); }
};

// @desc   Create cloud kitchen
// @route  POST /api/admin/kitchens
exports.createKitchen = async (req, res, next) => {
  try {
    const kitchen = await CloudKitchen.create(req.body);
    res.status(201).json({ success: true, message: 'Cloud kitchen created.', kitchen });
  } catch (error) { next(error); }
};

// @desc   Update cloud kitchen
// @route  PUT /api/admin/kitchens/:id
exports.updateKitchen = async (req, res, next) => {
  try {
    const kitchen = await CloudKitchen.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!kitchen) return res.status(404).json({ success: false, message: 'Kitchen not found.' });
    res.json({ success: true, message: 'Kitchen updated.', kitchen });
  } catch (error) { next(error); }
};

// @desc   Delete cloud kitchen
// @route  DELETE /api/admin/kitchens/:id
exports.deleteKitchen = async (req, res, next) => {
  try {
    const kitchen = await CloudKitchen.findByIdAndDelete(req.params.id);
    if (!kitchen) return res.status(404).json({ success: false, message: 'Kitchen not found.' });
    res.json({ success: true, message: 'Kitchen deleted.' });
  } catch (error) { next(error); }
};

// ─── MANAGERS ────────────────────────────────────────────────────────────────

// @desc   Get all managers
// @route  GET /api/admin/managers
exports.getManagers = async (req, res, next) => {
  try {
    const { search, status, page = 1, limit = 20 } = req.query;
    const query = {};
    if (status) query.status = status;
    if (search) {
      const regex = new RegExp(search, 'i');
      query.$or = [{ name: regex }, { email: regex }, { phone: regex }];
    }
    const skip = (Number(page) - 1) * Number(limit);
    const [managers, total] = await Promise.all([
      Manager.find(query).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)).populate('assignedKitchen', 'kitchenId city'),
      Manager.countDocuments(query),
    ]);
    res.json({ success: true, total, managers });
  } catch (error) { next(error); }
};

// @desc   Create manager
// @route  POST /api/admin/managers
exports.createManager = async (req, res, next) => {
  try {
    const manager = await Manager.create(req.body);
    res.status(201).json({ success: true, message: 'Manager created.', manager });
  } catch (error) { next(error); }
};

// @desc   Update manager
// @route  PUT /api/admin/managers/:id
exports.updateManager = async (req, res, next) => {
  try {
    const manager = await Manager.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!manager) return res.status(404).json({ success: false, message: 'Manager not found.' });
    res.json({ success: true, message: 'Manager updated.', manager });
  } catch (error) { next(error); }
};

// @desc   Delete manager
// @route  DELETE /api/admin/managers/:id
exports.deleteManager = async (req, res, next) => {
  try {
    const manager = await Manager.findByIdAndDelete(req.params.id);
    if (!manager) return res.status(404).json({ success: false, message: 'Manager not found.' });
    res.json({ success: true, message: 'Manager deleted.' });
  } catch (error) { next(error); }
};

// ─── DELIVERY PARTNERS ────────────────────────────────────────────────────────

// @desc   Get all delivery partners
// @route  GET /api/admin/delivery-partners
exports.getDeliveryPartners = async (req, res, next) => {
  try {
    const { search, status, city, page = 1, limit = 20 } = req.query;
    const query = {};
    if (status) query.status = status;
    if (city) query.city = new RegExp(city, 'i');
    if (search) {
      const regex = new RegExp(search, 'i');
      query.$or = [{ name: regex }, { email: regex }, { phone: regex }, { vehicleNumber: regex }];
    }
    const skip = (Number(page) - 1) * Number(limit);
    const [partners, total] = await Promise.all([
      DeliveryPartner.find(query).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      DeliveryPartner.countDocuments(query),
    ]);
    res.json({ success: true, total, partners });
  } catch (error) { next(error); }
};

// @desc   Create delivery partner
// @route  POST /api/admin/delivery-partners
exports.createDeliveryPartner = async (req, res, next) => {
  try {
    const partner = await DeliveryPartner.create(req.body);
    res.status(201).json({ success: true, message: 'Delivery partner added.', partner });
  } catch (error) { next(error); }
};

// @desc   Update delivery partner
// @route  PUT /api/admin/delivery-partners/:id
exports.updateDeliveryPartner = async (req, res, next) => {
  try {
    const partner = await DeliveryPartner.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!partner) return res.status(404).json({ success: false, message: 'Partner not found.' });
    res.json({ success: true, message: 'Partner updated.', partner });
  } catch (error) { next(error); }
};

// @desc   Delete delivery partner
// @route  DELETE /api/admin/delivery-partners/:id
exports.deleteDeliveryPartner = async (req, res, next) => {
  try {
    const partner = await DeliveryPartner.findByIdAndDelete(req.params.id);
    if (!partner) return res.status(404).json({ success: false, message: 'Partner not found.' });
    res.json({ success: true, message: 'Partner deleted.' });
  } catch (error) { next(error); }
};

// @desc   Toggle delivery partner verification
// @route  PUT /api/admin/delivery-partners/:id/verify
exports.togglePartnerVerification = async (req, res, next) => {
  try {
    const partner = await DeliveryPartner.findById(req.params.id);
    if (!partner) return res.status(404).json({ success: false, message: 'Partner not found.' });
    partner.isVerified = !partner.isVerified;
    await partner.save();
    res.json({ success: true, message: `Partner ${partner.isVerified ? 'verified' : 'unverified'}.`, partner });
  } catch (error) { next(error); }
};
