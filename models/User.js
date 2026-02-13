const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: [true, 'Name is required'],
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      unique: true,
      required: [true, 'Email is required'],
    },
    phone: {
      type: String,
      trim: true,
      unique: true,
      sparse: true,
      default: null,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 6,
    },
    role: {
      type: String,
      enum: ['normaluser', 'admin', 'administrator'],
      default: 'normaluser',
    },
    is_email_verified: {
      type: Boolean,
      default: false,
    },
    is_phone_verified: {
      type: Boolean,
      default: false,
    },
    auth_session_version: {
      type: Number,
      default: 0,
    },
    name_update_count: {
      type: Number,
      default: 0,
    },
    phone_update_count: {
      type: Number,
      default: 0,
    },
    city: {
      type: String,
      trim: true,
      required: [true, 'City is required'],
    },
    address: {
      type: String,
      trim: true,
      required: [true, 'Address is required'],
    },
    pin: {
      type: String,
      trim: true,
      required: [true, 'Pin is required'],
    },
    budgetRange: {
      type: String,
      trim: true,
      default: null,
    },
    preferredBrand: {
      type: String,
      trim: true,
      default: null,
    },
    fuelType: {
      type: String,
      trim: true,
      default: null,
    },
    transmissionType: {
      type: String,
      trim: true,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Ensure password is always hashed before saving.
userSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('password')) {
    return next();
  }

  this.password = await bcrypt.hash(this.password, 10);
  return next();
});

module.exports = mongoose.model('User', userSchema);
