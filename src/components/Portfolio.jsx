import { useState, useEffect } from 'react';
import { useWallet } from '../hooks/useWallet';

export default function Portfolio({ holdings = [] }) {
  const { connected, address, connect, error: walletError } = useWallet();
  const [portfolio, setPortfolio] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (connected && address) {
      fetchPortfolio(address);
    }
  }, [connected, address]);

  const fetchPortfolio = async (addr) => {
    setLoading(true);
    setError(null);
    
    try {
      const r = await fetch(`/api/portfolio?address=${addr}`);
      const data = await r.json();
      
      if (data.error) {
        setError(data.error);
      } else {
        setPortfolio(data);
      }
    } catch (e) {
      setError('Failed to fetch portfolio');
    }
    
    setLoading(false);
  };

  if (!connected) {
    return (
      <div className="portfolio-tracker">
        <div className="portfolio-header">
          <h2>💰 Portfolio</h2>
          <span className="portfolio-subtitle">Connect your wallet to view holdings</span>
        </div>
        
        <div className="portfolio-placeholder wallet-prompt">
          <span className="placeholder-icon">🔗</span>
          <p>Connect your crypto wallet to track your portfolio</p>
          <small>Supports MetaMask and other Ethereum wallets</small>
          <button className="connect-wallet-btn" onClick={connect}>
            Connect Wallet
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="portfolio-tracker">
      <div className="portfolio-header">
        <h2>💰 Portfolio</h2>
        <span className="portfolio-subtitle">
          {address.slice(0, 6)}...{address.slice(-4)}
        </span>
      </div>

      {(walletError || error) && (
        <div className="portfolio-error">
          <span>⚠️</span> {walletError || error}
        </div>
      )}

      {loading ? (
        <div className="portfolio-loading">
          <div className="spinner"></div>
          <span>Loading portfolio...</span>
        </div>
      ) : portfolio ? (
        <div className="portfolio-details">
          <div className="total-value">
            <span className="label">Total Value</span>
            <span className="big">${portfolio.totalValue?.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
            <span className="updated">
              Last updated: {new Date(portfolio.lastUpdated).toLocaleTimeString()}
            </span>
          </div>
          
          <div className="holdings-list">
            {portfolio.holdings?.map((h, i) => (
              <div key={i} className="holding-item">
                <div className="holding-main">
                  <span className="token">{h.symbol}</span>
                  <span className="amount">{h.amount?.toLocaleString(undefined, {maximumFractionDigits: 6})}</span>
                </div>
                <div className="holding-value">
                  <span className="value">${h.value?.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                  <span className={`change ${h.change24h >= 0 ? 'up' : 'down'}`}>
                    {h.change24h >= 0 ? '↑' : '↓'} {Math.abs(h.change24h || 0).toFixed(2)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="portfolio-placeholder">
          <span className="placeholder-icon">📊</span>
          <p>No holdings found for this wallet</p>
          <small>Your portfolio will appear here once you have tokens</small>
        </div>
      )}
    </div>
  );
}
