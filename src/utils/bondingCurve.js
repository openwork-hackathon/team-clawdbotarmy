// Bonding Curve for ARYA Token
// Implements a constant product bonding curve: x * y = k
// Price increases as more tokens are bought

const INITIAL_SUPPLY = 1000000; // 1M ARYA tokens
const INITIAL_RESERVE = 10; // 10 ETH initial reserve
const K = INITIAL_SUPPLY * INITIAL_RESERVE;

// Linear bonding curve parameters
const A = 0.00001; // Slope
const B = 0.5; // Base price in ETH

export function getTokenPrice(supply) {
  // Linear bonding curve: price = a * supply + b
  return A * supply + B;
}

export function getBuyAmount(ethAmount, currentSupply) {
  // Calculate tokens received for ETH input
  // Using linear curve: p = a*s + b
  // integral from s to s+ds of p(s)ds = a*(s+ds)^2/2 + b*(s+ds) - (a*s^2/2 + b*s)
  // ≈ ethAmount
  
  // Simplified: tokens = (sqrt(a) * ethAmount) for constant product
  // For linear: solve quadratic
  
  // Using approximation for small trades relative to supply
  const price = getTokenPrice(currentSupply + ethAmount / getTokenPrice(currentSupply));
  return ethAmount / price;
}

export function getSellAmount(tokenAmount, currentSupply) {
  // Calculate ETH received for token output
  const price = getTokenPrice(currentSupply - tokenAmount);
  return tokenAmount * (getTokenPrice(currentSupply) + price) / 2;
}

export function getSlippage(amount, supply, isBuy) {
  const midPrice = getTokenPrice(supply);
  const avgPrice = isBuy 
    ? getTokenPrice(supply + amount)
    : getTokenPrice(supply - amount);
  return Math.abs((avgPrice - midPrice) / midPrice * 100);
}

// Bonding Curve State
let curveState = {
  supply: INITIAL_SUPPLY,
  reserve: INITIAL_RESERVE,
  totalTrades: 0,
  totalVolume: 0
};

export function getCurveState() {
  return { ...curveState };
}

export function executeTrade(type, amount, token) {
  // type: 'BUY' | 'SELL'
  // amount: ETH amount for BUY, token amount for SELL
  
  const price = getTokenPrice(curveState.supply);
  let tokens, eth, slippage;
  
  if (type === 'BUY') {
    tokens = getBuyAmount(amount, curveState.supply);
    eth = amount;
    slippage = getSlippage(tokens, curveState.supply, true);
    
    curveState.supply += tokens;
    curveState.reserve += eth;
  } else {
    // SELL
    eth = getSellAmount(amount, curveState.supply);
    tokens = amount;
    slippage = getSlippage(tokens, curveState.supply, false);
    
    curveState.supply -= tokens;
    curveState.reserve -= eth;
  }
  
  curveState.totalTrades++;
  curveState.totalVolume += eth;
  
  return {
    type,
    inputAmount: type === 'BUY' ? eth : tokens,
    outputAmount: type === 'BUY' ? tokens : eth,
    price: price,
    slippage: slippage.toFixed(2),
    newSupply: curveState.supply,
    timestamp: new Date().toISOString()
  };
}
