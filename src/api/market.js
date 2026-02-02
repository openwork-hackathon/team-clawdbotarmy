// Market Data API - Fetches crypto prices from CoinGecko
// Uses native fetch to avoid axios caching issues on serverless

const COINGECKO_BASE = 'https://api.coingecko.com/api/v3';

/**
 * Get current prices for multiple coins
 */
async function getPrices(coinIds) {
  try {
    const response = await fetch(
      `${COINGECKO_BASE}/simple/price?ids=${coinIds.join(',')}&vs_currencies=usd&include_24hr_change=true&include_24hr_vol=true&include_market_cap=true&_cb=${Date.now()}`
    );
    return response.json();
  } catch (error) {
    console.error('Error fetching prices:', error.message);
    return {};
  }
}

/**
 * Get historical market data for charts
 */
async function getMarketChart(coinId, days = 7, timeframe = '1d') {
  const cb = Date.now() + Math.random();
  
  try {
    let prices = [];
    
    if (['1m', '5m', '15m', '1h', '4h'].includes(timeframe)) {
      // Use OHLC endpoint for intraday data
      const daysMap = { '1m': 1, '5m': 1, '15m': 1, '1h': 1, '4h': 3 };
      
      try {
        const ohlcResponse = await fetch(
          `${COINGECKO_BASE}/coins/${coinId}/ohlc?vs_currency=usd&days=${daysMap[timeframe] || 1}&_cb=${cb}`,
          { headers: { 'Cache-Control': 'no-cache' } }
        );
        const ohlcData = await ohlcResponse.json();
        
        // CoinGecko OHLC returns data at 5-minute intervals
        // Use all data points
        prices = (Array.isArray(ohlcData) ? ohlcData : []).map(d => [d[0], d[4]]);
        
      } catch (e) {
        console.error('OHLC error, falling back:', e.message);
        // Fallback to market_chart
        const marketResponse = await fetch(
          `${COINGECKO_BASE}/coins/${coinId}/market_chart?vs_currency=usd&days=${daysMap[timeframe] || 1}&_cb=${cb}`,
          { headers: { 'Cache-Control': 'no-cache' } }
        );
        const marketData = await marketResponse.json();
        prices = (marketData.prices || []);
      }
    } else {
      // Daily/weekly data
      const marketResponse = await fetch(
        `${COINGECKO_BASE}/coins/${coinId}/market_chart?vs_currency=usd&days=${days}&_cb=${cb}`,
        { headers: { 'Cache-Control': 'no-cache' } }
      );
      const marketData = await marketResponse.json();
      prices = (marketData.prices || []);
    }
    
    return prices;
  } catch (error) {
    console.error('Error fetching chart data:', error.message);
    return [];
  }
}

/**
 * Get OHLC data
 */
async function getOHLC(coinId, timeframe = '1h', days = 1) {
  const daysMap = { '1m': 1, '5m': 1, '15m': 1, '1h': 1, '4h': 3, '1d': 30 };
  
  try {
    const response = await fetch(
      `${COINGECKO_BASE}/coins/${coinId}/ohlc?vs_currency=usd&days=${daysMap[timeframe] || 1}&_cb=${Date.now()}`,
      { headers: { 'Cache-Control': 'no-cache' } }
    );
    return response.json();
  } catch (error) {
    console.error('Error fetching OHLC:', error.message);
    return [];
  }
}

/**
 * Get coin info
 */
async function getCoinInfo(coinId) {
  try {
    const response = await fetch(
      `${COINGECKO_BASE}/coins/${coinId}?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false&_cb=${Date.now()}`
    );
    const data = await response.json();
    return {
      id: data.id,
      name: data.name,
      symbol: data.symbol,
      currentPrice: data.market_data?.current_price?.usd,
      priceChange24h: data.market_data?.price_change_percentage_24h,
      marketCap: data.market_data?.market_cap?.usd,
      volume24h: data.market_data?.total_volume?.usd
    };
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
    const response = await fetch(
      `${COINGECKO_BASE}/search/trending?_cb=${Date.now()}`
    );
    const data = await response.json();
    return (data.coins || []).slice(0, 10).map(c => ({
      id: c.item.id,
      name: c.item.name,
      symbol: c.item.symbol,
      marketCapRank: c.item.market_cap_rank
    }));
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
