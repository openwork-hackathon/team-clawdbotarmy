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
    setUserStakes({
      ARYA: {
        stakedAmount: 5000,
        rewardEarned: 125.5,
        lockTimeRemaining: 86400 * 15,
        lockPeriodIndex: 0
      },
      OPENWORK: {
        stakedAmount: 15000,
        rewardEarned: 320.75,
        lockTimeRemaining: 0,
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
    setTimeout(() => {
      const hash = '0x' + Math.random().toString(16).slice(2, 66);
      setTxHash(hash);
      setStakeAmount('');
      fetchUserStakes();
      setLoading(false);
    }, 2000);
  };

  const poolConfig = {
    ARYA: { color: '#ff6b35', emoji: '🦞' },
    OPENWORK: { color: '#00d4ff', emoji: '⚡' }
  };

  return (
    <div>
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

        {pools && pools[selectedPool] && (
          <div className="staking-grid">
            <div className="staking-card pool-stats">
              <h3>📊 Pool Stats</h3>
              <div className="stat-grid">
                <div className="stat-item">
                  <span className="stat-label">Total Staked</span>
                  <span className="stat-value" style={{ color: poolConfig[selectedPool].color }}>
                    {pools[selectedPool].totalStaked.toLocaleString()} {selectedPool}
                  </span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Your Stake</span>
                  <span className="stat-value">
                    {userStakes[selectedPool]?.stakedAmount?.toLocaleString() || '0'} {selectedPool}
                  </span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">APY (30d)</span>
                  <span className="stat-value" style={{ color: '#10b981' }}>
                    {pools[selectedPool].apy[30]}%
                  </span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Rewards</span>
                  <span className="stat-value" style={{ color: '#f6851b' }}>
                    {userStakes[selectedPool]?.rewardEarned?.toFixed(2) || '0'} {selectedPool}
                  </span>
                </div>
              </div>
            </div>

            <div className="staking-card lock-periods">
              <h3>⏱️ Lock Periods</h3>
              <div className="lock-options">
                {pools[selectedPool].lockPeriods.map((period, index) => (
                  <button
                    key={period.duration}
                    className={`lock-option ${selectedLockPeriod === index ? 'active' : ''}`}
                    onClick={() => setSelectedLockPeriod(index)}
                    style={{ 
                      borderColor: selectedLockPeriod === index ? poolConfig[selectedPool].color : '#333'
                    }}
                  >
                    <div className="lock-duration">{period.label}</div>
                    <div className="lock-multiplier">{period.multiplier}x APY</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="staking-card stake-form">
              <h3>🎯 Stake {selectedPool}</h3>
              
              <div className="form-group">
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
    </div>
  );
}
