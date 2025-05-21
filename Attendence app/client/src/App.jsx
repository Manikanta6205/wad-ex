import React, { useState, useEffect } from 'react';
import StudentForm from './components/StudentForm';
import StudentList from './components/StudentList';
import AttendanceSummary from './components/AttendanceSummary';
import ErrorAlert from './components/ErrorAlert';
import { fetchAllStudents, addStudent, updateStudentAttendance } from './services/studentService';
import './App.css';

function App() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showChart, setShowChart] = useState(false);

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    try {
      setLoading(true);
      const data = await fetchAllStudents();
      setStudents(data);
      setError(null);
    } catch (err) {
      setError('Error fetching students: ' + err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddStudent = async (name) => {
    try {
      const newStudent = await addStudent(name);
      setStudents([...students, newStudent]);
    } catch (err) {
      setError('Error adding student: ' + err.message);
      console.error(err);
    }
  };

  const handleAttendanceChange = async (studentId, attendance) => {
    try {
      const updatedStudent = await updateStudentAttendance(studentId, attendance);
      
      setStudents(students.map(student => 
        student._id === updatedStudent._id 
          ? { ...student, attendance: updatedStudent.attendance }
          : student
      ));
    } catch (err) {
      setError('Error updating attendance: ' + err.message);
      console.error(err);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8 text-center">Class Attendance App</h1>
      
      {error && <ErrorAlert message={error} />}
      
      <div className="mb-8">
        <StudentForm onAddStudent={handleAddStudent} />
      </div>
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Student Attendance</h2>
        <StudentList 
          students={students}
          loading={loading}
          onAttendanceChange={handleAttendanceChange}
        />
        
        <div className="mt-4">
          <button
            onClick={() => setShowChart(!showChart)}
            className="bg-purple-500 hover:bg-purple-600 text-white font-medium px-4 py-2 rounded"
          >
            {showChart ? 'Hide Summary' : 'Show Summary'}
          </button>
        </div>
      </div>
      
      {showChart && students.length > 0 && (
        <AttendanceSummary students={students} />
      )}
    </div>
  );
}

export default App;
