// Bonding Curve Utility Functions
// Provides calculations for token bonding curves on Base network

const TOKENS = {
  ARYA: '0xcc78a1F8eCE2ce5ff78d2C0D0c8268ddDa5B6B07',
  OPENWORK: '0x299c30dd5974bf4d5bfe42c340ca40462816ab07',
  KROWNEPO: '0xAFe8861b074B8C2551055a20A2a4f39E45037B07',
  BRAUM: '0xefb28887A479029B065Cb931a973B97101209b07'
};

// Base price and curve parameters
const BASE_PRICE = 0.00001; // ETH
const CURVE_SLOPE = 1e-11; // Price increase per token

function getTokenInfo(symbol) {
  const address = TOKENS[symbol.toUpperCase()];
  if (!address) {
    return null;
  }
  return {
    symbol: symbol.toUpperCase(),
    address,
    decimals: 18,
    basePrice: BASE_PRICE,
    curveSlope: CURVE_SLOPE
  };
}

function calculatePrice(supply) {
  // Linear bonding curve: price = base + slope * supply
  return BASE_PRICE + (CURVE_SLOPE * supply);
}

function calculateSupplyFromPrice(price) {
  // Inverse: supply = (price - base) / slope
  if (price < BASE_PRICE) return 0;
  return (price - BASE_PRICE) / CURVE_SLOPE;
}

function calculateBuyAmount(ethAmount, currentSupply) {
  // Calculate how many tokens you get for a given ETH amount
  const startPrice = calculatePrice(currentSupply);
  const tokensBought = ethAmount / startPrice;
  const endSupply = currentSupply + tokensBought;
  const endPrice = calculatePrice(endSupply);
  const avgPrice = (startPrice + endPrice) / 2;
  return {
    tokens: tokensBought,
    avgPrice,
    newSupply: endSupply,
    newPrice: endPrice
  };
}

function calculateSellAmount(tokenAmount, currentSupply) {
  // Calculate how much ETH you get for selling tokens
  const startPrice = calculatePrice(currentSupply);
  const endSupply = currentSupply - tokenAmount;
  const endPrice = calculatePrice(endSupply);
  const avgPrice = (startPrice + endPrice) / 2;
  const ethReceived = tokenAmount * avgPrice;
  return {
    eth: ethReceived,
    avgPrice,
    newSupply: endSupply,
    newPrice: endPrice
  };
}

function getCurveState(symbol) {
  const info = getTokenInfo(symbol);
  if (!info) return null;
  
  // Estimate supply from current price (would need on-chain data for real values)
  const currentSupply = 1000000; // Placeholder
  const currentPrice = calculatePrice(currentSupply);
  
  return {
    symbol: symbol.toUpperCase(),
    address: info.address,
    currentSupply,
    currentPrice,
    basePrice: BASE_PRICE,
    curveSlope: CURVE_SLOPE,
    marketCap: currentSupply * currentPrice,
    liquidity: currentSupply * currentPrice * 0.5 // 50% in LP
  };
}

function getAllCurveStates() {
  const states = {};
  for (const symbol of Object.keys(TOKENS)) {
    const state = getCurveState(symbol);
    if (state) {
      states[symbol] = state;
    }
  }
  return states;
}

function getAllTokens() {
  return Object.entries(TOKENS).map(([symbol, address]) => ({
    symbol,
    address,
    ...getTokenInfo(symbol)
  }));
}

function executeTrade(type, amount, token) {
  // This is a simulation - real execution would interact with smart contract
  const symbol = token.toUpperCase();
  const info = getTokenInfo(symbol);
  
  if (!info) {
    throw new Error(`Unknown token: ${token}`);
  }
  
  const currentSupply = 1000000; // Placeholder
  
  if (type === 'buy') {
    const result = calculateBuyAmount(amount, currentSupply);
    return {
      type: 'buy',
      token: symbol,
      inputAmount: amount,
      outputAmount: result.tokens,
      newSupply: result.newSupply,
      newPrice: result.newPrice,
      txHash: `0x${Array(64).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('')}`
    };
  } else if (type === 'sell') {
    const result = calculateSellAmount(amount, currentSupply);
    return {
      type: 'sell',
      token: symbol,
      inputAmount: amount,
      outputAmount: result.eth,
      newSupply: result.newSupply,
      newPrice: result.newPrice,
      txHash: `0x${Array(64).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('')}`
    };
  } else {
    throw new Error(`Unknown trade type: ${type}`);
  }
}

function getTokenPrice(symbol) {
  const state = getCurveState(symbol);
  return state ? state.currentPrice : null;
}

export {
  getCurveState,
  executeTrade,
  getTokenPrice,
  getAllCurveStates,
  getTokenInfo,
  getAllTokens,
  calculatePrice,
  calculateBuyAmount,
  calculateSellAmount
};
