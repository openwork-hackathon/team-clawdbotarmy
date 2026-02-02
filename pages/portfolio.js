import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';

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
  const [view, setView] = useState('grid'); // 'grid' | 'list'

  // Token addresses on Base
  const TOKENS = [
    { id: 'ARYA', address: '0xcc78a1F8eCE2ce5ff78d2C0D0c8268ddDa5B6B07', decimals: 18, emoji: '🦞', color: '#ff6b35' },
    { id: 'OPENWORK', address: '0x299c30dd5974bf4d5bfe42c340ca40462816ab07', decimals: 18, emoji: '⚡', color: '#00d4ff' },
    { id: 'KROWNEPO', address: '0xAFe8861b074B8C2551055a20A2a4f39E45037B07', decimals: 18, emoji: '👑', color: '#9333ea' }
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
      
      // Fetch prices
      const pricesRes = await fetch('/api/price/all');
      const pricesData = await pricesRes.json();
      
      // Build holdings
      const holdingsList = [{
        ...ETH_CONFIG,
        amount: ethAmount,
        price: pricesData.prices?.ETH?.priceUSD || 3000,
        value: ethAmount * (pricesData.prices?.ETH?.priceUSD || 3000),
        change: 2.5 // Simulated 24h change
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
          
          holdingsList.push({
            ...token,
            amount,
            price,
            value: amount * price,
            change: (Math.random() * 20 - 10) // Simulated change for demo
          });
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

  const totalValue = holdings.reduce((sum, h) => sum + (h.value || 0), 0);
  const totalChange = holdings.reduce((sum, h) => sum + ((h.value || 0) * (h.change || 0) / 100), 0);

  const formatCurrency = (value) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(2)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(2)}K`;
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
  };

  const formatAmount = (amount) => {
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

  const getChangeColor = (change) => {
    if (!change) return 'var(--text-secondary)';
    return change >= 0 ? 'var(--accent-green)' : 'var(--accent-red)';
  };

  const copyAddress = () => {
    if (walletAddress) {
      navigator.clipboard.writeText(walletAddress);
      alert('Address copied!');
    }
  };

  return (
    <>
      <Head>
        <title>💼 Portfolio | ClawdbotArmy</title>
        <meta name="description" content="Track your crypto portfolio with real-time prices" />
        <link rel="stylesheet" href="/styles.css" />
      </Head>
      
      <div className="portfolio-page">
        <header className="portfolio-header">
          <Link href="/" className="back-link">
            ← Back
          </Link>
          <h1>💼 Portfolio</h1>
        </header>

        {/* Wallet Section */}
        <div className="wallet-section glass-card">
          {walletConnected ? (
            <div className="wallet-connected">
              <div className="wallet-info">
                <span className="wallet-label">Connected Wallet</span>
                <div className="wallet-address" onClick={copyAddress}>
                  <span className="address-icon">🔗</span>
                  <span className="address">{walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}</span>
                  <span className="copy-hint">Click to copy</span>
                </div>
              </div>
              <div className="portfolio-summary">
                <div className="total-value">
                  <span className="label">Total Balance</span>
                  <span className="value">{formatCurrency(totalValue)}</span>
                  <span className="change" style={{ color: getChangeColor(totalChange) }}>
                    {totalChange >= 0 ? '+' : ''}{formatCurrency(totalChange)} (24h)
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="wallet-not-connected">
              <div className="wallet-icon">👛</div>
              <h3>Connect Your Wallet</h3>
              <p>Connect your MetaMask wallet to view your real portfolio</p>
              <button className="connect-btn" onClick={connectWallet}>
                <span>🦊</span>
                <span>Connect Wallet</span>
              </button>
            </div>
          )}
        </div>

        {/* Holdings Section */}
        {walletConnected && (
          <div className="holdings-section">
            <div className="section-header">
              <h2>Your Assets</h2>
              <div className="view-toggle">
                <button 
                  className={`view-btn ${view === 'grid' ? 'active' : ''}`}
                  onClick={() => setView('grid')}
                >
                  ▦ Grid
                </button>
                <button 
                  className={`view-btn ${view === 'list' ? 'active' : ''}`}
                  onClick={() => setView('list')}
                >
                  ≡ List
                </button>
              </div>
            </div>

            {loading ? (
              <div className="loading-state">
                <div className="enhanced-spinner"></div>
                <p>Loading your assets...</p>
              </div>
            ) : holdings.length > 0 ? (
              view === 'grid' ? (
                <div className="holdings-grid">
                  {holdings.map(holding => (
                    <div key={holding.id} className="holding-card glass-card">
                      <div className="card-header">
                        <div className="token-identity">
                          <span className="token-emoji" style={{ color: holding.color }}>{holding.emoji}</span>
                          <div>
                            <span className="token-name">{holding.id}</span>
                            <span className="token-source">
                              via {holding.source || 'Wallet'}
                            </span>
                          </div>
                        </div>
                        <span 
                          className="change-badge"
                          style={{ background: getChangeColor(holding.change), color: holding.change >= 0 ? '#000' : '#fff' }}
                        >
                          {holding.change >= 0 ? '+' : ''}{holding.change?.toFixed(1)}%
                        </span>
                      </div>
                      <div className="card-body">
                        <div className="price-value">
                          <span className="price">{formatPrice(holding.price)}</span>
                          <span className="value">{formatCurrency(holding.value)}</span>
                        </div>
                        <div className="amount-hold">
                          <span className="amount">{formatAmount(holding.amount)}</span>
                          <span className="label">{holding.id}</span>
                        </div>
                      </div>
                      <div className="card-actions">
                        <a 
                          href={`https://app.uniswap.org/swap?chain=base&inputCurrency=ETH&outputCurrency=${TOKENS.find(t => t.id === holding.id)?.address || ''}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="action-btn trade"
                        >
                          🦄 Trade
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="holdings-list glass-card">
                  {holdings.map(holding => (
                    <div key={holding.id} className="holding-row">
                      <div className="col-token">
                        <span className="token-emoji" style={{ color: holding.color }}>{holding.emoji}</span>
                        <div>
                          <span className="token-name">{holding.id}</span>
                          <span className="token-amount">{formatAmount(holding.amount)} {holding.id}</span>
                        </div>
                      </div>
                      <div className="col-price">
                        <span className="price">{formatPrice(holding.price)}</span>
                        <span className="change" style={{ color: getChangeColor(holding.change) }}>
                          {holding.change >= 0 ? '+' : ''}{holding.change?.toFixed(2)}%
                        </span>
                      </div>
                      <div className="col-value">
                        <span className="value">{formatCurrency(holding.value)}</span>
                      </div>
                      <div className="col-action">
                        <a 
                          href={`https://app.uniswap.org/swap?chain=base&inputCurrency=ETH&outputCurrency=${TOKENS.find(t => t.id === holding.id)?.address || ''}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="trade-link"
                        >
                          Trade →
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )
            ) : (
              <div className="empty-state glass-card">
                <p>No assets found in this wallet</p>
              </div>
            )}
          </div>
        )}

        {/* Quick Links */}
        {walletConnected && (
          <div className="quick-links glass-card">
            <h3>Quick Actions</h3>
            <div className="links-grid">
              <Link href="/bonding-curves" className="quick-link">
                <span>📈</span>
                <span>Trade Tokens</span>
              </Link>
              <Link href="/staking" className="quick-link">
                <span>🔒</span>
                <span>Staking</span>
              </Link>
              <a 
                href="https://www.clanker.world" 
                target="_blank" 
                rel="noopener noreferrer"
                className="quick-link"
              >
                <span>🤖</span>
                <span>Clanker</span>
              </a>
            </div>
          </div>
        )}

        {/* ARYA Holder Benefits */}
        <div className="holder-benefits">
          <h3>🦞 ARYA Holder Benefits</h3>
          <div className="benefits-grid">
            <div className="benefit-item">
              <span className="icon">🚀</span>
              <div className="text">
                <strong>45% APY</strong>
                <span>on ARYA staking</span>
              </div>
            </div>
            <div className="benefit-item">
              <span className="icon">🗳️</span>
              <div className="text">
                <strong>Governance</strong>
                <span>Voting power</span>
              </div>
            </div>
            <div className="benefit-item">
              <span className="icon">🎯</span>
              <div className="text">
                <strong>Premium Signals</strong>
                <span>Trading insights</span>
              </div>
            </div>
            <div className="benefit-item">
              <span className="icon">🎁</span>
              <div className="text">
                <strong>NFT Drops</strong>
                <span>Exclusive access</span>
              </div>
            </div>
          </div>
          <Link href="/staking" className="stake-arya-btn">
            Stake ARYA & Earn 45% APY →
          </Link>
        </div>
      </div>

      <style jsx>{`
        .portfolio-page {
          min-height: 100vh;
          background: var(--bg-primary);
          padding: 20px;
        }
        
        .portfolio-header {
          display: flex;
          align-items: center;
          gap: 20px;
          margin-bottom: 30px;
        }
        
        .back-link {
          color: var(--text-secondary);
          text-decoration: none;
          font-size: 0.9em;
          transition: color 0.2s;
        }
        
        .back-link:hover {
          color: var(--accent);
        }
        
        .portfolio-header h1 {
          font-size: 2em;
          margin: 0;
        }
        
        .glass-card {
          background: rgba(26, 26, 36, 0.6);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          border: 1px solid var(--border-color);
          border-radius: 20px;
          padding: 24px;
        }
        
        .wallet-section {
          margin-bottom: 30px;
        }
        
        .wallet-not-connected {
          text-align: center;
          padding: 40px 20px;
        }
        
        .wallet-icon {
          font-size: 3em;
          margin-bottom: 15px;
        }
        
        .wallet-not-connected h3 {
          margin: 0 0 10px 0;
        }
        
        .wallet-not-connected p {
          color: var(--text-secondary);
          margin-bottom: 25px;
        }
        
        .wallet-connected {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 20px;
        }
        
        .wallet-info {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        
        .wallet-label {
          font-size: 0.85em;
          color: var(--text-secondary);
        }
        
        .wallet-address {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 16px;
          background: var(--bg-secondary);
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .wallet-address:hover {
          background: var(--bg-card);
        }
        
        .address {
          font-family: monospace;
          font-weight: 600;
        }
        
        .copy-hint {
          font-size: 0.75em;
          color: var(--text-secondary);
          opacity: 0;
          transition: opacity 0.2s;
        }
        
        .wallet-address:hover .copy-hint {
          opacity: 1;
        }
        
        .portfolio-summary {
          text-align: right;
        }
        
        .total-value .label {
          display: block;
          font-size: 0.85em;
          color: var(--text-secondary);
          margin-bottom: 5px;
        }
        
        .total-value .value {
          display: block;
          font-size: 2em;
          font-weight: 700;
          color: var(--accent-green);
        }
        
        .total-value .change {
          display: block;
          font-size: 0.9em;
          font-weight: 500;
        }
        
        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }
        
        .section-header h2 {
          margin: 0;
          font-size: 1.3em;
        }
        
        .view-toggle {
          display: flex;
          gap: 8px;
        }
        
        .view-btn {
          padding: 8px 14px;
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: 8px;
          color: var(--text-secondary);
          font-size: 0.85em;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .view-btn.active {
          background: var(--accent);
          color: #000;
          border-color: var(--accent);
        }
        
        .loading-state {
          text-align: center;
          padding: 60px;
        }
        
        .loading-state p {
          color: var(--text-secondary);
          margin-top: 20px;
        }
        
        .holdings-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 20px;
        }
        
        .holding-card {
          background: linear-gradient(145deg, var(--bg-card), var(--bg-secondary));
          border-radius: 16px;
          padding: 20px;
          border: 1px solid var(--border-color);
          transition: all 0.3s ease;
        }
        
        .holding-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
        }
        
        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 20px;
        }
        
        .token-identity {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        
        .token-emoji {
          font-size: 2em;
        }
        
        .token-name {
          font-weight: 700;
          font-size: 1.1em;
          display: block;
        }
        
        .token-source {
          font-size: 0.8em;
          color: var(--text-secondary);
        }
        
        .change-badge {
          padding: 4px 10px;
          border-radius: 20px;
          font-size: 0.8em;
          font-weight: 600;
        }
        
        .card-body {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          margin-bottom: 20px;
        }
        
        .price-value .price {
          font-size: 1.1em;
          color: var(--text-secondary);
          display: block;
        }
        
        .price-value .value {
          font-size: 1.5em;
          font-weight: 700;
          color: var(--accent-green);
        }
        
        .amount-hold {
          text-align: right;
        }
        
        .amount-hold .amount {
          font-size: 1.2em;
          font-weight: 600;
          display: block;
        }
        
        .amount-hold .label {
          font-size: 0.8em;
          color: var(--text-secondary);
        }
        
        .card-actions {
          display: flex;
          gap: 10px;
        }
        
        .action-btn {
          flex: 1;
          padding: 10px;
          background: linear-gradient(135deg, #ff0055, #ff00aa);
          border-radius: 10px;
          text-align: center;
          text-decoration: none;
          color: #fff;
          font-weight: 600;
          font-size: 0.9em;
          transition: all 0.2s;
        }
        
        .action-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 5px 20px rgba(255, 0, 85, 0.3);
        }
        
        .holdings-list {
          background: rgba(26, 26, 36, 0.6);
          backdrop-filter: blur(10px);
          border-radius: 16px;
          overflow: hidden;
        }
        
        .holding-row {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr auto;
          gap: 20px;
          padding: 18px 24px;
          border-bottom: 1px solid var(--border-color);
          align-items: center;
        }
        
        .holding-row:last-child {
          border-bottom: none;
        }
        
        .col-token {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        
        .token-amount {
          font-size: 0.85em;
          color: var(--text-secondary);
          display: block;
        }
        
        .col-price {
          text-align: right;
        }
        
        .col-price .price {
          display: block;
          font-weight: 500;
        }
        
        .col-price .change {
          font-size: 0.85em;
          font-weight: 500;
        }
        
        .col-value .value {
          font-size: 1.1em;
          font-weight: 600;
          color: var(--accent-green);
        }
        
        .trade-link {
          color: var(--accent);
          text-decoration: none;
          font-weight: 500;
          font-size: 0.9em;
          padding: 8px 16px;
          background: rgba(0, 212, 255, 0.1);
          border-radius: 8px;
          transition: all 0.2s;
        }
        
        .trade-link:hover {
          background: rgba(0, 212, 255, 0.2);
        }
        
        .empty-state {
          text-align: center;
          padding: 60px;
          color: var(--text-secondary);
        }
        
        .quick-links {
          margin-top: 30px;
        }
        
        .quick-links h3 {
          margin: 0 0 20px 0;
          font-size: 1.1em;
        }
        
        .links-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 15px;
        }
        
        .quick-link {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 15px 20px;
          background: var(--bg-secondary);
          border-radius: 12px;
          text-decoration: none;
          color: inherit;
          transition: all 0.2s;
        }
        
        .quick-link:hover {
          background: var(--bg-card);
          transform: translateY(-2px);
        }
        
        @media (max-width: 768px) {
          .wallet-connected {
            flex-direction: column;
            align-items: flex-start;
          }
          
          .portfolio-summary {
            text-align: left;
          }
          
          .holding-row {
            grid-template-columns: 1fr;
            gap: 10px;
          }
          
          .col-price, .col-value, .col-action {
            text-align: left;
          }
        }
        
        /* ARYA Holder Benefits */
        .holder-benefits {
          margin-top: 30px;
          padding: 25px;
          background: linear-gradient(135deg, rgba(255, 107, 53, 0.1), rgba(255, 107, 53, 0.05));
          border: 1px solid rgba(255, 107, 53, 0.3);
          border-radius: 16px;
        }
        
        .holder-benefits h3 {
          margin: 0 0 20px 0;
          color: #ff6b35;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        
        .benefits-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 15px;
        }
        
        .benefit-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 15px;
          background: rgba(255, 107, 53, 0.1);
          border-radius: 12px;
        }
        
        .benefit-item .icon {
          font-size: 1.5em;
        }
        
        .benefit-item .text {
          font-size: 0.9em;
        }
        
        .benefit-item .text strong {
          display: block;
          color: #ff6b35;
          margin-bottom: 2px;
        }
        
        .benefit-item .text span {
          color: var(--text-secondary);
          font-size: 0.85em;
        }
        
        .stake-arya-btn {
          display: block;
          width: 100%;
          margin-top: 20px;
          padding: 14px;
          background: linear-gradient(135deg, #ff6b35, #ff8c5a);
          color: #fff;
          border: none;
          border-radius: 12px;
          font-weight: 700;
          font-size: 1em;
          cursor: pointer;
          transition: all 0.3s ease;
          text-align: center;
          text-decoration: none;
        }
        
        .stake-arya-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(255, 107, 53, 0.4);
        }
      `}</style>
    </>
  );
}

export const dynamic = 'force-dynamic';
