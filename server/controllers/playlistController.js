const Playlist = require('../models/Playlist');
const Song = require('../models/Song');

// @desc    Get all playlists for logged in user
// @route   GET /api/playlists
// @access  Private
exports.getPlaylists = async (req, res, next) => {
  try {
    const playlists = await Playlist.find({ userId: req.user.id });
    
    // We also need to attach songs to each playlist to match the frontend shape
    const playlistsWithSongs = await Promise.all(
      playlists.map(async (pl) => {
        const songs = await Song.find({ playlistId: pl._id });
        const sideA = songs.filter(s => s.side === 'A');
        const sideB = songs.filter(s => s.side === 'B');
        return {
          ...pl.toObject(),
          id: pl._id, // frontend expects id
          sideA,
          sideB
        };
      })
    );

    res.status(200).json({ success: true, data: playlistsWithSongs });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new playlist
// @route   POST /api/playlists
// @access  Private
exports.createPlaylist = async (req, res, next) => {
  try {
    req.body.userId = req.user.id;
    
    const playlist = await Playlist.create(req.body);

    res.status(201).json({ success: true, data: { ...playlist.toObject(), id: playlist._id, sideA: [], sideB: [] } });
  } catch (error) {
    next(error);
  }
};

// @desc    Update playlist
// @route   PUT /api/playlists/:id
// @access  Private
exports.updatePlaylist = async (req, res, next) => {
  try {
    let playlist = await Playlist.findById(req.params.id);

    if (!playlist) {
      return res.status(404).json({ success: false, error: 'Playlist not found' });
    }

    if (playlist.userId.toString() !== req.user.id && !playlist.isCollaborative) {
      return res.status(401).json({ success: false, error: 'User not authorized to update this playlist' });
    }

    playlist = await Playlist.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    const songs = await Song.find({ playlistId: playlist._id });
    const sideA = songs.filter(s => s.side === 'A');
    const sideB = songs.filter(s => s.side === 'B');

    res.status(200).json({ success: true, data: { ...playlist.toObject(), id: playlist._id, sideA, sideB } });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete playlist
// @route   DELETE /api/playlists/:id
// @access  Private
exports.deletePlaylist = async (req, res, next) => {
  try {
    const playlist = await Playlist.findById(req.params.id);

    if (!playlist) {
      return res.status(404).json({ success: false, error: 'Playlist not found' });
    }

    if (playlist.userId.toString() !== req.user.id) {
      return res.status(401).json({ success: false, error: 'User not authorized to delete this playlist' });
    }

    await playlist.deleteOne();
    await Song.deleteMany({ playlistId: req.params.id });

    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};

// @desc    Get a shared playlist by ID (Public)
// @route   GET /api/playlists/share/:id
// @access  Public
exports.getSharedPlaylist = async (req, res, next) => {
  try {
    const playlist = await Playlist.findById(req.params.id);

    if (!playlist) {
      return res.status(404).json({ success: false, error: 'Playlist not found' });
    }

    const songs = await Song.find({ playlistId: playlist._id });
    const sideA = songs.filter(s => s.side === 'A');
    const sideB = songs.filter(s => s.side === 'B');

    res.status(200).json({
      success: true,
      data: {
        ...playlist.toObject(),
        id: playlist._id,
        sideA,
        sideB
      }
    });
  } catch (error) {
    next(error);
  }
};
