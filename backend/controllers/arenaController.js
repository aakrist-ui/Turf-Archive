const Arena = require('../models/arena');

// @desc    Get all arenas
// @route   GET /api/arenas
// @access  Public
exports.getAllArenas = async (req, res) => {
  try {
    const { city, search, minPrice, maxPrice } = req.query;
    
    let query = { isActive: true };

    // Filter by city
    if (city) {
      query['location.city'] = city;
    }

    // Search by name or location
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { 'location.address': { $regex: search, $options: 'i' } }
      ];
    }

    // Price range filter
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    const arenas = await Arena.find(query)
      .select('-timeSlots') // Exclude time slots for list view
      .sort('-rating');

    res.json({
      success: true,
      count: arenas.length,
      data: arenas
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single arena with available time slots
// @route   GET /api/arenas/:id
// @access  Public
exports.getArenaById = async (req, res) => {
  try {
    const arena = await Arena.findById(req.params.id);

    if (!arena) {
      return res.status(404).json({ message: 'Arena not found' });
    }

    res.json({
      success: true,
      data: arena
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get available time slots for specific date
// @route   GET /api/arenas/:id/slots/:date
// @access  Public
exports.getAvailableSlots = async (req, res) => {
  try {
    const { id, date } = req.params;
    
    const arena = await Arena.findById(id);
    if (!arena) {
      return res.status(404).json({ message: 'Arena not found' });
    }

    // Parse the date
    const requestedDate = new Date(date);
    requestedDate.setHours(0, 0, 0, 0);

    // Filter time slots for the requested date
    const slotsForDate = arena.timeSlots.filter(slot => {
      const slotDate = new Date(slot.date);
      slotDate.setHours(0, 0, 0, 0);
      return slotDate.getTime() === requestedDate.getTime();
    });

    // Generate time slots if none exist for this date
    if (slotsForDate.length === 0) {
      const generatedSlots = generateTimeSlots(
        requestedDate,
        arena.openingTime,
        arena.closingTime
      );
      
      return res.json({
        success: true,
        data: generatedSlots
      });
    }

    res.json({
      success: true,
      data: slotsForDate
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create new arena (Admin only)
// @route   POST /api/arenas
// @access  Private/Admin
exports.createArena = async (req, res) => {
  try {
    const arena = await Arena.create(req.body);

    res.status(201).json({
      success: true,
      data: arena
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update arena
// @route   PUT /api/arenas/:id
// @access  Private/Admin
exports.updateArena = async (req, res) => {
  try {
    const arena = await Arena.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!arena) {
      return res.status(404).json({ message: 'Arena not found' });
    }

    res.json({
      success: true,
      data: arena
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete arena
// @route   DELETE /api/arenas/:id
// @access  Private/Admin
exports.deleteArena = async (req, res) => {
  try {
    const arena = await Arena.findByIdAndDelete(req.params.id);

    if (!arena) {
      return res.status(404).json({ message: 'Arena not found' });
    }

    res.json({
      success: true,
      message: 'Arena deleted successfully'
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Helper function to generate time slots
function generateTimeSlots(date, openingTime, closingTime) {
  const slots = [];
  const [openHour] = openingTime.split(':').map(Number);
  const [closeHour] = closingTime.split(':').map(Number);

  for (let hour = openHour; hour < closeHour; hour++) {
    const startTime = `${hour.toString().padStart(2, '0')}:00`;
    const endTime = `${(hour + 1).toString().padStart(2, '0')}:00`;
    
    slots.push({
      date: date,
      startTime: startTime,
      endTime: endTime,
      isBooked: false
    });
  }

  return slots;
}