const mongoose = require('mongoose');

const cloudKitchenSchema = new mongoose.Schema(
  {
    kitchenId: { type: String, unique: true, trim: true },
    state: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    division: { type: String, required: true, trim: true },
    address: { type: String, required: true, trim: true },
    pinCode: { type: String, required: true, trim: true },
    manager: { type: mongoose.Schema.Types.ObjectId, ref: 'Manager', default: null },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
    capacity: { type: Number, default: 50 },
    operatingHours: { type: String, default: '09:00 - 22:00' },
    phoneNumber: { type: String, default: '' },
    email: { type: String, default: '' },
    notes: { type: String, default: '' },
  },
  { timestamps: true }
);

// Auto-generate kitchenId before save
cloudKitchenSchema.pre('save', async function () {
  if (!this.kitchenId) {
    const stateCode = this.state.slice(0, 2).toUpperCase();
    const cityCode = this.city.slice(0, 2).toUpperCase();
    const divCode = this.division.slice(0, 4).toUpperCase().replace(/\s+/g, '');
    this.kitchenId = `${stateCode}-${cityCode}-${divCode}`;
  }
});

cloudKitchenSchema.index({ state: 1, city: 1 });

module.exports = mongoose.model('CloudKitchen', cloudKitchenSchema);
