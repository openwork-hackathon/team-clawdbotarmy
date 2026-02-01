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
 * @returns {Array} Price history
 */
async function getMarketChart(coinId, days = 7) {
  try {
    const response = await axios.get(`${COINGECKO_BASE}/coins/${coinId}/market_chart`, {
      params: {
        vs_currency: 'usd',
        days: days
      }
    });
    return response.data.prices || [];
  } catch (error) {
    console.error('Error fetching chart data:', error.message);
    return [];
  }
}

/**
 * Get coin info (name, symbol, description, etc.)
 * @param {String} coinId - Coin ID
 * @returns {Object} Coin information
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
    
    const data = response.data;
    return {
      id: data.id,
      name: data.name,
      symbol: data.symbol,
      description: data.description?.en?.substring(0, 200) + '...',
      currentPrice: data.market_data?.current_price?.usd,
      priceChange24h: data.market_data?.price_change_percentage_24h,
      marketCap: data.market_data?.market_cap?.usd,
      volume24h: data.market_data?.total_volume?.usd,
      high24h: data.market_data?.high_24h?.usd,
      low24h: data.market_data?.low_24h?.usd
    };
  } catch (error) {
    console.error('Error fetching coin info:', error.message);
    return null;
  }
}

/**
 * Get trending coins
 * @returns {Array} Trending coins
 */
async function getTrending() {
  try {
    const response = await axios.get(`${COINGECKO_BASE}/search/trending`);
    return response.data.coins?.slice(0, 10).map(c => ({
      id: c.item.id,
      name: c.item.name,
      symbol: c.item.symbol,
      marketCapRank: c.item.market_cap_rank,
      thumb: c.item.thumb
    })) || [];
  } catch (error) {
    console.error('Error fetching trending:', error.message);
    return [];
  }
}

module.exports = {
  getPrices,
  getMarketChart,
  getCoinInfo,
  getTrending
};
