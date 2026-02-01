// WalletConnect Component
// Clean MetaMask connection UI with balance and network display

import { useState, useEffect, useCallback } from 'react';
import { createPublicClient, createWalletClient, http, parseEther, formatEther } from 'viem';
import { base } from 'viem/chains';

// Network configuration
const NETWORKS = {
  base: {
    id: 8453,
    name: 'Base',
    rpc: 'https://base-mainnet.infura.io',
    explorer: 'https://basescan.org'
  }
};

// ERC20 ABI for balance checks
const ERC20_ABI = [
  {
    name: 'balanceOf',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'owner', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }]
  },
  {
    name: 'decimals',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint8' }]
  }
];

export default function WalletConnect({ 
  onConnect, 
  onDisconnect,
  showBalance = true,
  compact = false 
}) {
  const [account, setAccount] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState(null);
  const [balance, setBalance] = useState(null);
  const [network, setNetwork] = useState(null);
  const [isCorrectNetwork, setIsCorrectNetwork] = useState(false);

  // Create public client
  const publicClient = createPublicClient({
    chain: base,
    transport: http()
  });

  // Check connection on mount
  useEffect(() => {
    checkConnection();
    
    // Listen for account changes
    if (typeof window !== 'undefined' && window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);
    }
    
    return () => {
      if (typeof window !== 'undefined' && window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      }
    };
  }, []);

  // Fetch balance when account changes
  useEffect(() => {
    if (account && showBalance) {
      fetchBalance();
    }
  }, [account, showBalance]);

  const checkConnection = useCallback(async () => {
    if (typeof window === 'undefined' || !window.ethereum) return;
    
    try {
      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      if (accounts.length > 0) {
        setAccount(accounts[0]);
        await checkNetwork();
      }
    } catch (err) {
      console.error('Error checking connection:', err);
    }
  }, []);

  const checkNetwork = useCallback(async () => {
    if (typeof window === 'undefined' || !window.ethereum) return;
    
    try {
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      const chainIdNum = parseInt(chainId, 16);
      
      setNetwork(NETWORKS.base);
      setIsCorrectNetwork(chainIdNum === NETWORKS.base.id);
    } catch (err) {
      console.error('Error checking network:', err);
    }
  }, []);

  const handleAccountsChanged = useCallback((accounts) => {
    if (accounts.length === 0) {
      setAccount(null);
      setBalance(null);
      onDisconnect?.();
    } else {
      setAccount(accounts[0]);
      fetchBalance();
      onConnect?.(accounts[0]);
    }
  }, [onDisconnect, onConnect]);

  const handleChainChanged = useCallback(async (chainId) => {
    const chainIdNum = parseInt(chainId, 16);
    setNetwork(NETWORKS.base);
    setIsCorrectNetwork(chainIdNum === NETWORKS.base.id);
    // Reload to avoid inconsistencies
    window.location.reload();
  }, []);

  const fetchBalance = useCallback(async () => {
    if (!account) return;
    
    try {
      const balanceWei = await publicClient.getBalance({ address: account });
      setBalance(formatEther(balanceWei));
    } catch (err) {
      console.error('Error fetching balance:', err);
      setBalance('0');
    }
  }, [account, publicClient]);

  const connect = useCallback(async () => {
    if (typeof window === 'undefined') return;
    
    const ethereum = window.ethereum;
    if (!ethereum) {
      setError('MetaMask not installed. Please install MetaMask to continue.');
      return;
    }

    setIsConnecting(true);
    setError(null);

    try {
      const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
      setAccount(accounts[0]);
      await checkNetwork();
      onConnect?.(accounts[0]);
    } catch (err) {
      setError(err.message || 'Failed to connect wallet');
    } finally {
      setIsConnecting(false);
    }
  }, [checkNetwork, onConnect]);

  const disconnect = useCallback(() => {
    setAccount(null);
    setBalance(null);
    onDisconnect?.();
  }, [onDisconnect]);

  const formatAddress = (addr) => {
    if (!addr) return '';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  // Compact version (for header)
  if (compact) {
    return (
      <div className="wallet-connect-compact">
        {account ? (
          <div className="wallet-connected-compact">
            {showBalance && balance && (
              <span className="wallet-balance">{parseFloat(balance).toFixed(4)} ETH</span>
            )}
            <span className="wallet-address">{formatAddress(account)}</span>
            <button className="disconnect-btn-small" onClick={disconnect}>
              ✕
            </button>
          </div>
        ) : (
          <button 
            className="connect-btn-small"
            onClick={connect}
            disabled={isConnecting}
          >
            {isConnecting ? '⏳' : '🦊 Connect'}
          </button>
        )}
        
        {error && <span className="wallet-error">{error}</span>}
        
        <style jsx>{`
          .wallet-connect-compact {
            display: flex;
            align-items: center;
            gap: 10px;
          }
          
          .wallet-connected-compact {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 6px 12px;
            background: rgba(16, 185, 129, 0.1);
            border: 1px solid var(--accent-green, #10b981);
            border-radius: 20px;
          }
          
          .wallet-balance {
            font-size: 0.85em;
            color: var(--accent-green, #10b981);
            font-weight: 500;
          }
          
          .wallet-address {
            font-family: monospace;
            font-size: 0.85em;
            background: var(--bg-secondary, #1e1e1e);
            padding: 4px 8px;
            border-radius: 4px;
          }
          
          .disconnect-btn-small {
            background: none;
            border: none;
            color: var(--text-secondary, #9ca3af);
            cursor: pointer;
            padding: 2px 6px;
            border-radius: 4px;
            font-size: 0.8em;
            transition: all 0.2s;
          }
          
          .disconnect-btn-small:hover {
            background: rgba(239, 68, 68, 0.1);
            color: var(--accent-red, #ef4444);
          }
          
          .connect-btn-small {
            padding: 8px 16px;
            background: linear-gradient(135deg, #f6851b, #e2761b);
            border: none;
            border-radius: 20px;
            color: white;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s;
          }
          
          .connect-btn-small:hover:not(:disabled) {
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(246, 133, 27, 0.3);
          }
          
          .connect-btn-small:disabled {
            opacity: 0.6;
            cursor: not-allowed;
          }
          
          .wallet-error {
            color: var(--accent-red, #ef4444);
            font-size: 0.8em;
          }
        `}</style>
      </div>
    );
  }

  // Full version
  return (
    <div className="wallet-connect-container">
      {account ? (
        <div className="wallet-connected">
          {/* Network Indicator */}
          <div className={`network-badge ${isCorrectNetwork ? 'correct' : 'wrong'}`}>
            <span className="network-dot"></span>
            {network?.name || 'Unknown'}
          </div>

          {/* Account Info */}
          <div className="account-info">
            <div className="account-header">
              <span className="account-label">Connected</span>
              <code className="account-address">{formatAddress(account)}</code>
            </div>
            
            {showBalance && balance && (
              <div className="balance-info">
                <span className="balance-label">Balance</span>
                <span className="balance-value">{parseFloat(balance).toFixed(6)} ETH</span>
              </div>
            )}
          </div>

          {/* Disconnect Button */}
          <button className="disconnect-btn" onClick={disconnect}>
            Disconnect
          </button>
        </div>
      ) : (
        <div className="wallet-connect-prompt">
          <div className="prompt-icon">🦊</div>
          <h3>Connect Your Wallet</h3>
          <p>Connect MetaMask to trade for real on Base</p>
          
          <button 
            className="connect-btn-large"
            onClick={connect}
            disabled={isConnecting}
          >
            {isConnecting ? (
              <>
                <span className="spinner"></span>
                Connecting...
              </>
            ) : (
              <>
                <span className="metamask-icon">🦊</span>
                Connect MetaMask
              </>
            )}
          </button>
          
          {error && <div className="error-message">{error}</div>}
          
          <div className="network-note">
            Make sure you're on <strong>Base Network</strong>
          </div>
        </div>
      )}

      <style jsx>{`
        .wallet-connect-container {
          max-width: 400px;
          margin: 0 auto;
        }
        
        .wallet-connected {
          background: var(--bg-card, #1e1e1e);
          border: 1px solid var(--border-color, #333);
          border-radius: 16px;
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 15px;
        }
        
        .network-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 0.85em;
          font-weight: 500;
          width: fit-content;
        }
        
        .network-badge.correct {
          background: rgba(16, 185, 129, 0.1);
          color: var(--accent-green, #10b981);
        }
        
        .network-badge.wrong {
          background: rgba(239, 68, 68, 0.1);
          color: var(--accent-red, #ef4444);
        }
        
        .network-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: currentColor;
        }
        
        .account-info {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        
        .account-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        
        .account-label {
          font-size: 0.85em;
          color: var(--accent-green, #10b981);
        }
        
        .account-address {
          background: var(--bg-secondary, #2a2a2a);
          padding: 4px 10px;
          border-radius: 6px;
          font-size: 0.9em;
        }
        
        .balance-info {
          display: flex;
          justify-content: space-between;
          padding: 10px;
          background: var(--bg-secondary, #2a2a2a);
          border-radius: 8px;
        }
        
        .balance-label {
          color: var(--text-secondary, #9ca3af);
          font-size: 0.9em;
        }
        
        .balance-value {
          font-weight: 600;
          color: var(--text-primary, #fff);
        }
        
        .disconnect-btn {
          padding: 10px 20px;
          background: transparent;
          border: 1px solid var(--border-color, #444);
          border-radius: 8px;
          color: var(--text-secondary, #9ca3af);
          cursor: pointer;
          transition: all 0.2s;
          font-size: 0.9em;
        }
        
        .disconnect-btn:hover {
          background: rgba(239, 68, 68, 0.1);
          border-color: var(--accent-red, #ef4444);
          color: var(--accent-red, #ef4444);
        }
        
        .wallet-connect-prompt {
          text-align: center;
          padding: 30px;
          background: var(--bg-card, #1e1e1e);
          border-radius: 16px;
        }
        
        .prompt-icon {
          font-size: 3em;
          margin-bottom: 15px;
        }
        
        .wallet-connect-prompt h3 {
          margin: 0 0 10px;
          font-size: 1.3em;
        }
        
        .wallet-connect-prompt p {
          color: var(--text-secondary, #9ca3af);
          margin: 0 0 20px;
          font-size: 0.95em;
        }
        
        .connect-btn-large {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          padding: 15px 30px;
          background: linear-gradient(135deg, #f6851b, #e2761b);
          border: none;
          border-radius: 12px;
          color: white;
          font-size: 1.1em;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
          width: 100%;
        }
        
        .connect-btn-large:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(246, 133, 27, 0.4);
        }
        
        .connect-btn-large:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
        
        .metamask-icon {
          font-size: 1.2em;
        }
        
        .spinner {
          width: 18px;
          height: 18px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
        
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        .error-message {
          margin-top: 15px;
          padding: 10px;
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid var(--accent-red, #ef4444);
          border-radius: 8px;
          color: var(--accent-red, #ef4444);
          font-size: 0.9em;
        }
        
        .network-note {
          margin-top: 20px;
          font-size: 0.85em;
          color: var(--text-secondary, #9ca3af);
        }
        
        .network-note strong {
          color: var(--accent-blue, #6366f1);
        }
      `}</style>
    </div>
  );
}
