import { useState, useEffect } from 'react';
import { createPublicClient, http, formatEther } from 'viem';
import { mainnet, base } from 'viem/chains';

const SUPPORTED_CHAINS = [
  { id: 1, name: 'Ethereum', chain: mainnet, rpc: 'https://eth-mainnet.g.alchemy.com/v2/demo' },
  { id: 8453, name: 'Base', chain: base, rpc: 'https://base-mainnet.g.alchemy.com/v2/demo' },
];

export default function WalletConnect() {
  const [connected, setConnected] = useState(false);
  const [address, setAddress] = useState('');
  const [balance, setBalance] = useState('0');
  const [chainId, setChainId] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Check if already connected
    if (typeof window !== 'undefined' && window.ethereum) {
      checkConnection();
      
      // Listen for account changes
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', (newChainId) => {
        setChainId(parseInt(newChainId, 16));
        if (connected) fetchBalance(address);
      });
    }
  }, []);

  const checkConnection = async () => {
    try {
      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      if (accounts.length > 0) {
        setAddress(accounts[0]);
        setConnected(true);
        await fetchBalance(accounts[0]);
      }
    } catch (e) {
      console.error('Error checking connection:', e);
    }
  };

  const handleAccountsChanged = async (accounts) => {
    if (accounts.length === 0) {
      setConnected(false);
      setAddress('');
      setBalance('0');
    } else {
      setAddress(accounts[0]);
      setConnected(true);
      await fetchBalance(accounts[0]);
    }
  };

  const fetchBalance = async (addr) => {
    try {
      const client = createPublicClient({
        chain: chainId === 8453 ? base : mainnet,
        transport: http()
      });
      
      const balanceRaw = await client.getBalance({ address: addr });
      setBalance(formatEther(balanceRaw));
    } catch (e) {
      console.error('Error fetching balance:', e);
      setBalance('0');
    }
  };

  const connectWallet = async () => {
    setLoading(true);
    setError(null);

    try {
      if (!window.ethereum) {
        throw new Error('No crypto wallet found. Please install MetaMask or another wallet.');
      }

      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      });

      if (accounts.length > 0) {
        setAddress(accounts[0]);
        setConnected(true);
        await fetchBalance(accounts[0]);
      }
    } catch (e) {
      setError(e.message);
    }

    setLoading(false);
  };

  const disconnect = () => {
    setConnected(false);
    setAddress('');
    setBalance('0');
  };

  const formatAddress = (addr) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  if (!mounted) {
    return (
      <div className="wallet-connect">
        <button className="connect-btn" disabled>
          ⏳ Loading...
        </button>
      </div>
    );
  }

  if (!window.ethereum) {
    return (
      <div className="wallet-connect">
        <div className="wallet-warning">
          <span className="warning-icon">⚠️</span>
          <div className="warning-text">
            <strong>Wallet Required</strong>
            <p>Install MetaMask or use a wallet-enabled browser</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="wallet-connect">
      {error && (
        <div className="wallet-error">
          <span>❌</span> {error}
          <button onClick={() => setError(null)}>×</button>
        </div>
      )}

      {connected ? (
        <div className="wallet-connected">
          <div className="wallet-info">
            <div className="wallet-address" onClick={() => navigator.clipboard.writeText(address)}>
              <span className="address-icon">👛</span>
              <span className="address">{formatAddress(address)}</span>
              <span className="copy-hint">Copy</span>
            </div>
            <div className="wallet-balance">
              <span className="balance">{parseFloat(balance).toFixed(4)} ETH</span>
            </div>
          </div>
          
          <div className="wallet-actions">
            <select 
              className="chain-select"
              value={chainId}
              onChange={(e) => setChainId(parseInt(e.target.value))}
            >
              {SUPPORTED_CHAINS.map(chain => (
                <option key={chain.id} value={chain.id}>{chain.name}</option>
              ))}
            </select>
            <button className="disconnect-btn" onClick={disconnect}>
              Disconnect
            </button>
          </div>
        </div>
      ) : (
        <button 
          className="connect-btn"
          onClick={connectWallet}
          disabled={loading}
        >
          {loading ? '⏳ Connecting...' : '🔗 Connect Wallet'}
        </button>
      )}
    </div>
  );
}
