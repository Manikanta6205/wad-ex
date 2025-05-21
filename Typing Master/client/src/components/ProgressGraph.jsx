import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const ProgressGraph = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: []
  });

  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/results', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      const sortedResults = response.data.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      setResults(sortedResults);
      prepareChartData(sortedResults);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching results:', error);
      setLoading(false);
    }
  };

  const prepareChartData = (data) => {
    const labels = data.map(result => {
      const date = new Date(result.createdAt);
      return `${date.getMonth()+1}/${date.getDate()}/${date.getFullYear().toString().substr(-2)}`;
    });

    const wpmData = data.map(result => result.wpm);
    const accuracyData = data.map(result => result.accuracy);

    setChartData({
      labels,
      datasets: [
        {
          label: 'Words Per Minute',
          data: wpmData,
          borderColor: 'rgb(75, 192, 192)',
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          tension: 0.1
        },
        {
          label: 'Accuracy (%)',
          data: accuracyData,
          borderColor: 'rgb(153, 102, 255)',
          backgroundColor: 'rgba(153, 102, 255, 0.2)',
          tension: 0.1
        }
      ]
    });
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Your Typing Progress Over Time'
      }
    },
    scales: {
      y: {
        beginAtZero: true
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">Your Typing Progress</h2>
      
      {loading ? (
        <div className="text-center py-8">Loading your progress data...</div>
      ) : results.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-lg">You haven't completed any typing tests yet.</p>
          <p>Take a test to start tracking your progress!</p>
        </div>
      ) : (
        <>
          <div className="mb-8 h-80">
            <Line data={chartData} options={chartOptions} />
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">WPM</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Accuracy</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time (sec)</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Difficulty</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {results.slice().reverse().map((result, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap">{new Date(result.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{result.wpm}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{result.accuracy}%</td>
                    <td className="px-6 py-4 whitespace-nowrap">{result.timeInSeconds}</td>
                    <td className="px-6 py-4 whitespace-nowrap capitalize">{result.difficulty}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

export default ProgressGraph;
