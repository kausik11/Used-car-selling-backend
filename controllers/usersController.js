const User = require('../models/User');

const normalizeEmail = (email) => (email || '').trim().toLowerCase();
const ALLOWED_ROLES = ['normaluser', 'admin', 'administrator'];
const normalizeRole = (role) => (typeof role === 'string' ? role.trim().toLowerCase() : undefined);

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
    const resolvedRole = normalizedRole || 'normaluser';
    if (!name || !normalizedEmail || !password || !city || !address || !pin) {
      return res.status(400).json({
        error: 'name, email, password, city, address and pin are required',
      });
    }
    if (!ALLOWED_ROLES.includes(resolvedRole)) {
      return res.status(400).json({
        error: 'Invalid role. Allowed roles: normaluser, admin, administrator',
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
        role: user.role,
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
    return res.status(200).json(users);
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

    return res.status(200).json(user);
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

    const isAdminLike = ['admin', 'administrator'].includes(req.user?.role);
    const isSelfUpdate = req.user?.id === userId;
    if (!isAdminLike && !isSelfUpdate) {
      return res.status(403).json({ error: 'You can only update your own profile' });
    }

    if (!isAdminLike && (role !== undefined || is_email_verified !== undefined || is_phone_verified !== undefined)) {
      return res.status(403).json({
        error: 'Only admin or administrator can update role or verification flags',
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

    if (isAdminLike && role !== undefined) {
      const normalizedRole = normalizeRole(role);
      if (!ALLOWED_ROLES.includes(normalizedRole)) {
        return res.status(400).json({
          error: 'Invalid role. Allowed roles: normaluser, admin, administrator',
        });
      }
      user.role = normalizedRole;
    }
    if (isAdminLike && is_email_verified !== undefined) user.is_email_verified = Boolean(is_email_verified);
    if (isAdminLike && is_phone_verified !== undefined) user.is_phone_verified = Boolean(is_phone_verified);

    await user.save();

    const safeUser = user.toObject();
    delete safeUser.password;

    return res.status(200).json({
      message: 'User updated successfully',
      user: safeUser,
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

module.exports = {
  createUser,
  listUsers,
  getUser,
  updateUser,
  deleteUser,
};
