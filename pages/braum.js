import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';

export default function Braum() {
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
      setMarketData(data.prices?.BRAUM || null);
    } catch (e) {
      console.error('Error:', e);
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

  const BRAUM_ADDRESS = '0xefb28887A479029B065Cb931a973B97101209b07';
  const uniswapUrl = `https://app.uniswap.org/swap?chain=base&inputCurrency=ETH&outputCurrency=${BRAUM_ADDRESS}`;
  const clankerUrl = `https://www.clanker.world/clanker/${BRAUM_ADDRESS}`;
  const basescanUrl = `https://basescan.org/token/${BRAUM_ADDRESS}`;

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
        <title>🛡️ BRAUM Token | ClawdbotArmy</title>
        <meta name="description" content="BRAUM Warrior Token on Base. Trade and track on ClawdbotArmy." />
        <link rel="stylesheet" href="/styles.css" />
      </Head>
      
      <div className="token-page">
        <header className="token-header">
          <Link href="/" className="back-link">← Back</Link>
          <div className="header-content">
            <div className="token-identity">
              <div className="token-avatar braum">🛡️</div>
              <div className="token-title">
                <h1>BRAUM</h1>
                <p>Warrior Token</p>
              </div>
            </div>
            <div className="token-badges">
              <span className="badge warrior">⚔️ Warrior</span>
              <span className="badge new">🆕 New</span>
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
              <span className="stat-label">Network</span>
              <span className="stat-value">Base</span>
            </div>
            <div className="stat">
              <span className="stat-label">Type</span>
              <span className="stat-value">Clanker Token</span>
            </div>
            <div className="stat">
              <span className="stat-label">Creator</span>
              <span className="stat-value">15% Vault</span>
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
                <code>{BRAUM_ADDRESS.slice(0, 6)}...{BRAUM_ADDRESS.slice(-4)}</code>
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
              <span className="info-value">BRAUM</span>
            </div>
            <div className="info-item">
              <span className="info-label">Decimals</span>
              <span className="info-value">18</span>
            </div>
          </div>
        </section>

        {/* About */}
        <section className="about-section glass-card">
          <h2>About BRAUM</h2>
          <div className="about-content">
            <p>
              BRAUM is the warrior token empowering the ClawdbotArmy ecosystem. 
              Named after the legendary protector from Runeterra, BRAUM represents 
              strength, defense, and community protection.
            </p>
            <div className="token-features">
              <div className="feature">
                <span className="feature-icon">🛡️</span>
                <span>Protector Staking</span>
              </div>
              <div className="feature">
                <span className="feature-icon">⚔️</span>
                <span>Warrior Rewards</span>
              </div>
              <div className="feature">
                <span className="feature-icon">🏰</span>
                <span>Community Vault</span>
              </div>
              <div className="feature">
                <span className="feature-icon">🎁</span>
                <span>NFT Access</span>
              </div>
            </div>
          </div>
        </section>

        {/* Uniswap Embed */}
        <section className="uniswap-section glass-card">
          <h2>Swap BRAUM</h2>
          <iframe
            src={getUniswapEmbedUrl(BRAUM_ADDRESS)}
            width="100%"
            height="550"
            style={{ border: 'none', borderRadius: '12px' }}
            title="Uniswap BRAUM Swap"
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
          border-radius: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2.5em;
        }
        
        .token-avatar.braum {
          background: linear-gradient(135deg, #4a90d9, #357abd);
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
          border-radius: 20px;
          font-size: 0.85em;
          font-weight: 500;
        }
        
        .badge.warrior {
          background: rgba(74, 144, 217, 0.15);
          border: 1px solid rgba(74, 144, 217, 0.3);
          color: #4a90d9;
        }
        
        .badge.new {
          background: rgba(0, 255, 136, 0.15);
          border: 1px solid rgba(0, 255, 136, 0.3);
          color: var(--accent-green);
        }
        
        .glass-card {
          background: rgba(26, 26, 36, 0.6);
          backdrop-filter: blur(10px);
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
          background: linear-gradient(135deg, #4a90d9, #357abd);
          color: #fff;
        }
        
        .action-btn.primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(74, 144, 217, 0.4);
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
          color: #4a90d9;
          font-family: monospace;
        }
        
        .etherscan-link {
          color: var(--text-secondary);
          text-decoration: none;
          font-size: 0.85em;
        }
        
        .etherscan-link:hover {
          color: #4a90d9;
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
          color: #4a90d9;
          background: rgba(74, 144, 217, 0.1);
        }
      `}</style>
    </>
  );
}

export const dynamic = 'force-dynamic';
