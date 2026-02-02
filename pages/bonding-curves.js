import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';

export default function BondingCurves() {
  const [tokens, setTokens] = useState([
    { 
      id: 'ARYA', 
      emoji: '🦞',
      color: '#ff6b35',
      address: '0xcc78a1F8eCE2ce5ff78d2C0D0c8268ddDa5B6B07',
      description: 'AI Agent Token',
      uniswapUrl: 'https://app.uniswap.org/swap?chain=base&inputCurrency=0xcc78a1F8eCE2ce5ff78d2C0D0c8268ddDa5B6B07'
    },
    { 
      id: 'OPENWORK', 
      emoji: '⚡',
      color: '#00d4ff',
      address: '0x299c30dd5974bf4d5bfe42c340ca40462816ab07',
      description: 'OpenWork Protocol',
      uniswapUrl: 'https://app.uniswap.org/swap?chain=base&inputCurrency=0x299c30dd5974bf4d5bfe42c340ca40462816ab07'
    },
    { 
      id: 'KROWNEPO', 
      emoji: '👑',
      color: '#9333ea',
      address: '0xAFe8861b074B8C2551055a20A2a4f39E45037B07',
      description: 'KROWNEPO Token',
      uniswapUrl: 'https://app.uniswap.org/swap?chain=base&inputCurrency=0xAFe8861b074B8C2551055a20A2a4f39E45037B07'
    }
  ]);
  const [selectedToken, setSelectedToken] = useState(tokens[0]);
  const [prices, setPrices] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPrices();
    const interval = setInterval(fetchPrices, 15000);
    return () => clearInterval(interval);
  }, []);

  const fetchPrices = async () => {
    setLoading(true);
    try {
      const r = await fetch('/api/price/all');
      const data = await r.json();
      setPrices(data.prices || {});
    } catch (e) {
      console.error('Error fetching prices:', e);
    }
    setLoading(false);
  };

  const formatPrice = (data) => {
    if (!data?.priceUSD || isNaN(data.priceUSD) || !isFinite(data.priceUSD)) return '--';
    if (data.priceUSD >= 1000) {
      return `$${data.priceUSD.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
    }
    if (data.priceUSD >= 1) {
      return `$${data.priceUSD.toFixed(2)}`;
    }
    return `$${data.priceUSD.toFixed(6)}`;
  };

  const formatETH = (priceETH) => {
    if (!priceETH || isNaN(priceETH) || !isFinite(priceETH)) return '--';
    return `${priceETH.toFixed(10)} ETH`;
  };

  const formatSource = (data) => {
    if (!data?.source) return '';
    return data.source;
  };

  const getUniswapEmbedUrl = (tokenAddress) => {
    return `https://app.uniswap.org/swap?chain=base&inputCurrency=ETH&outputCurrency=${tokenAddress}&use=v2`;
  };

  const getChangeColor = (tokenId) => {
    // Simulated 24h change
    return 'var(--accent-green)';
  };

  return (
    <>
      <Head>
        <title>📈 Trading | ClawdbotArmy</title>
        <meta name="description" content="Trade AI agent tokens on Base with bonding curves" />
        <link rel="stylesheet" href="/styles.css" />
      </Head>
      
      <div className="tokens-page">
        <header className="tokens-header">
          <Link href="/" className="back-link">← Back</Link>
          <h1>📈 Trading</h1>
          <p className="page-subtitle">Buy and sell AI agent tokens on Base</p>
        </header>

        {/* Token Selector */}
        <div className="token-tabs">
          {tokens.map(token => {
            const priceData = prices[token.id];
            const isSelected = selectedToken.id === token.id;
            
            return (
              <button
                key={token.id}
                className={`token-tab ${isSelected ? 'active' : ''}`}
                onClick={() => setSelectedToken(token)}
                style={{ '--token-color': token.color }}
              >
                <span className="token-emoji">{token.emoji}</span>
                <div className="token-info">
                  <span className="token-name">{token.id}</span>
                  <span className="token-price">
                    {priceData?.priceUSD ? formatPrice(priceData) : 'Loading...'}
                  </span>
                </div>
                {isSelected && <div className="active-indicator" />}
              </button>
            );
          })}
        </div>

        {/* Main Trading Section */}
        <div className="trading-layout">
          {/* Left: Token Info & Actions */}
          <div className="token-details glass-card">
            <div className="token-header">
              <div 
                className="token-icon"
                style={{ background: `linear-gradient(135deg, ${selectedToken.color}, ${selectedToken.color}88)` }}
              >
                {selectedToken.emoji}
              </div>
              <div className="token-title">
                <h2>{selectedToken.id}</h2>
                <p>{selectedToken.description}</p>
              </div>
            </div>

            <div className="token-price-section">
              {loading ? (
                <div className="price-loading">Loading...</div>
              ) : prices[selectedToken.id]?.priceUSD ? (
                <>
                  <div className="price-main">{formatPrice(prices[selectedToken.id])}</div>
                  <div className="price-eth">
                    {formatETH(prices[selectedToken.id]?.priceETH)}
                  </div>
                  <div className="price-meta">
                    <span className="price-source">
                      📊 via {formatSource(prices[selectedToken.id]) || 'Uniswap'}
                    </span>
                    <span className="price-change" style={{ color: getChangeColor(selectedToken.id) }}>
                      +2.5% (24h)
                    </span>
                  </div>
                </>
              ) : (
                <div className="price-loading">--</div>
              )}
            </div>

            {/* Trading Actions */}
            <div className="trading-actions">
              <a 
                href={selectedToken.uniswapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="trade-btn uniswap"
              >
                <span>🦄</span>
                <span>Trade on Uniswap</span>
              </a>
              <a 
                href={`https://www.clanker.world/clanker/${selectedToken.address}`}
                target="_blank"
                rel="noopener noreferrer"
                className="trade-btn clanker"
              >
                <span>🤖</span>
                <span>View on Clanker</span>
              </a>
            </div>

            {/* Contract Info */}
            <div className="contract-info">
              <h4>Contract Address</h4>
              <div className="address-row">
                <code>{selectedToken.address.slice(0, 6)}...{selectedToken.address.slice(-4)}</code>
                <a 
                  href={`https://basescan.org/address/${selectedToken.address}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="etherscan-link"
                >
                  View on Basescan →
                </a>
              </div>
            </div>

            {/* Bonding Curve Progress (Simulated) */}
            <div className="bonding-curve-info">
              <h4>Bonding Curve Status</h4>
              <div className="curve-progress">
                <div className="progress-bar">
                  <div 
                    className="progress-fill"
                    style={{ 
                      width: '65%',
                      background: `linear-gradient(90deg, ${selectedToken.color}, ${selectedToken.color}88)`
                    }}
                  />
                </div>
                <div className="progress-labels">
                  <span>Launch Pool</span>
                  <span>65% Filled</span>
                  <span>Uniswap V3</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Uniswap Embed */}
          <div className="uniswap-section glass-card">
            <div className="section-header">
              <h3>Swap {selectedToken.id}</h3>
              <span className="network-badge">Base Network</span>
            </div>
            <div className="iframe-container">
              <iframe
                src={getUniswapEmbedUrl(selectedToken.address)}
                width="100%"
                height="550"
                style={{ border: 'none', borderRadius: '12px' }}
                title={`Uniswap ${selectedToken.id} Swap`}
                allow="cross-origin-isolated"
              />
            </div>
          </div>
        </div>

        {/* All Tokens Quick View */}
        <div className="all-tokens-section glass-card">
          <h3>All Available Tokens</h3>
          <div className="tokens-grid">
            {tokens.map(token => {
              const priceData = prices[token.id];
              const isSelected = selectedToken.id === token.id;
              
              return (
                <div 
                  key={token.id}
                  className={`mini-token-card ${isSelected ? 'selected' : ''}`}
                  onClick={() => setSelectedToken(token)}
                  style={{ '--token-color': token.color }}
                >
                  <div className="mini-emoji">{token.emoji}</div>
                  <div className="mini-info">
                    <span className="mini-name">{token.id}</span>
                    <span className="mini-price">
                      {priceData?.priceUSD ? formatPrice(priceData) : '--'}
                    </span>
                  </div>
                  <div className="mini-change" style={{ color: getChangeColor(token.id) }}>
                    +2.5%
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <style jsx>{`
        .tokens-page {
          min-height: 100vh;
          background: var(--bg-primary);
          padding: 20px;
        }
        
        .tokens-header {
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
        
        .tokens-header h1 {
          font-size: 2em;
          margin: 0;
        }
        
        .page-subtitle {
          color: var(--text-secondary);
          margin: 0;
        }
        
        .token-tabs {
          display: flex;
          gap: 15px;
          margin-bottom: 30px;
          overflow-x: auto;
          padding-bottom: 10px;
        }
        
        .token-tab {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px 24px;
          background: var(--bg-secondary);
          border: 2px solid transparent;
          border-radius: 16px;
          cursor: pointer;
          transition: all 0.3s ease;
          min-width: 180px;
          position: relative;
        }
        
        .token-tab:hover {
          background: var(--bg-card);
        }
        
        .token-tab.active {
          background: var(--bg-card);
          border-color: var(--token-color);
          box-shadow: 0 0 20px var(--token-color);
        }
        
        .token-emoji {
          font-size: 1.8em;
        }
        
        .token-info {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
        }
        
        .token-name {
          font-weight: 700;
          font-size: 1.1em;
        }
        
        .token-price {
          font-size: 0.85em;
          color: var(--text-secondary);
        }
        
        .active-indicator {
          position: absolute;
          bottom: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 60%;
          height: 3px;
          background: var(--token-color);
          border-radius: 2px;
        }
        
        .glass-card {
          background: rgba(26, 26, 36, 0.6);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          border: 1px solid var(--border-color);
          border-radius: 20px;
          padding: 24px;
        }
        
        .trading-layout {
          display: grid;
          grid-template-columns: 350px 1fr;
          gap: 24px;
          margin-bottom: 30px;
        }
        
        .token-details {
          display: flex;
          flex-direction: column;
          gap: 25px;
        }
        
        .token-header {
          display: flex;
          align-items: center;
          gap: 16px;
        }
        
        .token-icon {
          width: 60px;
          height: 60px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2em;
        }
        
        .token-title h2 {
          margin: 0 0 4px 0;
          font-size: 1.5em;
        }
        
        .token-title p {
          margin: 0;
          color: var(--text-secondary);
          font-size: 0.9em;
        }
        
        .token-price-section {
          text-align: center;
          padding: 20px;
          background: var(--bg-secondary);
          border-radius: 16px;
        }
        
        .price-main {
          font-size: 2.5em;
          font-weight: 700;
          color: var(--accent-green);
          margin-bottom: 5px;
        }
        
        .price-eth {
          font-size: 1em;
          color: var(--text-secondary);
          margin-bottom: 10px;
        }
        
        .price-meta {
          display: flex;
          justify-content: center;
          gap: 20px;
          font-size: 0.85em;
        }
        
        .price-source {
          color: var(--text-secondary);
        }
        
        .price-change {
          font-weight: 600;
        }
        
        .price-loading {
          font-size: 2em;
          color: var(--text-secondary);
        }
        
        .trading-actions {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        
        .trade-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          padding: 16px;
          border-radius: 12px;
          text-decoration: none;
          font-weight: 600;
          font-size: 1em;
          transition: all 0.3s ease;
        }
        
        .trade-btn.uniswap {
          background: linear-gradient(135deg, #ff0055, #ff00aa);
          color: #fff;
        }
        
        .trade-btn.uniswap:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(255, 0, 85, 0.4);
        }
        
        .trade-btn.clanker {
          background: var(--bg-secondary);
          color: var(--text-primary);
          border: 1px solid var(--border-color);
        }
        
        .trade-btn.clanker:hover {
          border-color: var(--accent);
        }
        
        .contract-info h4,
        .bonding-curve-info h4 {
          margin: 0 0 12px 0;
          font-size: 0.9em;
          color: var(--text-secondary);
        }
        
        .address-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px;
          background: var(--bg-secondary);
          border-radius: 10px;
        }
        
        .address-row code {
          color: var(--accent);
          font-family: monospace;
        }
        
        .etherscan-link {
          color: var(--text-secondary);
          text-decoration: none;
          font-size: 0.85em;
          transition: color 0.2s;
        }
        
        .etherscan-link:hover {
          color: var(--accent);
        }
        
        .curve-progress {
          padding: 10px 0;
        }
        
        .progress-bar {
          height: 8px;
          background: var(--bg-secondary);
          border-radius: 4px;
          overflow: hidden;
          margin-bottom: 10px;
        }
        
        .progress-fill {
          height: 100%;
          border-radius: 4px;
          transition: width 0.5s ease;
        }
        
        .progress-labels {
          display: flex;
          justify-content: space-between;
          font-size: 0.8em;
          color: var(--text-secondary);
        }
        
        .uniswap-section {
          display: flex;
          flex-direction: column;
        }
        
        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }
        
        .section-header h3 {
          margin: 0;
        }
        
        .network-badge {
          padding: 6px 12px;
          background: linear-gradient(135deg, var(--accent), #0099ff);
          color: #fff;
          border-radius: 20px;
          font-size: 0.8em;
          font-weight: 600;
        }
        
        .iframe-container {
          flex: 1;
          border-radius: 12px;
          overflow: hidden;
        }
        
        .all-tokens-section h3 {
          margin: 0 0 20px 0;
        }
        
        .tokens-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 15px;
        }
        
        .mini-token-card {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px;
          background: var(--bg-secondary);
          border-radius: 12px;
          cursor: pointer;
          border: 2px solid transparent;
          transition: all 0.3s ease;
        }
        
        .mini-token-card:hover {
          background: var(--bg-card);
        }
        
        .mini-token-card.selected {
          border-color: var(--token-color);
        }
        
        .mini-emoji {
          font-size: 1.5em;
        }
        
        .mini-info {
          flex: 1;
        }
        
        .mini-name {
          font-weight: 600;
          display: block;
        }
        
        .mini-price {
          font-size: 0.85em;
          color: var(--text-secondary);
        }
        
        .mini-change {
          font-weight: 600;
          font-size: 0.9em;
        }
        
        @media (max-width: 900px) {
          .trading-layout {
            grid-template-columns: 1fr;
          }
          
          .token-tabs {
            flex-wrap: nowrap;
          }
        }
        
        @media (max-width: 600px) {
          .tokens-header {
            flex-direction: column;
            align-items: flex-start;
          }
          
          .token-tab {
            min-width: 150px;
            padding: 12px 16px;
          }
        }
      `}</style>
    </>
  );
}

export const dynamic = 'force-dynamic';
