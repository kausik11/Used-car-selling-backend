const User = require('../models/User');
const { CarListing, Media, RecentCarView } = require('../models');
const { CANONICAL_ROLES, normalizeRole, resolveRoleForStorage, isAdminLike } = require('../utils/roles');

const normalizeEmail = (email) => (email || '').trim().toLowerCase();
const ALLOWED_ROLES = CANONICAL_ROLES;

const serializeUser = (userDoc) => {
  const user = userDoc && typeof userDoc.toObject === 'function' ? userDoc.toObject() : userDoc;
  if (!user) return user;

  return {
    ...user,
    role: resolveRoleForStorage(user.role),
  };
};

// Create a new user from admin panel.
const createUser = async (req, res, next) => {
  try {
    const {
      name,
      email,
      phone,
      password,
      city,
      address,
      pin,
      role,
      is_email_verified = false,
      is_phone_verified = false,
    } = req.body;

    const normalizedEmail = normalizeEmail(email);
    const normalizedRole = normalizeRole(role);
    const resolvedRole = normalizedRole || 'user';
    if (!name || !normalizedEmail || !password || !city || !address || !pin) {
      return res.status(400).json({
        error: 'name, email, password, city, address and pin are required',
      });
    }
    if (!ALLOWED_ROLES.includes(resolvedRole)) {
      return res.status(400).json({
        error: 'Invalid role. Allowed roles: user, admin, superadmin',
      });
    }

    const duplicate = await User.findOne({
      $or: [{ email: normalizedEmail }, ...(phone ? [{ phone }] : [])],
    });
    if (duplicate) {
      return res.status(409).json({ error: 'User with this email or phone already exists' });
    }

    const user = await User.create({
      name,
      email: normalizedEmail,
      phone: phone || null,
      password,
      city,
      address,
      pin,
      role: resolvedRole,
      is_email_verified,
      is_phone_verified,
    });

    return res.status(201).json({
      message: 'User created successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: resolveRoleForStorage(user.role),
        is_email_verified: user.is_email_verified,
        is_phone_verified: user.is_phone_verified,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    return next(error);
  }
};

// List users for admin panel.
const listUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    return res.status(200).json(users.map((item) => serializeUser(item)));
  } catch (error) {
    return next(error);
  }
};

// Get one user by id for admin panel.
const getUser = async (req, res, next) => {
  try {
    const { user_id: userId } = req.params;
    const user = await User.findById(userId).select('-password');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.status(200).json(serializeUser(user));
  } catch (error) {
    return next(error);
  }
};

