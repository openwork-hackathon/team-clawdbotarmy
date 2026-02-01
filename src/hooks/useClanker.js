// useClanker - Hook for on-chain trading via Clanker
import { useState, useCallback, useEffect } from 'react';
import { createPublicClient, createWalletClient, http, parseEther, formatEther, custom } from 'viem';
import { base } from 'viem/chains';

// Clanker contracts on Base
const CLANKER_ADDRESSES = {
  clanker: '0x00000000F9490004a96217b5dC12bD5dD7c52ba8',
  weth: '0x4200000000000000000000000000000000000006',
  poolManager: '0x0000000000000000000000000000000000000000', // V4 Pool Manager
};

// ARYA token on Base
const ARYA_TOKEN = {
  address: '0xcc78a1F8eCE2ce5ff78d2C0D0c8268ddDa5B6B07',
  symbol: 'ARYA',
  decimals: 18,
  name: 'ARYA',
};

// Create public client for reading data
const publicClient = createPublicClient({
  chain: base,
  transport: http(),
});

// Clanker Trading Hook
export function useClanker() {
  const [walletClient, setWalletClient] = useState(null);
  const [account, setAccount] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState(null);
  const [isPending, setIsPending] = useState(false);
  const [txHash, setTxHash] = useState(null);

  // Connect wallet
  const connect = useCallback(async () => {
    if (typeof window === 'undefined') return;
    
    const ethereum = window.ethereum;
    if (!ethereum) {
      setError('MetaMask not installed');
      return;
    }

    setIsConnecting(true);
    setError(null);

    try {
      // Request accounts
      const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
      const address = accounts[0];

      // Create wallet client
      const client = createWalletClient({
        account: address,
        chain: base,
        transport: custom(ethereum),
      });

      setAccount(address);
      setWalletClient(client);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsConnecting(false);
    }
  }, []);

  // Disconnect
  const disconnect = useCallback(() => {
    setAccount(null);
    setWalletClient(null);
    setTxHash(null);
  }, []);

  // Get ARYA balance
  const getBalance = useCallback(async (address) => {
    try {
      const balance = await publicClient.readContract({
        address: ARYA_TOKEN.address,
        abi: ERC20_ABI,
        functionName: 'balanceOf',
        args: [address],
      });
      return formatEther(balance);
    } catch (err) {
      console.error('Error getting balance:', err);
      return '0';
    }
  }, []);

  // Approve tokens for trading
  const approve = useCallback(async (amount) => {
    if (!walletClient || !account) {
      setError('Wallet not connected');
      return null;
    }

    setIsPending(true);
    setError(null);

    try {
      const hash = await walletClient.writeContract({
        address: ARYA_TOKEN.address,
        abi: ERC20_ABI,
        functionName: 'approve',
        args: [CLANKER_ADDRESSES.clanker, parseEther(amount)],
      });

      setTxHash(hash);
      await publicClient.waitForTransactionReceipt({ hash });
      return hash;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setIsPending(false);
    }
  }, [walletClient, account]);

  // Buy ARYA with ETH (via Clanker Uniswap V4 pool)
  // Note: For real implementation, need the specific pool address
  const buy = useCallback(async (ethAmount) => {
    if (!walletClient || !account) {
      setError('Wallet not connected');
      return null;
    }

    setIsPending(true);
    setError(null);

    try {
      // For now, this is a placeholder for the actual Clanker trade
      // In production, you'd swap via the Clanker Uniswap V4 pool
      
      // Simulating a trade for demo purposes
      // Real implementation would use:
      // const hash = await walletClient.writeContract({
      //   address: POOL_ADDRESS,
      //   abi: UNISWAP_V4_POOL_ABI,
      //   functionName: 'swap',
      //   ...
      // });

      const hash = await walletClient.sendTransaction({
        to: ARYA_TOKEN.address,
        value: parseEther(ethAmount),
        data: '0x', // This would be the swap data
      });

      setTxHash(hash);
      await publicClient.waitForTransactionReceipt({ hash });
      return hash;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setIsPending(false);
    }
  }, [walletClient, account]);

  // Sell ARYA for ETH
  const sell = useCallback(async (tokenAmount) => {
    if (!walletClient || !account) {
      setError('Wallet not connected');
      return null;
    }

    setIsPending(true);
    setError(null);

    try {
      // First approve
      await approve(tokenAmount);

      // Then sell (placeholder for real implementation)
      const hash = await walletClient.writeContract({
        address: ARYA_TOKEN.address,
        abi: ERC20_ABI,
        functionName: 'transfer',
        args: [account, parseEther(tokenAmount)], // Placeholder
      });

      setTxHash(hash);
      await publicClient.waitForTransactionReceipt({ hash });
      return hash;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setIsPending(false);
    }
  }, [walletClient, account, approve]);

  return {
    account,
    isConnected: !!account,
    isConnecting,
    isPending,
    txHash,
    error,
    connect,
    disconnect,
    getBalance,
    approve,
    buy,
    sell,
  };
}

// ERC20 ABI (minimal)
const ERC20_ABI = [
  {
    name: 'balanceOf',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'owner', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'approve',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [{ name: '', type: 'bool' }],
  },
  {
    name: 'transfer',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [{ name: '', type: 'bool' }],
  },
  {
    name: 'decimals',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint8' }],
  },
  {
    name: 'symbol',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'string' }],
  },
  {
    name: 'name',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'string' }],
  },
];

// Export token info
export { ARYA_TOKEN, CLANKER_ADDRESSES };
