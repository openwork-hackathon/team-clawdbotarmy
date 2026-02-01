import { useState } from 'react';

export default function Portfolio({ holdings = [] }) {
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [portfolio, setPortfolio] = useState(null);

  const fetchPortfolio = async () => {
    if (!address) return;
    setLoading(true);
    try {
      const r = await fetch(`/api/portfolio?address=${address}`);
      const data = await r.json();
      setPortfolio(data);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  return (
    <div className="portfolio-tracker">
      <h2>💰 Portfolio Tracker</h2>
      
      <div className="input-group">
        <input
          type="text"
          placeholder="Wallet address (0x...)"
          value={address}
          onChange={e => setAddress(e.target.value)}
        />
        <button onClick={fetchPortfolio} disabled={loading}>
          {loading ? 'Loading...' : 'Fetch'}
        </button>
      </div>

      {portfolio && (
        <div className="portfolio-details">
          <div className="total-value">
            <h3>Total Value</h3>
            <p className="big">${portfolio.totalValue?.toFixed(2)}</p>
          </div>
          
          {portfolio.holdings?.map((h, i) => (
            <div key={i} className="holding-item">
              <span className="token">{h.symbol}</span>
              <span className="amount">{h.amount?.toFixed(4)}</span>
              <span className="value">${h.value?.toFixed(2)}</span>
              <span className={`change ${h.change24h >= 0 ? 'green' : 'red'}`}>
                {h.change24h >= 0 ? '+' : ''}{h.change24h?.toFixed(2)}%
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
