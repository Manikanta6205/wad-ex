const express = require('express');
const router = express.Router();
const Student = require('../models/Student');

// GET all students
router.get('/', async (req, res, next) => {
  try {
    const students = await Student.find();
    res.json(students);
  } catch (err) {
    next(err);
  }
});

// POST a new student
router.post('/', async (req, res, next) => {
  try {
    if (!req.body.name || typeof req.body.name !== 'string' || req.body.name.trim() === '') {
      return res.status(400).json({ message: 'Student name is required' });
    }
    
    const student = new Student({
      name: req.body.name.trim()
    });

    const newStudent = await student.save();
    res.status(201).json(newStudent);
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({ message: err.message });
    }
    next(err);
  }
});

// PUT update student attendance
router.put('/:id/attendance', async (req, res, next) => {
  try {
    const { attendance } = req.body;
    
    if (!['Present', 'Absent', 'Given'].includes(attendance)) {
      return res.status(400).json({ message: 'Invalid attendance status' });
    }
    
    const updatedStudent = await Student.findByIdAndUpdate(
      req.params.id,
      { attendance },
      { new: true, runValidators: true }
    );
    
    if (!updatedStudent) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    res.json(updatedStudent);
  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid student ID format' });
    }
    next(err);
  }
});

module.exports = router;
