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

export default function Staking() {
  const [pools] = useState([
    { 
      id: 'ARYA', 
      color: '#ff6b35', 
      emoji: '🦞', 
      address: '0xcc78a1F8eCE2ce5ff78d2C0D0c8268ddDa5B6B07',
      apyBoosted: '45%',
      apyStandard: '25%',
      minStake: '100 ARYA',
      duration: '30 Days',
      totalStaked: '1.25M'
    },
    { 
      id: 'OPENWORK', 
      color: '#00d4ff', 
      emoji: '⚡', 
      address: '0x299c30dd5974bf4d5bfe42c340ca40462816ab07',
      apyBoosted: '32%',
      apyStandard: '20%',
      minStake: '500 OPENWORK',
      duration: '45 Days',
      totalStaked: '3.5M'
    },
    { 
      id: 'KROWNEPO', 
      color: '#9333ea', 
      emoji: '👑', 
      address: '0xAFe8861b074B8C2551055a20A2a4f39E45037B07',
      apyBoosted: '55%',
      apyStandard: '35%',
      minStake: '1000 KROWNEPO',
      duration: '60 Days',
      totalStaked: '500K'
    }
  ]);
  
  const [selectedPool, setSelectedPool] = useState(pools[0]);
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [stakeAmount, setStakeAmount] = useState('');
  const [aryaBalance, setAryaBalance] = useState(0);
  const [hasArya, setHasArya] = useState(false);
  const [estimatedRewards, setEstimatedRewards] = useState(0);
  const [activeTab, setActiveTab] = useState('stake'); // 'stake' | 'rewards'

  useEffect(() => {
    checkWalletConnection();
  }, []);

  useEffect(() => {
    // Calculate estimated rewards based on ARYA holding status
    if (stakeAmount && selectedPool) {
      const isHolder = selectedPool.id === 'ARYA' ? hasArya : false;
      const baseApy = selectedPool.id === 'ARYA' ? 25 : selectedPool.id === 'OPENWORK' ? 20 : 35;
      const apy = isHolder ? (selectedPool.id === 'ARYA' ? 45 : baseApy) : baseApy;
      const dailyReward = (parseFloat(stakeAmount) * (apy / 100)) / 365;
      setEstimatedRewards(dailyReward * parseInt(selectedPool.duration));
    } else {
      setEstimatedRewards(0);
    }
  }, [stakeAmount, selectedPool, hasArya]);

  const checkWalletConnection = async () => {
    if (typeof window !== 'undefined' && window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          setWalletConnected(true);
          setWalletAddress(accounts[0]);
          checkAryaBalance(accounts[0]);
        }
      } catch (e) {
        console.error('Error checking wallet:', e);
      }
    }
  };

  const checkAryaBalance = async (address) => {
    try {
      const balance = await window.ethereum.request({
        method: 'eth_call',
        params: [{
          to: '0xcc78a1F8eCE2ce5ff78d2C0D0c8268ddDa5B6B07',
          data: '0x70a08231000000000000000000000000' + address.slice(2)
        }, 'latest']
      });
      
      const balanceAmount = parseInt(balance || '0') / 1e18;
      setAryaBalance(balanceAmount);
      setHasArya(balanceAmount >= 100); // 100 ARYA minimum for boost
    } catch (e) {
      console.error('Error checking ARYA balance:', e);
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
      checkAryaBalance(accounts[0]);
    } catch (e) {
      console.error('Wallet connection failed:', e);
    }
  };

  const formatNumber = (num) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(2)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(2)}K`;
    return num.toLocaleString();
  };

  const getCurrentApy = () => {
    const baseApy = selectedPool.id === 'ARYA' ? 25 : selectedPool.id === 'OPENWORK' ? 20 : 35;
    if (selectedPool.id === 'ARYA' && hasArya) return selectedPool.apyBoosted;
    return `${baseApy}%`;
  };

  return (
    <>
      <Head>
        <title>🔒 Staking | ClawdbotArmy</title>
        <meta name="description" content="Stake ARYA, OPENWORK, and KROWNEPO tokens with high APY rewards" />
        <link rel="stylesheet" href="/styles.css" />
      </Head>
      
      <div className="staking-page">
        <header className="staking-header">
          <Link href="/" className="back-link">← Back</Link>
          <h1>🔒 Staking</h1>
          <p>Stake tokens and earn high APY rewards</p>
        </header>

        {/* ARYA Holder Banner */}
        {walletConnected && (
          <div className={`holder-banner ${hasArya ? 'holder' : 'non-holder'}`}>
            <div className="holder-info">
              <span className="holder-icon">{hasArya ? '🦞' : '💰'}</span>
              <div>
                <span className="holder-title">
                  {hasArya ? 'ARYA Holder Detected!' : 'Hold 100+ ARYA for Boost!'}
                </span>
                <span className="holder-subtitle">
                  {hasArya 
                    ? `You have ${aryaBalance.toFixed(2)} ARYA - Enjoy boosted rewards!`
                    : 'Buy ARYA to unlock 45% APY on all pools'
                  }
                </span>
              </div>
            </div>
            {!hasArya && (
              <a href="/arya" className="buy-arya-btn">
                Buy ARYA →
              </a>
            )}
          </div>
        )}

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
            <span className="stat-label">Max APY</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{formatNumber(aryaBalance)}</span>
            <span className="stat-label">Your ARYA</span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="tab-nav">
          <button 
            className={`tab-btn ${activeTab === 'stake' ? 'active' : ''}`}
            onClick={() => setActiveTab('stake')}
          >
            📥 Stake
          </button>
          <button 
            className={`tab-btn ${activeTab === 'rewards' ? 'active' : ''}`}
            onClick={() => setActiveTab('rewards')}
          >
            🎁 My Rewards
          </button>
        </div>

        {activeTab === 'stake' ? (
          <>
            {/* Pool Tabs */}
            <div className="staking-tabs">
              {pools.map(pool => {
                const isSelected = selectedPool.id === pool.id;
                const isHolderBonus = pool.id === 'ARYA' && hasArya;
                
                return (
                  <button
                    key={pool.id}
                    className={`staking-tab ${isSelected ? 'active' : ''}`}
                    onClick={() => setSelectedPool(pool)}
                    style={{ '--pool-color': pool.color }}
                  >
                    <span className="tab-emoji">{pool.emoji}</span>
                    <div className="tab-info">
                      <span className="tab-name">{pool.id}</span>
                      <span className={`tab-apy ${isHolderBonus ? 'boosted' : ''}`}>
                        {isHolderBonus ? pool.apyBoosted : pool.apyStandard} APY
                        {isHolderBonus && ' 🚀'}
                      </span>
                    </div>
                    {isHolderBonus && <span className="boost-badge">BOOST!</span>}
                  </button>
                );
              })}
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
                      <div className="apy-display">
                        <span className={`apy-value ${selectedPool.id === 'ARYA' && hasArya ? 'boosted' : ''}`}>
                          {getCurrentApy()} APY
                        </span>
                        {selectedPool.id === 'ARYA' && hasArya && (
                          <span className="boost-info">🦞 ARYA Holder Boost!</span>
                        )}
                      </div>
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
                      <div className="preview-header">
                        <span>Estimated Rewards (50/50)</span>
                        {selectedPool.id === 'ARYA' && hasArya && (
                          <span className="boost-tag">🦞 Boosted</span>
                        )}
                      </div>
                      <div className="reward-main">
                        {(estimatedRewards / 2).toFixed(4)} {selectedPool.id} + {(estimatedRewards / 2).toFixed(4)} OPENWORK
                      </div>
                      <div className="reward-breakdown">
                        <span className="reward-part arya">50% ARYA</span>
                        <span className="reward-part openwork">50% OPENWORK</span>
                      </div>
                      <div className="reward-details">
                        <span>APY: {getCurrentApy()}</span>
                        <span>Period: {selectedPool.duration}</span>
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

                  {selectedPool.id === 'ARYA' && !hasArya && (
                    <div className="boost-reminder">
                      💡 Hold 100+ ARYA to unlock 45% APY (currently 25%)
                    </div>
                  )}
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
                      <span className="step-desc">Link your MetaMask wallet to Base</span>
                    </div>
                  </div>
                  <div className="step">
                    <span className="step-num">2</span>
                    <div className="step-content">
                      <span className="step-title">Stake Tokens</span>
                      <span className="step-desc">Choose amount and confirm</span>
                    </div>
                  </div>
                  <div className="step">
                    <span className="step-num">3</span>
                    <div className="step-content">
                      <span className="step-title">Earn Rewards</span>
                      <span className="step-desc">Receive rewards during lock period</span>
                    </div>
                  </div>
                  <div className="step">
                    <span className="step-num">4</span>
                    <div className="step-content">
                      <span className="step-title">Unstake</span>
                      <span className="step-desc">Withdraw after lock ends</span>
                    </div>
                  </div>
                </div>

                <div className="benefits">
                  <h5>🌟 ARYA Holder Benefits</h5>
                  <ul>
                    <li>🚀 <strong>45% APY</strong> on ARYA pool (vs 25%)</li>
                    <li>📈 <strong>Boosted rewards</strong> on all pools</li>
                    <li>🗳️ <strong>Governance voting power</strong></li>
                    <li>🎯 <strong>Premium trading signals</strong></li>
                    <li>🎁 <strong>Exclusive NFT drops</strong></li>
                  </ul>
                </div>
              </div>
            </div>
          </>
        ) : (
          /* Rewards Tab */
          <div className="rewards-section glass-card">
            <div className="rewards-header">
              <h2>🎁 Your Staking Rewards</h2>
            </div>
            
            {!walletConnected ? (
              <div className="rewards-cta">
                <div className="cta-icon">🔓</div>
                <h3>Connect Your Wallet</h3>
                <p>View your accumulated rewards and claim them</p>
                <button className="connect-btn" onClick={connectWallet}>
                  <span>🦊</span>
                  <span>Connect Wallet</span>
                </button>
              </div>
            ) : (
              <div className="rewards-content">
                <div className="rewards-summary">
                  <div className="summary-card">
                    <span className="summary-label">Total Rewards</span>
                    <span className="summary-value">0 ARYA</span>
                  </div>
                  <div className="summary-card">
                    <span className="summary-label">Pending</span>
                    <span className="summary-value pending">0 ARYA</span>
                  </div>
                  <div className="summary-card">
                    <span className="summary-label">Claimed</span>
                    <span className="summary-value">0 ARYA</span>
                  </div>
                </div>
                
                <div className="rewards-empty">
                  <span className="empty-icon">📭</span>
                  <p>No active stakes yet</p>
                  <button className="stake-now-btn" onClick={() => setActiveTab('stake')}>
                    Start Staking →
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <style jsx>{`
        .staking-page {
          min-height: 100vh;
          background: var(--bg-primary);
          padding: 20px;
          max-width: 900px;
          margin: 0 auto;
        }
        
        .staking-header {
          display: flex;
          align-items: center;
          gap: 20px;
          margin-bottom: 20px;
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
        
        .holder-banner {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 20px;
          border-radius: 16px;
          margin-bottom: 20px;
        }
        
        .holder-banner.holder {
          background: linear-gradient(135deg, rgba(0, 255, 136, 0.15), rgba(0, 255, 136, 0.05));
          border: 1px solid rgba(0, 255, 136, 0.3);
        }
        
        .holder-banner.non-holder {
          background: linear-gradient(135deg, rgba(255, 107, 53, 0.15), rgba(255, 107, 53, 0.05));
          border: 1px solid rgba(255, 107, 53, 0.3);
        }
        
        .holder-info {
          display: flex;
          align-items: center;
          gap: 15px;
        }
        
        .holder-icon {
          font-size: 2em;
        }
        
        .holder-title {
          display: block;
          font-weight: 600;
          font-size: 1.1em;
        }
        
        .holder-subtitle {
          font-size: 0.85em;
          color: var(--text-secondary);
        }
        
        .buy-arya-btn {
          padding: 10px 20px;
          background: linear-gradient(135deg, #ff6b35, #ff8c5a);
          color: #fff;
          border-radius: 10px;
          text-decoration: none;
          font-weight: 600;
          transition: transform 0.2s;
        }
        
        .buy-arya-btn:hover {
          transform: translateY(-2px);
        }
        
        .stats-banner {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 15px;
          margin-bottom: 25px;
        }
        
        .stat-item {
          text-align: center;
          padding: 16px;
          background: linear-gradient(145deg, var(--bg-card), var(--bg-secondary));
          border-radius: 14px;
          border: 1px solid var(--border-color);
        }
        
        .stat-value {
          display: block;
          font-size: 1.5em;
          font-weight: 700;
          color: var(--accent-green);
          margin-bottom: 4px;
        }
        
        .stat-label {
          font-size: 0.75em;
          color: var(--text-secondary);
        }
        
        .tab-nav {
          display: flex;
          gap: 10px;
          margin-bottom: 25px;
        }
        
        .tab-btn {
          flex: 1;
          padding: 14px 20px;
          background: var(--bg-secondary);
          border: 2px solid var(--border-color);
          border-radius: 12px;
          color: var(--text-secondary);
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        
        .tab-btn.active {
          background: var(--bg-card);
          border-color: var(--accent);
          color: var(--accent);
        }
        
        .staking-tabs {
          display: flex;
          gap: 15px;
          margin-bottom: 25px;
          overflow-x: auto;
        }
        
        .staking-tab {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px 20px;
          background: var(--bg-secondary);
          border: 2px solid transparent;
          border-radius: 14px;
          cursor: pointer;
          transition: all 0.3s ease;
          min-width: 160px;
          position: relative;
        }
        
        .staking-tab:hover {
          background: var(--bg-card);
        }
        
        .staking-tab.active {
          background: var(--bg-card);
          border-color: var(--pool-color);
        }
        
        .staking-tab.active .tab-apy.boosted {
          color: var(--accent-green);
        }
        
        .boost-badge {
          position: absolute;
          top: -8px;
          right: -8px;
          padding: 3px 8px;
          background: linear-gradient(135deg, var(--accent-green), #00cc6a);
          color: #000;
          border-radius: 10px;
          font-size: 0.7em;
          font-weight: 700;
          animation: pulse 2s infinite;
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
          font-size: 0.85em;
          color: var(--text-secondary);
        }
        
        .glass-card {
          background: rgba(26, 26, 36, 0.6);
          backdrop-filter: blur(10px);
          border: 1px solid var(--border-color);
          border-radius: 20px;
          padding: 24px;
          margin-bottom: 20px;
        }
        
        .staking-layout {
          display: grid;
          grid-template-columns: 1fr 320px;
          gap: 24px;
        }
        
        .staking-card {
          display: flex;
          flex-direction: column;
          gap: 25px;
          overflow: visible;
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
          width: 55px;
          height: 55px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.8em;
        }
        
        .staking-card-header h3 {
          margin: 0 0 8px 0;
        }
        
        .apy-display {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        
        .apy-value {
          font-size: 1.3em;
          font-weight: 700;
          color: var(--text-secondary);
        }
        
        .apy-value.boosted {
          color: var(--accent-green);
        }
        
        .boost-info {
          padding: 4px 10px;
          background: rgba(0, 255, 136, 0.15);
          border-radius: 20px;
          font-size: 0.75em;
          color: var(--accent-green);
        }
        
        .pool-info-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
        }
        
        .info-item {
          text-align: center;
          padding: 14px;
          background: var(--bg-secondary);
          border-radius: 12px;
        }
        
        .info-label {
          display: block;
          font-size: 0.75em;
          color: var(--text-secondary);
          margin-bottom: 5px;
        }
        
        .info-value {
          font-weight: 600;
          font-size: 0.95em;
        }
        
        .staking-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
          padding-bottom: 20px;
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
          border-radius: 14px;
          padding: 18px;
        }
        
        .preview-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 10px;
        }
        
        .boost-tag {
          padding: 4px 10px;
          background: var(--accent-green);
          color: #000;
          border-radius: 20px;
          font-size: 0.75em;
          font-weight: 700;
        }
        
        .reward-main {
          font-size: 1.8em;
          font-weight: 700;
          color: var(--accent-green);
          margin-bottom: 10px;
        }
        
        .reward-details {
          display: flex;
          gap: 20px;
          font-size: 0.85em;
          color: var(--text-secondary);
        }
        
        .reward-breakdown {
          display: flex;
          gap: 10px;
          margin-top: 10px;
          padding-top: 10px;
          border-top: 1px solid var(--border-color);
        }
        
        .reward-part {
          flex: 1;
          text-align: center;
          padding: 6px 10px;
          border-radius: 8px;
          font-size: 0.8em;
          font-weight: 600;
        }
        
        .reward-part.arya {
          background: rgba(255, 107, 53, 0.15);
          color: #ff6b35;
        }
        
        .reward-part.openwork {
          background: rgba(0, 212, 255, 0.15);
          color: #00d4ff;
        }
        
        .staking-actions {
          display: flex;
          gap: 15px;
          margin-bottom: 20px;
          position: relative;
          z-index: 10;
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
          font-size: 1.05em;
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
        
        .boost-reminder {
          text-align: center;
          padding: 14px;
          background: rgba(255, 107, 53, 0.1);
          border-radius: 10px;
          color: #ff6b35;
          font-size: 0.9em;
          margin-top: 15px;
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
          gap: 12px;
          align-items: flex-start;
        }
        
        .step-num {
          width: 26px;
          height: 26px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--accent);
          color: #000;
          border-radius: 50%;
          font-weight: 700;
          font-size: 0.85em;
          flex-shrink: 0;
        }
        
        .step-title {
          font-weight: 600;
          display: block;
          margin-bottom: 2px;
        }
        
        .step-desc {
          font-size: 0.8em;
          color: var(--text-secondary);
        }
        
        .benefits h5 {
          margin: 0 0 15px 0;
          color: var(--accent-green);
        }
        
        .benefits ul {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        
        .benefits li {
          padding: 10px 0;
          border-bottom: 1px solid var(--border-color);
          font-size: 0.9em;
        }
        
        .benefits li:last-child {
          border-bottom: none;
        }
        
        .rewards-header {
          margin-bottom: 25px;
        }
        
        .rewards-header h2 {
          margin: 0;
        }
        
        .rewards-cta {
          text-align: center;
          padding: 40px 20px;
        }
        
        .cta-icon {
          font-size: 3em;
          margin-bottom: 15px;
        }
        
        .rewards-cta h3 {
          margin: 0 0 10px 0;
        }
        
        .rewards-cta p {
          color: var(--text-secondary);
          margin-bottom: 25px;
        }
        
        .rewards-summary {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 15px;
          margin-bottom: 30px;
        }
        
        .summary-card {
          background: var(--bg-secondary);
          padding: 20px;
          border-radius: 14px;
          text-align: center;
        }
        
        .summary-label {
          display: block;
          font-size: 0.85em;
          color: var(--text-secondary);
          margin-bottom: 8px;
        }
        
        .summary-value {
          font-size: 1.4em;
          font-weight: 700;
        }
        
        .summary-value.pending {
          color: var(--accent);
        }
        
        .rewards-empty {
          text-align: center;
          padding: 40px;
        }
        
        .empty-icon {
          font-size: 3em;
          display: block;
          margin-bottom: 15px;
        }
        
        .rewards-empty p {
          color: var(--text-secondary);
          margin-bottom: 20px;
        }
        
        .stake-now-btn {
          padding: 12px 24px;
          background: linear-gradient(135deg, var(--accent), #0099ff);
          color: #fff;
          border: none;
          border-radius: 10px;
          font-weight: 600;
          cursor: pointer;
          transition: transform 0.2s;
        }
        
        .stake-now-btn:hover {
          transform: translateY(-2px);
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
        
        @media (max-width: 900px) {
          .staking-layout {
            grid-template-columns: 1fr;
          }
          
          .pool-info-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          
          .stats-banner {
            grid-template-columns: repeat(2, 1fr);
          }
        }
      `}</style>
    </>
  );
}

export const dynamic = 'force-dynamic';
