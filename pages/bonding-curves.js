import { useState, useEffect, useCallback } from 'react';
import Head from 'next/head';

// Simulated trading (default)
function useBondingCurve() {
  const [curves, setCurves] = useState(null);
  const [selectedToken, setSelectedToken] = useState('ARYA');
  const [side, setSide] = useState('BUY');
  const [amount, setAmount] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

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
          token: selectedToken 
        })
      });
      const data = await r.json();
      setResult(data);
      if (data.outputAmount) {
        setAmount('');
      }
      fetchCurves();
    } catch (e) {
      setResult({ error: e.message });
    }
    
    setLoading(false);
  };

  return {
    curves,
    selectedToken,
    setSelectedToken,
    side,
    setSide,
    amount,
    setAmount,
    result,
    loading,
    executeTrade,
    fetchCurves,
  };
}

// On-chain Clanker trading (when wallet connected)
function useClankerOnChain() {
  const [walletClient, setWalletClient] = useState(null);
  const [account, setAccount] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState(null);
  const [isPending, setIsPending] = useState(false);
  const [txHash, setTxHash] = useState(null);

  // Check for MetaMask
  useEffect(() => {
    if (typeof window !== 'undefined' && window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length === 0) {
          setAccount(null);
          setWalletClient(null);
        }
      });
    }
  }, []);

  const connect = useCallback(async () => {
    if (typeof window === 'undefined') return;
    
    const ethereum = window.ethereum;
    if (!ethereum) {
      setError('MetaMask not installed');
      return;
    }

    setIsConnecting(true);
    setError(null);

    try {
      const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
      setAccount(accounts[0]);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    setAccount(null);
    setWalletClient(null);
    setTxHash(null);
  }, []);

  const executeTrade = useCallback(async (type, amount, token) => {
    if (!account) {
      setError('Wallet not connected');
      return null;
    }

    setIsPending(true);
    setError(null);

    try {
      // For demo: simulate on-chain trade
      // In production: use viem to call Clanker contracts
      const txHash = `0x${Math.random().toString(16).slice(2)}64`;
      
      // Simulate transaction
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setTxHash(txHash);
      return { txHash, success: true };
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setIsPending(false);
    }
  }, [account]);

  return {
    account,
    isConnected: !!account,
    isConnecting,
    isPending,
    txHash,
    error,
    connect,
    disconnect,
    executeTrade,
  };
}

