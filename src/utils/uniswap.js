// Uniswap V3 Integration Service
// Real on-chain trading for any token with Uniswap V3 pool

import { createPublicClient, createWalletClient, http, parseEther, formatEther } from 'viem';
import { base } from 'viem/chains';

// Uniswap V3 contracts on Base
const UNISWAP_V3_CONTRACTS = {
  base: {
    poolManager: '0x00000000F9490004a96217b5dC12bD5dD7c52ba8',
    quoter: '0x3F4B0b59b717A61C41dF83dD7B5af32D8fE4d00c',
    router: '0x0000000000000000000000000000000000000000', // No V3 router needed with Permit2
    factory: '0x00000000A7d5B80c5247aA37bCf3f45d1fB12aF8',
    permit2: '0x000000000022d473030f116ddee9f6b43ac78ba3',
    weth: '0x4200000000000000000000000000000000000006',
    usdc: '0x833589fCD6eDb6E08f4c7C32Da4cEa5B8dE864e3'
  }
};

// Get Uniswap V3 pool address for a token pair
export async function getPoolAddress(tokenA, tokenB, fee = 3000) {
  const client = createPublicClient({
    chain: base,
    transport: http()
  });

  try {
    // Call factory to get pool address
    const poolAddress = await client.readContract({
      address: UNISWAP_V3_CONTRACTS.base.factory,
      abi: ['function getPool(address tokenA, address tokenB, uint24 fee) view returns (address)'],
      functionName: 'getPool',
      args: [tokenA, tokenB, fee]
    });
    return poolAddress;
  } catch (e) {
    console.error('Error getting pool address:', e);
    return null;
  }
}

// Get current price from pool (using QuoterV2)
export async function getQuote(tokenIn, tokenOut, amountIn, fee = 3000) {
  const client = createPublicClient({
    chain: base,
    transport: http()
  });

  try {
    const quote = await client.readContract({
      address: UNISWAP_V3_CONTRACTS.base.quoter,
      abi: ['function quoteExactInputSingle((address tokenIn, address tokenOut, uint256 amountIn, uint24 fee, uint160 sqrtPriceLimitX96)) external returns (uint256 amountOut, uint160 sqrtPriceX96After, uint32 initializedTicksCrossed, uint256 gasEstimate)'],
      functionName: 'quoteExactInputSingle',
      args: [{
        tokenIn,
        tokenOut,
        amountIn: parseEther(amountIn.toString()),
        fee,
        sqrtPriceLimitX96: 0
      }]
    });
    return {
      amountOut: formatEther(quote.amountOut),
      gasEstimate: quote.gasEstimate
    };
  } catch (e) {
    console.error('Error getting quote:', e);
    return null;
  }
}

// Get pool liquidity and TVL
export async function getPoolStats(tokenA, tokenB, fee = 3000) {
  const client = createPublicClient({
    chain: base,
    transport: http()
  });

  try {
    const poolAddress = await getPoolAddress(tokenA, tokenB, fee);
    if (!poolAddress || poolAddress === '0x0000000000000000000000000000000000000000') {
      return null;
    }

    const [liquidity, slot0] = await client.multicall({
      contracts: [
        {
          address: poolAddress,
          abi: ['function liquidity() view returns (uint128)'],
          functionName: 'liquidity'
        },
        {
          address: poolAddress,
          abi: ['function slot0() view returns (uint160 sqrtPriceX96, int24 tick, uint16 observationIndex, uint16 observationCardinality, uint16 observationCardinalityNext, uint8 feeProtocol, bool unlocked)'],
          functionName: 'slot0'
        }
      ]
    });

    const sqrtPriceX96 = slot0.result?.[0];
    const price = sqrtPriceX96 ? Number(sqrtPriceX96) / (2 ** 96) : 0;
    const tokenPrice = price * price; // Approximate

    return {
      poolAddress,
      liquidity: liquidity.result ? Number(liquidity.result) : 0,
      tick: slot0.result?.[1],
      token0Price: tokenPrice,
      tvlUsd: 0 // Would need token prices
    };
  } catch (e) {
    console.error('Error getting pool stats:', e);
    return null;
  }
}

// Estimate trade (wrapper for bonding curve OR Uniswap)
export async function estimateTrade(tokenSymbol, side, inputAmount, useUniswap = false) {
  const token = getTokenInfo(tokenSymbol);
  if (!token) throw new Error('Unknown token');

  if (useUniswap) {
    // Use Uniswap V3
    const quote = await getQuote(
      UNISWAP_V3_CONTRACTS.base.weth,
      token.address,
      inputAmount
    );
    if (!quote) throw new Error('No Uniswap pool available');
    
    return {
      inputAmount,
      outputAmount: parseFloat(quote.amountOut),
      executionPrice: inputAmount / parseFloat(quote.amountOut),
      source: 'Uniswap V3'
    };
  } else {
    // Use bonding curve simulation
    const basePrice = tokenSymbol === 'ARYA' ? 0.5 : 0.0001;
    const slope = tokenSymbol === 'ARYA' ? 0.00001 : 0.000001;
    const supply = tokenSymbol === 'ARYA' ? 1000000 : 5000000;
    const currentPrice = slope * supply + basePrice;

    if (side === 'BUY') {
      const outputAmount = inputAmount / currentPrice;
      return {
        inputAmount,
        outputAmount,
        executionPrice: currentPrice,
        source: 'Bonding Curve'
      };
    } else {
      const outputAmount = inputAmount * currentPrice;
      return {
        inputAmount,
        outputAmount,
        executionPrice: currentPrice,
        source: 'Bonding Curve'
      };
    }
  }
}

// Check if Uniswap pool exists for ARYA
export async function checkUniswapPool(tokenAddress = '0xcc78a1F8eCE2ce5ff78d2C0D0c8268ddDa5B6B07') {
  const pools = [
    { tokenA: tokenAddress, tokenB: UNISWAP_V3_CONTRACTS.base.weth, fee: 3000 },
    { tokenA: tokenAddress, tokenB: UNISWAP_V3_CONTRACTS.base.usdc, fee: 3000 },
    { tokenA: tokenAddress, tokenB: UNISWAP_V3_CONTRACTS.base.usdc, fee: 10000 }
  ];

  const results = await Promise.all(
    pools.map(async ({ tokenA, tokenB, fee }) => {
      const address = await getPoolAddress(tokenA, tokenB, fee);
      return { tokenA, tokenB, fee, address, exists: address && address !== '0x0000000000000000000000000000000000000000' };
    })
  );

  return results.find(p => p.exists) || null;
}

// Helper functions from clanker.js
export function getTokenInfo(tokenSymbol) {
  const { CLANKER_TOKENS } = require('./clanker');
  const token = CLANKER_TOKENS[tokenSymbol.toUpperCase()];
  if (!token) return null;
  return { ...token };
}

export function getAllTokens() {
  const { CLANKER_TOKENS } = require('./clanker');
  return Object.entries(CLANKER_TOKENS).map(([symbol, token]) => ({
    symbol,
    ...token
  }));
}
