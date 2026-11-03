const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const addressSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  phone: { type: String, required: true },
  houseFlat: { type: String, required: true },
  street: { type: String, default: '' },
  area: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, default: '' },
  division: { type: String, default: '' },
  pincode: { type: String, required: true },
  landmark: { type: String, default: '' },
  addressType: { type: String, enum: ['Home', 'Work', 'Other'], default: 'Home' },
  isDefault: { type: Boolean, default: false },
});

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Name is required'], trim: true },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: [true, 'Password is required'], minlength: 6, select: false },
    phone: { type: String, trim: true },
    profileImage: { type: String, default: '' },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    isActive: { type: Boolean, default: true },
    addresses: [addressSchema],
    favoriteRestaurants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant' }],
    favoriteFoods: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Food' }],
  },
  { timestamps: true }
);

userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
