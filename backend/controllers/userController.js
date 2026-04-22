const User = require('../models/user');
const mongoose = require('mongoose');
const { searchUsers: searchLocalUsers, findUserById, updateUser } = require('../utils/localDevStore');

const isDatabaseReady = () => mongoose.connection.readyState === 1;

exports.searchUsers = async (req, res) => {
  try {
    const q = typeof req.query.q === 'string' ? req.query.q.trim() : '';
    const query = { _id: { $ne: req.user.id }, isActive: true };

    if (q) {
      query.$or = [
        { name: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } },
      ];
    }

    const users = isDatabaseReady()
      ? await User.find(query)
          .select('name email position skillLevel profileImage currentTeam bio phone')
          .sort('name')
          .limit(30)
      : searchLocalUsers(q, req.user.id).map(({ password, ...user }) => user);

    res.json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getMyProfile = async (req, res) => {
  try {
    const user = isDatabaseReady()
      ? await User.findById(req.user.id)
          .select('-password')
          .populate('currentTeam', 'name')
      : (() => {
          const localUser = findUserById(req.user.id);
          if (!localUser) {
            return null;
          }

          const { password, ...safeUser } = localUser;
          return safeUser;
        })();

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateMyProfile = async (req, res) => {
  try {
    const allowedFields = ['name', 'phone', 'position', 'skillLevel', 'bio', 'profileImage'];
    const updates = {};

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = typeof req.body[field] === 'string' ? req.body[field].trim() : req.body[field];
      }
    });

    if (updates.name !== undefined && !updates.name) {
      return res.status(400).json({ message: 'Name cannot be empty' });
    }

    const user = isDatabaseReady()
      ? await User.findByIdAndUpdate(req.user.id, updates, {
          new: true,
          runValidators: true,
        })
          .select('-password')
          .populate('currentTeam', 'name')
      : (() => {
          const updatedUser = updateUser(req.user.id, updates);
          if (!updatedUser) {
            return null;
          }

          const { password, ...safeUser } = updatedUser;
          return safeUser;
        })();

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
