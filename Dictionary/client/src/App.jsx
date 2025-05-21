import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { Bar } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
)

const API_URL = 'http://localhost:5000'

const LoadingSpinner = () => {
  return (
    <div className="flex justify-center items-center py-8">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700"></div>
    </div>
  )
}

const WordForm = ({ onSubmit, searchTerm, setSearchTerm }) => {
  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(searchTerm)
  }

  return (
    <div className="mb-6">
      <form onSubmit={handleSubmit}>
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter a word to check..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            required
          />
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
          >
            Check
          </button>
        </div>
      </form>
    </div>
  )
}

const WordInfo = ({ result }) => {
  if (result.error) {
    return <div className="text-red-500">{result.error}</div>
  }

  return (
    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
      {result.exists ? (
        <div className="text-center">
          <span className="inline-block px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium mb-3">
            Correct Word
          </span>
          <h3 className="text-xl font-bold mb-2">{result.word.word}</h3>
          <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 max-w-xs mx-auto">
            <div>Length: <span className="font-medium">{result.word.length}</span></div>
            <div>First letter: <span className="font-medium">{result.word.firstLetter}</span></div>
          </div>
        </div>
      ) : (
        <div>
          <div className="text-center mb-4">
            <span className="inline-block px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium mb-2">
              Word Not Found
            </span>
          </div>
          
          {result.suggestions && result.suggestions.length > 0 ? (
            <div>
              <h4 className="text-md font-medium mb-2">Did you mean:</h4>
              <ul className="space-y-1">
                {result.suggestions.map((suggestion, index) => (
                  <li 
                    key={index} 
                    className="px-3 py-2 bg-blue-50 rounded-md hover:bg-blue-100 cursor-pointer"
                  >
                    {suggestion}
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="text-gray-600 text-center">No suggestions available.</p>
          )}
        </div>
      )}
    </div>
  )
}

const HistogramDisplay = ({ data }) => {
  if (!data || (!data.wordLength && !data.firstLetter)) {
    return <p>No data available for histograms</p>
  }

  const lengthChartData = {
    labels: data.wordLength?.map(item => `Length ${item.length}`),
    datasets: [
      {
        label: 'Word Count by Length',
        data: data.wordLength?.map(item => item.count),
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
      },
    ],
  }

  const letterChartData = {
    labels: data.firstLetter?.map(item => item.letter.toUpperCase()),
    datasets: [
      {
        label: 'Word Count by First Letter',
        data: data.firstLetter?.map(item => item.count),
        backgroundColor: 'rgba(255, 99, 132, 0.6)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 1,
      },
    ],
  }

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  }

  return (
    <div className="space-y-12">
      <div>
        <h3 className="text-xl font-semibold mb-4 text-center">Word Length Distribution</h3>
        <div className="h-80">
          {data.wordLength && data.wordLength.length > 0 ? (
            <Bar data={lengthChartData} options={options} />
          ) : (
            <p className="text-center text-gray-500">No word length data available</p>
          )}
        </div>
      </div>

      <div>
        <h3 className="text-xl font-semibold mb-4 text-center">First Letter Distribution</h3>
        <div className="h-80">
          {data.firstLetter && data.firstLetter.length > 0 ? (
            <Bar data={letterChartData} options={options} />
          ) : (
            <p className="text-center text-gray-500">No first letter data available</p>
          )}
        </div>
      </div>
    </div>
  )
}

const WordUpload = () => {
  const [word, setWord] = useState('')
  const [file, setFile] = useState(null)
  const [message, setMessage] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleAddWord = async (e) => {
    e.preventDefault()
    if (!word.trim()) return
    
    setLoading(true)
    try {
      await axios.post(`${API_URL}/dictionary`, { word: word.trim() })
      setMessage({ type: 'success', text: `Word "${word}" added successfully!` })
      setWord('')
    } catch (error) {
      console.error('Error adding word:', error)
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.error || 'Failed to add word'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleFileUpload = async (e) => {
    e.preventDefault()
    if (!file) return
    
    setLoading(true)
    const reader = new FileReader()
    
    reader.onload = async (event) => {
      try {
        const text = event.target.result
        const words = text.split(/[\r\n,;\s]+/)
          .filter(w => w.trim())
          .filter(w => /^[a-zA-Z]+$/.test(w))
        
        if (words.length === 0) {
          setMessage({ type: 'error', text: 'No valid words found in file' })
          setLoading(false)
          return
        }
        
        console.log(`Parsed ${words.length} words from file:`, words.slice(0, 5))
        
        await axios.post(`${API_URL}/dictionary/bulk`, { words })
        setMessage({ 
          type: 'success', 
          text: `Processed ${words.length} words from file` 
        })
        setFile(null)
        document.getElementById('file-upload').value = ''
      } catch (error) {
        console.error('Error uploading words:', error)
        setMessage({ 
          type: 'error', 
          text: error.response?.data?.error || 'Failed to upload words'
        })
      } finally {
        setLoading(false)
      }
    }
    
    reader.readAsText(file)
  }

  const clearMessage = () => {
    setMessage(null)
  }

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-xl font-semibold mb-4">Add a Word</h3>
        <form onSubmit={handleAddWord} className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter a word..."
            value={word}
            onChange={(e) => setWord(e.target.value)}
            disabled={loading}
            required
          />
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors disabled:bg-gray-400"
            disabled={loading}
          >
            {loading ? 'Adding...' : 'Add Word'}
          </button>
        </form>
      </div>

      <div>
        <h3 className="text-xl font-semibold mb-4">Upload Dictionary File</h3>
        <p className="text-sm text-gray-600 mb-3">
          Upload a text file with words separated by spaces, commas, or new lines
        </p>
        <form onSubmit={handleFileUpload} className="space-y-4">
          <input
            id="file-upload"
            type="file"
            accept=".txt,.csv"
            onChange={(e) => setFile(e.target.files[0])}
            className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-md file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-50 file:text-blue-700
              hover:file:bg-blue-100"
            disabled={loading}
          />
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors w-full disabled:bg-gray-400"
            disabled={!file || loading}
          >
            {loading ? 'Uploading...' : 'Upload'}
          </button>
        </form>
      </div>

      {message && (
        <div 
          className={`p-4 rounded-md ${
            message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}
        >
          <div className="flex justify-between">
            <p>{message.text}</p>
            <button 
              onClick={clearMessage}
              className="text-sm underline"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function App() {
  const [searchTerm, setSearchTerm] = useState('')
  const [result, setResult] = useState(null)
  const [histogramData, setHistogramData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('check')

  const checkWord = async (word) => {
    if (!word.trim()) return
    
    setLoading(true)
    try {
      const response = await axios.get(`${API_URL}/dictionary/check/${word}`)
      setResult(response.data)
    } catch (error) {
      console.error('Error checking word:', error)
      setResult({ error: 'Failed to check word' })
    } finally {
      setLoading(false)
    }
  }

  const fetchHistogramData = async () => {
    setLoading(true)
    try {
      const response = await axios.get(`${API_URL}/dictionary/histogram`)
      setHistogramData(response.data)
    } catch (error) {
      console.error('Error fetching histogram data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (activeTab === 'stats') {
      fetchHistogramData()
    }
  }, [activeTab])

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-3xl font-bold text-center mb-8 text-blue-700">
        Dictionary App
      </h1>
      
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex mb-6 border-b">
          <button 
            className={`px-4 py-2 ${activeTab === 'check' ? 'text-blue-600 border-b-2 border-blue-600 font-medium' : 'text-gray-500'}`}
            onClick={() => setActiveTab('check')}
          >
            Check Word
          </button>
          <button 
            className={`px-4 py-2 ${activeTab === 'upload' ? 'text-blue-600 border-b-2 border-blue-600 font-medium' : 'text-gray-500'}`}
            onClick={() => setActiveTab('upload')}
          >
            Upload Words
          </button>
          <button 
            className={`px-4 py-2 ${activeTab === 'stats' ? 'text-blue-600 border-b-2 border-blue-600 font-medium' : 'text-gray-500'}`}
            onClick={() => setActiveTab('stats')}
          >
            Dictionary Stats
          </button>
        </div>

        <div className="py-4">
          {activeTab === 'check' && (
            <>
              <WordForm 
                onSubmit={checkWord} 
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
              />
              
              {loading ? (
                <LoadingSpinner />
              ) : (
                result && <WordInfo result={result} />
              )}
            </>
          )}
          
          {activeTab === 'upload' && (
            <WordUpload />
          )}
          
          {activeTab === 'stats' && (
            <>
              {loading ? (
                <LoadingSpinner />
              ) : (
                histogramData ? (
                  <HistogramDisplay data={histogramData} />
                ) : (
                  <p className="text-center text-gray-500">No histogram data available</p>
                )
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default App