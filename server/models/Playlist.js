const mongoose = require('mongoose');

const playlistSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  name: {
    type: String,
    required: [true, 'Please add a playlist name'],
    trim: true,
  },
  description: {
    type: String,
    default: '',
  },
  cassetteColor: {
    type: String,
    default: '#1a472a',
  },
  color: {
    type: String,
    default: '#1a472a',
  },
  labelColor: {
    type: String,
    default: '#5DCAA5',
  },
  sticker: {
    type: String,
    default: '🎵',
  },
  coverImage: {
    type: String,
    default: '',
  },
  isFavorite: {
    type: Boolean,
    default: false,
  },
  lastPlayed: {
    type: Date,
    default: Date.now,
  },
  isGift: {
    type: Boolean,
    default: false,
  },
  giftSender: {
    type: String,
    default: '',
  },
  isUnwrapped: {
    type: Boolean,
    default: true,
  },
  isCollaborative: {
    type: Boolean,
    default: false,
  },
  contributors: [{
    type: String,
  }],
}, { timestamps: true });

module.exports = mongoose.model('Playlist', playlistSchema);
