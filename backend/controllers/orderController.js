const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Food = require('../models/Food');
const Restaurant = require('../models/Restaurant');
const Coupon = require('../models/Coupon');

// @desc   Create order
// @route  POST /api/orders
exports.createOrder = async (req, res, next) => {
  try {
    const { deliveryAddress, paymentMethod, couponCode, specialInstructions } = req.body;

    if (!deliveryAddress || !paymentMethod) {
      return res.status(400).json({ success: false, message: 'Delivery address and payment method are required.' });
    }
    if (!['COD', 'ONLINE'].includes(paymentMethod)) {
      return res.status(400).json({ success: false, message: 'Invalid payment method. Must be COD or ONLINE.' });
    }
    const requiredAddressFields = ['fullName', 'phone', 'houseFlat', 'city', 'pincode'];
    for (const field of requiredAddressFields) {
      if (!deliveryAddress[field] || !String(deliveryAddress[field]).trim()) {
        return res.status(400).json({ success: false, message: `Delivery address ${field} is required.` });
      }
    }

    const cart = await Cart.findOne({ user: req.user._id }).populate('items.food');
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ success: false, message: 'Cart is empty.' });
    }

    const restaurant = await Restaurant.findById(cart.restaurant);
    if (!restaurant || restaurant.status !== 'active') {
      return res.status(400).json({ success: false, message: 'Restaurant is not accepting orders.' });
    }

    // Verify all items and recalculate server-side
    let subtotal = 0;
    const orderItems = [];
    for (const item of cart.items) {
      const food = await Food.findById(item.food._id || item.food);
      if (!food || !food.isAvailable) {
        return res.status(400).json({ success: false, message: `${item.name} is no longer available.` });
      }
      const price = food.discountPrice || food.price;
      subtotal += price * item.quantity;
      orderItems.push({ food: food._id, name: food.name, image: food.image, price, quantity: item.quantity, isVeg: food.isVeg });
    }

    const deliveryFee = restaurant.deliveryFee || 30;
    const taxes = Math.round(subtotal * 0.05);
    const platformFee = 5;
    let discount = 0;
    let appliedCoupon = null;

    if (couponCode) {
      const coupon = await Coupon.findOne({ code: couponCode.toUpperCase(), isActive: true });
      if (coupon && coupon.expiryDate > new Date() && subtotal >= coupon.minimumOrderValue) {
        if (!coupon.usageLimit || coupon.usedCount < coupon.usageLimit) {
          if (!coupon.usedBy.includes(req.user._id)) {
            if (coupon.discountType === 'percentage') {
              discount = Math.round((subtotal * coupon.discountValue) / 100);
              if (coupon.maximumDiscount) discount = Math.min(discount, coupon.maximumDiscount);
            } else {
              discount = coupon.discountValue;
            }
            appliedCoupon = coupon;
          }
        }
      }
    }

    const totalAmount = subtotal + deliveryFee + taxes + platformFee - discount;

    const order = await Order.create({
      user: req.user._id,
      restaurant: cart.restaurant,
      items: orderItems,
      deliveryAddress,
      subtotal,
      deliveryFee,
      taxes,
      platformFee,
      discount,
      couponCode: appliedCoupon ? appliedCoupon.code : null,
      totalAmount,
      paymentMethod,
      paymentStatus: paymentMethod === 'COD' ? 'PENDING' : 'PENDING',
      specialInstructions,
      statusHistory: [{ status: 'PLACED', note: 'Order placed successfully' }],
      estimatedDeliveryTime: new Date(Date.now() + 45 * 60 * 1000),
    });

    // Update coupon usage
    if (appliedCoupon) {
      await Coupon.findByIdAndUpdate(appliedCoupon._id, {
        $inc: { usedCount: 1 },
        $push: { usedBy: req.user._id },
      });
    }

    // Update food order counts
    for (const item of orderItems) {
      await Food.findByIdAndUpdate(item.food, { $inc: { totalOrders: item.quantity } });
    }

    // Clear cart
    await Cart.findOneAndUpdate({ user: req.user._id }, { items: [], restaurant: null, couponCode: null, couponDiscount: 0 });

    const populated = await Order.findById(order._id).populate('restaurant', 'name logo coverImage address city phone').populate('items.food', 'name image');
    res.status(201).json({ success: true, message: 'Order placed successfully!', order: populated });
  } catch (error) {
    next(error);
  }
};

// @desc   Get user orders
// @route  GET /api/orders
exports.getMyOrders = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const query = { user: req.user._id };
    if (status) query.status = status;
    const skip = (Number(page) - 1) * Number(limit);
    const [orders, total] = await Promise.all([
      Order.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .populate('restaurant', 'name logo coverImage address city'),
      Order.countDocuments(query),
    ]);
    res.json({ success: true, total, page: Number(page), orders });
  } catch (error) { next(error); }
};

// @desc   Get single order
// @route  GET /api/orders/:id
exports.getOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('restaurant', 'name logo address city phone')
      .populate('user', 'name email phone');
    if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });
    if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to view this order.' });
    }
    res.json({ success: true, order });
  } catch (error) { next(error); }
};

// @desc   Cancel order
// @route  PUT /api/orders/:id/cancel
exports.cancelOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });
    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized.' });
    }
    const cancellableStatuses = ['PLACED', 'CONFIRMED'];
    if (!cancellableStatuses.includes(order.status)) {
      return res.status(400).json({ success: false, message: 'Order cannot be cancelled at this stage.' });
    }
    order.status = 'CANCELLED';
    order.cancelReason = req.body.reason || 'Cancelled by customer';
    order.statusHistory.push({ status: 'CANCELLED', note: order.cancelReason });
    await order.save();
    res.json({ success: true, message: 'Order cancelled successfully.', order });
  } catch (error) { next(error); }
};
