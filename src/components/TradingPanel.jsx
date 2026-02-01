import { useState } from 'react';

export default function TradingPanel() {
  const [symbol, setSymbol] = useState('BTC');
  const [side, setSide] = useState('BUY');
  const [amount, setAmount] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const prices = { 
    BTC: 78000, 
    ETH: 2400, 
    SOL: 105,
    ARYA: 0.000001 // Placeholder for new token
  };
  const aryaAddress = '0xcc78a1F8eCE2ce5ff78d2C0D0c8268ddDa5B6B07';
  const estimatedAmount = amount ? (parseFloat(amount) / prices[symbol]).toFixed(6) : '0';

  const executeTrade = async () => {
    if (!amount || parseFloat(amount) <= 0) return;
    
    setLoading(true);
    setResult(null);
    
    try {
      const r = await fetch('/api/trade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symbol, side, amount })
      });
      const data = await r.json();
      setResult(data);
      if (data.orderId) {
        setAmount('');
      }
    } catch (e) {
      setResult({ error: e.message });
    }
    
    setLoading(false);
  };

  return (
    <div className="trading-panel">
      <h2>🚀 Quick Trade</h2>
      
      <div className="trade-form">
        <div className="form-row">
          <select value={symbol} onChange={e => setSymbol(e.target.value)}>
            <option value="BTC">🟠 Bitcoin</option>
            <option value="ETH">🔵 Ethereum</option>
            <option value="SOL">🟣 Solana</option>
            <option value="ARYA">🦞 ARYA (NEW!)</option>
          </select>
          
          <div className="side-buttons">
            <button 
              className={side === 'BUY' ? 'active buy' : ''}
              onClick={() => setSide('BUY')}
            >
              🟢 BUY
            </button>
            <button 
              className={side === 'SELL' ? 'active sell' : ''}
              onClick={() => setSide('SELL')}
            >
              🔴 SELL
            </button>
          </div>
        </div>
        
        <div className="form-row">
          <div className="input-wrapper">
            <label>Amount (USD)</label>
            <input
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              min="0"
              step="0.01"
            />
          </div>
          
          <div className="input-wrapper">
            <label>Est. {symbol}</label>
            <input
              type="text"
              value={estimatedAmount}
              disabled
              className="disabled"
            />
          </div>
        </div>
        
        <div className="price-info">
          <span>Current Price:</span>
          <span>${prices[symbol]?.toLocaleString()}</span>
        </div>
        
        <button 
          className={`execute ${side.toLowerCase()}`} 
          onClick={executeTrade}
          disabled={loading || !amount}
        >
          {loading ? '⏳ Processing...' : `${side} ${amount ? '$' + parseFloat(amount).toFixed(2) : ''} ${symbol}`}
        </button>
      </div>

      {result && result.status === 'loading' && (
        <div className="loading">
          <div className="spinner-small"></div>
          Processing your trade...
        </div>
      )}
      
      {result && result.orderId && (
        <div className="success">
          <div className="success-icon">✅</div>
          <div className="success-details">
            <strong>Order Submitted!</strong>
            <p>#{result.orderId}</p>
            <small>{result.side} {result.amount} {result.symbol} @ ${result.price}</small>
          </div>
        </div>
      )}
      
      {result && result.error && (
        <div className="error">
          <span>❌</span> {result.error}
        </div>
      )}
      
      <div className="trade-disclaimer">
        <small>⚠️ Demo mode - Connect Bankr for real trading</small>
      </div>
    </div>
  );
}
