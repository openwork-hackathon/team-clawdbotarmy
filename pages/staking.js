import { useState, useEffect } from 'react';
import Head from 'next/head';


export default function Staking() {
  const [pools, setPools] = useState(null);
  const [userStakes, setUserStakes] = useState({ ARYA: null, OPENWORK: null });
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [stakeAmount, setStakeAmount] = useState('');
  const [selectedPool, setSelectedPool] = useState('ARYA');
  const [selectedLockPeriod, setSelectedLockPeriod] = useState(0);
  const [loading, setLoading] = useState(false);
  const [txHash, setTxHash] = useState(null);
  const [activeTab, setActiveTab] = useState('stake'); // stake, unstake, rewards

  useEffect(() => {
    fetchPools();
    const interval = setInterval(fetchPools, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (walletConnected) {
      fetchUserStakes();
    }
  }, [walletConnected]);

  const fetchPools = async () => {
    try {
      // Simulated pool data for demo
      setPools({
        ARYA: {
          totalStaked: 1250000,
          apy: { 30: 25, 60: 30, 90: 45 },
          lockPeriods: [
            { duration: 30, label: '30 Days', multiplier: 1.0 },
            { duration: 60, label: '60 Days', multiplier: 1.2 },
            { duration: 90, label: '90 Days', multiplier: 1.5 }
          ]
        },
        OPENWORK: {
          totalStaked: 3500000,
          apy: { 30: 20, 60: 24, 90: 32 },
          lockPeriods: [
            { duration: 30, label: '30 Days', multiplier: 1.0 },
            { duration: 60, label: '60 Days', multiplier: 1.1 },
            { duration: 90, label: '90 Days', multiplier: 1.3 }
          ]
        }
      });
    } catch (e) {
      console.error('Error fetching pools:', e);
    }
  };

  const fetchUserStakes = async () => {
    // Simulated user stake data
    setUserStakes({
      ARYA: {
        stakedAmount: 5000,
        rewardEarned: 125.5,
        lockTimeRemaining: 86400 * 15, // 15 days remaining
        lockPeriodIndex: 0
      },
      OPENWORK: {
        stakedAmount: 15000,
        rewardEarned: 320.75,
        lockTimeRemaining: 0, // Unlocked
        lockPeriodIndex: 1
      }
    });
  };

  const connectWallet = async () => {
    if (typeof window === 'undefined' || !window.ethereum) {
      alert('MetaMask not installed');
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

  const disconnectWallet = () => {
    setWalletConnected(false);
    setWalletAddress('');
  };

  const handleStake = async () => {
    if (!stakeAmount || parseFloat(stakeAmount) <= 0) return;
    setLoading(true);
    
    // Simulated stake transaction
    setTimeout(() => {
      const hash = '0x' + Math.random().toString(16).slice(2, 66);
      setTxHash(hash);
      setStakeAmount('');
      fetchUserStakes();
      setLoading(false);
    }, 2000);
  };

  const handleUnstake = async () => {
    setLoading(true);
    
    setTimeout(() => {
      const hash = '0x' + Math.random().toString(16).slice(2, 66);
      setTxHash(hash);
      fetchUserStakes();
      setLoading(false);
    }, 2000);
  };

  const handleClaim = async () => {
    setLoading(true);
    
    setTimeout(() => {
      const hash = '0x' + Math.random().toString(16).slice(2, 66);
      setTxHash(hash);
      fetchUserStakes();
      setLoading(false);
    }, 2000);
  };

  const formatAPY = (apy) => `${apy}%`;
  const formatTimeRemaining = (seconds) => {
    if (seconds <= 0) return 'Unlocked';
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    return `${days}d ${hours}h remaining`;
  };

  const poolConfig = {
    ARYA: { color: '#ff6b35', emoji: '🦞' },
    OPENWORK: { color: '#00d4ff', emoji: '⚡' }
  };

  return (
    <>
      <Head>
        <title>🦞 Staking | ClawdbotArmy</title>
        <meta name="description" content="Stake ARYA and OPENWORK tokens to earn rewards" />
        <link rel="stylesheet" href="/styles.css" />
      </Head>
      
      <div className="staking-page">
        <div className="staking-header">
          <h1>🔒 Staking</h1>
          <p>Stake ARYA and OPENWORK tokens to earn rewards</p>
        </div>

        {/* Wallet Connection */}
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          {walletConnected ? (
            <div style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '15px',
              padding: '15px 25px',
              background: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid #10b981',
              borderRadius: '12px'
            }}>
              <span style={{ color: '#10b981', fontSize: '1.2em' }}>●</span>
              <span style={{ color: '#10b981', fontWeight: 'bold' }}>Connected</span>
              <code style={{ background: '#252530', padding: '5px 10px', borderRadius: '6px', color: '#fff' }}>
                {walletAddress.slice(0,6)}...{walletAddress.slice(-4)}
              </code>
              <button 
                onClick={disconnectWallet}
                style={{ 
                  padding: '8px 16px', 
                  background: 'transparent', 
                  border: '1px solid #444', 
                  borderRadius: '8px', 
                  color: '#888', 
                  cursor: 'pointer'
                }}
              >
                Disconnect
              </button>
            </div>
          ) : (
            <button 
              onClick={connectWallet}
              style={{ 
                padding: '15px 40px', 
                background: 'linear-gradient(135deg, #f6851b, #e2761b)', 
                border: 'none', 
                borderRadius: '12px', 
                color: '#fff', 
                fontSize: '1.1em', 
                fontWeight: 'bold', 
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px'
              }}
            >
              <span>🦊</span>
              <span>Connect Wallet</span>
            </button>
          )}
        </div>

        {/* Pool Selection */}
        <div className="staking-tabs">
          {Object.entries(pools || {}).map(([token, pool]) => (
            <button
              key={token}
              className={`staking-tab ${selectedPool === token ? 'active' : ''}`}
              onClick={() => setSelectedPool(token)}
              style={{ borderColor: selectedPool === token ? poolConfig[token].color : 'transparent' }}
            >
              <span style={{ marginRight: '8px' }}>{poolConfig[token].emoji}</span>
              <span>{token}</span>
            </button>
          ))}
        </div>

        {/* Pool Details */}
        {pools && pools[selectedPool] && (
          <div className="staking-grid">
            {/* Pool Stats Card */}
            <div className="staking-card">
              <div className="staking-card-header">
                <h3>
                  <span style={{ marginRight: '10px' }}>{poolConfig[selectedPool].emoji}</span>
                  {selectedPool} Staking Pool
                </h3>
                <span className="apy-badge">{pools[selectedPool].apy[30]}% APY</span>
              </div>

              <div className="pool-stats">
                <div className="pool-stat">
                  <div className="pool-stat-value">{pools[selectedPool].totalStaked.toLocaleString()}</div>
                  <div className="pool-stat-label">Total Staked</div>
                </div>
                <div className="pool-stat">
                  <div className="pool-stat-value">{pools[selectedPool].apy[30]}%</div>
                  <div className="pool-stat-label">30 Days</div>
                </div>
                <div className="pool-stat">
                  <div className="pool-stat-value">{pools[selectedPool].apy[60]}%</div>
                  <div className="pool-stat-label">60 Days</div>
                </div>
                <div className="pool-stat">
                  <div className="pool-stat-value">{pools[selectedPool].apy[90]}%</div>
                  <div className="pool-stat-label">90 Days</div>
                </div>
              </div>

              {/* Lock Periods */}
              <div className="lock-periods">
                <h4>Lock Period</h4>
                <div className="lock-options">
                  {pools[selectedPool].lockPeriods.map((period) => (
                    <button
                      key={period.duration}
                      className={`lock-option ${selectedLockPeriod === period.duration ? 'active' : ''}`}
                      onClick={() => setSelectedLockPeriod(period.duration)}
                    >
                      <div className="days">{period.label}</div>
                      <div className="multiplier">×{period.multiplier} rewards</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* User Stakes */}
              {walletConnected && userStakes[selectedPool] && (
                <div className="user-stakes">
                  <h4>Your Stake</h4>
                  <div className="stake-row">
                    <span className="label">Staked Amount</span>
                    <span className="value">{userStakes[selectedPool].stakedAmount.toLocaleString()} {selectedPool}</span>
                  </div>
                  <div className="stake-row">
                    <span className="label">Rewards Earned</span>
                    <span className="value positive">{userStakes[selectedPool].rewardEarned.toFixed(4)} {selectedPool}</span>
                  </div>
                  <div className="stake-row">
                    <span className="label">Lock Status</span>
                    <span className="value">{formatTimeRemaining(userStakes[selectedPool].lockTimeRemaining)}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Stake Action Card */}
            <div className="staking-card">
              <h3>Stake {selectedPool}</h3>
              
              <div className="stake-input-group">
                <label>Amount to Stake</label>
                <input
                  type="number"
                  placeholder="0.00"
                  value={stakeAmount}
                  onChange={(e) => setStakeAmount(e.target.value)}
                  min="0"
                  step="0.01"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '20px' }}>
                <button 
                  onClick={() => setStakeAmount((userStakes[selectedPool]?.stakedAmount || 0).toString())}
                  style={{ 
                    padding: '10px', 
                    background: 'rgba(255,255,255,0.05)', 
                    border: '1px solid rgba(255,255,255,0.1)', 
                    borderRadius: '8px',
                    color: '#888',
                    cursor: 'pointer'
                  }}
                >
                  Max
                </button>
                <button 
                  onClick={() => setStakeAmount('1000')}
                  style={{ 
                    padding: '10px', 
                    background: 'rgba(255,255,255,0.05)', 
                    border: '1px solid rgba(255,255,255,0.1)', 
                    borderRadius: '8px',
                    color: '#888',
                    cursor: 'pointer'
                  }}
                >
                  1000
                </button>
              </div>

              <button 
                className="stake-btn"
                onClick={handleStake}
                disabled={loading || !stakeAmount}
              >
                {loading ? '⏳ Processing...' : `Stake ${stakeAmount || 0} ${selectedPool}`}
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
            </div>
          </div>
        )}

        {/* Action Tabs */}
        <div className="action-tabs">
          <button 
            className={activeTab === 'stake' ? 'active' : ''}
            onClick={() => setActiveTab('stake')}
          >
            Stake
          </button>
          <button 
            className={activeTab === 'unstake' ? 'active' : ''}
            onClick={() => setActiveTab('unstake')}
          >
            Unstake
          </button>
          <button 
            className={activeTab === 'rewards' ? 'active' : ''}
            onClick={() => setActiveTab('rewards')}
          >
            Claim Rewards
          </button>
        </div>

        {/* Action Panel */}
        <div className="action-panel">
          {activeTab === 'stake' && (
            <div className="stake-form">
              <h4>Stake {selectedPool}</h4>
              
              <div className="lock-periods">
                {pools?.[selectedPool]?.lockPeriods.map((period, idx) => (
                  <button
                    key={period.duration}
                    className={`lock-btn ${selectedLockPeriod === idx ? 'active' : ''}`}
                    onClick={() => setSelectedLockPeriod(idx)}
                  >
                    {period.label}
                    <span className="lock-multiplier">{period.multiplier}x APY</span>
                  </button>
                ))}
              </div>
              
              <div className="input-group">
                <label>Amount to stake</label>
                <input
                  type="number"
                  placeholder="0.00"
                  value={stakeAmount}
                  onChange={(e) => setStakeAmount(e.target.value)}
                />
              </div>
              
              <button 
                className="execute-btn"
                onClick={handleStake}
                disabled={loading || !stakeAmount}
              >
                {loading ? '⏳ Staking...' : `Stake ${stakeAmount || 0} ${selectedPool}`}
              </button>
            </div>
          )}

          {activeTab === 'unstake' && (
            <div className="unstake-form">
              <h4>Unstake {selectedPool}</h4>
              
              {userStakes[selectedPool]?.lockTimeRemaining > 0 ? (
                <div className="lock-warning">
                  🔒 Locked until {formatTimeRemaining(userStakes[selectedPool].lockTimeRemaining)}
                </div>
              ) : (
                <>
                  <div className="input-group">
                    <label>Amount to unstake</label>
                    <input
                      type="number"
                      placeholder={userStakes[selectedPool]?.stakedAmount?.toString() || '0'}
                      defaultValue={userStakes[selectedPool]?.stakedAmount}
                    />
                  </div>
                  
                  <button 
                    className="execute-btn unstake"
                    onClick={handleUnstake}
                    disabled={loading || !userStakes[selectedPool]?.stakedAmount}
                  >
                    {loading ? '⏳ Unstaking...' : `Unstake All ${selectedPool}`}
                  </button>
                </>
              )}
            </div>
          )}

          {activeTab === 'rewards' && (
            <div className="rewards-form">
              <h4>Claim Rewards</h4>
              
              <div className="rewards-display">
                <span className="rewards-label">Available</span>
                <span className="rewards-amount">
                  {userStakes[selectedPool]?.rewardEarned?.toFixed(4) || '0.0000'} {selectedPool}
                </span>
              </div>
              
              <button 
                className="execute-btn rewards"
                onClick={handleClaim}
                disabled={loading || (userStakes[selectedPool]?.rewardEarned || 0) <= 0}
              >
                {loading ? '⏳ Claiming...' : 'Claim Rewards'}
              </button>
            </div>
          )}

          {/* Transaction Result */}
          {txHash && (
            <div className="tx-success">
              <span>✅</span>
              <div>
                <strong>Transaction Submitted!</strong>
                <code>{txHash.slice(0,10)}...{txHash.slice(-8)}</code>
              </div>
            </div>
          )}
        </div>

        {/* Info Section */}
        <div className="info-section">
          <h3>📖 Staking Guide</h3>
          <div className="info-grid">
            <div className="info-card">
              <span className="info-icon">🔒</span>
              <h4>Lock Periods</h4>
              <p>Choose 30, 60, or 90 day lock periods. Longer locks = higher APY rewards.</p>
            </div>
            <div className="info-card">
              <span className="info-icon">📈</span>
              <h4>APY Rewards</h4>
              <p>Earn up to 45% APY on ARYA and 32% APY on OPENWORK with 90-day locks.</p>
            </div>
            <div className="info-card">
              <span className="info-icon">⚠️</span>
              <h4>Early Unstaking</h4>
              <p>Cannot unstake before lock period ends. Rewards continue accruing during lock.</p>
            </div>
            <div className="info-card">
              <span className="info-icon">🎁</span>
              <h4>Claim Anytime</h4>
              <p>Claim your rewards anytime without unstaking. Claimed rewards go to your wallet.</p>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .staking-page {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
        }
        
        .staking-header {
          text-align: center;
          margin-bottom: 30px;
        }
        
        .staking-header h1 {
          font-size: 2.5em;
          margin-bottom: 10px;
        }
        
        .staking-header p {
          color: #9ca3af;
        }
        
        .wallet-section {
          max-width: 500px;
          margin: 0 auto 30px;
        }
        
        .wallet-connected {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 15px;
          padding: 15px;
          background: rgba(16, 185, 129, 0.1);
          border: 1px solid #10b981;
          border-radius: 12px;
        }
        
        .wallet-status {
          color: #10b981;
        }
        
        .wallet-address {
          background: #2a2a2a;
          padding: 5px 10px;
          border-radius: 6px;
        }
        
        .connect-btn, .disconnect-btn {
          width: 100%;
          padding: 15px;
          border-radius: 12px;
          font-weight: bold;
          cursor: pointer;
          transition: all 0.3s;
        }
        
        .connect-btn {
          background: linear-gradient(135deg, #f6851b, #e2761b);
          border: none;
          color: #fff;
        }
        
        .disconnect-btn {
          background: transparent;
          border: 1px solid #ef4444;
          color: #ef4444;
        }
        
        .pools-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 20px;
          margin-bottom: 30px;
        }
        
        .pool-card {
          background: #1e1e1e;
          border-radius: 16px;
          padding: 25px;
          border: 2px solid transparent;
          cursor: pointer;
          transition: all 0.3s;
        }
        
        .pool-card.selected {
          border-color: var(--pool-color);
          box-shadow: 0 0 30px rgba(255, 255, 255, 0.1);
        }
        
        .pool-header {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 20px;
        }
        
        .pool-emoji {
          font-size: 2em;
        }
        
        .pool-header h2 {
          margin: 0;
        }
        
        .pool-stats {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 15px;
        }
        
        .stat {
          display: flex;
          flex-direction: column;
        }
        
        .stat-label {
          font-size: 0.8em;
          color: #9ca3af;
          text-transform: uppercase;
        }
        
        .stat-value {
          font-size: 1.1em;
          font-weight: bold;
        }
        
        .user-stakes {
          background: #1e1e1e;
          border-radius: 16px;
          padding: 25px;
          margin-bottom: 30px;
        }
        
        .user-stakes h3 {
          margin-bottom: 20px;
        }
        
        .stake-info {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        
        .info-row {
          display: flex;
          justify-content: space-between;
          padding: 12px;
          background: #2a2a2a;
          border-radius: 8px;
        }
        
        .action-tabs {
          display: flex;
          gap: 10px;
          margin-bottom: 20px;
        }
        
        .action-tabs button {
          flex: 1;
          padding: 15px;
          border: 2px solid #333;
          border-radius: 12px;
          background: transparent;
          color: #fff;
          font-weight: bold;
          cursor: pointer;
          transition: all 0.3s;
        }
        
        .action-tabs button.active {
          background: #6366f1;
          border-color: #6366f1;
        }
        
        .action-panel {
          background: #1e1e1e;
          border-radius: 16px;
          padding: 30px;
          margin-bottom: 40px;
        }
        
        .action-panel h4 {
          margin-bottom: 20px;
          text-align: center;
        }
        
        .lock-periods {
          display: flex;
          gap: 10px;
          margin-bottom: 20px;
        }
        
        .lock-btn {
          flex: 1;
          padding: 15px;
          border: 2px solid #333;
          border-radius: 10px;
          background: transparent;
          color: #fff;
          cursor: pointer;
          transition: all 0.3s;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 5px;
        }
        
        .lock-btn.active {
          border-color: #6366f1;
          background: rgba(99, 102, 241, 0.1);
        }
        
        .lock-multiplier {
          font-size: 0.8em;
          color: #10b981;
        }
        
        .input-group {
          margin-bottom: 20px;
        }
        
        .input-group label {
          display: block;
          margin-bottom: 8px;
          color: #9ca3af;
        }
        
        .input-group input {
          width: 100%;
          padding: 15px;
          background: #2a2a2a;
          border: 2px solid #333;
          border-radius: 10px;
          color: #fff;
          font-size: 1.1em;
        }
        
        .input-group input:focus {
          outline: none;
          border-color: #6366f1;
        }
        
        .execute-btn {
          width: 100%;
          padding: 18px;
          border: none;
          border-radius: 12px;
          font-size: 1.1em;
          font-weight: bold;
          cursor: pointer;
          transition: all 0.3s;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          color: #fff;
        }
        
        .execute-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        
        .execute-btn.unstake {
          background: linear-gradient(135deg, #ef4444, #dc2626);
        }
        
        .execute-btn.rewards {
          background: linear-gradient(135deg, #10b981, #059669);
        }
        
        .lock-warning {
          padding: 20px;
          background: rgba(251, 191, 36, 0.1);
          border: 1px solid #fbbf24;
          border-radius: 10px;
          text-align: center;
          color: #fbbf24;
          margin-bottom: 20px;
        }
        
        .rewards-display {
          text-align: center;
          margin-bottom: 20px;
        }
        
        .rewards-label {
          display: block;
          color: #9ca3af;
          margin-bottom: 10px;
        }
        
        .rewards-amount {
          font-size: 2em;
          font-weight: bold;
          color: #10b981;
        }
        
        .tx-success {
          display: flex;
          align-items: center;
          gap: 15px;
          margin-top: 20px;
          padding: 15px;
          background: rgba(16, 185, 129, 0.1);
          border: 1px solid #10b981;
          border-radius: 10px;
        }
        
        .tx-success code {
          display: block;
          margin-top: 5px;
          font-size: 0.85em;
          color: #9ca3af;
        }
        
        .info-section h3 {
          text-align: center;
          margin-bottom: 25px;
        }
        
        .info-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 20px;
        }
        
        .info-card {
          background: #1e1e1e;
          border-radius: 12px;
          padding: 25px;
          text-align: center;
        }
        
        .info-icon {
          font-size: 2em;
          display: block;
          margin-bottom: 15px;
        }
        
        .info-card h4 {
          margin-bottom: 10px;
        }
        
        .info-card p {
          color: #9ca3af;
          font-size: 0.9em;
          line-height: 1.6;
        }
        
        @media (max-width: 768px) {
          .staking-page {
            padding: 15px;
          }
          
          .pools-grid {
            grid-template-columns: 1fr;
          }
          
          .lock-periods {
            flex-direction: column;
          }
          
          .action-tabs {
            flex-direction: column;
          }
        }
      `}</style>
    </>
  );
}
