const mongoose = require('mongoose');
require('dotenv').config();

// Choose between local MongoDB or Atlas based on environment variable
const useLocalDb = process.env.USE_LOCAL_DB === 'true';
const mongoUri = useLocalDb 
  ? process.env.LOCAL_MONGO_URL || 'mongodb://127.0.0.1:27017/mousetracker'
  : process.env.MONGO_URL;

// Connect to MongoDB (either local or Atlas)
mongoose.connect(mongoUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  const dbType = useLocalDb ? 'local MongoDB' : 'MongoDB Atlas';
  console.log(`Connected to ${dbType} successfully!`);
})
.catch(err => console.error('MongoDB connection error:', err));