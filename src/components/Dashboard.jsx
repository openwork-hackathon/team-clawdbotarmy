import { useState, useEffect } from 'react';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const r = await fetch('/api/dashboard');
        if (!r.ok) throw new Error('Failed to fetch');
        const d = await r.json();
        setData(d);
        setLastUpdated(new Date());
        setError(null);
      } catch (e) {
        console.error('Dashboard error:', e);
        setError(e.message);
      }
      setLoading(false);
    };

    fetchData();
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, []);

  const getSignalColor = (signal) => {
    switch (signal) {
      case 'BUY': return 'signal-buy';
      case 'SELL': return 'signal-sell';
      case 'STRONG_BUY': return 'signal-strong-buy';
      case 'STRONG_SELL': return 'signal-strong-sell';
      default: return 'signal-hold';
    }
  };

  const getSignalBg = (signal) => {
    switch (signal) {
      case 'BUY': return 'rgba(16, 185, 129, 0.15)';
      case 'SELL': return 'rgba(239, 68, 68, 0.15)';
      case 'STRONG_BUY': return 'rgba(16, 185, 129, 0.25)';
      case 'STRONG_SELL': return 'rgba(239, 68, 68, 0.25)';
      default: return 'rgba(251, 191, 36, 0.1)';
    }
  };

  const getRsiColor = (rsi) => {
    if (rsi < 30) return '#10b981';
    if (rsi > 70) return '#ef4444';
    return '#fbbf24';
  };

  if (loading) {
    return (
      <div className="dashboard">
        <div className="dashboard-header">
          <h2>📊 Market Signals</h2>
        </div>
        <div className="signals-grid">
          {[1, 2, 3].map(i => (
            <div key={i} className="signal-card skeleton">
              <div className="skeleton-line title"></div>
              <div className="skeleton-line price"></div>
              <div className="skeleton-line small"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard">
        <div className="error-state">
          <span className="error-icon">⚠️</span>
          <p>Failed to load market data</p>
          <small>{error}</small>
          <button className="retry-btn" onClick={() => window.location.reload()}>
            🔄 Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>📊 Market Signals</h2>
        {lastUpdated && (
          <span className="last-updated">
            🔄 {lastUpdated.toLocaleTimeString()}
          </span>
        )}
      </div>
      
      <div className="signals-grid">
        {data.majorCoins.map(c => (
          <div 
            key={c.id} 
            className={`signal-card ${getSignalColor(c.signal)}`}
            style={{ background: getSignalBg(c.signal) }}
          >
            <div className="signal-header">
              <div className="coin-info">
                <span className="coin-icon">
                  {c.id === 'bitcoin' ? '₿' : c.id === 'ethereum' ? 'Ξ' : '◎'}
                </span>
                <h3>{c.id.toUpperCase()}</h3>
              </div>
              <span 
                className={`badge ${getSignalColor(c.signal)}`}
              >
                {c.signal.replace('_', ' ')}
              </span>
            </div>
            
            <div className="signal-price">
              <span className="price">
                ${c.price?.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
              </span>
              <span className={`change ${c.change24h >= 0 ? 'up' : 'down'}`}>
                {c.change24h >= 0 ? '↑' : '↓'} 
                {Math.abs(c.change24h || 0).toFixed(2)}%
              </span>
            </div>
            
            <div className="signal-indicators">
              <div className="indicator">
                <span className="label">RSI</span>
                <span 
                  className="value"
                  style={{ color: getRsiColor(c.rsi) }}
                >
                  {c.rsi?.toFixed(0)}
                </span>
                <div className="rsi-bar">
                  <div 
                    className="rsi-fill"
                    style={{ 
                      width: `${Math.min(c.rsi, 100)}%`,
                      background: getRsiColor(c.rsi)
                    }}
                  ></div>
                </div>
              </div>
              <div className="indicator">
                <span className="label">Vol</span>
                <span className="value small">
                  ${(c.volume24h / 1e9).toFixed(1)}B
                </span>
              </div>
            </div>
            
            <div className="signal-action">
              {c.signal.includes('BUY') && c.rsi < 50 && (
                <button className="action-btn buy">💰 Buy Signal</button>
              )}
              {c.signal.includes('SELL') && c.rsi > 50 && (
                <button className="action-btn sell">📤 Sell Signal</button>
              )}
            </div>
          </div>
        ))}
      </div>

      {data.trending?.length > 0 && (
        <div className="trending-section">
          <h3>🔥 Trending on CoinGecko</h3>
          <div className="trending-list">
            {data.trending.slice(0, 5).map(coin => (
              <div key={coin.id} className="trending-item">
                <span className="rank">#{coin.marketCapRank}</span>
                <span className="name">{coin.name}</span>
                <span className="symbol">{coin.symbol}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
