import { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';

import { Pie } from 'react-chartjs-2';

// Register necessary components
ChartJS.register(ArcElement, Tooltip, Legend);


const suits = ['♠', '♥', '♦', '♣'];
const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

function drawCard() {
  const suit = suits[Math.floor(Math.random() * suits.length)];
  const value = values[Math.floor(Math.random() * values.length)];
  return { suit, value };
}

function App() {
  const [playerCard, setPlayerCard] = useState(null);
  const [computerCard, setComputerCard] = useState(null);
  const [result, setResult] = useState('');
  const [stats, setStats] = useState({ wins: 0, losses: 0 });

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('gameStats'));
    if (stored) setStats(stored);
  }, []);

  const playGame = async () => {
    const player = drawCard();
    const computer = drawCard();
    setPlayerCard(player);
    setComputerCard(computer);

    if (player.value === computer.value || player.suit === computer.suit) {
      setResult('You Win!');
      const updated = { ...stats, wins: stats.wins + 1 };
      setStats(updated);
      localStorage.setItem('gameStats', JSON.stringify(updated));
      await axios.post('http://localhost:5000/api/game', { result: 'win' });
    } else {
      setResult('You Lose!');
      const updated = { ...stats, losses: stats.losses + 1 };
      setStats(updated);
      localStorage.setItem('gameStats', JSON.stringify(updated));
      await axios.post('http://localhost:5000/api/game', { result: 'loss' });
    }
  };

  return (
    <div className="p-6 text-center">
      <h1 className="text-2xl font-bold mb-4">Card Game</h1>
      <button onClick={playGame} className="bg-blue-500 px-4 py-2 rounded text-white mb-4">Draw</button>
      <div className="flex justify-around text-xl mb-4">
        <div>Player: {playerCard ? `${playerCard.value}${playerCard.suit}` : '---'}</div>
        <div>Computer: {computerCard ? `${computerCard.value}${computerCard.suit}` : '---'}</div>
      </div>
      <div className="text-lg font-semibold">{result}</div>
      <Pie
        data={{
          labels: ['Wins', 'Losses'],
          datasets: [
            {
              data: [stats.wins, stats.losses],
              backgroundColor: ['green', 'red'],
            },
          ],
        }}
        options={{
          responsive: false,
          maintainAspectRatio: false,
          width: 200,
          height: 200,
        }}
        width={200}
        height={200}
      />
    </div>
  );
}

export default App;
