const User = require('../models/user');
const Arena = require('../models/arena');
const Booking = require('../models/booking');

exports.getAdminSummary = async (req, res) => {
  try {
    const [users, owners, arenas, bookings] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'owner' }),
      Arena.countDocuments(),
      Booking.countDocuments({ status: { $ne: 'cancelled' } }),
    ]);

    res.json({
      success: true,
      data: {
        users,
        owners,
        arenas,
        bookings,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const { role } = req.query;
    const query = {};

    if (role) {
      query.role = role;
    }

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateUserStatus = async (req, res) => {
  try {
    const { isActive } = req.body;
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role === 'admin' && user._id.toString() === req.user.id) {
      return res.status(400).json({ message: 'You cannot deactivate your own admin account' });
    }

    user.isActive = Boolean(isActive);
    await user.save();

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAllArenas = async (req, res) => {
  try {
    const arenas = await Arena.find()
      .populate('owner', 'name email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: arenas.length,
      data: arenas,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateArenaStatus = async (req, res) => {
  try {
    const { isActive } = req.body;
    const arena = await Arena.findById(req.params.id).populate('owner', 'name email');

    if (!arena) {
      return res.status(404).json({ message: 'Arena not found' });
    }

    arena.isActive = Boolean(isActive);
    await arena.save();

    res.json({
      success: true,
      data: arena,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteArena = async (req, res) => {
  try {
    const arena = await Arena.findById(req.params.id);

    if (!arena) {
      return res.status(404).json({ message: 'Arena not found' });
    }

    await arena.deleteOne();

    res.json({
      success: true,
      message: 'Arena deleted successfully',
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ status: { $ne: 'cancelled' } })
      .populate('arena', 'name')
      .populate('user', 'name email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: bookings.length,
      data: bookings,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
