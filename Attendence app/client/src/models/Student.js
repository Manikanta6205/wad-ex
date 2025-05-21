/**
 * Student model
 * @typedef {Object} Student
 * @property {string} _id - MongoDB generated ID
 * @property {string} name - Student's name
 * @property {string} attendance - Attendance status (Present, Absent, or Given)
 */

/**
 * Creates a new Student object
 * @param {string} name - Student's name
 * @returns {Student} A new Student object
 */
export function createStudent(name) {
  if (!name || typeof name !== 'string' || name.trim() === '') {
    throw new Error('Student name is required and must be a non-empty string');
  }
  
  return {
    name: name.trim(),
    attendance: 'Given'
  };
}

/**
 * Validates attendance status
 * @param {string} status - The attendance status to validate
 * @returns {boolean} True if valid, false otherwise
 */
export function isValidAttendanceStatus(status) {
  return ['Present', 'Absent', 'Given'].includes(status);
}

/**
 * Get a default array of students for offline mode
 * @returns {Array<Student>} Array of sample students
 */
export function getSampleStudents() {
  return [
    { _id: '1', name: 'Sample Student 1', attendance: 'Present' },
    { _id: '2', name: 'Sample Student 2', attendance: 'Absent' },
    { _id: '3', name: 'Sample Student 3', attendance: 'Given' }
  ];
}
