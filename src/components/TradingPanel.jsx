import { useState, useEffect } from 'react';

export default function TradingPanel() {
  const [symbol, setSymbol] = useState('ARYA');
  const [side, setSide] = useState('BUY');
  const [amount, setAmount] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [curveData, setCurveData] = useState(null);

  const tokens = [
    { id: 'ARYA', name: '🦞 ARYA', emoji: '🦞' },
    { id: 'OPENWORK', name: '⚡ OPENWORK', emoji: '⚡' }
  ];

  // Fetch bonding curve state
  useEffect(() => {
    const fetchCurve = async () => {
      try {
        const r = await fetch('/api/bonding-curve');
        const data = await r.json();
        setCurveData(data[symbol] || data);
      } catch (e) {
        console.error('Error fetching curve:', e);
      }
    };
    fetchCurve();
    const interval = setInterval(fetchCurve, 10000);
    return () => clearInterval(interval);
  }, [symbol]);

  const executeTrade = async () => {
    if (!amount || parseFloat(amount) <= 0) return;
    
    setLoading(true);
    setResult(null);
    
    try {
      const r = await fetch('/api/bonding-curve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          type: side, 
          amount: parseFloat(amount),
          token: symbol 
        })
      });
      const data = await r.json();
      setResult(data);
      if (data.outputAmount) {
        setAmount('');
      }
    } catch (e) {
      setResult({ error: e.message });
    }
    
    setLoading(false);
  };

  const currentPrice = curveData?.currentPrice || 0.00001;
  const tokenConfig = symbol === 'ARYA' 
    ? { a: 0.00001, b: 0.5, max: 10000000 }
    : { a: 0.000001, b: 0.0001, max: 50000000 };
  
  const estimatedOutput = side === 'BUY' 
    ? (parseFloat(amount) / currentPrice).toFixed(0)
    : (parseFloat(amount) * currentPrice).toFixed(6);

  return (
    <div className="trading-panel">
      <h2>🚀 Quick Trade (Bonding Curve)</h2>
      
      {curveData && (
        <div className="curve-info">
          <div className="curve-stat">
            <span className="label">Supply</span>
            <span className="value">{curveData.supply?.toLocaleString()} {symbol}</span>
          </div>
          <div className="curve-stat">
            <span className="label">Price</span>
            <span className="value">Ξ {currentPrice.toFixed(8)}</span>
          </div>
          <div className="curve-stat">
            <span className="label">Trades</span>
            <span className="value">{curveData.totalTrades}</span>
          </div>
        </div>
      )}
      
      <div className="trade-form">
        <div className="form-row">
          <select value={symbol} onChange={e => setSymbol(e.target.value)}>
            {tokens.map(t => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
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
            <label>{side === 'BUY' ? 'ETH Amount' : `${symbol} Amount`}</label>
            <input
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              min="0"
              step={side === 'BUY' ? "0.001" : "1"}
            />
          </div>
          
          <div className="input-wrapper">
            <label>{side === 'BUY' ? `Est. ${symbol}` : 'Est. ETH'}</label>
            <input
              type="text"
              value={amount ? estimatedOutput : '0'}
              disabled
              className="disabled"
            />
          </div>
        </div>
        
        <div className="price-info">
          <span>Current Price:</span>
          <span>Ξ {currentPrice.toFixed(8)}</span>
        </div>
        
        <button 
          className={`execute ${side.toLowerCase()}`} 
          onClick={executeTrade}
          disabled={loading || !amount}
        >
          {loading ? '⏳ Processing...' : `${side} ${amount ? (side === 'BUY' ? 'ETH' : symbol) + ' ' + parseFloat(amount).toFixed(4) : ''}`}
        </button>
      </div>

      {result && result.error && (
        <div className="error">
          <span>❌</span> {result.error}
        </div>
      )}
      
      {result && result.outputAmount && (
        <div className="success">
          <div className="success-icon">✅</div>
          <div className="success-details">
            <strong>Order Submitted!</strong>
            <p>{result.type} {parseFloat(result.outputAmount).toFixed(0)} {symbol}</p>
            <small>Price: Ξ {result.price?.toFixed(8)}</small>
            {result.slippage && <small>Slippage: {result.slippage}%</small>}
          </div>
        </div>
      )}
      
      <div className="trade-disclaimer">
        <small>🤖 Bonding Curve: price = a×supply + b | OpenWork Hackathon 2026</small>
      </div>
    </div>
  );
}
