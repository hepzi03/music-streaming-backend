const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static frontend files
app.use(express.static(path.join(__dirname, 'frontend')));

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// MongoDB Connection
console.log('Mongo URI:', process.env.MONGO_URI);
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

// Routes
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

const musicRoutes = require('./routes/music');
app.use('/api/music', musicRoutes);

const playlistRoutes = require('./routes/playlist');
app.use('/api/playlists', playlistRoutes);

// Stream playlist endpoint
const Playlist = require('./models/Playlist');

app.get('/api/playlists/:id/stream', async (req, res) => {
  const { id } = req.params;
  try {
    const playlist = await Playlist.findById(id).populate('songs');
    if (!playlist) return res.status(404).json({ message: 'Playlist not found' });

    const songUrls = playlist.songs.map(song => song.audioUrl);
    res.status(200).json({ playlistName: playlist.name, songs: songUrls, autoplay: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/', (req, res) => {
  res.send('Music Streaming Backend is running!');
});

// Start Server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
