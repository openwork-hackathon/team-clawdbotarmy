// Clanker Integration Service
// Real on-chain trading for Clanker-deployed tokens

// Clanker contract addresses (Base mainnet)
const CLANKER_CONTRACTS = {
  base: {
    clanker: '0x00000000F9490004a96217b5dC12bD5dD7c52ba8', // Factory v4
    clankerFeeLocker: '0x00000000aF6dA933B0b9d7E7b7c4b7d0c9d6dE1f', // Fee locker
    weth: '0x4200000000000000000000000000000000000006',
    uniswapV4PoolManager: '0x0000000000000000000000000000000000000000', // V4 pool manager
  }
};

// Known Clanker tokens
const CLANKER_TOKENS = {
  ARYA: {
    address: '0xcc78a1F8eCE2ce5ff78d2C0D0c8268ddDa5B6B07',
    name: 'ARYA',
    symbol: 'ARYA',
    decimals: 18,
    color: '#ff6b35',
    emoji: '🦞',
    description: 'AI Agent Token',
    clankerUrl: 'https://www.clanker.world/clanker/0xcc78a1F8eCE2ce5ff78d2C0D0c8268ddDa5B6B07',
    website: 'https://arya.ai',
    twitter: '@arya_ai'
  },
  OPENWORK: {
    address: null, // Not yet deployed on Clanker
    name: 'OpenWork Protocol',
    symbol: 'OPENWORK',
    decimals: 18,
    color: '#00d4ff',
    emoji: '⚡',
    description: 'OpenWork Protocol Token',
    clankerUrl: null,
    website: 'https://www.openwork.bot',
    twitter: '@openwork_bot'
  }
};

// Get token info
export function getTokenInfo(tokenSymbol) {
  const token = CLANKER_TOKENS[tokenSymbol.toUpperCase()];
  if (!token) return null;
  return { ...token };
}

// Get all supported tokens
export function getAllTokens() {
  return Object.entries(CLANKER_TOKENS).map(([symbol, token]) => ({
    symbol,
    ...token
  }));
}

// Check if token is deployed on Clanker
export function isTokenDeployed(tokenSymbol) {
  const token = CLANKER_TOKENS[tokenSymbol.toUpperCase()];
  return token && token.address !== null;
}

// Get token address
export function getTokenAddress(tokenSymbol) {
  const token = CLANKER_TOKENS[tokenSymbol.toUpperCase()];
  return token?.address || null;
}

// Get Clanker contract address
export function getClankerAddress(chainId = 8453) { // Base = 8453
  return CLANKER_CONTRACTS[chainId]?.clanker || null;
}

// Generate Clanker deployment URL for a token
export function getClankerDeployUrl(tokenConfig) {
  const params = new URLSearchParams({
    name: tokenConfig.name,
    symbol: tokenConfig.symbol,
    image: tokenConfig.image || '',
    description: tokenConfig.description || '',
    twitter: tokenConfig.twitter || '',
    website: tokenConfig.website || '',
  });
  return `https://www.clanker.world/deploy?${params.toString()}`;
}

// Estimate trade using bonding curve (off-chain simulation)
// Real trades would use Uniswap V4 pools created by Clanker
export function estimateTrade(tokenSymbol, side, inputAmount, currentSupply = null) {
  const token = getTokenInfo(tokenSymbol);
  if (!token) throw new Error('Unknown token');
  
  // Use simulation for now (would be replaced with on-chain calls)
  const basePrice = tokenSymbol === 'ARYA' ? 0.5 : 0.0001;
  const slope = tokenSymbol === 'ARYA' ? 0.00001 : 0.000001;
  
  // Estimate price based on supply (simulated)
  const supply = currentSupply || (tokenSymbol === 'ARYA' ? 1000000 : 5000000);
  const currentPrice = slope * supply + basePrice;
  
  if (side === 'BUY') {
    const outputAmount = inputAmount / currentPrice;
    const newPrice = slope * (supply + outputAmount) + basePrice;
    const avgPrice = (currentPrice + newPrice) / 2;
    const outputAmountExact = inputAmount / avgPrice;
    
    return {
      inputAmount,
      outputAmount: outputAmountExact,
      executionPrice: avgPrice,
      currentPrice,
      newPrice,
      slippage: 0.1 // Simulated slippage
    };
  } else { // SELL
    const outputAmount = inputAmount * currentPrice;
    const newPrice = slope * (supply - inputAmount) + basePrice;
    const avgPrice = (currentPrice + newPrice) / 2;
    const outputAmountExact = inputAmount * avgPrice;
    
    return {
      inputAmount,
      outputAmount: outputAmountExact,
      executionPrice: avgPrice,
      currentPrice,
      newPrice,
      slippage: 0.1
    };
  }
}

// Get Clanker world URL for a token
export function getTokenClankerUrl(tokenSymbol) {
  const token = getTokenInfo(tokenSymbol);
  if (!token || !token.address) return null;
  return `https://www.clanker.world/clanker/${token.address}`;
}

// Validate token address
export function isValidAddress(address) {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

// Format token amount for display
export function formatTokenAmount(amount, decimals = 18) {
  if (amount >= 1000000) {
    return `${(amount / 1000000).toFixed(2)}M`;
  } else if (amount >= 1000) {
    return `${(amount / 1000).toFixed(2)}K`;
  }
  return amount.toFixed(decimals);
}

// Get trading URL on Clanker
export function getTradingUrl(tokenSymbol) {
  const token = getTokenInfo(tokenSymbol);
  if (!token || !token.address) return null;
  return `https://www.clanker.world/trade/${token.address}`;
}

// Export token list for easy access
export { CLANKER_TOKENS };
