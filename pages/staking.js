import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';

export default function Staking() {
  const [pools] = useState([
    { id: 'ARYA', color: '#ff6b35', emoji: '🦞', apy: '25-45%', totalStaked: '1.25M', minStake: '100 ARYA', duration: '30 Days' },
    { id: 'OPENWORK', color: '#00d4ff', emoji: '⚡', apy: '20-32%', totalStaked: '3.5M', minStake: '500 OPENWORK', duration: '45 Days' },
    { id: 'KROWNEPO', color: '#9333ea', emoji: '👑', apy: '35-55%', totalStaked: '500K', minStake: '1000 KROWNEPO', duration: '60 Days' }
  ]);
  const [selectedPool, setSelectedPool] = useState(pools[0]);
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [stakeAmount, setStakeAmount] = useState('');
  const [estimatedRewards, setEstimatedRewards] = useState(0);

  useEffect(() => {
    checkWalletConnection();
  }, []);

  useEffect(() => {
    // Calculate estimated rewards
    if (stakeAmount && selectedPool) {
      const apy = 35; // Average APY
      const dailyReward = (parseFloat(stakeAmount) * (apy / 100)) / 365;
      setEstimatedRewards(dailyReward * parseInt(selectedPool.duration));
    } else {
      setEstimatedRewards(0);
    }
  }, [stakeAmount, selectedPool]);

  const checkWalletConnection = async () => {
    if (typeof window !== 'undefined' && window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          setWalletConnected(true);
          setWalletAddress(accounts[0]);
        }
      } catch (e) {
        console.error('Error checking wallet:', e);
      }
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
    } catch (e) {
      console.error('Wallet connection failed:', e);
    }
  };

  const formatNumber = (num) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(2)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(2)}K`;
    return num.toLocaleString();
  };

  return (
    <>
      <Head>
        <title>🔒 Staking | ClawdbotArmy</title>
        <meta name="description" content="Stake ARYA, OPENWORK, and KROWNEPO tokens to earn rewards" />
        <link rel="stylesheet" href="/styles.css" />
      </Head>
      
      <div className="staking-page">
        <header className="staking-header">
          <Link href="/" className="back-link">← Back</Link>
          <h1>🔒 Staking</h1>
          <p>Stake tokens and earn high APY rewards</p>
        </header>

        {/* Stats Banner */}
        <div className="stats-banner">
          <div className="stat-item">
            <span className="stat-value">$2.5M+</span>
            <span className="stat-label">Total Value Locked</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">12.5K+</span>
            <span className="stat-label">Active Stakers</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">45%</span>
            <span className="stat-label">Average APY</span>
          </div>
        </div>

        {/* Pool Tabs */}
        <div className="staking-tabs">
          {pools.map(pool => (
            <button
              key={pool.id}
              className={`staking-tab ${selectedPool.id === pool.id ? 'active' : ''}`}
              onClick={() => setSelectedPool(pool)}
              style={{ '--pool-color': pool.color }}
            >
              <span className="tab-emoji">{pool.emoji}</span>
              <div className="tab-info">
                <span className="tab-name">{pool.id}</span>
                <span className="tab-apy">{pool.apy} APY</span>
              </div>
            </button>
          ))}
        </div>

        {/* Main Staking Card */}
        <div className="staking-layout">
          <div className="staking-card glass-card">
            <div className="staking-card-header">
              <div className="pool-identity">
                <div 
                  className="pool-icon"
                  style={{ background: `linear-gradient(135deg, ${selectedPool.color}, ${selectedPool.color}88)` }}
                >
                  {selectedPool.emoji}
                </div>
                <div>
                  <h3>{selectedPool.id} Staking Pool</h3>
                  <span className="apy-badge" style={{ background: selectedPool.color }}>
                    {selectedPool.apy} APY
                  </span>
                </div>
              </div>
            </div>

            {/* Pool Info Grid */}
            <div className="pool-info-grid">
              <div className="info-item">
                <span className="info-label">Total Staked</span>
                <span className="info-value">{selectedPool.totalStaked}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Min. Stake</span>
                <span className="info-value">{selectedPool.minStake}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Lock Period</span>
                <span className="info-value">{selectedPool.duration}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Your Stake</span>
                <span className="info-value">--</span>
              </div>
            </div>

            {/* Staking Form */}
            <div className="staking-form">
              <div className="form-group">
                <label>Amount to Stake</label>
                <div className="input-wrapper">
                  <input
                    type="number"
                    placeholder="0.00"
                    value={stakeAmount}
                    onChange={(e) => setStakeAmount(e.target.value)}
                    className="stake-input"
                  />
                  <span className="token-symbol">{selectedPool.id}</span>
                </div>
              </div>

              {stakeAmount && (
                <div className="rewards-preview">
                  <div className="reward-row">
                    <span>Est. Daily Rewards</span>
                    <span className="reward-value">
                      {(parseFloat(stakeAmount) * 0.35 / 365).toFixed(4)} {selectedPool.id}
                    </span>
                  </div>
                  <div className="reward-row">
                    <span>Est. Total Rewards ({selectedPool.duration})</span>
                    <span className="reward-value highlight">
                      {estimatedRewards.toFixed(4)} {selectedPool.id}
                    </span>
                  </div>
                </div>
              )}

              <div className="staking-actions">
                {walletConnected ? (
                  <button className="stake-btn" style={{ background: selectedPool.color }}>
                    <span>🔒</span>
                    <span>Stake {selectedPool.id}</span>
                  </button>
                ) : (
                  <button className="connect-btn" onClick={connectWallet}>
                    <span>🦊</span>
                    <span>Connect Wallet</span>
                  </button>
                )}
              </div>
            </div>

            <div className="staking-footer">
              <p>⚠️ Staking involves smart contract risk. DYOR.</p>
            </div>
          </div>

          {/* Info Panel */}
          <div className="info-panel glass-card">
            <h4>How Staking Works</h4>
            <div className="steps">
              <div className="step">
                <span className="step-num">1</span>
                <div className="step-content">
                  <span className="step-title">Connect Wallet</span>
                  <span className="step-desc">Link your MetaMask wallet to Base network</span>
                </div>
              </div>
              <div className="step">
                <span className="step-num">2</span>
                <div className="step-content">
                  <span className="step-title">Stake Tokens</span>
                  <span className="step-desc">Choose amount and confirm transaction</span>
                </div>
              </div>
              <div className="step">
                <span className="step-num">3</span>
                <div className="step-content">
                  <span className="step-title">Earn Rewards</span>
                  <span className="step-desc">Receive rewards proportional to your stake</span>
                </div>
              </div>
              <div className="step">
                <span className="step-num">4</span>
                <div className="step-content">
                  <span className="step-title">Unstake</span>
                  <span className="step-desc">Withdraw after lock period ends</span>
                </div>
              </div>
            </div>

            <div className="benefits">
              <h5>Benefits</h5>
              <ul>
                <li>🔥 High APY rewards up to 55%</li>
                <li>🔒 Secure smart contracts audited</li>
                <li>⚡ Instant reward tracking</li>
                <li>🌐 Low gas fees on Base</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .staking-page {
          min-height: 100vh;
          background: var(--bg-primary);
          padding: 20px;
        }
        
        .staking-header {
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
        
        .staking-header h1 {
          font-size: 2em;
          margin: 0;
        }
        
        .staking-header p {
          color: var(--text-secondary);
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
        
        .stats-banner {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
          margin-bottom: 30px;
        }
        
        .stat-item {
          text-align: center;
          padding: 20px;
          background: linear-gradient(145deg, var(--bg-card), var(--bg-secondary));
          border-radius: 16px;
          border: 1px solid var(--border-color);
        }
        
        .stat-value {
          display: block;
          font-size: 1.8em;
          font-weight: 700;
          background: linear-gradient(135deg, var(--accent-green), #00cc6a);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        
        .stat-label {
          font-size: 0.85em;
          color: var(--text-secondary);
        }
        
        .staking-tabs {
          display: flex;
          gap: 15px;
          margin-bottom: 30px;
          overflow-x: auto;
        }
        
        .staking-tab {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px 24px;
          background: var(--bg-secondary);
          border: 2px solid transparent;
          border-radius: 16px;
          cursor: pointer;
          transition: all 0.3s ease;
          min-width: 160px;
        }
        
        .staking-tab:hover {
          background: var(--bg-card);
        }
        
        .staking-tab.active {
          background: var(--bg-card);
          border-color: var(--pool-color);
          box-shadow: 0 0 20px var(--pool-color);
        }
        
        .tab-emoji {
          font-size: 1.8em;
        }
        
        .tab-info {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
        }
        
        .tab-name {
          font-weight: 700;
        }
        
        .tab-apy {
          font-size: 0.8em;
          color: var(--text-secondary);
        }
        
        .staking-layout {
          display: grid;
          grid-template-columns: 1fr 350px;
          gap: 24px;
        }
        
        .staking-card {
          display: flex;
          flex-direction: column;
          gap: 25px;
        }
        
        .staking-card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .pool-identity {
          display: flex;
          align-items: center;
          gap: 16px;
        }
        
        .pool-icon {
          width: 50px;
          height: 50px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.8em;
        }
        
        .staking-card-header h3 {
          margin: 0 0 5px 0;
        }
        
        .apy-badge {
          display: inline-block;
          padding: 4px 12px;
          border-radius: 20px;
          color: #fff;
          font-size: 0.85em;
          font-weight: 600;
        }
        
        .pool-info-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 15px;
        }
        
        .info-item {
          text-align: center;
          padding: 15px;
          background: var(--bg-secondary);
          border-radius: 12px;
        }
        
        .info-label {
          display: block;
          font-size: 0.8em;
          color: var(--text-secondary);
          margin-bottom: 5px;
        }
        
        .info-value {
          font-weight: 600;
          font-size: 1em;
        }
        
        .staking-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        
        .form-group label {
          display: block;
          margin-bottom: 10px;
          font-weight: 500;
        }
        
        .input-wrapper {
          display: flex;
          align-items: center;
          background: var(--bg-secondary);
          border: 2px solid var(--border-color);
          border-radius: 12px;
          overflow: hidden;
        }
        
        .stake-input {
          flex: 1;
          padding: 16px;
          background: transparent;
          border: none;
          color: var(--text-primary);
          font-size: 1.1em;
        }
        
        .stake-input:focus {
          outline: none;
        }
        
        .token-symbol {
          padding: 16px 20px;
          background: var(--bg-card);
          font-weight: 600;
          color: var(--accent);
        }
        
        .rewards-preview {
          background: var(--bg-secondary);
          border-radius: 12px;
          padding: 16px;
        }
        
        .reward-row {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
        }
        
        .reward-value {
          font-weight: 600;
        }
        
        .reward-value.highlight {
          color: var(--accent-green);
          font-size: 1.1em;
        }
        
        .staking-actions {
          display: flex;
          gap: 15px;
        }
        
        .stake-btn, .connect-btn {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          padding: 16px;
          border: none;
          border-radius: 12px;
          color: #fff;
          font-size: 1.1em;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        
        .connect-btn {
          background: linear-gradient(135deg, #f6851b, #e2761b);
        }
        
        .stake-btn:hover, .connect-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
        }
        
        .staking-footer {
          text-align: center;
          padding-top: 15px;
          border-top: 1px solid var(--border-color);
        }
        
        .staking-footer p {
          color: var(--text-secondary);
          font-size: 0.85em;
          margin: 0;
        }
        
        .info-panel h4 {
          margin: 0 0 20px 0;
        }
        
        .steps {
          display: flex;
          flex-direction: column;
          gap: 15px;
          margin-bottom: 25px;
        }
        
        .step {
          display: flex;
          gap: 15px;
          align-items: flex-start;
        }
        
        .step-num {
          width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--accent);
          color: #000;
          border-radius: 50%;
          font-weight: 700;
          font-size: 0.9em;
          flex-shrink: 0;
        }
        
        .step-title {
          font-weight: 600;
          display: block;
        }
        
        .step-desc {
          font-size: 0.85em;
          color: var(--text-secondary);
        }
        
        .benefits h5 {
          margin: 0 0 15px 0;
        }
        
        .benefits ul {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        
        .benefits li {
          padding: 10px 0;
          border-bottom: 1px solid var(--border-color);
        }
        
        .benefits li:last-child {
          border-bottom: none;
        }
        
        @media (max-width: 900px) {
          .staking-layout {
            grid-template-columns: 1fr;
          }
          
          .pool-info-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          
          .stats-banner {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </>
  );
}

export const dynamic = 'force-dynamic';
