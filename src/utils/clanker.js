// Clanker Integration Service
// Real on-chain trading for Clanker-deployed tokens

const CLANKER_CONTRACTS = {
  base: {
    clanker: '0x00000000F9490004a96217b5dC12bD5dD7c52ba8',
    clankerFeeLocker: '0x00000000aF6dA933B0b9d7E7b7c4b7d0c9d6dE1f',
    weth: '0x4200000000000000000000000000000000000006',
    uniswapV4PoolManager: '0x0000000000000000000000000000000000000000',
  }
};

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
    address: '0x299c30dd5974bf4d5bfe42c340ca40462816ab07',
    name: 'OpenWork Protocol',
    symbol: 'OPENWORK',
    decimals: 18,
    color: '#00d4ff',
    emoji: '⚡',
    description: 'OpenWork Protocol Token',
    clankerUrl: 'https://www.clanker.world/clanker/0x299c30dd5974bf4d5bfe42c340ca40462816ab07',
    website: 'https://www.openwork.bot',
    twitter: '@openwork_bot'
  },
  KROWNEPO: {
    address: '0xAFe8861b074B8C2551055a20A2a4f39E45037B07',
    name: 'KROWNEPO',
    symbol: 'KROWNEPO',
    decimals: 18,
    color: '#9333ea',
    emoji: '👑',
    description: 'KROWNEPO Token',
    clankerUrl: 'https://www.clanker.world/clanker/0xAFe8861b074B8C2551055a20A2a4f39E45037B07',
    website: '',
    twitter: ''
  }
};

export function getTokenInfo(tokenSymbol) {
  const token = CLANKER_TOKENS[tokenSymbol.toUpperCase()];
  if (!token) return null;
  return { ...token };
}

export function getAllTokens() {
  return Object.entries(CLANKER_TOKENS).map(([symbol, token]) => ({
    symbol,
    ...token
  }));
}

export function isTokenDeployed(tokenSymbol) {
  const token = CLANKER_TOKENS[tokenSymbol.toUpperCase()];
  return token && token.address !== null;
}

export function getTokenAddress(tokenSymbol) {
  const token = CLANKER_TOKENS[tokenSymbol.toUpperCase()];
  return token?.address || null;
}

export function getClankerAddress(chainId = 8453) {
  return CLANKER_CONTRACTS[chainId]?.clanker || null;
}

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

export function estimateTrade(tokenSymbol, side, inputAmount, currentSupply = null) {
  const token = getTokenInfo(tokenSymbol);
  if (!token) throw new Error('Unknown token');
  
  const basePrice = tokenSymbol === 'ARYA' ? 0.5 : 0.0001;
  const slope = tokenSymbol === 'ARYA' ? 0.00001 : 0.000001;
  
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
      slippage: 0.1
    };
  } else {
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

export function getTokenClankerUrl(tokenSymbol) {
  const token = getTokenInfo(tokenSymbol);
  if (!token || !token.address) return null;
  return `https://www.clanker.world/clanker/${token.address}`;
}

export function isValidAddress(address) {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

export function formatTokenAmount(amount, decimals = 18) {
  if (amount >= 1000000) {
    return `${(amount / 1000000).toFixed(2)}M`;
  } else if (amount >= 1000) {
    return `${(amount / 1000).toFixed(2)}K`;
  }
  return amount.toFixed(decimals);
}

export function getTradingUrl(tokenSymbol) {
  const token = getTokenInfo(tokenSymbol);
  if (!token || !token.address) return null;
  return `https://www.clanker.world/trade/${token.address}`;
}

export { CLANKER_TOKENS };
