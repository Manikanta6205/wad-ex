import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const TypingTest = () => {
  const [_, setTexts] = useState([]);
  const [currentText, setCurrentText] = useState('');
  const [userInput, setUserInput] = useState('');
  const [timer, setTimer] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [testComplete, setTestComplete] = useState(false);
  const [results, setResults] = useState(null);
  const [difficulty, setDifficulty] = useState('easy');
  const inputRef = useRef(null);
  const intervalRef = useRef(null);

  useEffect(() => {
    fetchTexts();
  }, [difficulty]);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTimer(prevTimer => prevTimer + 1);
      }, 1000);
    } else if (!isRunning && timer !== 0) {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [isRunning, timer]);

  const fetchTexts = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/texts?difficulty=${difficulty}`);
      setTexts(response.data);
      // Select a random text
      const randomIndex = Math.floor(Math.random() * response.data.length);
      setCurrentText(response.data[randomIndex].content);
    } catch (error) {
      console.error('Error fetching texts:', error);
    }
  };

  const startTest = () => {
    setUserInput('');
    setTimer(0);
    setIsRunning(true);
    setTestComplete(false);
    setResults(null);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const calculateResults = () => {
    const words = currentText.trim().split(/\s+/).length;
    const minutes = timer / 60;
    const wpm = Math.round(words / minutes);
    
    // Calculate accuracy
    const correctChars = [...userInput].filter((char, i) => char === currentText[i]).length;
    const accuracy = Math.round((correctChars / currentText.length) * 100);
    
    return { wpm, accuracy, timeInSeconds: timer };
  };

  const endTest = async () => {
    setIsRunning(false);
    setTestComplete(true);
    
    const results = calculateResults();
    setResults(results);
    
    try {
      await axios.post('http://localhost:5000/api/results', {
        wpm: results.wpm,
        accuracy: results.accuracy,
        timeInSeconds: results.timeInSeconds,
        difficulty
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
    } catch (error) {
      console.error('Error saving results:', error);
    }
  };

  const handleInputChange = (e) => {
    const input = e.target.value;
    setUserInput(input);
    
    // If user has typed the entire text, end the test
    if (input.length === currentText.length) {
      endTest();
    }
  };

  const getTextWithHighlighting = () => {
    return currentText.split('').map((char, index) => {
      let className = '';
      if (index < userInput.length) {
        className = userInput[index] === char ? 'text-green-500' : 'text-red-500';
      }
      return (
        <span key={index} className={className}>
          {char}
        </span>
      );
    });
  };

  return (
    <div className="max-w-3xl mx-auto bg-white p-8 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Typing Speed Test</h2>
      
      <div className="mb-4">
        <label className="block text-gray-700 mb-2">Difficulty Level</label>
        <select 
          className="w-full p-2 border rounded-md" 
          value={difficulty} 
          onChange={(e) => setDifficulty(e.target.value)}
          disabled={isRunning}
        >
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>
      </div>

      {!isRunning && !testComplete && (
        <button 
          onClick={startTest} 
          className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 mb-4"
        >
          Start Test
        </button>
      )}

      {isRunning && (
        <div className="text-xl font-mono bg-gray-100 p-4 rounded-md mb-4">
          {getTextWithHighlighting()}
        </div>
      )}

      {isRunning && (
        <div className="mb-4">
          <input
            ref={inputRef}
            type="text"
            value={userInput}
            onChange={handleInputChange}
            className="w-full p-3 border rounded-md font-mono"
            placeholder="Type here..."
            autoFocus
          />
        </div>
      )}

      {isRunning && (
        <div className="flex justify-between mb-4">
          <div className="text-lg">Time: {timer} seconds</div>
          <button 
            onClick={endTest} 
            className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
          >
            End Test
          </button>
        </div>
      )}

      {testComplete && results && (
        <div className="bg-green-100 p-4 rounded-md mb-4">
          <h3 className="text-xl font-bold mb-2">Results</h3>
          <p className="text-lg">Words per minute: <span className="font-bold">{results.wpm}</span></p>
          <p className="text-lg">Accuracy: <span className="font-bold">{results.accuracy}%</span></p>
          <p className="text-lg">Time taken: <span className="font-bold">{results.timeInSeconds} seconds</span></p>
          <button 
            onClick={startTest} 
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 mt-4"
          >
            Try Again
          </button>
        </div>
      )}
    </div>
  );
};

export default TypingTest;
