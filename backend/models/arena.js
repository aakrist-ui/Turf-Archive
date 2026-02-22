const mongoose = require('mongoose');

const timeSlotSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true
  },
  startTime: {
    type: String,
    required: true // Format: "09:00"
  },
  endTime: {
    type: String,
    required: true // Format: "10:00"
  },
  isBooked: {
    type: Boolean,
    default: false
  },
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    default: null
  }
});

const arenaSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  location: {
    address: {
      type: String,
      required: true
    },
    city: {
      type: String,
      required: true
    },
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  description: {
    type: String,
    trim: true
  },
  price: {
    type: Number,
    required: true
  },
  priceUnit: {
    type: String,
    default: 'per hour',
    enum: ['per hour', 'per game', 'per day']
  },
  images: [{
    type: String // URL to image
  }],
  facilities: [{
    type: String // e.g., "Parking", "Changing Room", "Lights"
  }],
  surfaceType: {
    type: String,
    enum: ['Natural Grass', 'Artificial Turf', 'Indoor', 'Outdoor'],
    default: 'Artificial Turf'
  },
  capacity: {
    type: Number,
    default: 10 // Number of players
  },
  timeSlots: [timeSlotSchema],
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  totalRatings: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  openingTime: {
    type: String,
    default: "06:00"
  },
  closingTime: {
    type: String,
    default: "23:00"
  }
}, { 
  timestamps: true 
});

// Index for search
arenaSchema.index({ name: 'text', 'location.city': 'text' });

module.exports = mongoose.model('Arena', arenaSchema);