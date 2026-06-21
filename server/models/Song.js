const mongoose = require('mongoose');

const memorySchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['sticky', 'polaroid'],
    default: 'sticky'
  },
  text: String,
  color: String,
  rotation: Number,
  imageUrl: String,
  position: {
    x: Number,
    y: Number
  }
}, { _id: false });

const songSchema = new mongoose.Schema({
  playlistId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Playlist',
    required: true,
  },
  side: {
    type: String,
    enum: ['A', 'B'],
    default: 'A'
  },
  jamendoId: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  artist: {
    type: String,
    required: true,
  },
  duration: {
    type: Number,
    required: true,
  },
  audioUrl: {
    type: String,
    required: true,
  },
  coverUrl: {
    type: String,
  },
  memory: {
    type: memorySchema,
    default: null
  }
}, { timestamps: true });

// Add index for search
songSchema.index({ title: 'text', artist: 'text' });

module.exports = mongoose.model('Song', songSchema);
