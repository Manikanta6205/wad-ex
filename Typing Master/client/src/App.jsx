import React, { useState, useEffect } from 'react'
import './App.css'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Login from './components/Login'
import Register from './components/Register'
import Dashboard from './components/Dashboard'
import TypingTest from './components/TypingTest'
import ProgressGraph from './components/ProgressGraph'
import Navbar from './components/Navbar'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <Navbar isAuthenticated={isAuthenticated} setIsAuthenticated={setIsAuthenticated} />
        <div className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />} />
            <Route path="/login" element={<Login setIsAuthenticated={setIsAuthenticated} />} />
            <Route path="/register" element={<Register setIsAuthenticated={setIsAuthenticated} />} />
            <Route path="/test" element={isAuthenticated ? <TypingTest /> : <Navigate to="/login" />} />
            <Route path="/progress" element={isAuthenticated ? <ProgressGraph /> : <Navigate to="/login" />} />
          </Routes>
        </div>
      </div>
    </Router>
  )
}

export default App
