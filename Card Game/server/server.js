const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const Game = require('./models/Game');
const app = express();
app.use(cors());
app.use(express.json());

// Choose between local MongoDB or MongoDB Atlas connection
// MongoDB Atlas: Cloud-hosted MongoDB service with auto-scaling and backups
// Local MongoDB: Use 'mongodb://localhost:27017/cardgame' for local development
const dbURI = process.env.MONGO_URI || 'mongodb://localhost:27017/cardgame';

mongoose.connect(dbURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log(`MongoDB Connected: ${dbURI.includes('localhost') ? 'Local' : 'Atlas'}`));

app.post('/api/game', async (req, res) => {
  const { result } = req.body;
  const game = new Game({ result });
  await game.save();
  res.status(201).json({ message: 'Saved' });
});

app.get('/api/stats', async (req, res) => {
  const wins = await Game.countDocuments({ result: 'win' });
  const losses = await Game.countDocuments({ result: 'loss' });
  res.json({ wins, losses });
});

app.listen(5000, () => console.log('Server running on port 5000'));