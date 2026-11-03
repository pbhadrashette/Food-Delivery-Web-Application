const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, unique: true },
    description: { type: String, default: '' },
    image: { type: String, default: '' },
    icon: { type: String, default: '' },
    isActive: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
    state: { type: String, default: '' },
    meal: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Category', categorySchema);
