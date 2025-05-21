import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

function AttendanceSummary({ students }) {
  const generateAttendanceData = () => {
    const present = students.filter(s => s.attendance === 'Present').length;
    const absent = students.filter(s => s.attendance === 'Absent').length;
    const given = students.filter(s => s.attendance === 'Given').length;
    
    return [
      { name: 'Present', value: present },
      { name: 'Absent', value: absent },
      { name: 'Given', value: given }
    ];
  };

  const COLORS = ['#4ade80', '#f87171', '#60a5fa'];

  return (
    <div className="mt-8">
      <h2 className="text-xl font-semibold mb-4">Attendance Summary</h2>
      <div className="h-64 bg-white rounded-lg shadow p-4">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={generateAttendanceData()}
              cx="50%"
              cy="50%"
              labelLine={true}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            >
              {generateAttendanceData().map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default AttendanceSummary;
