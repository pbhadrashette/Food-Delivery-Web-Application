const mongoose = require('mongoose');

const managerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    phone: { type: String, required: true, trim: true },
    role: { type: String, enum: ['Kitchen Manager', 'Area Manager', 'Operations Manager', 'City Manager'], default: 'Kitchen Manager' },
    assignedKitchen: { type: mongoose.Schema.Types.ObjectId, ref: 'CloudKitchen', default: null },
    assignedCity: { type: String, default: '' },
    status: { type: String, enum: ['active', 'inactive', 'on_leave'], default: 'active' },
    joiningDate: { type: Date, default: Date.now },
    salary: { type: Number, default: 0 },
    profileImage: { type: String, default: '' },
    address: { type: String, default: '' },
    notes: { type: String, default: '' },
  },
  { timestamps: true }
);

managerSchema.index({ name: 'text', email: 'text' });

module.exports = mongoose.model('Manager', managerSchema);
