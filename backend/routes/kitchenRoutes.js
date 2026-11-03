const express = require('express');
const router = express.Router();
const CloudKitchen = require('../models/CloudKitchen');

// @desc   Get all active cloud kitchens (public)
// @route  GET /api/kitchens
router.get('/', async (req, res, next) => {
  try {
    const { state, city, status = 'active', limit = 20 } = req.query;
    const query = {};
    if (status) query.status = status;
    if (state) query.state = new RegExp(state, 'i');
    if (city) query.city = new RegExp(city, 'i');

    const kitchens = await CloudKitchen.find(query)
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .populate('manager', 'name');

    res.json({ success: true, total: kitchens.length, kitchens });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
