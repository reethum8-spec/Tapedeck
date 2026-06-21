const Song = require('../models/Song');
const Playlist = require('../models/Playlist');

// @desc    Add song to playlist
// @route   POST /api/songs
// @access  Private
exports.addSong = async (req, res, next) => {
  try {
    const { playlistId, side, jamendoId, title, artist, duration, audioUrl, coverUrl } = req.body;

    const playlist = await Playlist.findById(playlistId);

    if (!playlist) {
      return res.status(404).json({ success: false, error: 'Playlist not found' });
    }

    if (playlist.userId.toString() !== req.user.id && !playlist.isCollaborative) {
      return res.status(401).json({ success: false, error: 'Not authorized to add songs to this playlist' });
    }

    const song = await Song.create({
      playlistId,
      side,
      jamendoId,
      title,
      artist,
      duration,
      audioUrl,
      coverUrl,
    });

    res.status(201).json({ success: true, data: { ...song.toObject(), id: song._id } });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete song
// @route   DELETE /api/songs/:id
// @access  Private
exports.deleteSong = async (req, res, next) => {
  try {
    const song = await Song.findById(req.params.id);

    if (!song) {
      return res.status(404).json({ success: false, error: 'Song not found' });
    }

    const playlist = await Playlist.findById(song.playlistId);
    if (!playlist) {
        await song.deleteOne();
        return res.status(200).json({ success: true, data: {} });
    }

    if (playlist.userId.toString() !== req.user.id && !playlist.isCollaborative) {
      return res.status(401).json({ success: false, error: 'Not authorized to delete song from this playlist' });
    }

    await song.deleteOne();

    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a song (e.g. for memory)
// @route   PUT /api/songs/:id
// @access  Private
exports.updateSong = async (req, res, next) => {
    try {
        let song = await Song.findById(req.params.id);

        if (!song) {
            return res.status(404).json({ success: false, error: 'Song not found' });
        }

        const playlist = await Playlist.findById(song.playlistId);

        if (playlist && playlist.userId.toString() !== req.user.id && !playlist.isCollaborative) {
            return res.status(401).json({ success: false, error: 'Not authorized to update this song' });
        }

        song = await Song.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.status(200).json({ success: true, data: { ...song.toObject(), id: song._id } });
    } catch (error) {
        next(error);
    }
};
