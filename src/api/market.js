// Market Data API - Fetches crypto prices from CoinGecko

const axios = require('axios');

const COINGECKO_BASE = 'https://api.coingecko.com/api/v3';

/**
 * Get current prices for multiple coins
 * @param {Array} coinIds - Array of coin IDs (e.g., ['bitcoin', 'ethereum', 'solana'])
 * @returns {Object} Price data
 */
async function getPrices(coinIds) {
  try {
    const response = await axios.get(`${COINGECKO_BASE}/simple/price`, {
      params: {
        ids: coinIds.join(','),
        vs_currencies: 'usd',
        include_24hr_change: true,
        include_24hr_vol: true,
        include_market_cap: true
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching prices:', error.message);
    return {};
  }
}

/**
 * Get historical market data for charts
 * @param {String} coinId - Coin ID
 * @param {Number} days - Number of days of history
 * @param {String} timeframe - Timeframe: 1m, 5m, 15m, 1h, 4h, 1d
 * @returns {Array} Price history
 */
async function getMarketChart(coinId, days = 7, timeframe = '1d') {
  try {
    // CoinGecko API: for intraday data, use 'hourly' vs 'daily' data
    // For 1d, 7d, 30d, 90d, 180d, 365d - use days parameter
    // For intraday (1m, 5m, 15m, 1h, 4h) - we need sparkline or OHLC
    
    let prices = [];
    
    // For short timeframes, we need to use a different endpoint
    if (['1m', '5m', '15m', '1h', '4h'].includes(timeframe)) {
      // Use OHLC endpoint for intraday data
      const daysMap = {
        '1m': 1, '5m': 1, '15m': 1, '1h': 1, '4h': 3
      };
      
      try {
        const ohlcResponse = await axios.get(
          `${COINGECKO_BASE}/coins/${coinId}/ohlc`,
          {
            params: {
              vs_currency: 'usd',
              days: daysMap[timeframe] || 1
            }
          }
        );
        
        // Convert OHLC data to [timestamp, price] format
        const ohlcData = ohlcResponse.data || [];
        const intervalMs = timeframe === '1m' ? 60000 : 
                          timeframe === '5m' ? 300000 : 
                          timeframe === '15m' ? 900000 : 
                          timeframe === '1h' ? 3600000 : 14400000;
        
        // Sample data at the requested interval
        prices = ohlcData.filter((_, i) => i % getSampleRate(timeframe) === 0)
          .map(d => [d[0], d[4]]); // Use close price
      } catch (e) {
        console.error('OHLC error, falling back:', e.message);
        // Fallback to regular chart
        const response = await axios.get(`${COINGECKO_BASE}/coins/${coinId}/market_chart`, {
          params: { vs_currency: 'usd', days: days }
        });
        prices = response.data.prices || [];
      }
    } else {
      // Daily/weekly data
      const response = await axios.get(`${COINGECKO_BASE}/coins/${coinId}/market_chart`, {
        params: {
          vs_currency: 'usd',
          days: days
        }
      });
      prices = response.data.prices || [];
    }
    
    return prices;
  } catch (error) {
    console.error('Error fetching chart data:', error.message);
    return [];
  }
}

// Helper to sample OHLC data for different timeframes
function getSampleRate(timeframe) {
  const rates = { '1m': 1, '5m': 5, '15m': 15, '1h': 60, '4h': 240 };
  return rates[timeframe] || 1;
}

/**
 * Get OHLC data for detailed charts
 * @param {String} coinId - Coin ID  
 * @param {String} timeframe - 1m, 5m, 15m, 1h, 4h, 1d
 * @param {Number} days - Number of days
 * @returns {Array} OHLC data [[time, open, high, low, close], ...]
 */
async function getOHLC(coinId, timeframe = '1h', days = 1) {
  try {
    const daysMap = { '1m': 1, '5m': 1, '15m': 1, '1h': 1, '4h': 3, '1d': 30 };
    
    const response = await axios.get(`${COINGECKO_BASE}/coins/${coinId}/ohlc`, {
      params: {
        vs_currency: 'usd',
        days: daysMap[timeframe] || 1
      }
    });
    
    return response.data || [];
  } catch (error) {
    console.error('Error fetching OHLC:', error.message);
    return [];
  }
}

module.exports = {
  getPrices,
  getMarketChart,
  getOHLC,
  getCoinInfo,
  getTrending
};
