// Backend for Mouse Track App
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection - use Atlas URI from env or local as fallback
const MONGODB_URI = process.env.MONGO_URL || 'mongodb://127.0.0.1:27017/mouse_tracker';

// MongoDB connection
mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

// MouseEvent Schema
const mouseEventSchema = new mongoose.Schema({
  x: Number,
  y: Number,
  count: Number,
  timestamp: { type: Date, default: Date.now },
});
const MouseEvent = mongoose.model('MouseEvent', mouseEventSchema);

// Save mouse events (bulk)
app.post('/api/mouse-events', async (req, res) => {
  try {
    const events = req.body.events;
    if (!Array.isArray(events)) {
      return res.status(400).json({ error: 'Events should be an array' });
    }
    const saved = await MouseEvent.insertMany(events);
    res.status(201).json(saved);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all mouse events
app.get('/api/mouse-events', async (req, res) => {
  try {
    const events = await MouseEvent.find();
    res.json(events);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
