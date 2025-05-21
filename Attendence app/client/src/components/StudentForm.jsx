import React, { useState } from 'react';

function StudentForm({ onAddStudent }) {
  const [newStudentName, setNewStudentName] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!newStudentName.trim()) return;
    
    onAddStudent(newStudentName);
    setNewStudentName('');
  };

  return (
    <>
      <h2 className="text-xl font-semibold mb-4">Add New Student</h2>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={newStudentName}
          onChange={(e) => setNewStudentName(e.target.value)}
          placeholder="Student Name"
          className="flex-1 border rounded px-3 py-2"
          required
        />
        <button 
          type="submit" 
          className="bg-blue-500 hover:bg-blue-600 text-white font-medium px-4 py-2 rounded"
        >
          Add Student
        </button>
      </form>
    </>
  );
}

export default StudentForm;
