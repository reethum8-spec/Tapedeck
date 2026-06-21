const express = require('express');
const { searchSongs } = require('../controllers/searchController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.route('/')
  .get(protect, searchSongs);

module.exports = router;
