const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  attendance: {
    type: String,
    enum: ['Present', 'Absent', 'Given'],
    default: 'Given'
  }
}, {
  timestamps: true
});

const Student = mongoose.model('Student', studentSchema);

module.exports = Student;
