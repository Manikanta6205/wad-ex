const API_URL = 'http://localhost:5000';

// Remove offline mode capability since we want to always connect to the real database
let connectionAttempted = false;

/**
 * Check server connection
 * @returns {Promise<boolean>} True if connection successful
 */
export async function checkServerConnection() {
  if (connectionAttempted) {
    return true;
  }
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);
    
    const response = await fetch(`${API_URL}/students`, {
      method: 'HEAD',
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    connectionAttempted = true;
    return response.ok;
  } catch (error) {
    console.error('Server connection failed:', error);
    throw new Error('Cannot connect to the server. Please check if the server is running.');
  }
}

/**
 * Fetch all students from the API
 * @returns {Promise<Array>} Array of student objects
 */
export async function fetchAllStudents() {
  // Check if we can connect to the server
  await checkServerConnection();
  
  try {
    const response = await fetch(`${API_URL}/students`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch students: ${response.status} ${response.statusText}`);
    }
    
    return await response.json();
  } catch (err) {
    console.error('Error fetching students:', err);
    throw err;
  }
}

/**
 * Add a new student
 * @param {string} name - The name of the student to add
 * @returns {Promise<Object>} The newly created student object
 */
export async function addStudent(name) {
  if (!name.trim()) {
    throw new Error('Student name cannot be empty');
  }
  
  const response = await fetch(`${API_URL}/students`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name }),
  });
  
  if (!response.ok) {
    throw new Error(`Failed to add student: ${response.status} ${response.statusText}`);
  }
  
  return await response.json();
}

/**
 * Update a student's attendance status
 * @param {string} studentId - The ID of the student to update
 * @param {string} attendance - The new attendance status
 * @returns {Promise<Object>} The updated student object
 */
export async function updateStudentAttendance(studentId, attendance) {
  try {
    const response = await fetch(`${API_URL}/students/${studentId}/attendance`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ attendance }),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to update attendance: ${response.status} ${response.statusText}`);
    }
    
    return await response.json();
  } catch (err) {
    console.error('Error updating attendance:', err);
    throw err;
  }
}