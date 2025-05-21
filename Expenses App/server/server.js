const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const dotenv = require('dotenv')

// Load environment variables
dotenv.config()

const app = express()
app.use(cors())
app.use(express.json())

// Use MongoDB Atlas URL from .env if available, otherwise use local MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/expense_tracker'

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err))

// Expense Schema and Model
const expenseSchema = new mongoose.Schema({
  date: { type: Date, required: true, default: Date.now },
  description: { type: String, required: true },
  amount: { type: Number, required: true },
  category: { type: String, required: true }
})

const Expense = mongoose.model('Expense', expenseSchema)

// Add an expense
app.post('/expenses', async (req, res) => {
  try {
    const expense = new Expense(req.body)
    await expense.save()
    res.status(201).json(expense)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

// Get all expenses with optional category filter
app.get('/expenses', async (req, res) => {
  try {
    const { category } = req.query
    const query = category ? { category } : {}
    const expenses = await Expense.find(query).sort({ date: -1 })
    res.json(expenses)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Add expense from SMS text
app.post('/expenses/sms', async (req, res) => {
  try {
    const { text } = req.body
    
    // Enhanced amount extraction
    const amountMatch = text.match(/(?:RS|INR|Rs|rs)\.?\s?(\d+(?:\.\d+)?)/i)
    const amount = amountMatch ? parseFloat(amountMatch[1]) : 0
    
    // Enhanced category detection
    let category = 'Other'
    if (text.match(/food|restaurant|cafe|dining|lunch|dinner|breakfast|eat|meal|snack/i)) category = 'Food'
    else if (text.match(/uber|ola|taxi|cab|auto|transport|travel|flight|train|bus/i)) category = 'Transport'
    else if (text.match(/movie|entertainment|show|concert|theater|cinema/i)) category = 'Entertainment'
    else if (text.match(/grocery|supermarket|mart|store|shop|market/i)) category = 'Groceries'
    else if (text.match(/bill|utility|electricity|water|gas|internet|phone/i)) category = 'Bills'
    
    // Extract a meaningful description
    let description = '';
    
    // Find food items (words before or after meal indicators)
    const foodMatch = text.match(/(?:\w+\s+for\s+(?:lunch|dinner|breakfast)|(?:ate|bought|had|ordered)\s+(\w+(?:\s+\w+){0,3}))/i);
    
    if (foodMatch) {
      // Get the food item and context
      description = foodMatch[0];
    } else {
      // Fallback: Remove the amount part and take a reasonable snippet
      description = text.replace(/(?:RS|INR|Rs|rs)\.?\s?\d+(?:\.\d+)?/i, '').trim();
      
      // Limit description length
      if (description.length > 50) {
        description = description.substring(0, 47) + '...';
      }
    }
    
    const expense = new Expense({
      date: new Date(),
      description,
      amount,
      category
    })
    
    await expense.save()
    res.status(201).json(expense)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

// Get total by category
app.get('/expenses/stats/by-category', async (req, res) => {
  try {
    const stats = await Expense.aggregate([
      { $group: { _id: '$category', total: { $sum: '$amount' } } },
      { $sort: { total: -1 } }
    ])
    res.json(stats)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Get total for last 7 days
app.get('/expenses/stats/last-seven-days', async (req, res) => {
  try {
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    
    const total = await Expense.aggregate([
      { $match: { date: { $gte: sevenDaysAgo } } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ])
    
    res.json({ total: total.length > 0 ? total[0].total : 0 })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Start the server
const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})

