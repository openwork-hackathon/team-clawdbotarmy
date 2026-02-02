import { useState, useEffect } from 'react';
import Head from 'next/head';

export default function Staking() {
  const [pools] = useState({
    ARYA: { color: '#ff6b35', emoji: '🦞', apy: '25-45%', totalStaked: '1.25M' },
    OPENWORK: { color: '#00d4ff', emoji: '⚡', apy: '20-32%', totalStaked: '3.5M' }
  });
  const [selectedPool, setSelectedPool] = useState('ARYA');
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');

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

  return (
    <>
      <Head>
        <title>🔒 Staking | ClawdbotArmy</title>
        <meta name="description" content="Stake ARYA and OPENWORK tokens" />
        <link rel="stylesheet" href="/styles.css" />
      </Head>
      
      <div className="staking-page">
        <header className="staking-header">
          <h1>🔒 Staking</h1>
          <p>Stake tokens to earn rewards</p>
        </header>

        {/* Pool Tabs */}
        <div className="staking-tabs">
          {Object.entries(pools).map(([token, pool]) => (
            <button
              key={token}
              className={`staking-tab ${selectedPool === token ? 'active' : ''}`}
              onClick={() => setSelectedPool(token)}
              style={{ '--pool-color': pool.color }}
            >
              <span>{pool.emoji}</span>
              <span>{token}</span>
            </button>
          ))}
        </div>

        {/* Pool Card */}
        <div className="staking-card">
          <div className="staking-card-header">
            <h3>
              <span style={{ marginRight: '10px' }}>{pools[selectedPool].emoji}</span>
              {selectedPool} Staking
            </h3>
            <span className="apy-badge">{pools[selectedPool].apy} APY</span>
          </div>

          <div className="pool-stats">
            <div className="pool-stat">
              <div className="pool-stat-value">{pools[selectedPool].totalStaked}</div>
              <div className="pool-stat-label">Total Staked</div>
            </div>
            <div className="pool-stat">
              <div className="pool-stat-value">30 Days</div>
              <div className="pool-stat-label">Min Lock</div>
            </div>
          </div>

          {/* Connect Wallet CTA */}
          <div className="staking-cta">
            {walletConnected ? (
              <div className="wallet-connected">
                <span className="wallet-dot">●</span>
                <span>Connected</span>
                <code>{walletAddress.slice(0,6)}...{walletAddress.slice(-4)}</code>
              </div>
            ) : (
              <button className="connect-btn" onClick={connectWallet}>
                <span>🦊</span>
                <span>Connect Wallet to Stake</span>
              </button>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        .staking-page {
          min-height: 100vh;
          background: linear-gradient(180deg, #0a0a0f 0%, #151520 100%);
          padding: 40px 20px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        
        .staking-header {
          text-align: center;
          margin-bottom: 40px;
        }
        
        .staking-header h1 {
          font-size: 2.5em;
          margin: 0 0 10px 0;
          background: linear-gradient(135deg, #10b981, #00ff88);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        
        .staking-header p {
          color: #888;
          margin: 0;
        }
        
        .staking-tabs {
          display: flex;
          justify-content: center;
          gap: 10px;
          margin-bottom: 30px;
        }
        
        .staking-tab {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 15px 30px;
          background: #1a1a24;
          border: 2px solid #2a2a3a;
          border-radius: 12px;
          color: #888;
          cursor: pointer;
          transition: all 0.3s;
          font-weight: 600;
        }
        
        .staking-tab:hover {
          background: #252530;
        }
        
        .staking-tab.active {
          border-color: var(--pool-color);
          color: var(--pool-color);
        }
        
        .staking-card {
          background: linear-gradient(135deg, #1a1a24 0%, #151520 100%);
          border-radius: 20px;
          padding: 30px;
          border: 1px solid #2a2a3a;
          max-width: 450px;
          margin: 0 auto;
        }
        
        .staking-card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 25px;
        }
        
        .staking-card-header h3 {
          margin: 0;
          font-size: 1.4em;
          color: #fff;
        }
        
        .apy-badge {
          background: linear-gradient(135deg, #10b981, #059669);
          color: #000;
          padding: 6px 14px;
          border-radius: 20px;
          font-size: 0.9em;
          font-weight: bold;
        }
        
        .pool-stats {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 15px;
          margin-bottom: 25px;
        }
        
        .pool-stat {
          background: rgba(0,0,0,0.2);
          padding: 20px;
          border-radius: 12px;
          text-align: center;
        }
        
        .pool-stat-value {
          font-size: 1.5em;
          font-weight: bold;
          color: #10b981;
          margin-bottom: 5px;
        }
        
        .pool-stat-label {
          font-size: 0.85em;
          color: #888;
        }
        
        .staking-cta {
          text-align: center;
        }
        
        .connect-btn {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 16px 30px;
          background: linear-gradient(135deg, #f6851b, #e2761b);
          border: none;
          border-radius: 12px;
          color: #fff;
          font-size: 1.1em;
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
          padding: 15px 25px;
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
      `}</style>
    </>
  );
}
