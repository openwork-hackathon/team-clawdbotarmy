import { useState, useEffect } from 'react';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const r = await fetch('/api/dashboard');
        const d = await r.json();
        setData(d);
      } catch (e) {
        console.error('Dashboard error:', e);
      }
      setLoading(false);
    };

    fetchData();
    const interval = setInterval(fetchData, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="dashboard">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading market data...</p>
        </div>
      </div>
    );
  }

  if (!data?.majorCoins) {
    return (
      <div className="dashboard">
        <div className="error-state">
          <p>❌ Failed to load market data</p>
          <button onClick={() => window.location.reload()}>Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>📊 Market Signals</h2>
        <span className="last-updated">
          Updated: {new Date(data.updatedAt).toLocaleTimeString()}
        </span>
      </div>
      
      <div className="signals-grid">
        {data.majorCoins.map(c => (
          <div key={c.id} className={`signal-card ${c.signal.toLowerCase()}`}>
            <div className="signal-header">
              <h3>{c.id.toUpperCase()}</h3>
              <span className={`badge ${c.signal.toLowerCase()}`}>{c.signal}</span>
            </div>
            
            <div className="signal-price">
              <span className="price">${c.price?.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
              <span className={`change ${c.change24h >= 0 ? 'up' : 'down'}`}>
                {c.change24h >= 0 ? '↑' : '↓'} {Math.abs(c.change24h || 0).toFixed(2)}%
              </span>
            </div>
            
            <div className="signal-indicators">
              <div className="indicator">
                <span className="label">RSI</span>
                <span className={`value ${c.rsi < 30 ? 'oversold' : c.rsi > 70 ? 'overbought' : ''}`}>
                  {c.rsi?.toFixed(0)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {data.trending?.length > 0 && (
        <div className="trending-section">
          <h3>🔥 Trending on CoinGecko</h3>
          <div className="trending-list">
            {data.trending.slice(0, 5).map(coin => (
              <span key={coin.id} className="trending-item">
                #{coin.marketCapRank} {coin.name}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
