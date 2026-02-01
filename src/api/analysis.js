// Market Analysis API - Combines market data with technical analysis

const { getPrices, getMarketChart, getTrending } = require('./market');
const { calculateRSI, calculateMACD, calculateBollingerBands, getTradingSignal } = require('../utils/indicators');

/**
 * Get full market analysis for a coin
 * @param {String} coinId - Coin ID (bitcoin, ethereum, solana)
 * @returns {Object} Complete analysis
 */
async function analyzeCoin(coinId) {
  // Get current price
  const prices = await getPrices([coinId]);
  const currentPrice = prices[coinId]?.usd || 0;
  
  // Get historical data for technical analysis
  const history = await getMarketChart(coinId, 30);
  const priceHistory = history.map(p => p[1]);
  
  // Calculate indicators
  const rsi = calculateRSI(priceHistory, 14);
  const macd = calculateMACD(priceHistory);
  const bb = calculateBollingerBands(priceHistory, 20, 2);
  
  // Get trading signal
  const signal = getTradingSignal({
    rsi,
    macd,
    bb,
    price: currentPrice
  });
  
  // Get coin info
  const coinInfo = {
    id: coinId,
    price: currentPrice,
    change24h: prices[coinId]?.usd_24h_change || 0,
    volume24h: prices[coinId]?.usd_24h_vol || 0,
    marketCap: prices[coinId]?.usd_market_cap || 0
  };
  
  return {
    coin: coinInfo,
    technical: {
      rsi: Math.round(rsi * 100) / 100,
      macd: Math.round(macd.macd * 100) / 100,
      macdSignal: Math.round(macd.signal * 100) / 100,
      macdHistogram: Math.round(macd.histogram * 100) / 100,
      bollingerBands: {
        upper: Math.round(bb.upper * 100) / 100,
        middle: Math.round(bb.middle * 100) / 100,
        lower: Math.round(bb.lower * 100) / 100
      }
    },
    signal: signal,
    recommendation: getRecommendation(signal, rsi, currentPrice, bb)
  };
}

/**
 * Get human-readable recommendation
 */
function getRecommendation(signal, rsi, price, bb) {
  const recommendations = {
    'BUY': [
      `Price ($${Math.round(price)}) is below lower Bollinger Band`,
      `RSI at ${Math.round(rsi)} indicates oversold conditions`,
      'Multiple indicators suggest upward movement'
    ],
    'SELL': [
      `Price ($${Math.round(price)}) is above upper Bollinger Band`,
      `RSI at ${Math.round(rsi)} indicates overbought conditions`,
      'Multiple indicators suggest downward pressure'
    ],
    'HOLD': [
      `Price ($${Math.round(price)}) within Bollinger Bands range`,
      `RSI at ${Math.round(rsi)} is neutral`,
      'Wait for clearer signals before acting'
    ]
  };
  
  return {
    action: signal,
    reasons: recommendations[signal] || recommendations['HOLD']
  };
}

/**
 * Get dashboard summary for all major coins
 */
async function getDashboard() {
  const coins = ['bitcoin', 'ethereum', 'solana'];
  const trends = await getTrending();
  
  const analyses = await Promise.all(coins.map(async (coin) => {
    const analysis = await analyzeCoin(coin);
    return {
      id: coin,
      ...analysis.coin,
      signal: analysis.signal,
      rsi: analysis.technical.rsi
    };
  }));
  
  return {
    majorCoins: analyses,
    trending: trends,
    updatedAt: new Date().toISOString()
  };
}

module.exports = {
  analyzeCoin,
  getDashboard
};
