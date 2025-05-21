const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const fs = require('fs')
const path = require('path')
const { MongoClient } = require('mongodb')
const { seedDictionary } = require('./seed-dictionary')

const app = express()
app.use(cors())
app.use(express.json())

// Only using local MongoDB instance
const LOCAL_MONGO_URI = 'mongodb://localhost:27017/dictionary'
const MONGO_URI = LOCAL_MONGO_URI
const API_URL = 'http://localhost:5000'

mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log(`MongoDB connected to local database`))
  .catch(err => console.error('MongoDB connection error:', err))

const dictionarySchema = new mongoose.Schema({
  word: { type: String, required: true, unique: true },
  length: { type: Number },
  firstLetter: { type: String }
})

const Dictionary = mongoose.model('Dictionary', dictionarySchema)

app.post('/dictionary/bulk', async (req, res) => {
  try {
    const { words } = req.body
    
    if (!words || !Array.isArray(words) || words.length === 0) {
      return res.status(400).json({ error: 'Invalid words array provided' })
    }
    
    const validWords = words.filter(word => 
      typeof word === 'string' && word.trim().length > 0
    )
    
    if (validWords.length === 0) {
      return res.status(400).json({ error: 'No valid words found in the input' })
    }
    
    console.log(`Processing ${validWords.length} words`)
    
    const wordsToInsert = validWords.map(word => ({
      word: word.toLowerCase(),
      length: word.length,
      firstLetter: word.charAt(0).toLowerCase()
    }))
    
    try {
      await Dictionary.insertMany(wordsToInsert, { ordered: false })
      res.status(201).json({ 
        message: 'Words added successfully',
        count: validWords.length 
      })
    } catch (dbError) {
      if (dbError.code === 11000 || dbError.writeErrors) {
        const errorCount = dbError.writeErrors?.length || 1
        const insertedCount = validWords.length - errorCount
        console.log(`Inserted ${insertedCount} words, ${errorCount} duplicates skipped`)
        res.status(201).json({ 
          message: `Words processed: ${insertedCount} added, ${errorCount} duplicates skipped`,
          count: insertedCount
        })
      } else {
        throw dbError
      }
    }
  } catch (error) {
    console.error('Bulk upload error:', error)
    res.status(500).json({ error: 'Failed to process words' })
  }
})

app.post('/dictionary', async (req, res) => {
  try {
    const { word } = req.body
    const wordDoc = new Dictionary({ 
      word: word.toLowerCase(),
      length: word.length,
      firstLetter: word.charAt(0).toLowerCase()
    })
    await wordDoc.save()
    res.status(201).json(wordDoc)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

app.get('/dictionary/check/:word', async (req, res) => {
  try {
    const word = req.params.word.toLowerCase()
    const wordExists = await Dictionary.findOne({ word })
    
    if (wordExists) {
      res.json({ exists: true, word: wordExists })
    } else {
      const nearestMatches = await Dictionary.find({
        $or: [
          { word: { $regex: `^${word.substring(0, Math.max(word.length - 1, 1))}` } },
          { word: { $regex: `${word.substring(1)}$` } }
        ]
      }).limit(5)
      
      res.json({ 
        exists: false, 
        suggestions: nearestMatches.map(match => match.word) 
      })
    }
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

app.get('/dictionary/histogram', async (req, res) => {
  try {
    const lengthPipeline = [
      { $group: { _id: "$length", count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]
    
    const letterPipeline = [
      { $group: { _id: "$firstLetter", count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]
    
    const [lengthHistogram, letterHistogram] = await Promise.all([
      Dictionary.aggregate(lengthPipeline),
      Dictionary.aggregate(letterPipeline)
    ])
    
    res.json({
      wordLength: lengthHistogram.map(item => ({ length: item._id, count: item.count })),
      firstLetter: letterHistogram.map(item => ({ letter: item._id, count: item.count }))
    })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

async function initializeLocalDB() {
  const uri = 'mongodb://localhost:27017'
  const dbName = 'dictionary'
  const client = new MongoClient(uri)

  try {
    await client.connect()
    console.log('Connected to MongoDB server')

    const db = client.db(dbName)
    
    try {
      await db.createCollection('dictionaries', {
        validator: {
          $jsonSchema: {
            bsonType: 'object',
            required: ['word', 'length', 'firstLetter'],
            properties: {
              word: {
                bsonType: 'string',
                description: 'must be a string and is required'
              },
              length: {
                bsonType: 'int',
                description: 'must be an integer and is required'
              },
              firstLetter: {
                bsonType: 'string',
                description: 'must be a string and is required'
              }
            }
          }
        }
      })
      console.log('Dictionary collection created with validation rules')
    } catch (e) {
      if (e.codeName === 'NamespaceExists') {
        console.log('Dictionary collection already exists')
      } else {
        throw e
      }
    }
    
    await db.collection('dictionaries').createIndex({ word: 1 }, { unique: true })
    console.log('Created unique index on word field')
    console.log('Local MongoDB database initialized successfully!')
  } catch (err) {
    console.error('Error initializing database:', err)
  } finally {
    await client.close()
  }
}

const PORT = 5000
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})

if (process.argv[2] === 'seed') {
  seedDictionary()
} else if (process.argv[2] === 'init') {
  initializeLocalDB()
}

module.exports = { app, initializeLocalDB }