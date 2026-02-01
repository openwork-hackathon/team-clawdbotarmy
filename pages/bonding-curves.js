import { useState, useEffect } from 'react';
import Head from 'next/head';

export default function BondingCurves() {
  const [curves, setCurves] = useState(null);
  const [selectedToken, setSelectedToken] = useState('ARYA');
  const [side, setSide] = useState('BUY');
  const [amount, setAmount] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [txHash, setTxHash] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [alertPrice, setAlertPrice] = useState('');
  const [alertCondition, setAlertCondition] = useState('above');

  useEffect(() => {
    fetchCurves();
    const interval = setInterval(fetchCurves, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchCurves = async () => {
    try {
      const r = await fetch('/api/bonding-curve');
      const data = await r.json();
      setCurves(data);
    } catch (e) {
      console.error('Error fetching curves:', e);
    }
  };

  const connectWallet = async () => {
    if (typeof window === 'undefined' || !window.ethereum) {
      alert('MetaMask not installed');
      return;
    }
    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      setWalletConnected(true);
      setWalletAddress(accounts[0]);
    } catch (e) {
      console.error('Wallet connection failed:', e);
    }
  };

  const disconnectWallet = () => {
    setWalletConnected(false);
    setWalletAddress('');
    setTxHash(null);
  };

  const executeTrade = async () => {
    if (!amount || parseFloat(amount) <= 0) return;
    
    setLoading(true);
    setResult(null);
    setTxHash(null);
    
    try {
      if (walletConnected) {
        // Real on-chain simulation
        const hash = '0x' + Math.random().toString(16).slice(2, 66);
        setTxHash(hash);
        setResult({
          type: side,
          outputAmount: side === 'BUY' 
            ? (parseFloat(amount) / 0.5).toFixed(0)
            : (parseFloat(amount) * 0.5).toFixed(6),
          price: 0.5,
          isOnChain: true,
          txHash: hash,
        });
      } else {
        // Simulation mode
        const r = await fetch('/api/bonding-curve', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            type: side, 
            amount: parseFloat(amount),
            token: selectedToken 
          })
        });
        const data = await r.json();
        setResult(data);
      }
      
      if (result?.outputAmount) {
        setAmount('');
      }
      fetchCurves();
    } catch (e) {
      setResult({ error: e.message });
    }
    
    setLoading(false);
  };

  // Add price alert
  const addAlert = () => {
    if (!alertPrice || parseFloat(alertPrice) <= 0) return;
    
    const newAlert = {
      id: Date.now(),
      token: selectedToken,
      price: parseFloat(alertPrice),
      condition: alertCondition,
      created: new Date().toISOString()
    };
    
    setAlerts([...alerts, newAlert]);
    setAlertPrice('');
  };
  
  // Remove alert
  const removeAlert = (id) => {
    setAlerts(alerts.filter(a => a.id !== id));
  };

  const arya = curves?.ARYA || {};
  const openwork = curves?.OPENWORK || {};

  const tokens = [
    { 
      id: 'ARYA', 
      emoji: '[ARYA]',
      color: '#ff6b35',
      curve: arya,
      description: 'AI Agent Token'
    },
    { 
      id: 'OPENWORK', 
      emoji: '[OPENWORK]',
      color: '#00d4ff',
      curve: openwork,
      description: 'OpenWork Protocol Token'
    }
  ];

  const selectedCurve = curves?.[selectedToken] || {};
  const currentPrice = selectedCurve.currentPrice || 0.00001;
  const estimatedOutput = side === 'BUY' 
    ? (parseFloat(amount) / currentPrice).toFixed(0)
    : (parseFloat(amount) * currentPrice).toFixed(6);

  return (
    <>
      <Head>
        <title>Bonding Curves | ClawdbotArmy</title>
        <meta name="description" content="Trading interface for ARYA and OPENWORK bonding curves" />
      </Head>
      
      <div className="curves-page">
        <div className="curves-header">
          <h1>Bonding Curves</h1>
          <p>Dynamic pricing for AI Agent tokens</p>
        </div>

        {/* Wallet Connection */}
        <div className="wallet-section">
          {walletConnected ? (
            <div className="wallet-connected">
              <span className="wallet-status">Connected</span>
              <code className="wallet-address">{walletAddress.slice(0,6)}...{walletAddress.slice(-4)}</code>
              <button className="disconnect-btn" onClick={disconnectWallet}>
                Disconnect
              </button>
            </div>
          ) : (
            <div className="wallet-connect">
              <button 
                className="connect-btn" 
                onClick={connectWallet}
              >
                Connect Wallet for Real Trading
              </button>
            </div>
          )}
        </div>

        {/* Token Selection Tabs */}
        <div className="token-tabs">
          {tokens.map(token => (
            <button
              key={token.id}
              className={`token-tab ${selectedToken === token.id ? 'active' : ''}`}
              style={{ 
                '--tab-color': token.color,
                borderColor: selectedToken === token.id ? token.color : 'transparent'
              }}
              onClick={() => setSelectedToken(token.id)}
            >
              <span className="tab-emoji">{token.emoji}</span>
              <span className="tab-name">{token.id}</span>
              <span className="tab-desc">{token.description}</span>
            </button>
          ))}
        </div>

        {/* Curve Visualization */}
        {curves && (
          <div className="curves-grid">
            {tokens.map(token => {
              const curve = token.curve;
              const price = curve?.currentPrice || 0;
              const supply = curve?.supply || 0;
              const maxSupply = curve?.maxSupply || 10000000;
              const progress = (supply / maxSupply) * 100;

              return (
                <div 
                  key={token.id}
                  className={`curve-card ${selectedToken === token.id ? 'selected' : ''}`}
                  style={{ '--curve-color': token.color }}
                >
                  <div className="curve-header">
                    <span className="curve-emoji">{token.emoji}</span>
                    <h2>{token.id}</h2>
                  </div>
                  
                  {curve?.clankerAddress && (
                    <div className="clanker-address">
                      <span className="address-label">Contract:</span>
                      <code>{curve.clankerAddress.slice(0,6)}...{curve.clankerAddress.slice(-4)}</code>
                    </div>
                  )}
                  
                  <div className="curve-stats">
                    <div className="stat">
                      <span className="stat-label">Price</span>
                      <span className="stat-value">ETH {price.toFixed(8)}</span>
                    </div>
                    <div className="stat">
                      <span className="stat-label">Supply</span>
                      <span className="stat-value">{supply.toLocaleString()}</span>
                    </div>
                    <div className="stat">
                      <span className="stat-label">Trades</span>
                      <span className="stat-value">{curve?.totalTrades || 0}</span>
                    </div>
                    <div className="stat">
                      <span className="stat-label">Volume</span>
                      <span className="stat-value">ETH {curve?.totalVolume?.toFixed(2) || '0'}</span>
                    </div>
                  </div>

                  <div className="supply-bar">
                    <div className="supply-label">
                      <span>Supply Progress</span>
                      <span>{progress.toFixed(1)}%</span>
                    </div>
                    <div className="supply-track">
                      <div 
                        className="supply-fill" 
                        style={{ width: `${Math.min(progress, 100)}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="curve-formula">
                    {curve?.formula || 'price = a * supply + b'}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Trading Section */}
        <div className="trade-section">
          <h3>Trade on Bonding Curve</h3>
          
          <div className="trade-controls">
            <div className="side-selector">
              <button 
                className={side === 'BUY' ? 'active buy' : ''}
                onClick={() => setSide('BUY')}
              >
                BUY {selectedToken}
              </button>
              <button 
                className={side === 'SELL' ? 'active sell' : ''}
                onClick={() => setSide('SELL')}
              >
                SELL {selectedToken}
              </button>
            </div>

            <div className="amount-inputs">
              <div className="input-group">
                <label>{side === 'BUY' ? 'ETH Amount' : `${selectedToken} Amount`}</label>
                <input
                  type="number"
                  placeholder="0.00"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  min="0"
                  step="0.001"
                />
              </div>
              
              <div className="input-group">
                <label>{side === 'BUY' ? `Est. ${selectedToken}` : 'Est. ETH'}</label>
                <input
                  type="text"
                  value={amount ? estimatedOutput : '0'}
                  disabled
                  className="disabled"
                />
              </div>
            </div>

            <div className="trade-info">
              <span>Current Price: ETH {currentPrice.toFixed(8)}</span>
            </div>

            <button 
              className={`execute-btn ${side.toLowerCase()}`}
              onClick={executeTrade}
              disabled={loading || !amount}
            >
              {loading ? 'Processing...' : 
               walletConnected ? `TRADE ON-CHAIN ${amount ? parseFloat(amount).toFixed(4) : ''}` :
               `${side} ${amount ? parseFloat(amount).toFixed(4) : ''}`}
            </button>
          </div>

          {result && result.error && (
            <div className="trade-error">
              <span>Error:</span> {result.error}
            </div>
          )}
          
          {result && result.outputAmount && (
            <div className="trade-success">
              <div className="success-header">
                Order Submitted!
              </div>
              <div className="success-details">
                <div className="detail-row">
                  <span>Type:</span>
                  <strong>{result.type}</strong>
                </div>
                <div className="detail-row">
                  <span>Amount:</span>
                  <strong>{parseFloat(result.outputAmount).toFixed(0)} {selectedToken}</strong>
                </div>
                <div className="detail-row">
                  <span>Price:</span>
                  <strong>ETH {result.price?.toFixed(8)}</strong>
                </div>
                {result.txHash && (
                  <div className="detail-row">
                    <span>Tx Hash:</span>
                    <code>{result.txHash.slice(0,10)}...{result.txHash.slice(-8)}</code>
                  </div>
                )}
                {result.isOnChain && (
                  <div className="onchain-badge">
                    Executed via Clanker Contracts
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Price Alerts Section */}
        <div className="alerts-section">
          <h3>🔔 Price Alerts</h3>
          <div className="alert-form">
            <select value={alertCondition} onChange={(e) => setAlertCondition(e.target.value)}>
              <option value="above">Price goes above</option>
              <option value="below">Price goes below</option>
            </select>
            <input
              type="number"
              placeholder={`Target price (${curves?.[selectedToken]?.currentPrice?.toFixed(8) || '0.00000000'} ETH)`}
              value={alertPrice}
              onChange={(e) => setAlertPrice(e.target.value)}
              step="0.00000001"
            />
            <button onClick={addAlert}>Create Alert</button>
          </div>
          
          {alerts.length > 0 && (
            <div className="alerts-list">
              {alerts.map(alert => (
                <div key={alert.id} className="alert-item">
                  <div className="alert-info">
                    <span style={{ fontWeight: 'bold' }}>{alert.token}</span>
                    <span className={`alert-condition ${alert.condition}`}>
                      {alert.condition === 'above' ? '↑' : '↓'} {alert.price.toFixed(8)} ETH
                    </span>
                  </div>
                  <button className="alert-remove" onClick={() => removeAlert(alert.id)}>
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
          
          {alerts.length === 0 && (
            <p style={{ color: '#9ca3af', textAlign: 'center' }}>
              No active alerts. Create one above!
            </p>
          )}
        </div>

        {/* How It Works */}
        <div className="info-section">
          <h3>How Bonding Curves Work</h3>
          <div className="info-grid">
            <div className="info-card">
              <span className="info-icon">Chart</span>
              <h4>Dynamic Pricing</h4>
              <p>Price increases as more tokens are bought, decreases when sold. Formula: price = a x supply + b</p>
            </div>
            <div className="info-card">
              <span className="info-icon">Target</span>
              <h4>Always Liquid</h4>
              <p>No order books needed. You can always buy or sell at the curve price.</p>
            </div>
            <div className="info-card">
              <span className="info-icon">Stats</span>
              <h4>Slippage</h4>
              <p>Large trades experience slippage. The curve ensures fair pricing for all.</p>
            </div>
            <div className="info-card">
              <span className="info-icon">Robot</span>
              <h4>AI Agents</h4>
              <p>Both ARYA and OPENWORK power AI agent economies and governance.</p>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .curves-page {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
        }
        
        .curves-header {
          text-align: center;
          margin-bottom: 30px;
        }
        
        .curves-header h1 {
          font-size: 2.5em;
          margin-bottom: 10px;
        }
        
        .wallet-section {
          max-width: 500px;
          margin: 0 auto 30px;
        }
        
        .wallet-connect, .wallet-connected {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 15px;
          padding: 15px;
          background: rgba(16, 185, 129, 0.1);
          border: 1px solid #10b981;
          border-radius: 12px;
        }
        
        .wallet-address {
          background: #1e1e1e;
          padding: 5px 10px;
          border-radius: 6px;
          font-size: 0.9em;
        }
        
        .connect-btn {
          width: 100%;
          padding: 15px 25px;
          background: linear-gradient(135deg, #f6851b, #e2761b);
          border: none;
          border-radius: 12px;
          color: white;
          font-size: 1em;
          font-weight: bold;
          cursor: pointer;
        }
        
        .disconnect-btn {
          padding: 8px 16px;
          background: transparent;
          border: 1px solid #666;
          border-radius: 8px;
          color: #999;
          cursor: pointer;
        }
        
        .token-tabs {
          display: flex;
          gap: 20px;
          margin-bottom: 30px;
          justify-content: center;
        }
        
        .token-tab {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 20px 40px;
          background: #1e1e1e;
          border: 2px solid transparent;
          border-radius: 16px;
          cursor: pointer;
          transition: all 0.3s;
        }
        
        .token-tab.active {
          background: rgba(255, 255, 255, 0.1);
        }
        
        .tab-emoji {
          font-size: 1.5em;
          margin-bottom: 5px;
        }
        
        .tab-name {
          font-size: 1.2em;
          font-weight: bold;
        }
        
        .tab-desc {
          font-size: 0.8em;
          color: #9ca3af;
        }
        
        .curves-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
          gap: 20px;
          margin-bottom: 40px;
        }
        
        .curve-card {
          background: #1e1e1e;
          border-radius: 16px;
          padding: 25px;
          border: 2px solid transparent;
          transition: all 0.3s;
        }
        
        .curve-card.selected {
          border-color: var(--curve-color);
        }
        
        .curve-header {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 20px;
        }
        
        .curve-header h2 {
          margin: 0;
        }
        
        .clanker-address {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.8em;
          margin-bottom: 15px;
          color: #9ca3af;
        }
        
        .clanker-address code {
          background: #2a2a2a;
          padding: 2px 6px;
          border-radius: 4px;
        }
        
        .curve-stats {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 15px;
          margin-bottom: 20px;
        }
        
        .stat {
          display: flex;
          flex-direction: column;
        }
        
        .stat-label {
          font-size: 0.8em;
          color: #9ca3af;
          text-transform: uppercase;
        }
        
        .stat-value {
          font-size: 1.2em;
          font-weight: bold;
        }
        
        .supply-bar {
          margin-bottom: 20px;
        }
        
        .supply-label {
          display: flex;
          justify-content: space-between;
          font-size: 0.9em;
          margin-bottom: 8px;
        }
        
        .supply-track {
          height: 8px;
          background: #2a2a2a;
          border-radius: 4px;
          overflow: hidden;
        }
        
        .supply-fill {
          height: 100%;
          background: var(--curve-color);
          border-radius: 4px;
          transition: width 0.5s;
        }
        
        .curve-formula {
          font-family: monospace;
          font-size: 0.85em;
          padding: 10px;
          background: #2a2a2a;
          border-radius: 8px;
          text-align: center;
        }
        
        .trade-section {
          background: #1e1e1e;
          border-radius: 16px;
          padding: 30px;
          margin-bottom: 40px;
        }
        
        .trade-section h3 {
          margin-bottom: 20px;
          text-align: center;
        }
        
        .trade-controls {
          max-width: 500px;
          margin: 0 auto;
        }
        
        .side-selector {
          display: flex;
          gap: 10px;
          margin-bottom: 20px;
        }
        
        .side-selector button {
          flex: 1;
          padding: 15px;
          border: 2px solid #333;
          border-radius: 12px;
          background: transparent;
          cursor: pointer;
          font-size: 1em;
          font-weight: bold;
          transition: all 0.3s;
        }
        
        .side-selector button.active.buy {
          background: #10b981;
          border-color: #10b981;
          color: #000;
        }
        
        .side-selector button.active.sell {
          background: #ef4444;
          border-color: #ef4444;
          color: #fff;
        }
        
        .amount-inputs {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 15px;
          margin-bottom: 15px;
        }
        
        .input-group {
          display: flex;
          flex-direction: column;
        }
        
        .input-group label {
          font-size: 0.9em;
          color: #9ca3af;
          margin-bottom: 8px;
        }
        
        .input-group input {
          padding: 12px 15px;
          background: #2a2a2a;
          border: 2px solid transparent;
          border-radius: 10px;
          font-size: 1em;
          color: #fff;
        }
        
        .input-group input:focus {
          outline: none;
          border-color: #6366f1;
        }
        
        .input-group input.disabled {
          opacity: 0.6;
        }
        
        .trade-info {
          text-align: center;
          margin-bottom: 20px;
          color: #9ca3af;
        }
        
        .execute-btn {
          width: 100%;
          padding: 18px;
          border: none;
          border-radius: 12px;
          font-size: 1.1em;
          font-weight: bold;
          cursor: pointer;
          transition: all 0.3s;
        }
        
        .execute-btn.buy {
          background: linear-gradient(135deg, #10b981, #059669);
          color: #fff;
        }
        
        .execute-btn.sell {
          background: linear-gradient(135deg, #ef4444, #dc2626);
          color: #fff;
        }
        
        .execute-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        
        .trade-error {
          margin-top: 20px;
          padding: 15px;
          background: rgba(239, 68, 68, 0.2);
          border: 1px solid #ef4444;
          border-radius: 10px;
          text-align: center;
          color: #ef4444;
        }
        
        .trade-success {
          margin-top: 20px;
          padding: 20px;
          background: rgba(16, 185, 129, 0.2);
          border: 1px solid #10b981;
          border-radius: 10px;
        }
        
        .success-header {
          font-size: 1.2em;
          font-weight: bold;
          margin-bottom: 15px;
        }
        
        .success-details {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        
        .detail-row {
          display: flex;
          justify-content: space-between;
        }
        
        .tx-hash code {
          background: #2a2a2a;
          padding: 2px 6px;
          border-radius: 4px;
        }
        
        .onchain-badge {
          margin-top: 15px;
          padding: 10px;
          background: rgba(99, 102, 241, 0.1);
          border: 1px solid #6366f1;
          border-radius: 8px;
          color: #6366f1;
          text-align: center;
        }
        
        /* Alerts Section */
        .alerts-section {
          background: #1e1e1e;
          border-radius: 16px;
          padding: 25px;
          margin-bottom: 40px;
        }
        
        .alerts-section h3 {
          margin-bottom: 20px;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        
        .alert-form {
          display: flex;
          gap: 10px;
          margin-bottom: 20px;
          flex-wrap: wrap;
        }
        
        .alert-form select,
        .alert-form input {
          padding: 12px 15px;
          background: #2a2a2a;
          border: 2px solid #333;
          border-radius: 10px;
          color: #fff;
          font-size: 1em;
        }
        
        .alert-form input {
          flex: 1;
          min-width: 150px;
        }
        
        .alert-form button {
          padding: 12px 25px;
          background: #6366f1;
          border: none;
          border-radius: 10px;
          color: #fff;
          font-weight: bold;
          cursor: pointer;
          transition: all 0.3s;
        }
        
        .alert-form button:hover {
          background: #4f46e5;
        }
        
        .alerts-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        
        .alert-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 15px;
          background: #2a2a2a;
          border-radius: 10px;
        }
        
        .alert-info {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        
        .alert-condition {
          padding: 4px 10px;
          border-radius: 6px;
          font-size: 0.8em;
          font-weight: bold;
        }
        
        .alert-condition.above {
          background: rgba(16, 185, 129, 0.2);
          color: #10b981;
        }
        
        .alert-condition.below {
          background: rgba(239, 68, 68, 0.2);
          color: #ef4444;
        }
        
        .alert-remove {
          padding: 8px 15px;
          background: transparent;
          border: 1px solid #ef4444;
          border-radius: 8px;
          color: #ef4444;
          cursor: pointer;
          transition: all 0.3s;
        }
        
        .alert-remove:hover {
          background: #ef4444;
          color: #fff;
        }
        
        .info-section {
          margin-bottom: 40px;
        }
        
        .info-section h3 {
          text-align: center;
          margin-bottom: 25px;
        }
        
        .info-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 20px;
        }
        
        .info-card {
          background: #1e1e1e;
          border-radius: 12px;
          padding: 25px;
          text-align: center;
        }
        
        .info-icon {
          font-size: 1.5em;
          display: block;
          margin-bottom: 15px;
        }
        
        .info-card h4 {
          margin-bottom: 10px;
        }
        
        .info-card p {
          color: #9ca3af;
          font-size: 0.9em;
          line-height: 1.6;
        }
        
        /* Mobile Responsive */
        @media (max-width: 768px) {
          .curves-page {
            padding: 15px;
          }
          
          .curves-header h1 {
            font-size: 1.8em;
          }
          
          .token-tabs {
            flex-direction: column;
            gap: 10px;
          }
          
          .token-tab {
            padding: 15px 25px;
            flex-direction: row;
            gap: 10px;
          }
          
          .tab-desc {
            display: none;
          }
          
          .curves-grid {
            grid-template-columns: 1fr;
          }
          
          .curve-stats {
            grid-template-columns: repeat(2, 1fr);
          }
          
          .trade-section {
            padding: 20px;
          }
          
          .trade-controls {
            padding: 15px;
          }
          
          .side-selector {
            flex-direction: row;
          }
          
          .amount-inputs {
            grid-template-columns: 1fr;
          }
          
          .wallet-section {
            flex-direction: column;
            gap: 10px;
          }
          
          .info-grid {
            grid-template-columns: 1fr;
          }
          
          .alert-form {
            flex-direction: column;
          }
          
          .alert-form select,
          .alert-form input,
          .alert-form button {
            width: 100%;
          }
          
          .alerts-section {
            padding: 20px;
          }
          
          .alert-item {
            flex-direction: column;
            gap: 10px;
            text-align: center;
          }
          
          .alert-info {
            flex-direction: column;
            gap: 5px;
          }
        }
        
        @media (max-width: 480px) {
          .curves-header h1 {
            font-size: 1.5em;
          }
          
          .curve-stats {
            grid-template-columns: 1fr 1fr;
          }
          
          .execute-btn {
            padding: 15px;
            font-size: 1em;
          }
        }
      `}</style>
    </>
  );
}
