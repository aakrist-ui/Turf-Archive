const Booking = require('../models/booking');
const Arena = require('../models/arena');

// @desc    Create new booking
// @route   POST /api/bookings
// @access  Private
exports.createBooking = async (req, res) => {
  try {
    const { arena, date, startTime, endTime, team, notes, paymentMethod } = req.body;

    // Validation
    if (!arena || !date || !startTime || !endTime) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    // Check if arena exists
    const arenaDoc = await Arena.findById(arena);
    if (!arenaDoc) {
      return res.status(404).json({ message: 'Arena not found' });
    }

    // Calculate duration and price
    const duration = calculateDuration(startTime, endTime);
    const totalPrice = arenaDoc.price * duration;

    // Check if slot is available
    const bookingDate = new Date(date);
    const existingBooking = await Booking.findOne({
      arena,
      date: bookingDate,
      startTime,
      endTime,
      status: { $nin: ['cancelled'] }
    });

    if (existingBooking) {
      return res.status(400).json({ message: 'This time slot is already booked' });
    }

    // Create booking
    const booking = await Booking.create({
      arena,
      user: req.user.id,
      team: team || null,
      date: bookingDate,
      startTime,
      endTime,
      duration,
      totalPrice,
      notes,
      paymentMethod: paymentMethod || 'cash',
      status: 'confirmed'
    });

    // Update arena time slots
    await updateArenaTimeSlot(arena, bookingDate, startTime, endTime, booking._id, true);

    const populatedBooking = await Booking.findById(booking._id)
      .populate('arena', 'name location price')
      .populate('user', 'name email phone');

    res.status(201).json({
      success: true,
      data: populatedBooking
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all bookings for logged in user
// @route   GET /api/bookings/my-bookings
// @access  Private
exports.getMyBookings = async (req, res) => {
  try {
    const { status } = req.query;
    
    let query = { user: req.user.id };
    
    if (status) {
      query.status = status;
    }

    const bookings = await Booking.find(query)
      .populate('arena', 'name location price images')
      .populate('team', 'name')
      .sort('-date');

    res.json({
      success: true,
      count: bookings.length,
      data: bookings
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single booking
// @route   GET /api/bookings/:id
// @access  Private
exports.getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('arena')
      .populate('user', 'name email phone')
      .populate('team');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check if user owns this booking or is admin
    if (booking.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to access this booking' });
    }

    res.json({
      success: true,
      data: booking
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Cancel booking
// @route   PUT /api/bookings/:id/cancel
// @access  Private
exports.cancelBooking = async (req, res) => {
  try {
    const { cancellationReason } = req.body;

    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check if user owns this booking
    if (booking.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to cancel this booking' });
    }

    // Check if booking is already cancelled
    if (booking.status === 'cancelled') {
      return res.status(400).json({ message: 'Booking is already cancelled' });
    }

    // Update booking status
    booking.status = 'cancelled';
    booking.cancelledAt = Date.now();
    booking.cancelledBy = req.user.id;
    booking.cancellationReason = cancellationReason || 'No reason provided';

    await booking.save();

    // Update arena time slot
    await updateArenaTimeSlot(
      booking.arena,
      booking.date,
      booking.startTime,
      booking.endTime,
      booking._id,
      false
    );

    res.json({
      success: true,
      message: 'Booking cancelled successfully',
      data: booking
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all bookings (Admin only)
// @route   GET /api/bookings
// @access  Private/Admin
exports.getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('arena', 'name location')
      .populate('user', 'name email')
      .sort('-createdAt');

    res.json({
      success: true,
      count: bookings.length,
      data: bookings
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update booking status (Admin only)
// @route   PUT /api/bookings/:id/status
// @access  Private/Admin
exports.updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    res.json({
      success: true,
      data: booking
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Helper function to calculate duration
function calculateDuration(startTime, endTime) {
  const [startHour, startMin] = startTime.split(':').map(Number);
  const [endHour, endMin] = endTime.split(':').map(Number);
  
  const startMinutes = startHour * 60 + startMin;
  const endMinutes = endHour * 60 + endMin;
  
  return (endMinutes - startMinutes) / 60; // Return hours
}

// Helper function to update arena time slot
async function updateArenaTimeSlot(arenaId, date, startTime, endTime, bookingId, isBooked) {
  try {
    const arena = await Arena.findById(arenaId);
    if (!arena) return;

    const bookingDate = new Date(date);
    bookingDate.setHours(0, 0, 0, 0);

    // Find existing slot
    const slotIndex = arena.timeSlots.findIndex(slot => {
      const slotDate = new Date(slot.date);
      slotDate.setHours(0, 0, 0, 0);
      return (
        slotDate.getTime() === bookingDate.getTime() &&
        slot.startTime === startTime &&
        slot.endTime === endTime
      );
    });

    if (slotIndex !== -1) {
      // Update existing slot
      arena.timeSlots[slotIndex].isBooked = isBooked;
      arena.timeSlots[slotIndex].bookingId = isBooked ? bookingId : null;
    } else if (isBooked) {
      // Add new slot
      arena.timeSlots.push({
        date: bookingDate,
        startTime,
        endTime,
        isBooked: true,
        bookingId
      });
    }

    await arena.save();
  } catch (error) {
    console.error('Error updating arena time slot:', error);
  }
}