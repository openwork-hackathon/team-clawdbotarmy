import { useState, useEffect } from 'react';

export default function MarketOverview() {
  const [marketData, setMarketData] = useState(null);
  const [gainers, setGainers] = useState([]);
  const [losers, setLosers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch market data
        const r = await fetch('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=20&page=1');
        const data = await r.json();
        
        setMarketData(data[0]); // Bitcoin as market overview
        
        // Sort by 24h change for gainers/losers
        const sorted = [...data].sort((a, b) => b.price_change_percentage_24h - a.price_change_percentage_24h);
        setGainers(sorted.slice(0, 3));
        setLosers(sorted.slice(-3).reverse());
      } catch (e) {
        console.error('Market overview error:', e);
      }
      setLoading(false);
    };

    fetchData();
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="market-overview">
        <div className="market-loading">
          <div className="spinner"></div>
          <span>Loading market data...</span>
        </div>
      </div>
    );
  }

  if (!marketData) return null;

  const btc = marketData;
  const isPositive = btc.price_change_percentage_24h >= 0;

  return (
    <div className="market-overview">
      <div className="market-header">
        <div className="main-pair">
          <div className="pair-info">
            <span className="pair-name">BTC/USDT</span>
            <span className="pair-price">${btc.current_price?.toLocaleString()}</span>
            <span className={`pair-change ${isPositive ? 'up' : 'down'}`}>
              {isPositive ? '+' : ''}{btc.price_change_percentage_24h?.toFixed(2)}% (24h)
            </span>
          </div>
        </div>
        
        <div className="market-stats">
          <div className="stat">
            <span className="stat-label">24h High</span>
            <span className="stat-value">${btc.high_24h?.toLocaleString()}</span>
          </div>
          <div className="stat">
            <span className="stat-label">24h Low</span>
            <span className="stat-value">${btc.low_24h?.toLocaleString()}</span>
          </div>
          <div className="stat">
            <span className="stat-label">24h Volume</span>
            <span className="stat-value">${(btc.total_volume / 1000000).toFixed(1)}M</span>
          </div>
          <div className="stat">
            <span className="stat-label">Market Cap</span>
            <span className="stat-value">${(btc.market_cap / 1000000000).toFixed(2)}B</span>
          </div>
        </div>
      </div>

      <div className="market-sections">
        <div className="section gainers">
          <h4>🚀 Top Gainers</h4>
          <div className="mini-list">
            {gainers.map(coin => (
              <div key={coin.id} className="mini-item">
                <div className="mini-info">
                  <span className="mini-name">{coin.symbol.toUpperCase()}</span>
                  <span className="mini-price">${coin.current_price?.toLocaleString()}</span>
                </div>
                <span className="mini-change up">+{coin.price_change_percentage_24h?.toFixed(2)}%</span>
              </div>
            ))}
          </div>
        </div>

        <div className="section losers">
          <h4>📉 Top Losers</h4>
          <div className="mini-list">
            {losers.map(coin => (
              <div key={coin.id} className="mini-item">
                <div className="mini-info">
                  <span className="mini-name">{coin.symbol.toUpperCase()}</span>
                  <span className="mini-price">${coin.current_price?.toLocaleString()}</span>
                </div>
                <span className="mini-change down">{coin.price_change_percentage_24h?.toFixed(2)}%</span>
              </div>
            ))}
          </div>
        </div>

        <div className="section quick-stats">
          <h4>📊 Market Stats</h4>
          <div className="stats-grid">
            <div className="stat-item">
              <span>BTC Dominance</span>
              <span className="value">{(btc.market_cap / 1000000000 / 2200).toFixed(1)}%</span>
            </div>
            <div className="stat-item">
              <span>Fear & Greed</span>
              <span className="value neutral">62 (Greed)</span>
            </div>
            <div className="stat-item">
              <span>Open Interest</span>
              <span className="value">$12.4B</span>
            </div>
            <div className="stat-item">
              <span>Long/Short</span>
              <span className="value up">52% / 48%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
