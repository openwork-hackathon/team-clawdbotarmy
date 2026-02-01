// Technical Analysis Indicators

/**
 * Calculate RSI (Relative Strength Index)
 * @param {Array} prices - Array of closing prices
 * @param {Number} period - RSI period (default 14)
 * @returns {Number} RSI value (0-100)
 */
function calculateRSI(prices, period = 14) {
  if (prices.length < period + 1) return 50;
  
  let gains = 0;
  let losses = 0;
  
  for (let i = prices.length - period; i < prices.length; i++) {
    const change = prices[i] - prices[i - 1];
    if (change > 0) gains += change;
    else losses -= change;
  }
  
  const avgGain = gains / period;
  const avgLoss = losses / period;
  
  if (avgLoss === 0) return 100;
  
  const rs = avgGain / avgLoss;
  return 100 - (100 / (1 + rs));
}

/**
 * Calculate MACD (Moving Average Convergence Divergence)
 * @param {Array} prices - Array of closing prices
 * @returns {Object} MACD value, signal line, and histogram
 */
function calculateMACD(prices) {
  const ema12 = calculateEMA(prices, 12);
  const ema26 = calculateEMA(prices, 26);
  
  const macdLine = ema12 - ema26;
  const signalLine = calculateEMA([macdLine], 9);
  const histogram = macdLine - signalLine;
  
  return {
    macd: macdLine,
    signal: signalLine,
    histogram: histogram
  };
}

/**
 * Calculate EMA (Exponential Moving Average)
 * @param {Array} prices - Array of closing prices
 * @param {Number} period - EMA period
 * @returns {Number} EMA value
 */
function calculateEMA(prices, period) {
  if (prices.length === 0) return 0;
  
  const multiplier = 2 / (period + 1);
  let ema = prices[0];
  
  for (let i = 1; i < prices.length; i++) {
    ema = (prices[i] - ema) * multiplier + ema;
  }
  
  return ema;
}

/**
 * Calculate Bollinger Bands
 * @param {Array} prices - Array of closing prices
 * @param {Number} period - BB period (default 20)
 * @param {Number} stdDev - Standard deviations (default 2)
 * @returns {Object} Upper band, middle band, lower band
 */
function calculateBollingerBands(prices, period = 20, stdDev = 2) {
  if (prices.length < period) {
    return { upper: 0, middle: 0, lower: 0 };
  }
  
  const slice = prices.slice(-period);
  const middle = slice.reduce((a, b) => a + b, 0) / period;
  
  const squaredDiffs = slice.map(price => Math.pow(price - middle, 2));
  const stdDevValue = Math.sqrt(squaredDiffs.reduce((a, b) => a + b, 0) / period);
  
  return {
    upper: middle + (stdDev * stdDevValue),
    middle: middle,
    lower: middle - (stdDev * stdDevValue)
  };
}

/**
 * Calculate Simple Moving Average
 * @param {Array} prices - Array of closing prices
 * @param {Number} period - SMA period
 * @returns {Number} SMA value
 */
function calculateSMA(prices, period) {
  if (prices.length < period) return prices[prices.length - 1];
  
  const slice = prices.slice(-period);
  return slice.reduce((a, b) => a + b, 0) / period;
}

/**
 * Get trading signal based on multiple indicators
 * @param {Object} analysis - RSI, MACD, BB values
 * @returns {String} 'BUY', 'SELL', or 'HOLD'
 */
function getTradingSignal(analysis) {
  let score = 0;
  
  // RSI signals
  if (analysis.rsi < 30) score += 2;      // Oversold = BUY
  else if (analysis.rsi > 70) score -= 2; // Overbought = SELL
  
  // MACD signals
  if (analysis.macd > analysis.signal) score += 1;
  else if (analysis.macd < analysis.signal) score -= 1;
  
  // Bollinger Bands signals
  if (analysis.price < analysis.bb.lower) score += 2;
  else if (analysis.price > analysis.bb.upper) score -= 2;
  
  if (score >= 3) return 'BUY';
  if (score <= -3) return 'SELL';
  return 'HOLD';
}

module.exports = {
  calculateRSI,
  calculateMACD,
  calculateEMA,
  calculateBollingerBands,
  calculateSMA,
  getTradingSignal
};
