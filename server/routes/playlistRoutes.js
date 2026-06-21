const express = require('express');
const {
  getPlaylists,
  createPlaylist,
  updatePlaylist,
  deletePlaylist,
  getSharedPlaylist,
} = require('../controllers/playlistController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.route('/share/:id')
  .get(getSharedPlaylist);

router.route('/')
  .get(protect, getPlaylists)
  .post(protect, createPlaylist);

router.route('/:id')
  .put(protect, updatePlaylist)
  .delete(protect, deletePlaylist);

module.exports = router;