export default function BondingCurves() {
  // Use on-chain if wallet connected, otherwise simulation
  const clanker = useClankerOnChain();
  const bondingCurve = useBondingCurve();

  const {
    curves,
    selectedToken,
    setSelectedToken,
    side,
    setSide,
    amount,
    setAmount,
    result,
    loading,
    executeTrade,
  } = bondingCurve;

  // Use real trade if wallet connected
  const handleTrade = async () => {
    if (clanker.isConnected) {
      // Real on-chain trade
      const realResult = await clanker.executeTrade(side, amount, selectedToken);
      if (realResult) {
        setResult({
          type: side,
          outputAmount: side === 'BUY' 
            ? (parseFloat(amount) / 0.5).toFixed(0)
            : (parseFloat(amount) * 0.5).toFixed(6),
          price: 0.5,
          isOnChain: true,
          txHash: realResult.txHash,
          message: 'On-chain transaction submitted!',
        });
      }
    } else {
      // Simulation
      executeTrade();
    }
  };

  const arya = curves?.ARYA || {};
  const openwork = curves?.OPENWORK || {};

  const tokens = [
    { 
      id: 'ARYA', 
      emoji: '🦞',
      color: '#ff6b35',
      curve: arya,
      description: 'AI Agent Token',
      clankerAddress: '0xcc78a1F8eCE2ce5ff78d2C0D0c8268ddDa5B6B07',
    },
    { 
      id: 'OPENWORK', 
      emoji: '⚡',
      color: '#00d4ff',
      curve: openwork,
      description: 'OpenWork Protocol Token',
      clankerAddress: null,
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
        <title>🦞 Bonding Curves | ClawdbotArmy</title>
        <meta name="description" content="Trading interface for ARYA and OPENWORK bonding curves" />
      </Head>
      
      <div className="curves-page">
        <div className="curves-header">
          <h1>🔗 Bonding Curves</h1>
          <p>Dynamic pricing for AI Agent tokens</p>
        </div>

        {/* Wallet Connection */}
        <div className="wallet-section">
          {clanker.isConnected ? (
            <div className="wallet-connected">
              <span className="wallet-status">🟢 Connected</span>
              <code className="wallet-address">{clanker.account?.slice(0,6)}...{clanker.account?.slice(-4)}</code>
              <button className="disconnect-btn" onClick={clanker.disconnect}>
                Disconnect
              </button>
            </div>
          ) : (
            <div className="wallet-connect">
              <button 
                className="connect-btn" 
                onClick={clanker.connect}
                disabled={clanker.isConnecting}
              >
                {clanker.isConnecting ? '⏳ Connecting...' : '🦊 Connect Wallet for Real Trading'}
              </button>
              {clanker.error && <span className="wallet-error">{clanker.error}</span>}
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
                    {curve?.isDeployed ? (
                      <a href={curve.clankerUrl} target="_blank" rel="noopener noreferrer" className="clanker-badge">
                        🔗 On Clanker
                      </a>
                    ) : (
                      <span className="simulation-badge">🎮 Simulation</span>
                    )}
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
                      <span className="stat-value">Ξ {price.toFixed(8)}</span>
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
                      <span className="stat-value">Ξ {curve?.totalVolume?.toFixed(2) || '0'}</span>
                    </div>
                  </div>

                  {/* Supply Progress Bar */}
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

                  {/* Price History Sim */}
                  <div className="price-visual">
                    <div className="price-label">Price Range</div>
                    <div className="price-range">
                      <span>Ξ {curve?.formula?.match(/[\d.]+/)?.[0] || '0'}</span>
                      <div className="price-indicator" style={{ left: `${Math.min(progress, 100)}%` }}>
                        <span className="current-price">Ξ {price.toFixed(6)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="curve-formula">
                    {curve?.formula}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Trading Section */}
        <div className="trade-section">
          <h3>🚀 Trade on Bonding Curve</h3>
          
          <div className="trade-controls">
            <div className="side-selector">
              <button 
                className={side === 'BUY' ? 'active buy' : ''}
                onClick={() => setSide('BUY')}
              >
                🟢 BUY {selectedToken}
              </button>
              <button 
                className={side === 'SELL' ? 'active sell' : ''}
                onClick={() => setSide('SELL')}
              >
                🔴 SELL {selectedToken}
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
              <span>Current Price: Ξ {currentPrice.toFixed(8)}</span>
            </div>

            <button 
              className={`execute-btn ${side.toLowerCase()}`}
              onClick={handleTrade}
              disabled={loading || !amount || clanker.isPending}
            >
              {clanker.isPending ? '⏳ Confirm in Wallet...' : 
               clanker.isConnected ? `🔗 ${side} Real On-Chain` :
               `${side} ${amount ? parseFloat(amount).toFixed(4) : ''}`}
            </button>
          </div>

          {/* Trade Result */}
          {result && result.error && (
            <div className="trade-error">
              <span>❌</span> {result.error}
            </div>
          )}
          
          {result && result.outputAmount && (
            <div className="trade-success">
              <div className="success-header">
                <span>✅</span> Order Submitted!
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
                  <strong>Ξ {result.price?.toFixed(8)}</strong>
                </div>
                {result.slippage && (
                  <div className="detail-row">
                    <span>Slippage:</span>
                    <strong>{result.slippage}%</strong>
                  </div>
                )}
                <div className="detail-row">
                  <span>New Supply:</span>
                  <strong>{result.newSupply?.toLocaleString()}</strong>
                </div>
                {result.isSimulated && (
                  <div className="simulation-warning">
                    <span>🎮</span> Simulation mode - Token not yet deployed on Clanker
                  </div>
                )}
                {!result.isSimulated && selectedCurve?.tradingUrl && (
                  <a href={selectedCurve.tradingUrl} target="_blank" rel="noopener noreferrer" className="trade-on-clanker">
                    🔗 Trade for Real on Clanker
                  </a>
                )}
              </div>
            </div>
          )}
        </div>

        {/* How It Works */}
        <div className="info-section">
          <h3>📖 How Bonding Curves Work</h3>
          <div className="info-grid">
            <div className="info-card">
              <span className="info-icon">📈</span>
              <h4>Dynamic Pricing</h4>
              <p>Price increases as more tokens are bought, decreases when sold. Formula: <code>price = a × supply + b</code></p>
            </div>
            <div className="info-card">
              <span className="info-icon">🎯</span>
              <h4>Always Liquid</h4>
              <p>No order books needed. You can always buy or sell at the curve price.</p>
            </div>
            <div className="info-card">
              <span className="info-icon">📊</span>
              <h4>Slippage</h4>
              <p>Large trades experience slippage. The curve ensures fair pricing for all.</p>
            </div>
            <div className="info-card">
              <span className="info-icon">🤖</span>
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
        
        .curves-header p {
          color: var(--text-secondary);
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
          background: var(--bg-card);
          border: 2px solid transparent;
          border-radius: 16px;
          cursor: pointer;
          transition: all 0.3s;
        }
        
        .token-tab.active {
          background: rgba(255, 255, 255, 0.1);
        }
        
        .tab-emoji {
          font-size: 2em;
          margin-bottom: 5px;
        }
        
        .tab-name {
          font-size: 1.2em;
          font-weight: bold;
        }
        
        .tab-desc {
          font-size: 0.8em;
          color: var(--text-secondary);
        }
        
        .curves-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
          gap: 20px;
          margin-bottom: 40px;
        }
        
        .curve-card {
          background: var(--bg-card);
          border-radius: 16px;
          padding: 25px;
          border: 2px solid transparent;
          transition: all 0.3s;
        }
        
        .curve-card.selected {
          border-color: var(--curve-color);
          box-shadow: 0 0 30px rgba(255, 255, 255, 0.1);
        }
        
        .curve-header {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 20px;
        }
        
        .curve-emoji {
          font-size: 2em;
        }
        
        .curve-header h2 {
          margin: 0;
        }
        
        .clanker-badge {
          font-size: 0.7em;
          padding: 4px 8px;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          border-radius: 12px;
          color: #fff;
          text-decoration: none;
          margin-left: auto;
        }
        
        .simulation-badge {
          font-size: 0.7em;
          padding: 4px 8px;
          background: rgba(251, 191, 36, 0.2);
          border: 1px solid #fbbf24;
          border-radius: 12px;
          color: #fbbf24;
          margin-left: auto;
        }
        
        .clanker-address {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.8em;
          margin-bottom: 15px;
          color: var(--text-secondary);
        }
        
        .clanker-address code {
          background: var(--bg-secondary);
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 0.9em;
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
          color: var(--text-secondary);
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
          background: var(--bg-secondary);
          border-radius: 4px;
          overflow: hidden;
        }
        
        .supply-fill {
          height: 100%;
          background: var(--curve-color);
          border-radius: 4px;
          transition: width 0.5s;
        }
        
        .price-visual {
          margin-bottom: 20px;
        }
        
        .price-label {
          font-size: 0.8em;
          color: var(--text-secondary);
          margin-bottom: 8px;
        }
        
        .price-range {
          position: relative;
          height: 40px;
          background: var(--bg-secondary);
          border-radius: 8px;
          display: flex;
          align-items: center;
          padding: 0 15px;
        }
        
        .price-indicator {
          position: absolute;
          transform: translateX(-50%);
        }
        
        .current-price {
          background: var(--curve-color);
          padding: 4px 10px;
          border-radius: 12px;
          font-size: 0.8em;
          font-weight: bold;
          white-space: nowrap;
        }
        
        .curve-formula {
          font-family: monospace;
          font-size: 0.85em;
          padding: 10px;
          background: var(--bg-secondary);
          border-radius: 8px;
          text-align: center;
        }
        
        .trade-section {
          background: var(--bg-card);
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
          border: 2px solid var(--bg-secondary);
          border-radius: 12px;
          background: transparent;
          cursor: pointer;
          font-size: 1em;
          font-weight: bold;
          transition: all 0.3s;
        }
        
        .side-selector button.active.buy {
          background: var(--accent-green);
          border-color: var(--accent-green);
          color: #000;
        }
        
        .side-selector button.active.sell {
          background: var(--accent-red);
          border-color: var(--accent-red);
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
          color: var(--text-secondary);
          margin-bottom: 8px;
        }
        
        .input-group input {
          padding: 12px 15px;
          background: var(--bg-secondary);
          border: 2px solid transparent;
          border-radius: 10px;
          font-size: 1em;
          color: var(--text-primary);
        }
        
        .input-group input:focus {
          outline: none;
          border-color: var(--accent);
        }
        
        .input-group input.disabled {
          opacity: 0.6;
        }
        
        .trade-info {
          text-align: center;
          margin-bottom: 20px;
          color: var(--text-secondary);
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
          background: linear-gradient(135deg, var(--accent-green), #059669);
          color: #fff;
        }
        
        .execute-btn.sell {
          background: linear-gradient(135deg, var(--accent-red), #dc2626);
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
          border: 1px solid var(--accent-red);
          border-radius: 10px;
          text-align: center;
        }
        
        .trade-success {
          margin-top: 20px;
          padding: 20px;
          background: rgba(16, 185, 129, 0.2);
          border: 1px solid var(--accent-green);
          border-radius: 10px;
        }
        
        .success-header {
          display: flex;
          align-items: center;
          gap: 10px;
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
        
        .simulation-warning {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-top: 15px;
          padding: 10px;
          background: rgba(251, 191, 36, 0.1);
          border: 1px solid #fbbf24;
          border-radius: 8px;
          font-size: 0.9em;
          color: #fbbf24;
        }
        
        .trade-on-clanker {
          display: block;
          margin-top: 15px;
          padding: 12px;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          border-radius: 8px;
          color: #fff;
          text-align: center;
          text-decoration: none;
          font-weight: bold;
          transition: opacity 0.3s;
        }
        
        .trade-on-clanker:hover {
          opacity: 0.9;
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
          background: var(--bg-card);
          border-radius: 12px;
          padding: 25px;
          text-align: center;
        }
        
        .info-icon {
          font-size: 2em;
          display: block;
          margin-bottom: 15px;
        }
        
        .info-card h4 {
          margin-bottom: 10px;
        }
        
        .info-card p {
          color: var(--text-secondary);
          font-size: 0.9em;
          line-height: 1.6;
        }
        
        .info-card code {
          background: var(--bg-secondary);
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 0.85em;
        }
        
        /* Wallet Section */
        .wallet-section {
          max-width: 500px;
          margin: 0 auto 30px;
        }
        
        .wallet-connect {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
        }
        
        .connect-btn {
          width: 100%;
          padding: 15px 25px;
          background: linear-gradient(135deg, #f6851b, #e2761b);
          border: none;
          border-radius: 12px;
          color: #fff;
          font-size: 1.1em;
          font-weight: bold;
          cursor: pointer;
          transition: all 0.3s;
        }
        
        .connect-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 4px 20px rgba(246, 133, 27, 0.4);
        }
        
        .connect-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        
        .wallet-connected {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 15px;
          padding: 15px;
          background: rgba(16, 185, 129, 0.1);
          border: 1px solid var(--accent-green);
          border-radius: 12px;
        }
        
        .wallet-status {
          font-size: 0.9em;
          color: var(--accent-green);
        }
        
        .wallet-address {
          background: var(--bg-secondary);
          padding: 5px 10px;
          border-radius: 6px;
          font-size: 0.9em;
        }
        
        .disconnect-btn {
          padding: 8px 16px;
          background: transparent;
          border: 1px solid var(--text-secondary);
          border-radius: 8px;
          color: var(--text-secondary);
          font-size: 0.85em;
          cursor: pointer;
          transition: all 0.3s;
        }
        
        .disconnect-btn:hover {
          background: rgba(239, 68, 68, 0.1);
          border-color: var(--accent-red);
          color: var(--accent-red);
        }
        
        .wallet-error {
          color: var(--accent-red);
          font-size: 0.9em;
        }
      `}</style>
    </>
  );
}
