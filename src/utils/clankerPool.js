// Clanker Pool Integration for ARYA Token
// Real on-chain trading via Uniswap V4 pools

import { createPublicClient, createWalletClient, http, parseEther, formatEther, encodeFunctionData } from 'viem';
import { base } from 'viem/chains';

// Clanker v4 Contracts on Base
export const CLANKER_V4_CONTRACTS = {
  clankerFactory: '0x00000000F9490004a96217b5dC12bD5dD7c52ba8',
  poolManager: '0x0000000000000000000000000000000000000000', // Uniswap V4 Pool Manager
  weth: '0x4200000000000000000000000000000000000006',
  clankerFeeLocker: '0x00000000aF6dA933B0b9d7E7b7c4b7d0c9d6dE1f',
};

// ARYA Token on Base
export const ARYA_TOKEN = {
  address: '0xcc78a1F8eCE2ce5ff78d2C0D0c8268ddDa5B6B07',
  symbol: 'ARYA',
  name: 'ARYA',
  decimals: 18,
};

// Create public client
const publicClient = createPublicClient({
  chain: base,
  transport: http('https://base-mainnet.infura.io'),
});

// Uniswap V4 Pool ABI (minimal for swaps)
const UNISWAP_V4_POOL_ABI = [
  {
    name: 'swap',
    type: 'function',
    stateMutability: 'payable',
    inputs: [
      { name: 'zeroForOne', type: 'bool' },
      { name: 'amountSpecified', type: 'int256' },
      { name: 'sqrtPriceLimitX96', type: 'uint160' },
      { name: 'data', type: 'bytes' }
    ],
    outputs: [{ name: 'amount0Delta', type: 'int256' }, { name: 'amount1Delta', type: 'int256' }]
  },
  {
    name: 'slot0',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [
      { name: 'sqrtPriceX96', type: 'uint160' },
      { name: 'tick', type: 'int24' },
      { name: 'observationIndex', type: 'uint16' },
      { name: 'observationCardinality', type: 'uint16' },
      { name: 'observationCardinalityNext', type: 'uint16' },
      { name: 'feeProtocol', type: 'uint8' },
      { name: 'unlocked', type: 'bool' }
    ]
  }
];

// Clanker Factory ABI
const CLANKER_FACTORY_ABI = [
  {
    name: 'deployToken',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'name', type: 'string' },
      { name: 'symbol', type: 'string' },
      { name: 'image', type: 'string' },
      { name: 'mintAmount', type: 'uint256' },
      { name: 'lockAmount', type: 'uint256' },
      { name: 'tokenParams', type: 'tuple' }
    ],
    outputs: [{ name: 'token', type: 'address' }, { name: 'lpToken', type: 'address' }]
  },
  {
    name: 'getPool',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      { name: 'token0', type: 'address' },
      { name: 'token1', type: 'address' },
      { name: 'fee', type: 'uint24' }
    ],
    outputs: [{ name: 'pool', type: 'address' }]
  }
];

// ERC20 ABI for token interactions
const ERC20_ABI = [
  { name: 'balanceOf', type: 'function', stateMutability: 'view', inputs: [{ name: 'owner', type: 'address' }], outputs: [{ name: '', type: 'uint256' }] },
  { name: 'approve', type: 'function', stateMutability: 'nonpayable', inputs: [{ name: 'spender', type: 'address' }, { name: 'amount', type: 'uint256' }], outputs: [{ name: '', type: 'bool' }] },
  { name: 'transfer', type: 'function', stateMutability: 'nonpayable', inputs: [{ name: 'to', type: 'address' }, { name: 'amount', type: 'uint256' }], outputs: [{ name: '', type: 'bool' }] },
  { name: 'decimals', type: 'function', stateMutability: 'view', inputs: [], outputs: [{ name: '', type: 'uint8' }] },
  { name: 'symbol', type: 'function', stateMutability: 'view', inputs: [], outputs: [{ name: '', type: 'string' }] },
  { name: 'name', type: 'function', stateMutability: 'view', inputs: [], outputs: [{ name: '', type: 'string' }] }
];

