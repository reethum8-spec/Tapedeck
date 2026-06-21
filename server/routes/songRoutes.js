const express = require('express');
const {
  addSong,
  deleteSong,
  updateSong,
} = require('../controllers/songController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.route('/')
  .post(protect, addSong);

router.route('/:id')
  .put(protect, updateSong)
  .delete(protect, deleteSong);

module.exports = router;
