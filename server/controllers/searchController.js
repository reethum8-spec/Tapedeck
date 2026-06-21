const Song = require('../models/Song');

// @desc    Search songs
// @route   GET /api/search
// @access  Private
exports.searchSongs = async (req, res, next) => {
  try {
    const { q } = req.query;

    if (!q) {
      return res.status(400).json({ success: false, error: 'Please provide a search query' });
    }

    const songs = await Song.find(
        { $text: { $search: q } },
        { score: { $meta: "textScore" } }
    ).sort({ score: { $meta: "textScore" } });

    res.status(200).json({ success: true, data: songs });
  } catch (error) {
    next(error);
  }
};
