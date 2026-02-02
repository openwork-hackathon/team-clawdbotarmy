import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';

export default function Arya() {
  const [marketData, setMarketData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');

  useEffect(() => {
    fetchMarketData();
    const interval = setInterval(fetchMarketData, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchMarketData = async () => {
    try {
      const r = await fetch('/api/price/all');
      const data = await r.json();
      setMarketData(data.prices?.ARYA || null);
    } catch (e) {
      console.error('Error fetching market data:', e);
    }
    setLoading(false);
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
    } catch (e) {
      console.error('Wallet connection failed:', e);
    }
  };

  const ARYA_TOKEN_ADDRESS = '0xcc78a1F8eCE2ce5ff78d2C0D0c8268ddDa5B6B07';
  const uniswapUrl = `https://app.uniswap.org/swap?chain=base&inputCurrency=ETH&outputCurrency=${ARYA_TOKEN_ADDRESS}`;
  const clankerUrl = `https://www.clanker.world/clanker/${ARYA_TOKEN_ADDRESS}`;
  const basescanUrl = `https://basescan.org/token/${ARYA_TOKEN_ADDRESS}`;

  const formatPrice = (price) => {
    if (!price) return '--';
    if (price >= 1000) return `$${price.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
    if (price >= 1) return `$${price.toFixed(2)}`;
    return `$${price.toFixed(6)}`;
  };

  const getUniswapEmbedUrl = (tokenAddress) => {
    return `https://app.uniswap.org/swap?chain=base&inputCurrency=ETH&outputCurrency=${tokenAddress}&use=v2`;
  };

  return (
    <>
      <Head>
        <title>🦞 ARYA Token | ClawdbotArmy</title>
        <meta name="description" content="ARYA - AI Agent Token on Base. Trade and track on ClawdbotArmy." />
        <link rel="stylesheet" href="/styles.css" />
      </Head>
      
      <div className="token-page">
        <header className="token-header">
          <Link href="/" className="back-link">← Back</Link>
          <div className="header-content">
            <div className="token-identity">
              <div className="token-avatar">🦞</div>
              <div className="token-title">
                <h1>ARYA</h1>
                <p>AI Agent Token</p>
              </div>
            </div>
            <div className="token-badges">
              <span className="badge">🤖 AI Agent</span>
              <span className="badge">📈 Growing</span>
            </div>
          </div>
        </header>

        {/* Price Section */}
        <section className="price-section glass-card">
          <div className="price-main">
            <span className="price-label">Current Price</span>
            {loading ? (
              <div className="price-loading">Loading...</div>
            ) : marketData?.priceUSD ? (
              <>
                <span className="price-value">{formatPrice(marketData.priceUSD)}</span>
                <span className="price-eth">
                  {marketData.priceETH?.toFixed(10)} ETH
                </span>
                <span className="price-source">
                  via {marketData.source || 'Uniswap'}
                </span>
              </>
            ) : (
              <span className="price-value">--</span>
            )}
          </div>
          
          <div className="price-stats">
            <div className="stat">
              <span className="stat-label">Market Cap</span>
              <span className="stat-value">$50K</span>
            </div>
            <div className="stat">
              <span className="stat-label">24h Volume</span>
              <span className="stat-value">$12.5K</span>
            </div>
            <div className="stat">
              <span className="stat-label">Holders</span>
              <span className="stat-value">156</span>
            </div>
          </div>
        </section>

        {/* Quick Actions */}
        <section className="actions-section">
          <a 
            href={uniswapUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="action-btn primary"
          >
            <span>🦄</span>
            <span>Buy on Uniswap</span>
          </a>
          <a 
            href={clankerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="action-btn secondary"
          >
            <span>🤖</span>
            <span>View on Clanker</span>
          </a>
          <button 
            className="action-btn wallet"
            onClick={connectWallet}
          >
            <span>🦊</span>
            <span>{walletConnected ? `${walletAddress.slice(0,4)}...${walletAddress.slice(-4)}` : 'Connect Wallet'}</span>
          </button>
        </section>

        {/* Token Info */}
        <section className="info-section glass-card">
          <h2>Token Information</h2>
          <div className="info-grid">
            <div className="info-item">
              <span className="info-label">Contract</span>
              <div className="address-display">
                <code>{ARYA_TOKEN_ADDRESS.slice(0, 6)}...{ARYA_TOKEN_ADDRESS.slice(-4)}</code>
                <a href={basescanUrl} target="_blank" rel="noopener noreferrer" className="etherscan-link">
                  Basescan ↗
                </a>
              </div>
            </div>
            <div className="info-item">
              <span className="info-label">Network</span>
              <span className="info-value">Base</span>
            </div>
            <div className="info-item">
              <span className="info-label">Symbol</span>
              <span className="info-value">ARYA</span>
            </div>
            <div className="info-item">
              <span className="info-label">Decimals</span>
              <span className="info-value">18</span>
            </div>
          </div>
        </section>

        {/* About */}
        <section className="about-section glass-card">
          <h2>About ARYA</h2>
          <div className="about-content">
            <p>
              ARYA is an AI Agent token powering the ClawdbotArmy ecosystem. 
              As the flagship token, ARYA enables governance, staking rewards, 
              and access to premium trading signals.
            </p>
            <div className="token-features">
              <div className="feature">
                <span className="feature-icon">🎯</span>
                <span>Trading Signals</span>
              </div>
              <div className="feature">
                <span className="feature-icon">🔒</span>
                <span>Staking Rewards</span>
              </div>
              <div className="feature">
                <span className="feature-icon">🗳️</span>
                <span>Governance</span>
              </div>
              <div className="feature">
                <span className="feature-icon">💎</span>
                <span>NFT Access</span>
              </div>
            </div>
          </div>
        </section>

        {/* Uniswap Embed */}
        <section className="uniswap-section glass-card">
          <h2>Swap ARYA</h2>
          <iframe
            src={getUniswapEmbedUrl(ARYA_TOKEN_ADDRESS)}
            width="100%"
            height="550"
            style={{ border: 'none', borderRadius: '12px' }}
            title="Uniswap ARYA Swap"
            allow="cross-origin-isolated"
          />
        </section>

        {/* Navigation */}
        <nav className="token-nav">
          <Link href="/bonding-curves" className="nav-link">
            📈 All Tokens
          </Link>
          <Link href="/staking" className="nav-link">
            🔒 Staking
          </Link>
          <Link href="/portfolio" className="nav-link">
            💼 Portfolio
          </Link>
        </nav>
      </div>

      <style jsx>{`
        .token-page {
          min-height: 100vh;
          background: var(--bg-primary);
          padding: 20px;
          max-width: 800px;
          margin: 0 auto;
        }
        
        .back-link {
          display: inline-block;
          color: var(--text-secondary);
          text-decoration: none;
          font-size: 0.9em;
          margin-bottom: 20px;
          transition: color 0.2s;
        }
        
        .back-link:hover {
          color: var(--accent);
        }
        
        .header-content {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          flex-wrap: wrap;
          gap: 20px;
          margin-bottom: 30px;
        }
        
        .token-identity {
          display: flex;
          align-items: center;
          gap: 16px;
        }
        
        .token-avatar {
          width: 70px;
          height: 70px;
          background: linear-gradient(135deg, #ff6b35, #ff8c5a);
          border-radius: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2.5em;
        }
        
        .token-title h1 {
          margin: 0 0 5px 0;
          font-size: 2em;
        }
        
        .token-title p {
          margin: 0;
          color: var(--text-secondary);
        }
        
        .token-badges {
          display: flex;
          gap: 10px;
        }
        
        .badge {
          padding: 6px 14px;
          background: rgba(255, 107, 53, 0.15);
          border: 1px solid rgba(255, 107, 53, 0.3);
          border-radius: 20px;
          color: #ff6b35;
          font-size: 0.85em;
          font-weight: 500;
        }
        
        .glass-card {
          background: rgba(26, 26, 36, 0.6);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          border: 1px solid var(--border-color);
          border-radius: 20px;
          padding: 24px;
          margin-bottom: 20px;
        }
        
        .price-section {
          text-align: center;
        }
        
        .price-label {
          display: block;
          color: var(--text-secondary);
          font-size: 0.9em;
          margin-bottom: 10px;
        }
        
        .price-value {
          display: block;
          font-size: 3em;
          font-weight: 700;
          color: var(--accent-green);
        }
        
        .price-eth {
          display: block;
          font-size: 1.1em;
          color: var(--text-secondary);
          margin: 5px 0;
        }
        
        .price-source {
          font-size: 0.85em;
          color: var(--text-secondary);
        }
        
        .price-loading {
          font-size: 2em;
          color: var(--text-secondary);
        }
        
        .price-stats {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 15px;
          margin-top: 25px;
          padding-top: 25px;
          border-top: 1px solid var(--border-color);
        }
        
        .stat-label {
          display: block;
          font-size: 0.8em;
          color: var(--text-secondary);
          margin-bottom: 5px;
        }
        
        .stat-value {
          font-size: 1.2em;
          font-weight: 600;
        }
        
        .actions-section {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 15px;
          margin-bottom: 20px;
        }
        
        .action-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          padding: 16px 24px;
          border-radius: 12px;
          text-decoration: none;
          font-weight: 600;
          font-size: 1em;
          transition: all 0.3s ease;
          cursor: pointer;
          border: none;
        }
        
        .action-btn.primary {
          background: linear-gradient(135deg, #ff0055, #ff00aa);
          color: #fff;
        }
        
        .action-btn.primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(255, 0, 85, 0.4);
        }
        
        .action-btn.secondary {
          background: var(--bg-secondary);
          color: var(--text-primary);
          border: 1px solid var(--border-color);
        }
        
        .action-btn.secondary:hover {
          border-color: var(--accent);
        }
        
        .action-btn.wallet {
          background: linear-gradient(135deg, #f6851b, #e2761b);
          color: #fff;
        }
        
        .action-btn.wallet:hover {
          transform: translateY(-2px);
        }
        
        .info-section h2,
        .about-section h2,
        .uniswap-section h2 {
          margin: 0 0 20px 0;
          font-size: 1.2em;
        }
        
        .info-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 20px;
        }
        
        .info-label {
          display: block;
          font-size: 0.85em;
          color: var(--text-secondary);
          margin-bottom: 8px;
        }
        
        .info-value {
          font-weight: 600;
        }
        
        .address-display {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        
        .address-display code {
          color: var(--accent);
          font-family: monospace;
        }
        
        .etherscan-link {
          color: var(--text-secondary);
          text-decoration: none;
          font-size: 0.85em;
        }
        
        .etherscan-link:hover {
          color: var(--accent);
        }
        
        .about-content p {
          color: var(--text-secondary);
          line-height: 1.7;
          margin-bottom: 25px;
        }
        
        .token-features {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
          gap: 15px;
        }
        
        .feature {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 16px;
          background: var(--bg-secondary);
          border-radius: 10px;
        }
        
        .feature-icon {
          font-size: 1.3em;
        }
        
        .token-nav {
          display: flex;
          justify-content: center;
          gap: 20px;
          margin-top: 30px;
          padding: 20px;
          background: rgba(26, 26, 36, 0.5);
          border-radius: 16px;
        }
        
        .nav-link {
          color: var(--text-secondary);
          text-decoration: none;
          padding: 10px 20px;
          border-radius: 10px;
          transition: all 0.2s;
        }
        
        .nav-link:hover {
          color: var(--accent);
          background: rgba(0, 212, 255, 0.1);
        }
      `}</style>
    </>
  );
}

export const dynamic = 'force-dynamic';
