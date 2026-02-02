import { useState, useEffect } from 'react';
import Head from 'next/head';

// ERC20 ABI for balanceOf
const ERC20_ABI = [
  {
    "constant": true,
    "inputs": [{ "name": "_owner", "type": "address" }],
    "name": "balanceOf",
    "outputs": [{ "name": "balance", "type": "uint256" }],
    "type": "function"
  }
];

export default function Portfolio() {
  const [holdings, setHoldings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [error, setError] = useState(null);

  // Token addresses on Base
  const TOKENS = [
    { 
      id: 'ARYA', 
      address: '0xcc78a1F8eCE2ce5ff78d2C0D0c8268ddDa5B6B07',
      decimals: 18,
      ...{ emoji: '🦞', color: '#ff6b35' }
    },
    { 
      id: 'OPENWORK', 
      address: '0x299c30dd5974bf4d5bfe42c340ca40462816ab07',
      decimals: 18,
      ...{ emoji: '⚡', color: '#00d4ff' }
    },
    { 
      id: 'KROWNEPO', 
      address: '0xAFe8861b074B8C2551055a20A2a4f39E45037B07',
      decimals: 18,
      ...{ emoji: '👑', color: '#9333ea' }
    }
  ];

  const ETH_CONFIG = { id: 'ETH', emoji: 'Ξ', color: '#627eea' };

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
          fetchAllBalances(accounts[0]);
        } else {
          setHoldings([]);
          setLoading(false);
        }
      } catch (e) {
        console.error('Error checking wallet:', e);
        setLoading(false);
      }
    } else {
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
      fetchAllBalances(accounts[0]);
    } catch (e) {
      console.error('Wallet connection failed:', e);
      setError('Failed to connect wallet');
    }
  };

  const fetchAllBalances = async (address) => {
    setLoading(true);
    setError(null);
    
    try {
      // Fetch ETH balance
      const ethBalance = await window.ethereum.request({
        method: 'eth_getBalance',
        params: [address, 'latest']
      });
      const ethAmount = parseInt(ethBalance) / 1e18;
      
      // Fetch prices from our API
      const pricesRes = await fetch('/api/price/all');
      const pricesData = await pricesRes.json();
      
      // Build holdings with ETH
      const holdingsList = [{
        ...ETH_CONFIG,
        amount: ethAmount,
        price: pricesData.prices?.ETH?.priceUSD || 3000,
        value: ethAmount * (pricesData.prices?.ETH?.priceUSD || 3000)
      }];

      // Fetch token balances
      for (const token of TOKENS) {
        try {
          const balance = await window.ethereum.request({
            method: 'eth_call',
            params: [{
              to: token.address,
              data: '0x70a08231000000000000000000000000' + address.slice(2)
            }, 'latest']
          });
          
          const amount = parseInt(balance || '0') / Math.pow(10, token.decimals);
          const priceData = pricesData.prices?.[token.id];
          const price = priceData?.priceUSD || 0;
          
          if (amount > 0) {
            holdingsList.push({
              ...token,
              amount,
              price,
              value: amount * price
            });
          }
        } catch (e) {
          console.error(`Error fetching ${token.id} balance:`, e);
        }
      }

      setHoldings(holdingsList);
    } catch (e) {
      console.error('Error fetching balances:', e);
      setError('Could not fetch wallet balances');
    }
    
    setLoading(false);
  };

  const displayHoldings = holdings;
  const totalValue = displayHoldings.reduce((sum, h) => sum + (h.value || 0), 0);

  const formatCurrency = (value) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(2)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(2)}K`;
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
  };

  const formatAmount = (amount, token) => {
    if (amount >= 1000000) return `${(amount / 1000000).toFixed(2)}M`;
    if (amount >= 1000) return `${(amount / 1000).toFixed(2)}K`;
    return amount.toLocaleString(undefined, { maximumFractionDigits: 4 });
  };

  const formatPrice = (price) => {
    if (!price) return '$0.00';
    if (price < 0.01) return `< $0.01`;
    if (price < 1) return `$${price.toFixed(4)}`;
    if (price < 1000) return `$${price.toFixed(2)}`;
    return `$${price.toLocaleString()}`;
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

        {!walletConnected && (
          <div className="connect-prompt">
            Connect your wallet to see your real holdings
          </div>
        )}

        <div className="holdings-section">
          <h2>Holdings {walletConnected ? '' : '(Demo)'}</h2>
          
          {loading ? (
            <div className="loading">Loading portfolio...</div>
          ) : displayHoldings.length > 0 ? (
            <>
              <div className="holdings-table">
                {displayHoldings.map(holding => (
                  <div key={holding.id} className="holding-row">
                    <div className="holding-token">
                      <span className="token-emoji" style={{ color: holding.color }}>{holding.emoji}</span>
                      <span className="token-name">{holding.id}</span>
                    </div>
                    <div className="holding-price">{formatPrice(holding.price)}</div>
                    <div className="holding-amount">{formatAmount(holding.amount, holding.id)}</div>
                    <div className="holding-value">{formatCurrency(holding.value || 0)}</div>
                  </div>
                ))}
              </div>
              
              {totalValue > 0 && (
                <div className="allocation-bar">
                  {displayHoldings.map(h => {
                    const percentage = ((h.value || 0) / totalValue * 100).toFixed(1);
                    return parseFloat(percentage) > 0 ? (
                      <div 
                        key={h.id}
                        className="allocation-segment"
                        style={{ 
                          width: `${percentage}%`,
                          background: h.color,
                          minWidth: parseFloat(percentage) > 1 ? '4px' : '0px'
                        }}
                        title={`${h.id}: ${percentage}%`}
                      />
                    ) : null;
                  })}
                </div>
              )}
            </>
          ) : (
            <div className="empty-state">No holdings found</div>
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
        
        .connect-prompt {
          text-align: center;
          color: #888;
          margin-bottom: 20px;
        }
        
        .loading {
          text-align: center;
          padding: 40px;
          color: #888;
        }
        
        .empty-state {
          text-align: center;
          padding: 40px;
          color: #666;
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
          grid-template-columns: 1fr 1fr 1fr 1fr;
          align-items: center;
          padding: 15px 0;
          border-bottom: 1px solid #2a2a3a;
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
          font-size: 1.5em;
        }
        
        .token-name {
          font-weight: 600;
          color: #fff;
        }
        
        .holding-price {
          color: #888;
          font-size: 0.9em;
        }
        
        .holding-amount {
          color: #fff;
          text-align: right;
        }
        
        .holding-value {
          color: #10b981;
          font-weight: 600;
          text-align: right;
        }
        
        .allocation-bar {
          display: flex;
          height: 8px;
          background: #252530;
          border-radius: 4px;
          overflow: hidden;
          margin-top: 20px;
        }
        
        .allocation-segment {
          height: 100%;
        }
      `}</style>
    </>
  );
}
