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
    let prices = [];
    
    if (['1m', '5m', '15m', '1h', '4h'].includes(timeframe)) {
      // Use OHLC endpoint for intraday data
      const daysMap = { '1m': 1, '5m': 1, '15m': 1, '1h': 1, '4h': 3 };
      
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
        
        const ohlcData = ohlcResponse.data || [];
        
        // CoinGecko OHLC returns data at 5-minute intervals
        // Use all data points for accurate chart
        prices = ohlcData.map(d => [d[0], d[4]]); // Use close price
        
      } catch (e) {
        console.error('OHLC error, falling back:', e.message);
        // Fallback: use market_chart with small days for intraday data
        const response = await axios.get(`${COINGECKO_BASE}/coins/${coinId}/market_chart`, {
          params: { vs_currency: 'usd', days: daysMap[timeframe] || 1 }
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

/**
 * Get OHLC data for detailed charts
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

/**
 * Get basic coin info
 */
async function getCoinInfo(coinId) {
  try {
    const response = await axios.get(`${COINGECKO_BASE}/coins/${coinId}`, {
      params: {
        localization: false,
        tickers: false,
        market_data: true,
        community_data: false,
        developer_data: false,
        sparkline: false
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching coin info:', error.message);
    return null;
  }
}

/**
 * Get trending coins
 */
async function getTrending() {
  try {
    const response = await axios.get(`${COINGECKO_BASE}/search/trending`);
    return response.data.coins || [];
  } catch (error) {
    console.error('Error fetching trending:', error.message);
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