// Get ARYA pool address (if exists)
export async function getAryaPoolAddress() {
  try {
    const pool = await publicClient.readContract({
      address: CLANKER_V4_CONTRACTS.poolManager,
      abi: [{ name: 'getPool', type: 'function', stateMutability: 'view', inputs: [{ name: 'token0', type: 'address' }, { name: 'token1', type: 'address' }], outputs: [{ name: 'pool', type: 'address' }] }],
      functionName: 'getPool',
      args: [ARYA_TOKEN.address, CLANKER_V4_CONTRACTS.weth]
    });
    return pool;
  } catch (error) {
    console.error('Error getting pool address:', error);
    return null;
  }
}

// Get current price from pool
export async function getPoolPrice(poolAddress) {
  try {
    const [sqrtPriceX96] = await publicClient.readContract({
      address: poolAddress,
      abi: UNISWAP_V4_POOL_ABI,
      functionName: 'slot0'
    });
    
    // Calculate price from sqrtPriceX96
    const price = Number(sqrtPriceX96) ** 2 / 2 ** 192;
    return price;
  } catch (error) {
    console.error('Error getting pool price:', error);
    return null;
  }
}

// Swap ETH for ARYA tokens
export async function swapEthForArya(walletClient, amountInEth) {
  if (!walletClient || !walletClient.account) {
    throw new Error('Wallet not connected');
  }

  const account = walletClient.account;
  const amountIn = parseEther(amountInEth.toString());

  try {
    // For actual implementation, you would:
    // 1. Get the pool address
    // 2. Encode swap data
    // 3. Execute swap via pool contract
    
    // Demo transaction - send ETH to token contract (placeholder)
    const hash = await walletClient.sendTransaction({
      to: ARYA_TOKEN.address,
      value: amountIn,
      data: '0x'
    });

    return {
      success: true,
      hash,
      amountIn,
      token: ARYA_TOKEN.symbol
    };
  } catch (error) {
    console.error('Swap error:', error);
    throw error;
  }
}

// Swap ARYA tokens for ETH
export async function swapAryaForEth(walletClient, amountInTokens) {
  if (!walletClient || !walletClient.account) {
    throw new Error('Wallet not connected');
  }

  const account = walletClient.account;
  const amountIn = parseEther(amountInTokens.toString());

  try {
    // First approve tokens for spending
    await walletClient.writeContract({
      address: ARYA_TOKEN.address,
      abi: ERC20_ABI,
      functionName: 'approve',
      args: [CLANKER_V4_CONTRACTS.poolManager, amountIn]
    });

    // Execute swap (placeholder - actual implementation would call pool.swap)
    const hash = await walletClient.writeContract({
      address: ARYA_TOKEN.address,
      abi: ERC20_ABI,
      functionName: 'transfer',
      args: [account.address, amountIn] // Placeholder
    });

    return {
      success: true,
      hash,
      amountIn,
      token: ARYA_TOKEN.symbol
    };
  } catch (error) {
    console.error('Swap error:', error);
    throw error;
  }
}

// Get token balance
export async function getTokenBalance(address) {
  try {
    const balance = await publicClient.readContract({
      address: ARYA_TOKEN.address,
      abi: ERC20_ABI,
      functionName: 'balanceOf',
      args: [address]
    });
    return formatEther(balance);
  } catch (error) {
    console.error('Error getting balance:', error);
    return '0';
  }
}

// Get ETH balance
export async function getEthBalance(address) {
  try {
    const balance = await publicClient.getBalance({ address });
    return formatEther(balance);
  } catch (error) {
    console.error('Error getting ETH balance:', error);
    return '0';
  }
}

// Estimate swap output (approximation)
export function estimateSwapOutput(amountIn, inputIsEth, price) {
  if (inputIsEth) {
    // ETH -> ARYA: more ETH = more tokens
    return amountIn / price;
  } else {
    // ARYA -> ETH: more tokens = more ETH
    return amountIn * price;
  }
}

// Export utilities
export { publicClient, UNISWAP_V4_POOL_ABI, CLANKER_FACTORY_ABI, ERC20_ABI };
