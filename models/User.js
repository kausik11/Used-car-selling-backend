const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { normalizeRole } = require('../utils/roles');

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
      index: true,
      required: [true, 'Email is required'],
    },
    googleId: {
      type: String,
      trim: true,
      unique: true,
      sparse: true,
      index: true,
    },
    avatar: {
      type: String,
      trim: true,
      default: null,
    },
    provider: {
      type: String,
      enum: ['local', 'google'],
      default: 'local',
      index: true,
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
      required() {
        return this.provider === 'local';
      },
      minlength: 6,
      select: false,
    },
    role: {
      type: String,
      enum: ['user', 'admin', 'superadmin'],
      default: 'user',
      index: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
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
    refreshTokenHash: {
      type: String,
      default: null,
      select: false,
    },
    lastLogin: {
      type: Date,
      default: null,
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
      default: null,
      required() {
        return this.provider === 'local';
      },
    },
    address: {
      type: String,
      trim: true,
      default: null,
      required() {
        return this.provider === 'local';
      },
    },
    pin: {
      type: String,
      trim: true,
      default: null,
      required() {
        return this.provider === 'local';
      },
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

userSchema.pre('validate', function normalizeUserRole(next) {
  if (this.role) {
    this.role = normalizeRole(this.role) || 'user';
  }
  next();
});

userSchema.pre('save', function syncVerificationFields(next) {
  if (this.isModified('is_email_verified')) {
    this.isVerified = this.is_email_verified;
  } else if (this.isModified('isVerified')) {
    this.is_email_verified = this.isVerified;
  }
  next();
});

// Ensure password is always hashed before saving.
userSchema.pre('save', async function hashPassword(next) {
  if (!this.password || !this.isModified('password')) {
    return next();
  }

  this.password = await bcrypt.hash(this.password, 10);
  return next();
});

userSchema.methods.comparePassword = function comparePassword(plainPassword) {
  if (!this.password) return false;
  return bcrypt.compare(plainPassword, this.password);
};

userSchema.set('toJSON', {
  transform(doc, ret) {
    delete ret.password;
    delete ret.refreshTokenHash;
    return ret;
  },
});

module.exports = mongoose.model('User', userSchema);
