import React, { useRef, useEffect, useState } from 'react';

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;
const PIXEL_SIZE = 4; // Each pixel is 4x4
const STORAGE_KEY = 'mouse_track_points';
const API_URL = 'http://localhost:5000/api/mouse-events';

function getColor(count) {
  // Simple heatmap: blue (1), green (2-3), yellow (4-6), orange (7-10), red (11+)
  if (count > 10) return '#ff0000';
  if (count > 6) return '#ff9900';
  if (count > 3) return '#ffff00';
  if (count > 1) return '#00ff00';
  return '#00bfff';
}

function loadPoints() {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : {};
}

function savePoints(points) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(points));
}

function App() {
  const canvasRef = useRef(null);
  const [points, setPoints] = useState({});
  const [replaying, setReplaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [history, setHistory] = useState([{}]);
  const [historyIndex, setHistoryIndex] = useState(0);

  // Save events to server periodically
  useEffect(() => {
    const interval = setInterval(async () => {
      const events = Object.entries(points).map(([key, count]) => {
        const [x, y] = key.split(',').map(Number);
        return { x, y, count };
      });
      try {
        await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ events }),
        });
      } catch (err) {
        console.error('Failed to save events:', err);
      }
    }, 5000); // Save every 5 seconds
    return () => clearInterval(interval);
  }, [points]);

  // Draw all points
  useEffect(() => {
    const ctx = canvasRef.current.getContext('2d');
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    Object.entries(points).forEach(([key, count]) => {
      const [x, y] = key.split(',').map(Number);
      ctx.fillStyle = getColor(count);
      ctx.fillRect(x, y, PIXEL_SIZE, PIXEL_SIZE);
    });
  }, [points]);

  // Mouse move handler
  function handleMouseMove(e) {
    if (replaying || isPaused) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / PIXEL_SIZE) * PIXEL_SIZE;
    const y = Math.floor((e.clientY - rect.top) / PIXEL_SIZE) * PIXEL_SIZE;
    const key = `${x},${y}`;
    setPoints(prev => {
      const next = { ...prev, [key]: (prev[key] || 0) + 1 };
      savePoints(next);
      setHistory(prevHistory => [...prevHistory.slice(0, historyIndex + 1), next]);
      setHistoryIndex(prevIndex => prevIndex + 1);
      return next;
    });
  }

  // Mouse down handler
  function handleMouseDown() {
    setIsPaused(true);
  }

  // Mouse up handler
  function handleMouseUp() {
    setIsPaused(false);
  }

  // Clear canvas and storage
  function handleClear() {
    setPoints({});
    savePoints({});
    setHistory([{}]);
    setHistoryIndex(0);
  }

  // Replay mouse path
  async function handleReplay() {
    setReplaying(true);
    const ctx = canvasRef.current.getContext('2d');
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    const entries = Object.entries(points);
    for (let i = 0; i < entries.length; i++) {
      const [key, count] = entries[i];
      const [x, y] = key.split(',').map(Number);
      ctx.fillStyle = getColor(count);
      ctx.fillRect(x, y, PIXEL_SIZE, PIXEL_SIZE);
      // Delay for animation effect
      await new Promise(res => setTimeout(res, 2));
    }
    setReplaying(false);
  }

  // Undo function
  function handleUndo() {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setPoints(history[newIndex]);
      savePoints(history[newIndex]);
    }
  }

  // Redo function
  function handleRedo() {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setPoints(history[newIndex]);
      savePoints(history[newIndex]);
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900">
      <h1 className="text-3xl font-bold text-white mb-2">Mouse Track Canvas</h1>
      <p className="text-gray-400 mb-4">Hold to pause, release to draw. Color intensity shows visit frequency.</p>
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        style={{ border: '2px solid #fff', background: '#222', cursor: 'crosshair' }}
        onMouseMove={handleMouseMove}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
      />
      <div className="mt-4 flex gap-2">
        <button onClick={handleUndo} className="bg-gray-600 text-white px-4 py-2 rounded">Undo</button>
        <button onClick={handleRedo} className="bg-gray-600 text-white px-4 py-2 rounded">Redo</button>
        <button onClick={handleClear} className="bg-red-600 text-white px-4 py-2 rounded">Clear</button>
        <button onClick={handleReplay} className="bg-blue-600 text-white px-4 py-2 rounded" disabled={replaying}>Replay</button>
      </div>
    </div>
  );
}

export default App;