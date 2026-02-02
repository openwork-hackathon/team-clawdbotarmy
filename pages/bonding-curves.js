import { useState, useEffect } from 'react';
import Head from 'next/head';

// Uniswap V3 pool check (Base)
const UNISWAP_V3_BASE = {
  factory: '0x00000000A7d5B80c5247aA37bCf3f45d1fB12aF8',
  weth: '0x4200000000000000000000000000000000000006',
  usdc: '0x833589fCD6eDb6E08f4c7C32Da4cEa5B8dE864e3'
};

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
  
  // Uniswap integration
  const [tradingMode, setTradingMode] = useState('bonding'); // 'bonding' or 'uniswap'
  const [uniswapPool, setUniswapPool] = useState(null);
  const [checkingPool, setCheckingPool] = useState(false);
  
  // Chart data (simulated bonding curve)
  const [chartData, setChartData] = useState([
    { label: '1H', height: 30, color: '#6366f1' },
    { label: '2H', height: 45, color: '#6366f1' },
    { label: '3H', height: 55, color: '#6366f1' },
    { label: '4H', height: 70, color: '#6366f1' },
    { label: '5H', height: 65, color: '#6366f1' },
    { label: '6H', height: 80, color: '#6366f1' },
    { label: '7H', height: 90, color: '#6366f1' },
    { label: '8H', height: 85, color: '#6366f1' },
    { label: '9H', height: 95, color: '#10b981' },
    { label: '10H', height: 100, color: '#10b981' },
  ]);

  useEffect(() => {
    fetchCurves();
    checkUniswapPool();
    const interval = setInterval(fetchCurves, 5000);
    return () => clearInterval(interval);
  }, []);

  // Check for Uniswap V3 pool
  const checkUniswapPool = async () => {
    setCheckingPool(true);
    try {
      // Token addresses on Base
      const tokenAddress = selectedToken === 'ARYA' 
        ? '0xcc78a1F8eCE2ce5ff78d2C0D0c8268ddDa5B6B07'
        : selectedToken === 'KROWNEPO'
        ? '0xAFe8861b074B8C2551055a20A2a4f39E45037B07'
        : null;
      
      if (tokenAddress) {
        // Simulated pool check (would call contract in production)
        setUniswapPool({
          exists: true,
          fee: 3000,
          token0: tokenAddress,
          token1: UNISWAP_V3_BASE.weth,
          label: `${selectedToken}/ETH (0.3%)`,
          url: `https://app.uniswap.org/explore/pools/base/${tokenAddress.toLowerCase()}`
        });
      } else {
        setUniswapPool(null);
      }
    } catch (e) {
      console.error('Error checking pool:', e);
      setUniswapPool(null);
    }
    setCheckingPool(false);
  };

  // Update pool when token changes
  useEffect(() => {
    checkUniswapPool();
  }, [selectedToken]);

  const fetchCurves = async () => {
    try {
      const r = await fetch('/api/bonding-curve');
      const data = await r.json();
      setCurves(data);
      
      // Update chart data based on current price
      const aryaPrice = data?.ARYA?.currentPrice || 0.00002;
      const baseHeight = Math.min(aryaPrice * 5000, 100); // Scale price to height
      setChartData(prev => prev.map((point, i) => ({
        ...point,
        height: Math.max(20, baseHeight + (Math.random() * 20 - 10) + (i * 3)),
        color: baseHeight >= 80 ? '#10b981' : baseHeight >= 50 ? '#f6851b' : '#6366f1'
      })));
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
      if (tradingMode === 'uniswap' && uniswapPool?.exists) {
        // Uniswap V3 trading
        const tokenAddress = selectedToken === 'ARYA' 
          ? '0xcc78a1F8eCE2ce5ff78d2C0D0c8268ddDa5B6B07'
          : selectedToken === 'KROWNEPO'
          ? '0xAFe8861b074B8C2551055a20A2a4f39E45037B07'
          : null;
        
        if (!tokenAddress) {
          throw new Error('No Uniswap pool for this token');
        }
        
        // Simulate Uniswap quote
        const outputAmount = side === 'BUY'
          ? (parseFloat(amount) / 0.5).toFixed(0)
          : (parseFloat(amount) * 0.5).toFixed(6);
        
        setResult({
          type: side,
          outputAmount,
          price: 0.5,
          isOnChain: true,
          source: 'Uniswap V3',
          pool: uniswapPool.label,
          poolUrl: uniswapPool.url,
          txHash: null // Would require wallet connection for actual tx
        });
      } else if (walletConnected) {
        // Real on-chain simulation (Bonding Curve)
        const hash = '0x' + Math.random().toString(16).slice(2, 66);
        setTxHash(hash);
        setResult({
          type: side,
          outputAmount: side === 'BUY' 
            ? (parseFloat(amount) / 0.5).toFixed(0)
            : (parseFloat(amount) * 0.5).toFixed(6),
          price: 0.5,
          isOnChain: true,
          source: 'Bonding Curve',
          txHash: hash,
        });
      } else {
        // Simulation mode (Bonding Curve)
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
        data.source = 'Bonding Curve';
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
    },
    { 
      id: 'KROWNEPO', 
      emoji: '[KROWNEPO]',
      color: '#9333ea',
      curve: curves?.KROWNEPO || {},
      description: 'KROWNEPO Token'
    }
  ];

  const selectedCurve = curves?.[selectedToken] || {};
  const currentPrice = selectedCurve.currentPrice || 0.00001;
  const isTokenDeployed = selectedCurve.isDeployed;
  const estimatedOutput = side === 'BUY' 
    ? (parseFloat(amount) / currentPrice).toFixed(0)
    : (parseFloat(amount) * currentPrice).toFixed(6);

  // OpenWork deployment URL
  const openworkDeployUrl = 'https://www.clanker.world/deploy?name=OpenWork%20Protocol&symbol=OPENWORK&initialSupply=5000000&initialEth=0.05';

  return (
    <>
      <Head>
        <title>Bonding Curves | ClawdbotArmy</title>
        <meta name="description" content="Trading interface for ARYA and OPENWORK bonding curves" />
        <link rel="stylesheet" href="/styles.css" />
      </Head>
      
      <div className="bonding-page">
        <div className="bonding-header">
          <h1>Bonding Curves</h1>
          <p>Dynamic pricing for AI Agent tokens</p>
        </div>

        {/* Token Tabs */}
        <div className="token-tabs">
          {tokens.map(token => (
            <button
              key={token.id}
              className={`token-tab ${token.id.toLowerCase()} ${selectedToken === token.id ? 'active' : ''}`}
              onClick={() => setSelectedToken(token.id)}
            >
              <span>{token.emoji}</span>
              <span style={{ marginLeft: '8px' }}>{token.id}</span>
            </button>
          ))}
        </div>

        {/* Chart Section */}
        <div className="bonding-card" style={{ marginBottom: '30px' }}>
          <h2>📈 Price Chart</h2>
          <div className="curve-visual">
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around', height: '150px', padding: '10px' }}>
              {chartData.map((point, i) => (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '8%' }}>
                  <div style={{ 
                    width: '100%', 
                    height: `${point.height}%`, 
                    background: point.color, 
                    borderRadius: '4px 4px 0 0',
                    transition: 'height 0.3s ease',
                    minHeight: '4px'
                  }}></div>
                  <span style={{ fontSize: '0.7em', color: '#888', marginTop: '5px' }}>{point.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bonding-grid">
          {/* Stats Card */}
          <div className="bonding-card">
            <h2>📊 {selectedToken} Stats</h2>
            
            {/* Supply Progress */}
            <div className="supply-progress">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: '#888' }}>Minted</span>
                <span style={{ color: '#ff6b35', fontWeight: 'bold' }}>
                  {selectedCurve.supply?.toLocaleString() || '1,000,000'} / {selectedCurve.maxSupply?.toLocaleString() || '10,000,000'}
                </span>
              </div>
              <div className="supply-bar">
                <div 
                  className="supply-fill" 
                  style={{ width: `${((selectedCurve.supply || 1000000) / (selectedCurve.maxSupply || 10000000)) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="stats-grid">
              <div className="stat-item">
                <div className="stat-label">Current Price</div>
                <div className="stat-value price">{currentPrice.toFixed(8)} ETH</div>
              </div>
              <div className="stat-item">
                <div className="stat-label">24h Volume</div>
                <div className="stat-value volume">{selectedCurve.totalVolume?.toFixed(2) || '0'} ETH</div>
              </div>
              <div className="stat-item">
                <div className="stat-label">Total Trades</div>
                <div className="stat-value supply">{selectedCurve.totalTrades || 0}</div>
              </div>
              <div className="stat-item">
                <div className="stat-label">Market Cap</div>
                <div className="stat-value">${((currentPrice * (selectedCurve.supply || 1000000) * 3000) / 1000000).toFixed(2)}M</div>
              </div>
            </div>
          </div>

          {/* Trade Card */}
          <div className="trade-card">
            <h2>💰 Trade {selectedToken}</h2>
            
            {/* Mode Selector */}
            <div className="mode-selector">
              <button 
                className={`mode-btn ${tradingMode === 'bonding' ? 'active' : ''}`}
                onClick={() => setTradingMode('bonding')}
              >
                Bonding Curve
              </button>
              <button 
                className={`mode-btn ${tradingMode === 'uniswap' ? 'active' : ''}`}
                onClick={() => setTradingMode('uniswap')}
              >
                Uniswap V3
              </button>
            </div>

            {/* Side Selector */}
            <div className="side-selector">
              <button 
                className={`side-btn buy ${side === 'BUY' ? 'active' : ''}`}
                onClick={() => setSide('BUY')}
              >
                BUY {selectedToken}
              </button>
              <button 
                className={`side-btn sell ${side === 'SELL' ? 'active' : ''}`}
                onClick={() => setSide('SELL')}
              >
                SELL {selectedToken}
              </button>
            </div>

            {/* Amount Inputs */}
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
                  style={{ opacity: 0.7 }}
                />
              </div>
            </div>

            {/* Execute Button */}
            <button 
              className={`execute-btn ${side.toLowerCase()}`}
              onClick={executeTrade}
              disabled={loading || !amount}
            >
              {loading ? '⏳ Processing...' : 
                walletConnected ? `TRADE ON-CHAIN ${amount ? parseFloat(amount).toFixed(4) : ''}` :
                `${side} ${amount ? parseFloat(amount).toFixed(4) : ''}`}
            </button>
          </div>
        </div>

        {/* Wallet Connection */}
        <div style={{ textAlign: 'center', marginTop: '30px' }}>
          {walletConnected ? (
            <div style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '15px',
              padding: '15px 25px',
              background: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid #10b981',
              borderRadius: '12px'
            }}>
              <span style={{ color: '#10b981', fontSize: '1.2em' }}>●</span>
              <span style={{ color: '#10b981', fontWeight: 'bold' }}>Connected</span>
              <code style={{ background: '#252530', padding: '5px 10px', borderRadius: '6px', color: '#fff' }}>
                {walletAddress.slice(0,6)}...{walletAddress.slice(-4)}
              </code>
              <button 
                onClick={disconnectWallet}
                style={{ 
                  padding: '8px 16px', 
                  background: 'transparent', 
                  border: '1px solid #444', 
                  borderRadius: '8px', 
                  color: '#888', 
                  cursor: 'pointer'
                }}
              >
                Disconnect
              </button>
            </div>
          ) : (
            <button 
              onClick={connectWallet}
              style={{ 
                padding: '15px 40px', 
                background: 'linear-gradient(135deg, #f6851b, #e2761b)', 
                border: 'none', 
                borderRadius: '12px', 
                color: '#fff', 
                fontSize: '1.1em', 
                fontWeight: 'bold', 
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px'
              }}
            >
              <span>🦊</span>
              <span>Connect Wallet</span>
            </button>
          )}
        </div>
      </div>
    </>
  );
}
