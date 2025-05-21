const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config(); 
const studentRoutes = require('./routes/students');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP', message: 'Server is running' });
});

// MongoDB Connection with better error handling
const connectDB = async () => {
  try {
    console.log('Connecting to MongoDB...',process.env.MONGO_URI);
    const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/attendance-app';
    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log('MongoDB Connected');
  } catch (err) {
    console.error('MongoDB Connection Error:', err);
    console.log('Exiting application - MongoDB connection is required');
    process.exit(1);
  }
};

connectDB();

// Routes
app.use('/students', studentRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'production' ? 'An error occurred' : err.message 
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    mongoose.connection.close(false, () => {
      console.log('MongoDB connection closed');
      process.exit(0);
    });
  });
});

module.exports = app; 
