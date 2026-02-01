import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { createPublicClient, http, formatEther } from 'viem';
import { mainnet, base } from 'viem/chains';

const WalletContext = createContext(null);

export function WalletProvider({ children }) {
  const [connected, setConnected] = useState(false);
  const [address, setAddress] = useState('');
  const [balance, setBalance] = useState('0');
  const [chainId, setChainId] = useState(1);
  const [error, setError] = useState(null);

  const getClient = useCallback(() => {
    return createPublicClient({
      chain: chainId === 8453 ? base : mainnet,
      transport: http()
    });
  }, [chainId]);

  const fetchBalance = useCallback(async (addr) => {
    try {
      const client = getClient();
      const balanceRaw = await client.getBalance({ address: addr });
      setBalance(formatEther(balanceRaw));
    } catch (e) {
      console.error('Error fetching balance:', e);
      setBalance('0');
    }
  }, [getClient]);

  const connect = useCallback(async () => {
    setError(null);
    
    if (typeof window === 'undefined' || !window.ethereum) {
      setError('No crypto wallet found. Please install MetaMask.');
      return false;
    }

    try {
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      });

      if (accounts.length > 0) {
        setAddress(accounts[0]);
        setConnected(true);
        await fetchBalance(accounts[0]);
        return true;
      }
    } catch (e) {
      setError(e.message);
      return false;
    }
    return false;
  }, [fetchBalance]);

  const disconnect = useCallback(() => {
    setConnected(false);
    setAddress('');
    setBalance('0');
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.ethereum) {
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
      
      checkConnection();
      
      window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length === 0) {
          disconnect();
        } else {
          setAddress(accounts[0]);
          fetchBalance(accounts[0]);
        }
      });

      window.ethereum.on('chainChanged', (newChainId) => {
        setChainId(parseInt(newChainId, 16));
        if (connected) fetchBalance(address);
      });

      return () => {
        window.ethereum.removeAllListeners('accountsChanged');
        window.ethereum.removeAllListeners('chainChanged');
      };
    }
  }, [address, connected, disconnect, fetchBalance]);

  return (
    <WalletContext.Provider value={{ 
      connected, 
      address, 
      balance, 
      chainId,
      error,
      connect, 
      disconnect,
      fetchBalance,
      setChainId
    }}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
}
