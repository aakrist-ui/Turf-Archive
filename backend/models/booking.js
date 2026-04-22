const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  arena: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Arena',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  team: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
    default: null
  },
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
  duration: {
    type: Number,
    required: true // in hours
  },
  totalPrice: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'completed'],
    default: 'confirmed'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'online', 'card'],
    default: 'cash'
  },
  notes: {
    type: String,
    trim: true
  },
  cancelledAt: {
    type: Date,
    default: null
  },
  cancelledBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  cancellationReason: {
    type: String,
    default: null
  }
}, { 
  timestamps: true 
});

// Index for queries
bookingSchema.index({ user: 1, date: -1 });
bookingSchema.index({ arena: 1, date: 1 });
bookingSchema.index({ status: 1 });
bookingSchema.index(
  { arena: 1, date: 1, startTime: 1, endTime: 1 },
  {
    unique: true,
    partialFilterExpression: {
      status: { $in: ['pending', 'confirmed', 'completed'] },
    },
  }
);

module.exports = mongoose.model('Booking', bookingSchema);
