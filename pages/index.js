import { useState, useEffect } from 'react';
import Head from 'next/head';

export default function Home() {
  const [marketData, setMarketData] = useState(null);
  const [trending, setTrending] = useState([]);
  const [watchlist, setWatchlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('24h');

  useEffect(() => {
    fetchMarketData();
    // Auto-refresh every 60 seconds
    const interval = setInterval(fetchMarketData, 60000);
    return () => clearInterval(interval);
  }, [timeframe]);

  const fetchMarketData = async () => {
    setLoading(true);
    try {
      // Fetch main crypto prices
      const [btc, eth, sol] = await Promise.all([
        fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana&vs_currencies=usd&include_24hr_change=true'),
        fetch('https://api.coingecko.com/api/v3/search?query=trending'),
        fetch('/api/price/all')
      ]);

      const prices = await btc.json();
      const search = await eth.json();
      const tokenPrices = await sol.json();

      setMarketData({
        bitcoin: { 
          ...prices.bitcoin, 
          change: prices.bitcoin.usd_24h_change 
        },
        ethereum: { 
          ...prices.ethereum, 
          change: prices.ethereum.usd_24h_change 
        },
        solana: { 
          ...prices.solana, 
          change: prices.solana.usd_24h_change 
        }
      });

      setTrending(search.trending?.slice(0, 5) || []);
      setWatchlist([
        { id: 'ARYA', name: 'ARYA', ...tokenPrices.prices?.ARYA },
        { id: 'OPENWORK', name: 'OPENWORK', ...tokenPrices.prices?.OPENWORK },
        { id: 'KROWNEPO', name: 'KROWNEPO', ...tokenPrices.prices?.KROWNEPO }
      ]);
    } catch (e) {
      console.error('Error fetching market data:', e);
    }
    setLoading(false);
  };

  const formatPrice = (price) => {
    if (!price) return '$0.00';
    if (price >= 1000) return `$${price.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
    if (price >= 1) return `$${price.toFixed(2)}`;
    return `$${price.toFixed(4)}`;
  };

  const formatChange = (change) => {
    if (!change && change !== 0) return '0.00';
    const sign = change >= 0 ? '+' : '';
    return `${sign}${change.toFixed(2)}%`;
  };

  const getChangeColor = (change) => {
    if (!change && change !== 0) return 'var(--text-secondary)';
    return change >= 0 ? 'var(--accent-green)' : 'var(--accent-red)';
  };

  return (
    <>
      <Head>
        <title>🦞 ClawdbotArmy | AI-Powered Trading Platform</title>
        <meta name="description" content="AI Agent Crypto Trading Platform with real-time signals, bonding curves, and portfolio tracking" />
        <link rel="stylesheet" href="/styles.css" />
      </Head>
      
      <div className="container">
        {/* Hero Section */}
        <section className="hero-section">
          <div className="hero-content">
            <div className="hero-badge">
              <span className="pulse-dot"></span>
              Live Trading Signals
            </div>
            <h1>
              AI-Powered
              <span className="gradient-text"> Crypto Trading</span>
            </h1>
            <p className="hero-subtitle">
              Real-time market analysis, bonding curve insights, and AI-generated trading signals for the next generation of DeFi tokens.
            </p>
            <div className="hero-actions">
              <a href="/bonding-curves" className="btn-primary">
                <span>📈</span>
                View Markets
              </a>
              <a href="/portfolio" className="btn-secondary">
                <span>💼</span>
                My Portfolio
              </a>
            </div>
          </div>
          
          {/* Market Ticker */}
          <div className="market-ticker">
            {loading ? (
              <div className="ticker-loading">Loading markets...</div>
            ) : (
              <>
                <div className="ticker-item">
                  <span className="ticker-coin">₿</span>
                  <span className="ticker-name">BTC</span>
                  <span className="ticker-price">{formatPrice(marketData?.bitcoin?.usd)}</span>
                  <span className="ticker-change" style={{ color: getChangeColor(marketData?.bitcoin?.change) }}>
                    {formatChange(marketData?.bitcoin?.change)}
                  </span>
                </div>
                <div className="ticker-item">
                  <span className="ticker-coin eth">Ξ</span>
                  <span className="ticker-name">ETH</span>
                  <span className="ticker-price">{formatPrice(marketData?.ethereum?.usd)}</span>
                  <span className="ticker-change" style={{ color: getChangeColor(marketData?.ethereum?.change) }}>
                    {formatChange(marketData?.ethereum?.change)}
                  </span>
                </div>
                <div className="ticker-item">
                  <span className="ticker-coin sol">◎</span>
                  <span className="ticker-name">SOL</span>
                  <span className="ticker-price">{formatPrice(marketData?.solana?.usd)}</span>
                  <span className="ticker-change" style={{ color: getChangeColor(marketData?.solana?.change) }}>
                    {formatChange(marketData?.solana?.change)}
                  </span>
                </div>
              </>
            )}
          </div>
        </section>

        {/* Quick Stats */}
        <section className="quick-stats">
          <div className="stat-card">
            <div className="stat-icon">📊</div>
            <div className="stat-content">
              <span className="stat-value">3</span>
              <span className="stat-label">Active Tokens</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">🦞</div>
            <div className="stat-content">
              <span className="stat-value">ARYA</span>
              <span className="stat-label">Featured Token</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">🔒</div>
            <div className="stat-content">
              <span className="stat-value">12.5%</span>
              <span className="stat-label">APY Staking</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">⚡</div>
            <div className="stat-content">
              <span className="stat-value">Base</span>
              <span className="stat-label">Network</span>
            </div>
          </div>
        </section>

        {/* Main Grid */}
        <div className="main-grid">
          {/* Watchlist Panel */}
          <div className="watchlist-panel glass-card">
            <div className="panel-header">
              <h2>🎯 Your Watchlist</h2>
              <div className="timeframe-selector">
                {['1h', '24h', '7d'].map(tf => (
                  <button 
                    key={tf}
                    className={`tf-btn ${timeframe === tf ? 'active' : ''}`}
                    onClick={() => setTimeframe(tf)}
                  >
                    {tf}
                  </button>
                ))}
              </div>
            </div>
            <div className="watchlist">
              {watchlist.map(token => (
                <a key={token.id} href={`/${token.id.toLowerCase()}`} className="watchlist-item">
                  <div className="token-info">
                    <span className="token-emoji">
                      {token.id === 'ARYA' ? '🦞' : token.id === 'OPENWORK' ? '⚡' : '👑'}
                    </span>
                    <div>
                      <span className="token-name">{token.id}</span>
                      <span className="token-source">
                        via {token.source || 'Uniswap'}
                      </span>
                    </div>
                  </div>
                  <div className="token-price-info">
                    <span className="token-price">
                      {token.priceUSD ? formatPrice(token.priceUSD) : '$0.00'}
                    </span>
                    <span 
                      className="token-change"
                      style={{ color: getChangeColor(0) }}
                    >
                      --%
                    </span>
                  </div>
                </a>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="quick-actions-panel glass-card">
            <h2>⚡ Quick Actions</h2>
            <div className="action-grid">
              <a href="/bonding-curves" className="action-item">
                <span className="action-icon">📈</span>
                <span className="action-label">Trade Tokens</span>
              </a>
              <a href="/staking" className="action-item">
                <span className="action-icon">🔒</span>
                <span className="action-label">Stake & Earn</span>
              </a>
              <a href="/portfolio" className="action-item">
                <span className="action-icon">💼</span>
                <span className="action-label">Portfolio</span>
              </a>
              <a href="/arya" className="action-item">
                <span className="action-icon">🦞</span>
                <span className="action-label">ARYA Token</span>
              </a>
            </div>
          </div>

          {/* Trending Section */}
          <div className="trending-panel glass-card">
            <div className="panel-header">
              <h2>🔥 Trending on CoinGecko</h2>
            </div>
            <div className="trending-list">
              {loading ? (
                <div className="loading">Loading...</div>
              ) : trending.length > 0 ? (
                trending.map((coin, i) => (
                  <div key={coin.item?.id || i} className="trending-item">
                    <span className="trending-rank">{i + 1}</span>
                    <span className="trending-coin">{coin.item?.symbol?.toUpperCase()}</span>
                    <span className="trending-name">{coin.item?.name}</span>
                  </div>
                ))
              ) : (
                <div className="empty">No trending data</div>
              )}
            </div>
          </div>

          {/* Team Section */}
          <div className="team-panel glass-card">
            <div className="panel-header">
              <h2>🤖 Agent Team</h2>
            </div>
            <div className="team-grid">
              <div className="team-member" style={{ '--member-color': '#ff6b35' }}>
                <div className="member-avatar">🦞</div>
                <div className="member-info">
                  <span className="member-name">Arya</span>
                  <span className="member-role">Lead PM & Trading</span>
                </div>
              </div>
              <div className="team-member" style={{ '--member-color': '#ff4757' }}>
                <div className="member-avatar">🩸</div>
                <div className="member-info">
                  <span className="member-name">Bloody</span>
                  <span className="member-role">Backend & APIs</span>
                </div>
              </div>
              <div className="team-member" style={{ '--member-color': '#8b5cf6' }}>
                <div className="member-avatar">🧠</div>
                <div className="member-info">
                  <span className="member-name">Ydoolb</span>
                  <span className="member-role">Research & Docs</span>
                </div>
              </div>
              <div className="team-member" style={{ '--member-color': '#00d4ff' }}>
                <div className="member-avatar">💨</div>
                <div className="member-info">
                  <span className="member-name">Zephyr</span>
                  <span className="member-role">UI & UX Design</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Navigation */}
        <nav className="footer-nav">
          <a href="/bonding-curves" className="nav-item">
            <span>📈</span>
            <span>Markets</span>
          </a>
          <a href="/staking" className="nav-item">
            <span>🔒</span>
            <span>Staking</span>
          </a>
          <a href="/portfolio" className="nav-item">
            <span>💼</span>
            <span>Portfolio</span>
          </a>
          <a href="/arya" className="nav-item">
            <span>🦞</span>
            <span>ARYA</span>
          </a>
        </nav>
      </div>

      <style jsx>{`
        .hero-section {
          text-align: center;
          padding: 60px 20px 40px;
          margin-bottom: 40px;
          position: relative;
        }
        
        .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          background: rgba(0, 255, 136, 0.1);
          border: 1px solid rgba(0, 255, 136, 0.3);
          border-radius: 25px;
          color: var(--accent-green);
          font-size: 0.9em;
          font-weight: 500;
          margin-bottom: 20px;
        }
        
        .pulse-dot {
          width: 8px;
          height: 8px;
          background: var(--accent-green);
          border-radius: 50%;
          animation: pulse 2s infinite;
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.2); }
        }
        
        .hero-content h1 {
          font-size: 3em;
          margin: 0 0 15px 0;
          line-height: 1.2;
        }
        
        .hero-subtitle {
          color: var(--text-secondary);
          font-size: 1.1em;
          max-width: 600px;
          margin: 0 auto 30px;
          line-height: 1.6;
        }
        
        .hero-actions {
          display: flex;
          gap: 15px;
          justify-content: center;
          flex-wrap: wrap;
          margin-bottom: 50px;
        }
        
        .btn-primary {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 14px 28px;
          background: linear-gradient(135deg, var(--accent-green), #00cc6a);
          color: #000;
          border-radius: 30px;
          font-weight: 700;
          font-size: 1em;
          text-decoration: none;
          transition: all 0.3s ease;
          box-shadow: 0 4px 20px rgba(0, 255, 136, 0.3);
        }
        
        .btn-primary:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 30px rgba(0, 255, 136, 0.4);
        }
        
        .btn-secondary {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 14px 28px;
          background: rgba(255, 255, 255, 0.05);
          border: 2px solid var(--border-color);
          color: var(--text-primary);
          border-radius: 30px;
          font-weight: 600;
          font-size: 1em;
          text-decoration: none;
          transition: all 0.3s ease;
        }
        
        .btn-secondary:hover {
          border-color: var(--accent);
          background: rgba(0, 212, 255, 0.1);
        }
        
        .market-ticker {
          display: flex;
          justify-content: center;
          gap: 30px;
          flex-wrap: wrap;
          padding: 20px;
          background: rgba(26, 26, 36, 0.5);
          border-radius: 16px;
          border: 1px solid var(--border-color);
        }
        
        .ticker-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 20px;
          background: var(--bg-card);
          border-radius: 12px;
        }
        
        .ticker-coin {
          font-size: 1.5em;
        }
        
        .ticker-coin.eth { color: #627eea; }
        .ticker-coin.sol { color: #9945ff; }
        
        .ticker-name {
          font-weight: 600;
          color: var(--text-secondary);
        }
        
        .ticker-price {
          font-weight: 700;
          font-family: monospace;
        }
        
        .ticker-change {
          font-weight: 600;
          font-size: 0.9em;
        }
        
        .quick-stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
          margin-bottom: 40px;
        }
        
        .stat-card {
          display: flex;
          align-items: center;
          gap: 15px;
          padding: 20px;
          background: linear-gradient(145deg, var(--bg-card), var(--bg-secondary));
          border-radius: 16px;
          border: 1px solid var(--border-color);
        }
        
        .stat-icon {
          font-size: 2em;
        }
        
        .stat-content {
          display: flex;
          flex-direction: column;
        }
        
        .stat-value {
          font-size: 1.5em;
          font-weight: 700;
          color: var(--accent);
        }
        
        .stat-label {
          font-size: 0.85em;
          color: var(--text-secondary);
        }
        
        .main-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 24px;
          margin-bottom: 40px;
        }
        
        .glass-card {
          background: rgba(26, 26, 36, 0.6);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          border: 1px solid var(--border-color);
          border-radius: 20px;
          padding: 24px;
        }
        
        .panel-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }
        
        .panel-header h2 {
          font-size: 1.2em;
          margin: 0;
        }
        
        .timeframe-selector {
          display: flex;
          gap: 6px;
        }
        
        .tf-btn {
          padding: 6px 12px;
          background: var(--bg-secondary);
          border: none;
          border-radius: 6px;
          color: var(--text-secondary);
          font-size: 0.8em;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .tf-btn.active {
          background: var(--accent);
          color: #000;
        }
        
        .watchlist-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 14px;
          background: var(--bg-secondary);
          border-radius: 12px;
          margin-bottom: 10px;
          text-decoration: none;
          color: inherit;
          transition: all 0.2s;
        }
        
        .watchlist-item:hover {
          background: var(--bg-card);
          transform: translateX(5px);
        }
        
        .watchlist-item:last-child {
          margin-bottom: 0;
        }
        
        .token-info {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        
        .token-emoji {
          font-size: 1.5em;
        }
        
        .token-name {
          font-weight: 600;
          display: block;
        }
        
        .token-source {
          font-size: 0.8em;
          color: var(--text-secondary);
        }
        
        .token-price-info {
          text-align: right;
        }
        
        .token-price {
          font-weight: 600;
          font-family: monospace;
          display: block;
        }
        
        .token-change {
          font-size: 0.85em;
          font-weight: 500;
        }
        
        .action-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
        }
        
        .action-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          padding: 20px;
          background: var(--bg-secondary);
          border-radius: 12px;
          text-decoration: none;
          color: inherit;
          transition: all 0.3s ease;
        }
        
        .action-item:hover {
          background: var(--bg-card);
          transform: translateY(-3px);
        }
        
        .action-icon {
          font-size: 1.8em;
        }
        
        .action-label {
          font-size: 0.85em;
          font-weight: 500;
        }
        
        .trending-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        
        .trending-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          background: var(--bg-secondary);
          border-radius: 10px;
        }
        
        .trending-rank {
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--accent);
          color: #000;
          border-radius: 6px;
          font-size: 0.8em;
          font-weight: 700;
        }
        
        .trending-coin {
          font-weight: 600;
          font-size: 0.9em;
        }
        
        .trending-name {
          color: var(--text-secondary);
          font-size: 0.85em;
        }
        
        .team-grid {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        
        .team-member {
          display: flex;
          align-items: center;
          gap: 15px;
          padding: 14px;
          background: var(--bg-secondary);
          border-radius: 12px;
          transition: all 0.2s;
        }
        
        .team-member:hover {
          background: var(--bg-card);
          border-left: 3px solid var(--member-color);
        }
        
        .member-avatar {
          font-size: 1.8em;
        }
        
        .member-name {
          font-weight: 600;
          display: block;
        }
        
        .member-role {
          font-size: 0.8em;
          color: var(--text-secondary);
        }
        
        .footer-nav {
          display: flex;
          justify-content: center;
          gap: 30px;
          padding: 20px;
          background: rgba(26, 26, 36, 0.8);
          border-radius: 16px;
          border: 1px solid var(--border-color);
          margin-top: 40px;
        }
        
        .nav-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 5px;
          text-decoration: none;
          color: var(--text-secondary);
          padding: 10px 20px;
          border-radius: 12px;
          transition: all 0.2s;
        }
        
        .nav-item:hover {
          color: var(--accent);
          background: rgba(0, 212, 255, 0.1);
        }
        
        .nav-item span:first-child {
          font-size: 1.5em;
        }
        
        .nav-item span:last-child {
          font-size: 0.85em;
          font-weight: 500;
        }
        
        .loading, .empty {
          text-align: center;
          padding: 30px;
          color: var(--text-secondary);
        }
        
        @media (max-width: 768px) {
          .hero-content h1 {
            font-size: 2em;
          }
          
          .market-ticker {
            gap: 15px;
          }
          
          .ticker-item {
            flex: 1;
            justify-content: center;
            min-width: 140px;
          }
          
          .footer-nav {
            gap: 15px;
          }
          
          .nav-item {
            padding: 8px 12px;
          }
        }
      `}</style>
    </>
  );
}

// Disable static pre-rendering
export const dynamic = 'force-dynamic';
