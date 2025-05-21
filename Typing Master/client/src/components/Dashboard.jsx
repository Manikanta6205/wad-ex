import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const Dashboard = () => {
  const [userData, setUserData] = useState(null);
  const [recentResults, setRecentResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserData();
    fetchRecentResults();
  }, []);

  const fetchUserData = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/users/me', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setUserData(response.data);
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const fetchRecentResults = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/results/recent', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setRecentResults(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching recent results:', error);
      setLoading(false);
    }
  };

  const getBestScore = () => {
    if (recentResults.length === 0) return null;
    return recentResults.reduce((max, result) => result.wpm > max.wpm ? result : max, recentResults[0]);
  };

  const getAverageWpm = () => {
    if (recentResults.length === 0) return 0;
    const sum = recentResults.reduce((total, result) => total + result.wpm, 0);
    return Math.round(sum / recentResults.length);
  };

  const bestScore = getBestScore();

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-2xl font-bold mb-4">Welcome {userData?.username || 'User'}!</h2>
        <p className="mb-6">Improve your typing skills by taking regular tests and tracking your progress.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <Link 
            to="/test" 
            className="bg-blue-500 text-white p-6 rounded-lg shadow hover:bg-blue-600 transition-colors text-center"
          >
            <h3 className="text-xl font-bold mb-2">Take Typing Test</h3>
            <p>Start a new typing test to measure your speed and accuracy</p>
          </Link>
          
          <Link 
            to="/progress" 
            className="bg-green-500 text-white p-6 rounded-lg shadow hover:bg-green-600 transition-colors text-center"
          >
            <h3 className="text-xl font-bold mb-2">View Your Progress</h3>
            <p>See detailed charts and statistics about your typing performance</p>
          </Link>
        </div>
      </div>
      
      {loading ? (
        <div className="text-center py-6">Loading your stats...</div>
      ) : (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-4">Your Stats</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-gray-100 p-4 rounded-md text-center">
              <h3 className="text-gray-500 mb-1">Tests Completed</h3>
              <p className="text-2xl font-bold">{recentResults.length}</p>
            </div>
            
            <div className="bg-gray-100 p-4 rounded-md text-center">
              <h3 className="text-gray-500 mb-1">Best WPM</h3>
              <p className="text-2xl font-bold">{bestScore ? bestScore.wpm : 'N/A'}</p>
            </div>
            
            <div className="bg-gray-100 p-4 rounded-md text-center">
              <h3 className="text-gray-500 mb-1">Average WPM</h3>
              <p className="text-2xl font-bold">{getAverageWpm()}</p>
            </div>
          </div>
          
          <h3 className="font-bold mb-2">Recent Results</h3>
          {recentResults.length > 0 ? (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">WPM</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Accuracy</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Difficulty</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentResults.slice(0, 5).map((result, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap">{new Date(result.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{result.wpm}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{result.accuracy}%</td>
                    <td className="px-6 py-4 whitespace-nowrap capitalize">{result.difficulty}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-gray-500 py-4">You haven't taken any tests yet. Start a test to see your results here!</p>
          )}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
