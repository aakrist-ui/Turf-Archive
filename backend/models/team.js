const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  captain: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  members: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    position: {
      type: String,
      enum: ['Goalkeeper', 'Defender', 'Midfielder', 'Forward', 'Any'],
      default: 'Any'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    }
  }],
  maxMembers: {
    type: Number,
    default: 10
  },
  description: {
    type: String,
    trim: true
  },
  teamImage: {
    type: String // URL
  },
  isActive: {
    type: Boolean,
    default: true
  },
  totalGamesPlayed: {
    type: Number,
    default: 0
  }
}, { 
  timestamps: true 
});

// Virtual for current member count
teamSchema.virtual('currentMembers').get(function() {
  return this.members.length;
});

module.exports = mongoose.model('Team', teamSchema);