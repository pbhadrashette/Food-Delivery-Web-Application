const Coupon = require('../models/Coupon');

const couponFields = ['code', 'description', 'discountType', 'discountValue', 'minimumOrderValue', 'maximumDiscount', 'expiryDate', 'usageLimit', 'isActive'];
const pickCouponFields = (body) => Object.fromEntries(
  couponFields.filter((field) => body[field] !== undefined).map((field) => [field, body[field]])
);

// @desc   Validate coupon
// @route  POST /api/coupons/validate
exports.validateCoupon = async (req, res, next) => {
  try {
    const { code, orderTotal } = req.body;
    if (!code) return res.status(400).json({ success: false, message: 'Coupon code is required.' });

    const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true });
    if (!coupon) return res.status(404).json({ success: false, message: 'Invalid coupon code.' });
    if (coupon.expiryDate < new Date()) return res.status(400).json({ success: false, message: 'Coupon has expired.' });
    if (orderTotal < coupon.minimumOrderValue) {
      return res.status(400).json({ success: false, message: `Minimum order value of ₹${coupon.minimumOrderValue} required.` });
    }
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return res.status(400).json({ success: false, message: 'Coupon usage limit reached.' });
    }
    if (coupon.usedBy.includes(req.user._id)) {
      return res.status(400).json({ success: false, message: 'You have already used this coupon.' });
    }

    let discount = 0;
    if (coupon.discountType === 'percentage') {
      discount = Math.round((orderTotal * coupon.discountValue) / 100);
      if (coupon.maximumDiscount) discount = Math.min(discount, coupon.maximumDiscount);
    } else {
      discount = coupon.discountValue;
    }

    res.json({ success: true, message: `Coupon applied! You save ₹${discount}.`, coupon, discount });
  } catch (error) { next(error); }
};

// @desc   Get active coupons (public)
// @route  GET /api/coupons/active
exports.getActiveCoupons = async (req, res, next) => {
  try {
    const coupons = await Coupon.find({ isActive: true, expiryDate: { $gt: new Date() } })
      .select('code description discountType discountValue minimumOrderValue maximumDiscount expiryDate')
      .sort({ discountValue: -1 })
      .limit(6);
    res.json({ success: true, coupons });
  } catch (error) { next(error); }
};

// @desc   Get all coupons (admin)
exports.getCoupons = async (req, res, next) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    res.json({ success: true, coupons });
  } catch (error) { next(error); }
};

// @desc   Create coupon (admin)
exports.createCoupon = async (req, res, next) => {
  try {
    const coupon = await Coupon.create(pickCouponFields(req.body));
    res.status(201).json({ success: true, message: 'Coupon created.', coupon });
  } catch (error) { next(error); }
};

// @desc   Update coupon (admin)
exports.updateCoupon = async (req, res, next) => {
  try {
    const coupon = await Coupon.findByIdAndUpdate(req.params.id, pickCouponFields(req.body), { new: true, runValidators: true });
    if (!coupon) return res.status(404).json({ success: false, message: 'Coupon not found.' });
    res.json({ success: true, message: 'Coupon updated.', coupon });
  } catch (error) { next(error); }
};

// @desc   Delete coupon (admin)
exports.deleteCoupon = async (req, res, next) => {
  try {
    await Coupon.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Coupon deleted.' });
  } catch (error) { next(error); }
};
