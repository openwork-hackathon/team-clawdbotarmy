import { useState, useEffect } from 'react';
import Head from 'next/head';

export default function Portfolio() {
  const [holdings, setHoldings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [error, setError] = useState(null);

  // Token addresses on Base
  const TOKEN_ADDRESSES = {
    ARYA: '0xcc78a1F8eCE2ce5ff78d2C0D0c8268ddDa5B6B07',
    OPENWORK: '0x299c30dd5974bf4d5bfe42c340ca40462816ab07',
    KROWNEPO: '0xAFe8861b074B8C2551055a20A2a4f39E45037B07',
    ETH: '0x4200000000000000000000000000000000000006',
    USDC: '0x833589fCD6eDb6E08f4c7C32Da4cEa5B8dE864e3'
  };

  const TOKEN_CONFIG = {
    ARYA: { emoji: '🦞', color: '#ff6b35' },
    OPENWORK: { emoji: '⚡', color: '#00d4ff' },
    KROWNEPO: { emoji: '👑', color: '#9333ea' },
    ETH: { emoji: 'Ξ', color: '#627eea' },
    USDC: { emoji: '$', color: '#2775ca' }
  };

  // Default portfolio for display when not connected
  const defaultHoldings = [
    { token: 'ARYA', amount: 15000, price: 0.00001, ...TOKEN_CONFIG.ARYA },
    { token: 'ETH', amount: 2.5, price: 2297.35, ...TOKEN_CONFIG.ETH },
    { token: 'OPENWORK', amount: 50000, price: 0.00001, ...TOKEN_CONFIG.OPENWORK },
    { token: 'USDC', amount: 2240.77, price: 1.00, ...TOKEN_CONFIG.USDC }
  ];

  useEffect(() => {
    checkWalletConnection();
  }, []);

  const checkWalletConnection = async () => {
    if (typeof window !== 'undefined' && window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          setWalletConnected(true);
          setWalletAddress(accounts[0]);
          fetchWalletBalances(accounts[0]);
        } else {
          setHoldings(defaultHoldings);
          setLoading(false);
        }
      } catch (e) {
        console.error('Error checking wallet:', e);
        setHoldings(defaultHoldings);
        setLoading(false);
      }
    } else {
      setHoldings(defaultHoldings);
      setLoading(false);
    }
  };

  const connectWallet = async () => {
    if (typeof window === 'undefined' || !window.ethereum) {
      alert('MetaMask not installed!');
      return;
    }
    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      setWalletConnected(true);
      setWalletAddress(accounts[0]);
      fetchWalletBalances(accounts[0]);
    } catch (e) {
      console.error('Wallet connection failed:', e);
      setError('Failed to connect wallet');
    }
  };

  const fetchWalletBalances = async (address) => {
    setLoading(true);
    setError(null);
    
    try {
      // Get ETH balance
      const ethBalance = await window.ethereum.request({
        method: 'eth_getBalance',
        params: [address, 'latest']
      });
      const ethAmount = parseInt(ethBalance) / 1e18;
      const ethPrice = 3000; // Approximate
      
      // Fetch token balances via multicall would be better, but simplified here
      const holdings = [
        { token: 'ETH', amount: ethAmount, price: ethPrice, ...TOKEN_CONFIG.ETH },
        // Note: For token balances, you'd need to call balanceOf for each token
        // This is simplified - in production use multicall or indexer
      ];
      
      // For now, show ETH balance and fallback to defaults for tokens
      // Real token balances require contract calls
      setHoldings(holdings);
    } catch (e) {
      console.error('Error fetching balances:', e);
      setError('Could not fetch wallet balances');
      setHoldings(defaultHoldings);
    }
    
    setLoading(false);
  };

  const displayHoldings = holdings.length > 0 ? holdings : defaultHoldings;
  const totalValue = displayHoldings.reduce((sum, h) => sum + (h.amount * (h.price || 0)), 0);

  const formatCurrency = (value) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(2)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(2)}K`;
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
  };

  const formatAmount = (amount, token) => {
    if (token === 'ETH') return amount.toFixed(4);
    if (amount >= 1000000) return `${(amount / 1000000).toFixed(2)}M`;
    if (amount >= 1000) return `${(amount / 1000).toFixed(2)}K`;
    return amount.toLocaleString(undefined, { maximumFractionDigits: 2 });
  };

  return (
    <>
      <Head>
        <title>📊 Portfolio | ClawdbotArmy</title>
        <meta name="description" content="Track your crypto portfolio" />
        <link rel="stylesheet" href="/styles.css" />
      </Head>
      
      <div className="portfolio-page">
        <header className="portfolio-header">
          <h1>📊 Portfolio</h1>
          <div className="total-value">{formatCurrency(totalValue)}</div>
        </header>

        {/* Wallet Connection */}
        <div className="wallet-section">
          {walletConnected ? (
            <div className="wallet-connected">
              <span className="wallet-dot">●</span>
              <span>Connected</span>
              <code>{walletAddress.slice(0,6)}...{walletAddress.slice(-4)}</code>
            </div>
          ) : (
            <button className="connect-btn" onClick={connectWallet}>
              <span>🦊</span>
              <span>Connect Wallet</span>
            </button>
          )}
        </div>

        {error && (
          <div className="error-message">{error}</div>
        )}

        <div className="holdings-section">
          <h2>Holdings</h2>
          {loading ? (
            <div className="loading">Loading portfolio...</div>
          ) : (
            <div className="holdings-table">
              {displayHoldings.map(holding => (
                <div key={holding.token} className="holding-row">
                  <div className="holding-token">
                    <span className="token-emoji" style={{ color: holding.color }}>{holding.emoji}</span>
                    <span className="token-name">{holding.token}</span>
                  </div>
                  <div className="holding-price">{formatCurrency(holding.price || 0)}</div>
                  <div className="holding-amount">{formatAmount(holding.amount, holding.token)}</div>
                  <div className="holding-value">{formatCurrency(holding.amount * (holding.price || 0))}</div>
                </div>
              ))}
            </div>
          )}
          
          {totalValue > 0 && (
            <div className="allocation-bar">
              {displayHoldings.map(h => {
                const percentage = ((h.amount * (h.price || 0)) / totalValue * 100).toFixed(1);
                return parseFloat(percentage) > 0 ? (
                  <div 
                    key={h.token}
                    className="allocation-segment"
                    style={{ 
                      width: `${percentage}%`,
                      background: h.color,
                      minWidth: percentage > 1 ? '4px' : '0px'
                    }}
                    title={`${h.token}: ${percentage}%`}
                  />
                ) : null;
              })}
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .portfolio-page {
          min-height: 100vh;
          background: linear-gradient(180deg, #0a0a0f 0%, #151520 100%);
          padding: 40px 20px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        
        .portfolio-header {
          text-align: center;
          margin-bottom: 40px;
        }
        
        .portfolio-header h1 {
          font-size: 2em;
          margin: 0 0 15px 0;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        
        .total-value {
          font-size: 2.5em;
          font-weight: bold;
          color: #10b981;
        }
        
        .wallet-section {
          text-align: center;
          margin-bottom: 25px;
        }
        
        .connect-btn {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 12px 24px;
          background: linear-gradient(135deg, #f6851b, #e2761b);
          border: none;
          border-radius: 12px;
          color: #fff;
          font-size: 1em;
          font-weight: bold;
          cursor: pointer;
          transition: transform 0.2s;
        }
        
        .connect-btn:hover {
          transform: translateY(-2px);
        }
        
        .wallet-connected {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 12px 24px;
          background: rgba(16, 185, 129, 0.15);
          border: 1px solid #10b981;
          border-radius: 12px;
          color: #10b981;
          font-weight: 600;
        }
        
        .wallet-dot {
          font-size: 1.2em;
        }
        
        .wallet-connected code {
          background: #252530;
          padding: 5px 10px;
          border-radius: 6px;
          color: #fff;
        }
        
        .loading {
          text-align: center;
          padding: 40px;
          color: #888;
        }
        
        .error-message {
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid #ef4444;
          border-radius: 8px;
          padding: 12px;
          margin-bottom: 20px;
          color: #ef4444;
          text-align: center;
        }
        
        .holdings-section {
          background: linear-gradient(135deg, #1a1a24 0%, #151520 100%);
          border-radius: 20px;
          padding: 25px;
          border: 1px solid #2a2a3a;
          max-width: 600px;
          margin: 0 auto;
        }
        
        .holdings-section h2 {
          margin: 0 0 20px 0;
          font-size: 1.2em;
          color: #888;
        }
        
        .holdings-table {
          display: flex;
          flex-direction: column;
        }
        
        .holding-row {
          display: grid;
          grid-template-columns: 1fr auto auto auto;
          gap: 15px;
          padding: 15px 0;
          border-bottom: 1px solid #2a2a3a;
          align-items: center;
        }
        
        .holding-row:last-child {
          border-bottom: none;
        }
        
        .holding-token {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        
        .token-emoji {
          font-size: 1.3em;
        }
        
        .token-name {
          font-weight: 600;
          color: #fff;
        }
        
        .holding-price {
          color: #888;
          font-size: 0.9em;
          min-width: 80px;
          text-align: right;
        }
        
        .holding-amount {
          color: #888;
          text-align: right;
          font-size: 0.9em;
          min-width: 70px;
        }
        
        .holding-value {
          font-weight: bold;
          color: #10b981;
          text-align: right;
          min-width: 90px;
        }
        
        .allocation-bar {
          display: flex;
          height: 8px;
          background: rgba(0,0,0,0.3);
          border-radius: 4px;
          overflow: hidden;
          margin-top: 20px;
        }
        
        .allocation-segment {
          height: 100%;
          transition: width 0.3s;
        }
      `}</style>
    </>
  );
}
