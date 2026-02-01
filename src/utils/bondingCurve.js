// Bonding Curve for Multiple Tokens
// Implements linear bonding curves for ARYA, OPENWORK, and other tokens

// Token configurations
const TOKENS = {
  ARYA: {
    name: 'ARYA',
    symbol: 'ARYA',
    initialSupply: 1000000,
    initialReserve: 10, // ETH
    a: 0.00001, // Slope
    b: 0.5, // Base price (ETH)
    maxSupply: 10000000
  },
  OPENWORK: {
    name: 'OPENWORK',
    symbol: 'OPENWORK', 
    initialSupply: 5000000,
    initialReserve: 5, // ETH
    a: 0.000001, // Gentler slope for larger supply
    b: 0.0001, // Lower base price
    maxSupply: 50000000
  }
};

// Get token configuration
export function getTokenConfig(token) {
  return TOKENS[token.toUpperCase()] || null;
}

// Get current price for a token
export function getTokenPrice(token, supply) {
  const config = getTokenConfig(token);
  if (!config) return 0;
  
  // Linear bonding curve: price = a * supply + b
  return config.a * supply + config.b;
}

// Calculate buy amount (ETH -> Tokens)
export function getBuyAmount(ethAmount, token, currentSupply) {
  const config = getTokenConfig(token);
  if (!config) return 0;
  
  const startPrice = getTokenPrice(token, currentSupply);
  const endPrice = getTokenPrice(token, currentSupply + 1000000); // Approximation
  
  // Simple linear approximation
  return ethAmount / ((startPrice + endPrice) / 2);
}

// Calculate sell amount (Tokens -> ETH)  
export function getSellAmount(tokenAmount, token, currentSupply) {
  const config = getTokenConfig(token);
  if (!config) return 0;
  
  const startPrice = getTokenPrice(token, currentSupply);
  const endPrice = getTokenPrice(token, currentSupply - tokenAmount);
  
  return tokenAmount * ((startPrice + endPrice) / 2);
}

// Calculate slippage percentage
export function getSlippage(amount, supply, token, isBuy) {
  const midPrice = getTokenPrice(token, supply);
  const avgPrice = isBuy 
    ? getTokenPrice(token, supply + amount)
    : getTokenPrice(token, supply - amount);
  
  if (midPrice === 0) return 0;
  return Math.abs((avgPrice - midPrice) / midPrice * 100);
}

// Global curve state
const curveStates = {
  ARYA: {
    supply: TOKENS.ARYA.initialSupply,
    reserve: TOKENS.ARYA.initialReserve,
    totalTrades: 0,
    totalVolume: 0
  },
  OPENWORK: {
    supply: TOKENS.OPENWORK.initialSupply,
    reserve: TOKENS.OPENWORK.initialReserve,
    totalTrades: 0,
    totalVolume: 0
  }
};

// Get curve state for a token
export function getCurveState(token) {
  const config = getTokenConfig(token);
  if (!config) return null;
  
  const state = curveStates[token.toUpperCase()];
  const price = getTokenPrice(token, state.supply);
  
  return {
    ...state,
    currentPrice: price,
    token: config.symbol,
    curveType: 'linear',
    formula: `price = ${config.a} * supply + ${config.b} ETH`,
    maxSupply: config.maxSupply
  };
}

// Execute a trade on the bonding curve
export function executeTrade(type, amount, token) {
  const config = getTokenConfig(token);
  if (!config) throw new Error('Unknown token');
  
  const stateKey = token.toUpperCase();
  const state = curveStates[stateKey];
  
  if (type === 'BUY') {
    const tokens = getBuyAmount(amount, token, state.supply);
    
    if (state.supply + tokens > config.maxSupply) {
      throw new Error('Max supply reached');
    }
    
    const slippage = getSlippage(tokens, state.supply, token, true);
    
    state.supply += tokens;
    state.reserve += amount;
    state.totalTrades++;
    state.totalVolume += amount;
    
    return {
      type: 'BUY',
      inputAmount: amount,
      outputAmount: tokens,
      price: getTokenPrice(token, state.supply - tokens),
      newPrice: getTokenPrice(token, state.supply),
      slippage: slippage.toFixed(2),
      newSupply: state.supply,
      timestamp: new Date().toISOString()
    };
  } 
  else if (type === 'SELL') {
    const eth = getSellAmount(amount, token, state.supply);
    
    if (eth > state.reserve) {
      throw new Error('Insufficient reserve');
    }
    
    const slippage = getSlippage(amount, state.supply, token, false);
    
    state.supply -= amount;
    state.reserve -= eth;
    state.totalTrades++;
    state.totalVolume += eth;
    
    return {
      type: 'SELL',
      inputAmount: amount,
      outputAmount: eth,
      price: getTokenPrice(token, state.supply + amount),
      newPrice: getTokenPrice(token, state.supply),
      slippage: slippage.toFixed(2),
      newSupply: state.supply,
      timestamp: new Date().toISOString()
    };
  }
  
  throw new Error('Invalid trade type');
}

// Get all token stats
export function getAllCurveStates() {
  return {
    ARYA: getCurveState('ARYA'),
    OPENWORK: getCurveState('OPENWORK')
  };
}