// Update user fields from admin panel.
const updateUser = async (req, res, next) => {
  try {
    const { user_id: userId } = req.params;
    const {
      name,
      email,
      phone,
      password,
      city,
      address,
      pin,
      budgetRange,
      preferredBrand,
      fuelType,
      transmissionType,
      role,
      is_email_verified,
      is_phone_verified,
    } = req.body;

    const userIsAdminLike = isAdminLike(req.user?.role);
    const isSelfUpdate = req.user?.id === userId;
    if (!userIsAdminLike && !isSelfUpdate) {
      return res.status(403).json({ error: 'You can only update your own profile' });
    }

    if (!userIsAdminLike && (role !== undefined || is_email_verified !== undefined || is_phone_verified !== undefined)) {
      return res.status(403).json({
        error: 'Only admin or superadmin can update role or verification flags',
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const normalizedEmail = email !== undefined ? normalizeEmail(email) : undefined;
    if (normalizedEmail !== undefined && normalizedEmail !== user.email) {
      return res.status(400).json({ error: 'Email cannot be updated' });
    }

    if (name !== undefined && name !== user.name) {
      if (user.name_update_count >= 2) {
        return res.status(400).json({ error: 'Name can only be updated 2 times' });
      }
      user.name = name;
      user.name_update_count += 1;
    }

    if (phone !== undefined && phone !== user.phone) {
      if (user.phone_update_count >= 2) {
        return res.status(400).json({ error: 'Phone can only be updated 2 times' });
      }
      if (phone) {
        const phoneExists = await User.findOne({ phone, _id: { $ne: user._id } });
        if (phoneExists) {
          return res.status(409).json({ error: 'Phone is already in use' });
        }
      }
      user.phone = phone || null;
      user.phone_update_count += 1;
    }

    if (password !== undefined && password !== '') user.password = password;
    if (city !== undefined) user.city = city;
    if (address !== undefined) user.address = address;
    if (pin !== undefined) user.pin = pin;
    if (budgetRange !== undefined) user.budgetRange = budgetRange || null;
    if (preferredBrand !== undefined) user.preferredBrand = preferredBrand || null;
    if (fuelType !== undefined) user.fuelType = fuelType || null;
    if (transmissionType !== undefined) user.transmissionType = transmissionType || null;

    if (userIsAdminLike && role !== undefined) {
      const normalizedRole = normalizeRole(role);
      if (!ALLOWED_ROLES.includes(normalizedRole)) {
        return res.status(400).json({
          error: 'Invalid role. Allowed roles: user, admin, superadmin',
        });
      }
      user.role = normalizedRole;
    }
    if (userIsAdminLike && is_email_verified !== undefined) user.is_email_verified = Boolean(is_email_verified);
    if (userIsAdminLike && is_phone_verified !== undefined) user.is_phone_verified = Boolean(is_phone_verified);

    await user.save();

    return res.status(200).json({
      message: 'User updated successfully',
      user: serializeUser(user),
    });
  } catch (error) {
    return next(error);
  }
};

// Delete user by id from admin panel.
const deleteUser = async (req, res, next) => {
  try {
    const { user_id: userId } = req.params;
    const user = await User.findByIdAndDelete(userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    return next(error);
  }
};

// Get recently viewed cars for a user (self or admin/superadmin).
const getRecentViewedCars = async (req, res, next) => {
  try {
    const { user_id: userId } = req.params;
    const userIsAdminLike = isAdminLike(req.user?.role);
    const isSelfRequest = req.user?.id === userId;

    if (!userIsAdminLike && !isSelfRequest) {
      return res.status(403).json({ error: 'You can only view your own recently viewed cars' });
    }

    const requestedLimit = Number(req.query.limit);
    const limit = Number.isFinite(requestedLimit)
      ? Math.min(Math.max(requestedLimit, 1), 50)
      : 20;

    const recentViews = await RecentCarView.find({ user_id: userId })
      .sort({ viewed_at: -1 })
      .limit(limit)
      .lean();

    if (recentViews.length === 0) {
      return res.status(200).json({ total: 0, items: [] });
    }

    const carIds = recentViews.map((entry) => entry.car_id);
    const [listings, mediaDocs] = await Promise.all([
      CarListing.find({ car_id: { $in: carIds } }).lean(),
      Media.find({ car_id: { $in: carIds } }).lean(),
    ]);

    const listingByCarId = listings.reduce((acc, listing) => {
      acc[listing.car_id] = listing;
      return acc;
    }, {});
    const mediaByCarId = mediaDocs.reduce((acc, media) => {
      acc[media.car_id] = media;
      return acc;
    }, {});

    const items = recentViews
      .map((entry) => {
        const listing = listingByCarId[entry.car_id];
        if (!listing) return null;

        return {
          car_id: listing.car_id,
          viewed_at: entry.viewed_at,
          title: listing.title,
          brand: listing.brand,
          model: listing.model,
          variant: listing.variant,
          city: listing.city,
          make_year: listing.make_year,
          registration_year: listing.registration_year,
          price: listing.price,
          status: listing.status,
          visibility: listing.visibility,
          listing_ref: listing.listing_ref,
          car_slug: listing.car_slug,
          slug_path: listing.slug_path,
          media: mediaByCarId[listing.car_id] || null,
        };
      })
      .filter(Boolean);

    return res.status(200).json({ total: items.length, items });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  createUser,
  listUsers,
  getUser,
  updateUser,
  deleteUser,
  getRecentViewedCars,
};
