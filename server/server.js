require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/error');

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(express.json({ limit: '50mb' })); // Support large base64 images
app.use(cors());

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/playlists', require('./routes/playlistRoutes'));
app.use('/api/songs', require('./routes/songRoutes'));
app.use('/api/search', require('./routes/searchRoutes'));

// Error Handler Middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
