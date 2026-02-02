import { useState, useEffect } from 'react';
import Head from 'next/head';

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
    const newPrices = {};
    
    for (const token of tokens) {
      try {
        const r = await fetch(`/api/price/${token.id.toLowerCase()}`);
        const data = await r.json();
        newPrices[token.id] = data;
      } catch (e) {
        newPrices[token.id] = null;
      }
    }
    
    setPrices(newPrices);
    setLoading(false);
  };

  const formatPrice = (data) => {
    if (!data?.priceUSD) return '--';
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(data.priceUSD);
  };

  // Uniswap widget URL for embedded swap
  const getUniswapEmbedUrl = (tokenAddress) => {
    return `https://app.uniswap.org/swap?chain=base&inputCurrency=ETH&outputCurrency=${tokenAddress}&use=v2`;
  };

  return (
    <>
      <Head>
        <title>Tokens | ClawdbotArmy</title>
        <meta name="description" content="AI Agent Tokens on Base" />
        <link rel="stylesheet" href="/styles.css" />
      </Head>
      
      <div className="tokens-page">
        <header className="tokens-header">
          <h1>AI Agent Tokens</h1>
          <p>Trade on Uniswap V3 (Base)</p>
        </header>

        {/* Token Tabs */}
        <div className="token-tabs">
          {tokens.map(token => (
            <button
              key={token.id}
              className={`token-tab ${selectedToken.id === token.id ? 'active' : ''}`}
              onClick={() => setSelectedToken(token)}
              style={{ '--token-color': token.color }}
            >
              <span className="token-emoji">{token.emoji}</span>
              <span className="token-name">{token.id}</span>
            </button>
          ))}
        </div>

        {/* Selected Token Card */}
        <div className="token-card" style={{ borderColor: selectedToken.color }}>
          <div className="token-header" style={{ borderColor: selectedToken.color }}>
            <span className="token-emoji-large">{selectedToken.emoji}</span>
            <div className="token-info">
              <h2>{selectedToken.id}</h2>
              <p>{selectedToken.description}</p>
            </div>
          </div>

          <div className="token-price">
            {loading ? (
              <span className="price-loading">Loading...</span>
            ) : prices[selectedToken.id]?.priceUSD ? (
              <>
                <div className="price-main">{formatPrice(prices[selectedToken.id])}</div>
                <div className="price-eth">{prices[selectedToken.id].priceETH?.toFixed(10)} ETH</div>
              </>
            ) : (
              <div className="price-loading">--</div>
            )}
          </div>

          <div className="token-actions">
            <a 
              href={selectedToken.uniswapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="action-btn trade"
            >
              <span>🦄</span>
              <span>Trade on Uniswap</span>
            </a>
            <a 
              href={`https://www.clanker.world/clanker/${selectedToken.address}`}
              target="_blank"
              rel="noopener noreferrer"
              className="action-btn info"
            >
              <span>📄</span>
              <span>View on Clanker</span>
            </a>
          </div>

          <div className="token-contract">
            <span>Contract</span>
            <code>{selectedToken.address.slice(0,6)}...{selectedToken.address.slice(-4)}</code>
          </div>

          {/* Uniswap Embed */}
          <div className="uniswap-embed">
            <h3>Swap {selectedToken.id} on Uniswap</h3>
            <iframe
              src={getUniswapEmbedUrl(selectedToken.address)}
              width="100%"
              height="500"
              style={{ border: 'none', borderRadius: '12px' }}
              title={`Uniswap ${selectedToken.id} Swap`}
              allow="cross-origin-isolated"
            />
          </div>
        </div>

        {/* All Tokens Grid */}
        <div className="tokens-grid">
          {tokens.map(token => (
            <div 
              key={token.id}
              className="mini-token-card"
              onClick={() => setSelectedToken(token)}
              style={{ borderColor: selectedToken.id === token.id ? token.color : '#2a2a3a' }}
            >
              <span className="mini-emoji">{token.emoji}</span>
              <div className="mini-info">
                <span className="mini-name">{token.id}</span>
                <span className="mini-price">
                  {loading ? '...' : formatPrice(prices[token.id])}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        .tokens-page {
          min-height: 100vh;
          background: linear-gradient(180deg, #0a0a0f 0%, #151520 100%);
          padding: 40px 20px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        
        .tokens-header {
          text-align: center;
          margin-bottom: 40px;
        }
        
        .tokens-header h1 {
          font-size: 2.5em;
          margin: 0 0 10px 0;
          background: linear-gradient(135deg, #00d4ff, #00ff88);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        
        .tokens-header p {
          color: #888;
          margin: 0;
        }
        
        .token-tabs {
          display: flex;
          justify-content: center;
          gap: 10px;
          margin-bottom: 30px;
          flex-wrap: wrap;
        }
        
        .token-tab {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 15px 25px;
          background: #1a1a24;
          border: 2px solid #2a2a3a;
          border-radius: 12px;
          color: #888;
          cursor: pointer;
          transition: all 0.3s;
        }
        
        .token-tab:hover {
          background: #252530;
        }
        
        .token-tab.active {
          border-color: var(--token-color);
          color: var(--token-color);
          background: rgba(255,255,255,0.05);
        }
        
        .token-emoji {
          font-size: 1.3em;
        }
        
        .token-name {
          font-weight: 600;
        }
        
        .token-card {
          background: linear-gradient(135deg, #1a1a24 0%, #151520 100%);
          border-radius: 20px;
          padding: 30px;
          border: 2px solid;
          max-width: 450px;
          margin: 0 auto 30px;
          text-align: center;
        }
        
        .token-header {
          display: flex;
          align-items: center;
          gap: 15px;
          padding-bottom: 20px;
          margin-bottom: 20px;
          border-bottom: 1px solid;
        }
        
        .token-emoji-large {
          font-size: 3em;
        }
        
        .token-info {
          text-align: left;
        }
        
        .token-info h2 {
          margin: 0;
          font-size: 1.8em;
          color: #fff;
        }
        
        .token-info p {
          margin: 5px 0 0 0;
          color: #888;
        }
        
        .token-price {
          margin-bottom: 25px;
        }
        
        .price-main {
          font-size: 2.5em;
          font-weight: bold;
          color: #10b981;
          margin-bottom: 5px;
        }
        
        .price-eth {
          color: #ff6b35;
          font-size: 1.1em;
        }
        
        .price-loading {
          color: #888;
          font-size: 2em;
        }
        
        .token-actions {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-bottom: 25px;
        }
        
        .action-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          padding: 16px;
          border-radius: 12px;
          text-decoration: none;
          font-weight: 600;
          font-size: 1em;
          transition: transform 0.2s, box-shadow 0.2s;
        }
        
        .action-btn.trade {
          background: linear-gradient(135deg, #ff0055, #ff00aa);
          color: #fff;
        }
        
        .action-btn.trade:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 30px rgba(255, 0, 85, 0.3);
        }
        
        .action-btn.info {
          background: rgba(255,255,255,0.05);
          border: 1px solid #333;
          color: #fff;
        }
        
        .action-btn.info:hover {
          background: rgba(255,255,255,0.1);
        }
        
        .token-contract {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 15px;
          background: rgba(0,0,0,0.3);
          border-radius: 10px;
        }
        
        .token-contract span {
          color: #888;
        }
        
        .token-contract code {
          color: #ff6b35;
          font-family: monospace;
        }
        
        .tokens-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 15px;
          max-width: 800px;
          margin: 0 auto;
        }
        
        .mini-token-card {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 15px;
          background: #1a1a24;
          border: 1px solid #2a2a3a;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .mini-token-card:hover {
          background: #252530;
        }
        
        .mini-emoji {
          font-size: 1.5em;
        }
        
        .mini-info {
          display: flex;
          flex-direction: column;
        }
        
        .mini-name {
          font-weight: 600;
          color: #fff;
        }
        
        .mini-price {
          font-size: 0.85em;
          color: #10b981;
        }
        
        .uniswap-embed {
          margin-top: 25px;
          background: #1a1a24;
          border-radius: 16px;
          padding: 20px;
          border: 1px solid #2a2a3a;
        }
        
        .uniswap-embed h3 {
          margin: 0 0 15px 0;
          font-size: 1em;
          color: #888;
        }
        
        .uniswap-embed iframe {
          min-height: 450px;
        }
      `}</style>
    </>
  );
}
