import React, { useState, useEffect } from 'react'
import './App.css'

const API_URL = 'http://localhost:5000'

function App() {
  const [expenses, setExpenses] = useState([])
  const [filter, setFilter] = useState('')
  const [categoryStats, setCategoryStats] = useState([])
  const [weeklyTotal, setWeeklyTotal] = useState(0)
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    description: '',
    amount: '',
    category: 'Other'
  })
  const [smsText, setSmsText] = useState('')
  const [loading, setLoading] = useState(false)

  const categories = ['Food', 'Transport', 'Entertainment', 'Groceries', 'Bills', 'Other']

  const fetchData = async () => {
    setLoading(true)
    try {
      const expensesURL = filter ? `${API_URL}/expenses?category=${filter}` : `${API_URL}/expenses`
      const expResp = await fetch(expensesURL)
      const expData = await expResp.json()
      setExpenses(expData)
      
      const statsResp = await fetch(`${API_URL}/expenses/stats/by-category`)
      const statsData = await statsResp.json()
      setCategoryStats(statsData)
      
      const weeklyResp = await fetch(`${API_URL}/expenses/stats/last-seven-days`)
      const weeklyData = await weeklyResp.json()
      setWeeklyTotal(weeklyData.total)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [filter])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const resp = await fetch(`${API_URL}/expenses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, amount: Number(formData.amount) })
      })
      if (resp.ok) {
        setFormData({
          date: new Date().toISOString().split('T')[0],
          description: '',
          amount: '',
          category: 'Other'
        })
        fetchData()
      }
    } catch (error) {
      console.error('Error adding expense:', error)
    }
  }

  const handleSmsSubmit = async (e) => {
    e.preventDefault()
    try {
      const resp = await fetch(`${API_URL}/expenses/sms`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: smsText })
      })
      if (resp.ok) {
        setSmsText('')
        fetchData()
      }
    } catch (error) {
      console.error('Error adding SMS expense:', error)
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString()
  }

  return (
    <div className="container mx-auto p-4 max-w-5xl">
      <h1 className="text-3xl font-bold text-center mb-8">Expense Tracker</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Add New Expense</h2>
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="block text-sm font-medium mb-1">Date</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            <div className="mb-3">
              <label className="block text-sm font-medium mb-1">Description</label>
              <input
                type="text"
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            <div className="mb-3">
              <label className="block text-sm font-medium mb-1">Amount</label>
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                min="0"
                step="0.01"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Category</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                required
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <button 
              type="submit" 
              className="w-full p-2 bg-blue-600 text-white font-medium rounded hover:bg-blue-700"
            >
              Add Expense
            </button>
          </form>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Add from SMS</h2>
          <form onSubmit={handleSmsSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Paste SMS Text</label>
              <textarea
                name="smsText"
                value={smsText}
                onChange={(e) => setSmsText(e.target.value)}
                className="w-full p-2 border rounded"
                rows="5"
                required
              ></textarea>
            </div>
            <button 
              type="submit" 
              className="w-full p-2 bg-green-600 text-white font-medium rounded hover:bg-green-700"
            >
              Parse & Add Expense
            </button>
          </form>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Category Totals</h2>
          {categoryStats.length > 0 ? (
            <ul className="divide-y">
              {categoryStats.map(stat => (
                <li key={stat._id} className="py-2 flex justify-between">
                  <span>{stat._id}</span>
                  <span className="font-medium">₹{stat.total.toFixed(2)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No expense data available</p>
          )}
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Last 7 Days Total</h2>
          <div className="text-center">
            <p className="text-3xl font-bold text-blue-600">₹{weeklyTotal.toFixed(2)}</p>
            <p className="text-sm text-gray-500 mt-1">Total expenses in the last week</p>
          </div>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Your Expenses</h2>
          <div className="flex items-center">
            <label className="text-sm mr-2">Filter by Category:</label>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="p-1 border rounded"
            >
              <option value="">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>
        
        {loading ? (
          <p className="text-center text-gray-500">Loading...</p>
        ) : expenses.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full table-auto">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left">Date</th>
                  <th className="px-4 py-2 text-left">Description</th>
                  <th className="px-4 py-2 text-left">Category</th>
                  <th className="px-4 py-2 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {expenses.map(expense => (
                  <tr key={expense._id}>
                    <td className="px-4 py-2">{formatDate(expense.date)}</td>
                    <td className="px-4 py-2">{expense.description}</td>
                    <td className="px-4 py-2">{expense.category}</td>
                    <td className="px-4 py-2 text-right">₹{expense.amount.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-center text-gray-500">No expenses found</p>
        )}
      </div>
    </div>
  )
}

export default App
