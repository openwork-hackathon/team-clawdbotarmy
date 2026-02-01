import { useState, useEffect } from 'react';

export default function Dashboard() {
  const [prices, setPrices] = useState(null);
  const [signal, setSignal] = useState('HOLD');

  useEffect(() => {
    // Fetch data on mount
    fetch('/api/dashboard')
      .then(r => r.json())
      .then(d => {
        setPrices(d.majorCoins);
        setSignal(d.majorCoins[0]?.signal || 'HOLD');
      });
  }, []);

  if (!prices) return <div>Loading...</div>;

  return (
    <div className="dashboard">
      <h1>🦞 ClawdbotArmy Trading Platform</h1>
      <div className="signals">
        {prices.map(c => (
          <div key={c.id} className={`signal ${c.signal.toLowerCase()}`}>
            <h3>{c.id.toUpperCase()}</h3>
            <p>${c.price?.toFixed(2)}</p>
            <span className="badge">{c.signal}</span>
            <small>RSI: {c.rsi?.toFixed(0)}</small>
          </div>
        ))}
      </div>
    </div>
  );
}
