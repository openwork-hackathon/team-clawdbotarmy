// Bonding Curve for Multiple Tokens
// Integrated with Clanker for real on-chain trading

import { 
  getTokenInfo, 
  getAllTokens, 
  isTokenDeployed, 
  getTokenClankerUrl,
  getTradingUrl,
  estimateTrade,
  CLANKER_TOKENS
} from './clanker';

// Token configurations (mirrors Clanker deployment params)
const TOKEN_CONFIGS = {
  ARYA: {
    name: 'ARYA',
    symbol: 'ARYA',
    initialSupply: 1000000,
    initialReserve: 0.01,
    a: 0.00000000001,
    b: 0.00001,
    maxSupply: 10000000,
    clankerAddress: '0xcc78a1F8eCE2ce5ff78d2C0D0c8268ddDa5B6B07'
  },
  OPENWORK: {
    name: 'OpenWork Protocol',
    symbol: 'OPENWORK',
    initialSupply: 5000000,
    initialReserve: 0.05,
    a: 0.00000000001,
    b: 0.00001,
    maxSupply: 50000000,
    clankerAddress: null
  }
};

// Global curve state (in-memory for demo)
const curveStates = {
  ARYA: {
    supply: TOKEN_CONFIGS.ARYA.initialSupply,
    reserve: TOKEN_CONFIGS.ARYA.initialReserve,
    totalTrades: 0,
    totalVolume: 0
  },
  OPENWORK: {
    supply: TOKEN_CONFIGS.OPENWORK.initialSupply,
    reserve: TOKEN_CONFIGS.OPENWORK.initialReserve,
    totalTrades: 0,
    totalVolume: 0
  }
};

// Get token configuration
export function getTokenConfig(token) {
  return TOKEN_CONFIGS[token.toUpperCase()] || null;
}

// Get current price for a token (linear bonding curve)
export function getTokenPrice(token, supply) {
  const config = getTokenConfig(token);
  if (!config) return 0;
  return config.a * supply + config.b;
}

// Calculate buy amount (ETH -> Tokens)
export function getBuyAmount(ethAmount, token, currentSupply) {
  const config = getTokenConfig(token);
  if (!config) return 0;
  const startPrice = getTokenPrice(token, currentSupply);
  const endPrice = getTokenPrice(token, currentSupply + 1000000);
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

// Get curve state for a token
export function getCurveState(token) {
  const config = getTokenConfig(token);
  if (!config) return null;
  const stateKey = token.toUpperCase();
  const state = curveStates[stateKey] || {
    supply: config.initialSupply,
    reserve: config.initialReserve,
    totalTrades: 0,
    totalVolume: 0
  };
  const price = getTokenPrice(token, state.supply);
  const isDeployed = isTokenDeployed(token);
  const clankerUrl = getTokenClankerUrl(token);
  const tradingUrl = getTradingUrl(token);
  
  return {
    ...state,
    currentPrice: price,
    token: config.symbol,
    curveType: 'linear',
    formula: 'price = ' + config.a + ' * supply + ' + config.b + ' ETH',
    maxSupply: config.maxSupply,
    isDeployed,
    clankerAddress: config.clankerAddress,
    clankerUrl,
    tradingUrl,
    tokenInfo: getTokenInfo(token)
  };
}

// Execute a trade (simulation mode - for real trades, use on-chain)
export function executeTrade(type, amount, token) {
  const config = getTokenConfig(token);
  if (!config) throw new Error('Unknown token');
  const stateKey = token.toUpperCase();
  
  if (!curveStates[stateKey]) {
    curveStates[stateKey] = {
      supply: config.initialSupply,
      reserve: config.initialReserve,
      totalTrades: 0,
      totalVolume: 0
    };
  }
  
  const state = curveStates[stateKey];
  const isDeployed = isTokenDeployed(token);
  
  if (type === 'BUY') {
    const tokens = getBuyAmount(amount, token, state.supply);
    if (state.supply + tokens > config.maxSupply) {
      throw new Error('Max supply reached');
    }
    const slippage = getSlippage(tokens, state.supply, token, true);
    const oldPrice = getTokenPrice(token, state.supply);
    state.supply += tokens;
    state.reserve += amount;
    state.totalTrades++;
    state.totalVolume += amount;
    
    return {
      type: 'BUY',
      inputAmount: amount,
      outputAmount: tokens,
      price: oldPrice,
      newPrice: getTokenPrice(token, state.supply),
      slippage: slippage.toFixed(2),
      newSupply: state.supply,
      isSimulated: !isDeployed,
      message: isDeployed 
        ? 'Ready for on-chain execution via Clanker'
        : 'Simulation mode - Token not yet deployed on Clanker',
      timestamp: new Date().toISOString()
    };
  } 
  else if (type === 'SELL') {
    const eth = getSellAmount(amount, token, state.supply);
    if (eth > state.reserve) {
      throw new Error('Insufficient reserve');
    }
    const slippage = getSlippage(amount, state.supply, token, false);
    const oldPrice = getTokenPrice(token, state.supply);
    state.supply -= amount;
    state.reserve -= eth;
    state.totalTrades++;
    state.totalVolume += eth;
    
    return {
      type: 'SELL',
      inputAmount: amount,
      outputAmount: eth,
      price: oldPrice,
      newPrice: getTokenPrice(token, state.supply),
      slippage: slippage.toFixed(2),
      newSupply: state.supply,
      isSimulated: !isDeployed,
      message: isDeployed
        ? 'Ready for on-chain execution via Clanker'
        : 'Simulation mode - Token not yet deployed on Clanker',
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

// Get token info from Clanker module
export { getTokenInfo, getAllTokens, isTokenDeployed, getTokenClankerUrl, getTradingUrl };

// Estimate trade with Clanker integration
export function estimateTradeWithClanker(tokenSymbol, side, inputAmount) {
  const state = getCurveState(tokenSymbol);
  return estimateTrade(tokenSymbol, side, inputAmount, state.supply);
}
