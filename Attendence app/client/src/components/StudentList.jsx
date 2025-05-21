import React from 'react';

function StudentList({ students, loading, onAttendanceChange }) {
  if (loading) {
    return <p>Loading students...</p>;
  }
  
  if (students.length === 0) {
    return <p>No students added yet.</p>;
  }
  
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-100">
            <th className="border px-4 py-2 text-left">Name</th>
            <th className="border px-4 py-2 text-center">Present</th>
            <th className="border px-4 py-2 text-center">Absent</th>
            <th className="border px-4 py-2 text-center">Given</th>
          </tr>
        </thead>
        <tbody>
          {students.map(student => (
            <tr key={student._id}>
              <td className="border px-4 py-2">{student.name}</td>
              <td className="border px-4 py-2 text-center">
                <input
                  type="radio"
                  name={`attendance-${student._id}`}
                  checked={student.attendance === 'Present'}
                  onChange={() => onAttendanceChange(student._id, 'Present')}
                  className="form-radio h-4 w-4 text-green-600"
                />
              </td>
              <td className="border px-4 py-2 text-center">
                <input
                  type="radio"
                  name={`attendance-${student._id}`}
                  checked={student.attendance === 'Absent'}
                  onChange={() => onAttendanceChange(student._id, 'Absent')}
                  className="form-radio h-4 w-4 text-red-600"
                />
              </td>
              <td className="border px-4 py-2 text-center">
                <input
                  type="radio"
                  name={`attendance-${student._id}`}
                  checked={student.attendance === 'Given'}
                  onChange={() => onAttendanceChange(student._id, 'Given')}
                  className="form-radio h-4 w-4 text-blue-600"
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default StudentList;
