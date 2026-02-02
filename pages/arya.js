import { useState, useEffect } from 'react';
import Head from 'next/head';

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
      const r = await fetch('/api/price/arya');
      const data = await r.json();
      setMarketData(data);
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

  const uniswapUrl = `https://app.uniswap.org/swap?chain=base&inputCurrency=ETH&outputCurrency=0xcc78a1F8eCE2ce5ff78d2C0D0c8268ddDa5B6B07`;
  const clankerUrl = 'https://www.clanker.world/clanker/0xcc78a1F8eCE2ce5ff78d2C0D0c8268ddDa5B6B07';

  const formatPrice = (price, isUSD = false) => {
    if (!price) return '--';
    if (isUSD) {
      return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(price);
    }
    return price.toFixed(10);
  };

  const formatSupply = (supply) => {
    if (!supply) return '--';
    return parseInt(supply).toLocaleString();
  };

  return (
    <>
      <Head>
        <title>🦞 ARYA Token | ClawdbotArmy</title>
        <meta name="description" content="ARYA AI Agent Token on Base" />
        <link rel="stylesheet" href="/styles.css" />
      </Head>
      
      <div className="arya-page">
        {/* Header */}
        <header className="arya-header">
          <div className="arya-logo">🦞</div>
          <h1>ARYA</h1>
          <p className="arya-subtitle">AI Agent Token</p>
        </header>

        {/* Price Card */}
        <div className="arya-card price-card">
          <div className="price-label">Live Price</div>
          {loading ? (
            <div className="price-loading">Loading...</div>
          ) : marketData?.priceUSD ? (
            <>
              <div className="price-usd">{formatPrice(marketData.priceUSD, true)}</div>
              <div className="price-eth">{formatPrice(marketData.priceETH)} ETH</div>
              <div className="price-source">via Uniswap V3</div>
            </>
          ) : (
            <>
              <div className="price-loading">--</div>
              <div className="price-note">Price coming soon</div>
            </>
          )}
        </div>

        {/* Actions */}
        <div className="arya-card actions-card">
          <button 
            className="uniswap-btn"
            onClick={() => window.open(uniswapUrl, '_blank')}
          >
            <span>🦄</span>
            <span>Buy on Uniswap</span>
          </button>
          
          <button 
            className="wallet-btn"
            onClick={connectWallet}
          >
            <span>🦊</span>
            <span>{walletConnected ? `${walletAddress.slice(0,6)}...${walletAddress.slice(-4)}` : 'Connect Wallet'}</span>
          </button>
        </div>

        {/* Links */}
        <div className="arya-links">
          <a href={clankerUrl} target="_blank" rel="noopener noreferrer" className="arya-link">
            📄 View on Clanker
          </a>
          <a href="/bonding-curves" className="arya-link">
            📈 All Tokens
          </a>
        </div>

        {/* Token Info */}
        <div className="arya-card info-card">
          <h3>Token Info</h3>
          <div className="info-row">
            <span>Contract</span>
            <code>0xcc78...5B6B07</code>
          </div>
          <div className="info-row">
            <span>Network</span>
            <span>Base</span>
          </div>
          <div className="info-row">
            <span>Symbol</span>
            <span>ARYA</span>
          </div>
        </div>
      </div>

      <style jsx>{`
        .arya-page {
          min-height: 100vh;
          background: linear-gradient(180deg, #0a0a0f 0%, #151520 100%);
          padding: 40px 20px;
          display: flex;
          flex-direction: column;
          align-items: center;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        
        .arya-header {
          text-align: center;
          margin-bottom: 40px;
        }
        
        .arya-logo {
          font-size: 5em;
          margin-bottom: 15px;
        }
        
        .arya-header h1 {
          font-size: 3em;
          margin: 0 0 10px 0;
          background: linear-gradient(135deg, #ff6b35, #ff8c5a);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        
        .arya-subtitle {
          color: #888;
          font-size: 1.2em;
          margin: 0;
        }
        
        .arya-card {
          background: linear-gradient(135deg, #1a1a24 0%, #151520 100%);
          border-radius: 20px;
          padding: 30px;
          border: 1px solid #2a2a3a;
          margin-bottom: 20px;
          text-align: center;
          width: 100%;
          max-width: 400px;
        }
        
        .price-card {
          background: linear-gradient(135deg, rgba(255,107,53,0.1) 0%, rgba(255,107,53,0.05) 100%);
          border-color: rgba(255,107,53,0.3);
        }
        
        .price-label {
          color: #888;
          font-size: 0.9em;
          margin-bottom: 15px;
          text-transform: uppercase;
          letter-spacing: 2px;
        }
        
        .price-usd {
          font-size: 2.5em;
          font-weight: bold;
          color: #10b981;
          margin-bottom: 5px;
        }
        
        .price-eth {
          font-size: 1.2em;
          color: #ff6b35;
          margin-bottom: 10px;
        }
        
        .price-source {
          font-size: 0.85em;
          color: #666;
        }
        
        .price-loading {
          font-size: 2em;
          color: #888;
        }
        
        .price-note {
          color: #666;
          font-size: 0.9em;
        }
        
        .actions-card {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }
        
        .uniswap-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          padding: 18px;
          background: linear-gradient(135deg, #ff0055, #ff00aa);
          border: none;
          border-radius: 12px;
          color: #fff;
          font-size: 1.1em;
          font-weight: bold;
          cursor: pointer;
          transition: transform 0.2s, box-shadow 0.2s;
        }
        
        .uniswap-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 30px rgba(255, 0, 85, 0.3);
        }
        
        .wallet-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          padding: 15px;
          background: rgba(255,255,255,0.05);
          border: 1px solid #333;
          border-radius: 12px;
          color: #fff;
          font-size: 1em;
          cursor: pointer;
          transition: background 0.2s;
        }
        
        .wallet-btn:hover {
          background: rgba(255,255,255,0.1);
        }
        
        .arya-links {
          display: flex;
          gap: 20px;
          margin-bottom: 20px;
        }
        
        .arya-link {
          color: #6366f1;
          text-decoration: none;
          font-size: 0.95em;
          padding: 10px 20px;
          background: rgba(99,102,241,0.1);
          border-radius: 10px;
          border: 1px solid rgba(99,102,241,0.2);
          transition: all 0.2s;
        }
        
        .arya-link:hover {
          background: rgba(99,102,241,0.2);
        }
        
        .info-card {
          text-align: left;
        }
        
        .info-card h3 {
          margin: 0 0 20px 0;
          color: #fff;
          font-size: 1.1em;
        }
        
        .info-row {
          display: flex;
          justify-content: space-between;
          padding: 12px 0;
          border-bottom: 1px solid #2a2a3a;
        }
        
        .info-row:last-child {
          border-bottom: none;
        }
        
        .info-row span:first-child {
          color: #888;
        }
        
        .info-row code {
          color: #ff6b35;
          font-family: monospace;
        }
      `}</style>
    </>
  );
}
