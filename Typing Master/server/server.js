const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
// Add dotenv for environment variables
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Use a hardcoded JWT secret (replace with the generated value from generateSecret.js)
const JWT_SECRET = 'bc41ab788b9e9ebbb4b87ece3902940e903dbeba785ce123bd6249845f1f5a0dad05f9b3cd804a1c43676dd0ad62711833f7db092a8172fcd98473e0c73b668c';
// Configure MongoDB connection with .env support
// Use environment variables with fallback to the hardcoded Atlas URL
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/typing_master';
// Original Atlas connection (commented out but kept as reference)
// const MONGODB_URI = 'mongodb+srv://mdarbazking7:Mdarbaz123@cluster0.pbmnugu.mongodb.net/abcd';

// Connect to MongoDB
mongoose.connect(MONGODB_URI).then(() => console.log('MongoDB connected to:', MONGODB_URI))
  .catch(err => console.error('MongoDB connection error:', err));

// User Schema
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

// Text Schema for typing tests
const textSchema = new mongoose.Schema({
  content: { type: String, required: true },
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'easy' },
  createdAt: { type: Date, default: Date.now }
});

// Test Result Schema
const resultSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  wpm: { type: Number, required: true },
  accuracy: { type: Number, required: true },
  timeInSeconds: { type: Number, required: true },
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'easy' },
  createdAt: { type: Date, default: Date.now }
});

// Models
const User = mongoose.model('User', userSchema);
const Text = mongoose.model('Text', textSchema);
const Result = mongoose.model('Result', resultSchema);

// Auth middleware
const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization').replace('Bearer ', '');
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Authentication required' });
  }
};

// Register a new user
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }
    
    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Create new user
    const user = new User({
      username,
      email,
      password: hashedPassword
    });
    
    await user.save();
    
    // Generate JWT token
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '7d' });
    
    res.status(201).json({ token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Login user
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    // Generate JWT token
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '7d' });
    
    res.json({ token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get current user
app.get('/api/users/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get texts for typing tests
app.get('/api/texts', async (req, res) => {
  try {
    const { difficulty = 'easy' } = req.query;
    const texts = await Text.find({ difficulty });
    
    // If no texts exist, create some sample texts
    if (texts.length === 0) {
      const sampleTexts = [
        {
          content: 'The quick brown fox jumps over the lazy dog. This pangram contains every letter of the English alphabet.',
          difficulty: 'easy'
        },
        {
          content: 'Programming is the process of creating a set of instructions that tell a computer how to perform a task.',
          difficulty: 'easy'
        },
        {
          content: 'Learning to type quickly and accurately is an essential skill in today\'s digital world. Practice regularly to improve.',
          difficulty: 'medium'
        },
        {
          content: 'The science of today is the technology of tomorrow. We can only see a short distance ahead, but we can see plenty there that needs to be done.',
          difficulty: 'medium'
        },
        {
          content: 'Success is not final, failure is not fatal: It is the courage to continue that counts. The best way to predict the future is to create it yourself.',
          difficulty: 'hard'
        },
        {
          content: 'Artificial intelligence is the simulation of human intelligence processes by machines, especially computer systems. These processes include learning, reasoning, and self-correction.',
          difficulty: 'hard'
        }
      ];
      
      await Text.insertMany(sampleTexts);
      const newTexts = await Text.find({ difficulty });
      return res.json(newTexts);
    }
    
    res.json(texts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add a new text
app.post('/api/texts', auth, async (req, res) => {
  try {
    const { content, difficulty } = req.body;
    const text = new Text({ content, difficulty });
    await text.save();
    res.status(201).json(text);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Save a test result
app.post('/api/results', auth, async (req, res) => {
  try {
    const { wpm, accuracy, timeInSeconds, difficulty } = req.body;
    
    const result = new Result({
      user: req.userId,
      wpm,
      accuracy,
      timeInSeconds,
      difficulty
    });
    
    await result.save();
    res.status(201).json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all test results for a user
app.get('/api/results', auth, async (req, res) => {
  try {
    const results = await Result.find({ user: req.userId }).sort({ createdAt: -1 });
    res.json(results);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get recent test results for a user (last 10)
app.get('/api/results/recent', auth, async (req, res) => {
  try {
    const results = await Result.find({ user: req.userId })
      .sort({ createdAt: -1 })
      .limit(10);
    res.json(results);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
