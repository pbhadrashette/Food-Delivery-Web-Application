const mongoose = require('mongoose');

const deliveryPartnerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    phone: { type: String, required: true, trim: true },
    vehicleType: { type: String, enum: ['Bike', 'Bicycle', 'Scooter', 'Car'], default: 'Bike' },
    vehicleNumber: { type: String, default: '' },
    licenseNumber: { type: String, default: '' },
    city: { type: String, required: true },
    status: { type: String, enum: ['active', 'inactive', 'on_delivery', 'on_leave'], default: 'active' },
    rating: { type: Number, default: 5, min: 0, max: 5 },
    totalDeliveries: { type: Number, default: 0 },
    totalEarnings: { type: Number, default: 0 },
    joiningDate: { type: Date, default: Date.now },
    isVerified: { type: Boolean, default: false },
    profileImage: { type: String, default: '' },
    aadharNumber: { type: String, default: '' },
    bankAccountNumber: { type: String, default: '' },
    ifscCode: { type: String, default: '' },
    notes: { type: String, default: '' },
  },
  { timestamps: true }
);

deliveryPartnerSchema.index({ name: 'text', email: 'text', city: 'text' });
deliveryPartnerSchema.index({ status: 1 });

module.exports = mongoose.model('DeliveryPartner', deliveryPartnerSchema);
