const Arena = require('../models/arena');
const Booking = require('../models/booking');

exports.getOwnerSummary = async (req, res) => {
  try {
    const ownerId = req.user.id;
    const ownedArenaIds = await Arena.find({ owner: ownerId, isActive: true }).distinct('_id');

    const [arenaCount, bookingCount, upcomingBookings] = await Promise.all([
      Arena.countDocuments({ owner: ownerId, isActive: true }),
      Booking.countDocuments({ arena: { $in: ownedArenaIds }, status: { $nin: ['cancelled'] } }),
      Booking.find({
        arena: { $in: ownedArenaIds },
        date: { $gte: new Date() },
        status: { $nin: ['cancelled'] },
      })
        .populate('arena', 'name')
        .populate('user', 'name phone')
        .sort({ date: 1, startTime: 1 })
        .limit(5),
    ]);

    res.json({
      success: true,
      data: {
        arenaCount,
        bookingCount,
        upcomingBookings,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getOwnerArenas = async (req, res) => {
  try {
    const arenas = await Arena.find({ owner: req.user.id })
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

exports.createOwnerArena = async (req, res) => {
  try {
    const arenaPayload = buildArenaPayload(req.body);
    const arena = await Arena.create({
      ...arenaPayload,
      owner: req.user.id,
      rating: 0,
      totalRatings: 0,
      isActive: req.body.isActive !== false,
    });

    res.status(201).json({
      success: true,
      data: arena,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateOwnerArena = async (req, res) => {
  try {
    const arena = await Arena.findOne({ _id: req.params.id, owner: req.user.id });

    if (!arena) {
      return res.status(404).json({ message: 'Arena not found' });
    }

    Object.assign(arena, buildArenaPayload(req.body, arena));
    await arena.save();

    res.json({
      success: true,
      data: arena,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteOwnerArena = async (req, res) => {
  try {
    const arena = await Arena.findOne({ _id: req.params.id, owner: req.user.id });

    if (!arena) {
      return res.status(404).json({ message: 'Arena not found' });
    }

    const activeBookings = await Booking.countDocuments({
      arena: arena._id,
      status: { $nin: ['cancelled', 'completed'] },
    });

    if (activeBookings > 0) {
      return res.status(400).json({ message: 'Resolve active bookings before deleting this arena' });
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

exports.updateArenaSlots = async (req, res) => {
  try {
    const { date, slots } = req.body;
    const arena = await Arena.findOne({ _id: req.params.id, owner: req.user.id });

    if (!arena) {
      return res.status(404).json({ message: 'Arena not found' });
    }

    if (!date || !Array.isArray(slots)) {
      return res.status(400).json({ message: 'Please provide a date and slot list' });
    }

    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);

    const existingSlots = arena.timeSlots.filter((slot) => isSameDay(slot.date, targetDate));
    const bookedSlots = existingSlots.filter((slot) => slot.isBooked);
    const normalizedSlots = slots
      .map((slot) => ({
        date: targetDate,
        startTime: slot.startTime,
        endTime: slot.endTime,
        isBooked: false,
        bookingId: null,
      }))
      .filter((slot) => slot.startTime && slot.endTime);

    const dedupedSlots = [];
    const seen = new Set();

    [...bookedSlots, ...normalizedSlots].forEach((slot) => {
      const key = `${slot.startTime}-${slot.endTime}`;
      if (!seen.has(key)) {
        seen.add(key);
        dedupedSlots.push(slot);
      }
    });

    arena.timeSlots = [
      ...arena.timeSlots.filter((slot) => !isSameDay(slot.date, targetDate)),
      ...dedupedSlots.sort((a, b) => a.startTime.localeCompare(b.startTime)),
    ];

    await arena.save();

    res.json({
      success: true,
      data: arena.timeSlots.filter((slot) => isSameDay(slot.date, targetDate)),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getOwnerBookings = async (req, res) => {
  try {
    const { status } = req.query;
    const ownedArenaIds = await Arena.find({ owner: req.user.id }).distinct('_id');
    const query = { arena: { $in: ownedArenaIds } };

    if (status) {
      query.status = status;
    }

    const bookings = await Booking.find(query)
      .populate('arena', 'name location')
      .populate('user', 'name email phone')
      .populate('team', 'name')
      .sort({ date: 1, startTime: 1 });

    res.json({
      success: true,
      count: bookings.length,
      data: bookings,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateOwnerBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const allowedStatuses = ['pending', 'confirmed', 'cancelled', 'completed'];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid booking status' });
    }

    const booking = await Booking.findById(req.params.id).populate('arena', 'owner');
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (!booking.arena || booking.arena.owner?.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to manage this booking' });
    }

    await syncArenaSlot(booking, status !== 'cancelled');
    booking.status = status;
    await booking.save();

    const populatedBooking = await Booking.findById(booking._id)
      .populate('arena', 'name location')
      .populate('user', 'name email phone')
      .populate('team', 'name');

    res.json({
      success: true,
      data: populatedBooking,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

function buildArenaPayload(body, existingArena = null) {
  const payload = {};

  if (body.name !== undefined) payload.name = body.name?.trim();
  if (body.description !== undefined) payload.description = body.description?.trim();
  if (body.price !== undefined) payload.price = Number(body.price) || 0;
  if (body.priceUnit !== undefined) payload.priceUnit = body.priceUnit;
  if (body.contactPhone !== undefined) payload.contactPhone = body.contactPhone?.trim();
  if (body.openingTime !== undefined) payload.openingTime = body.openingTime;
  if (body.closingTime !== undefined) payload.closingTime = body.closingTime;
  if (body.surfaceType !== undefined) payload.surfaceType = body.surfaceType;
  if (body.capacity !== undefined) payload.capacity = Number(body.capacity) || 10;
  if (body.isActive !== undefined) payload.isActive = Boolean(body.isActive);

  if (body.images !== undefined) {
    payload.images = Array.isArray(body.images)
      ? body.images.filter(Boolean)
      : body.images
          .split('\n')
          .map((item) => item.trim())
          .filter(Boolean);
  }

  if (body.facilities !== undefined) {
    payload.facilities = Array.isArray(body.facilities)
      ? body.facilities.filter(Boolean)
      : body.facilities
          .split(',')
          .map((item) => item.trim())
          .filter(Boolean);
  }

  payload.location = {
    address: body.location?.address ?? existingArena?.location?.address,
    city: body.location?.city ?? existingArena?.location?.city,
    neighborhood: body.location?.neighborhood ?? existingArena?.location?.neighborhood,
    coordinates: {
      latitude: body.location?.coordinates?.latitude ?? existingArena?.location?.coordinates?.latitude,
      longitude: body.location?.coordinates?.longitude ?? existingArena?.location?.coordinates?.longitude,
    },
  };

  return payload;
}

function isSameDay(left, right) {
  const leftDate = new Date(left);
  const rightDate = new Date(right);
  leftDate.setHours(0, 0, 0, 0);
  rightDate.setHours(0, 0, 0, 0);
  return leftDate.getTime() === rightDate.getTime();
}

async function syncArenaSlot(booking, isBooked) {
  const arena = await Arena.findById(booking.arena._id || booking.arena);
  if (!arena) {
    return;
  }

  const bookingDate = new Date(booking.date);
  bookingDate.setHours(0, 0, 0, 0);

  const slotIndex = arena.timeSlots.findIndex((slot) => {
    const slotDate = new Date(slot.date);
    slotDate.setHours(0, 0, 0, 0);
    return (
      slotDate.getTime() === bookingDate.getTime() &&
      slot.startTime === booking.startTime &&
      slot.endTime === booking.endTime
    );
  });

  if (slotIndex !== -1) {
    arena.timeSlots[slotIndex].isBooked = isBooked;
    arena.timeSlots[slotIndex].bookingId = isBooked ? booking._id : null;
  } else if (isBooked) {
    arena.timeSlots.push({
      date: bookingDate,
      startTime: booking.startTime,
      endTime: booking.endTime,
      isBooked: true,
      bookingId: booking._id,
    });
  }

  await arena.save();
}
