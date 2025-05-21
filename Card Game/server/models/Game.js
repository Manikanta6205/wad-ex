const mongoose = require('mongoose');

const gameSchema = new mongoose.Schema({
  result: {
    type: String,
    enum: ['win', 'loss'],
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Game', gameSchema);
