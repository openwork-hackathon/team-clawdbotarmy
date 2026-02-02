// Market API - Fetches real-time market data

const COINGECKO_API = 'https://api.coingecko.com/api/v3';
const UNISWAP_SUBGRAPH = 'https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v3';

// Cache for market data
let marketCache = { timestamp: 0, data: null };
const CACHE_DURATION = 30000; // 30 seconds

async function fetchTokenPrice(tokenId) {
  try {
    const response = await fetch(
      `${COINGECKO_API}/simple/price?ids=${tokenId}&vs_currencies=usd&include_24hr_change=true`
    );
    const data = await response.json();
    return data[tokenId];
  } catch (e) {
    console.error(`Error fetching ${tokenId} price:`, e);
    return null;
  }
}

async function fetchUniswapPoolData(tokenAddress) {
  const query = `
    {
      pools(where: {
        token1: "${tokenAddress}"
      }) {
        id
        token0Price
        token1Price
        volumeToken0
        volumeToken1
        feeTier
      }
    }
  `;

  try {
    const response = await fetch(UNISWAP_SUBGRAPH, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query })
    });
    const data = await response.json();
    return data.data?.pools || [];
  } catch (e) {
    console.error('Error fetching Uniswap pool:', e);
    return [];
  }
}

async function getMarketOverview() {
  const now = Date.now();
  
  // Check cache
  if (marketCache.data && (now - marketCache.timestamp) < CACHE_DURATION) {
    return marketCache.data;
  }

  try {
    // Fetch prices from CoinGecko
    const [ethData, aryaData] = await Promise.all([
      fetchTokenPrice('ethereum'),
      fetchTokenPrice('arya')
    ]);

    const overview = {
      timestamp: now,
      ethereum: {
        price: ethData?.usd || 0,
        change24h: ethData?.usd_24h_change || 0
      },
      arya: {
        price: aryaData?.usd || 0,
        change24h: aryaData?.usd_24h_change || 0
      }
    };

    marketCache = { timestamp: now, data: overview };
    return overview;
  } catch (e) {
    console.error('Error fetching market overview:', e);
    return { timestamp: now, error: e.message };
  }
}

async function getTokenChartData(coin, days = 7) {
  try {
    const coinId = coin === 'eth' ? 'ethereum' : coin;
    const response = await fetch(
      `${COINGECKO_API}/coins/${coinId}/market_chart?vs_currency=usd&days=${days}`
    );
    const data = await response.json();
    return {
      coin,
      prices: data.prices || [],
      market_caps: data.market_caps || [],
      total_volumes: data.total_volumes || []
    };
  } catch (e) {
    console.error(`Error fetching chart data for ${coin}:`, e);
    return { coin, error: e.message };
  }
}

async function getUniswapTokenData(tokenAddress) {
  const pools = await fetchUniswapPoolData(tokenAddress);
  return {
    address: tokenAddress,
    pools,
    poolCount: pools.length
  };
}

export {
  getMarketOverview,
  getTokenChartData,
  getUniswapTokenData,
  fetchTokenPrice,
  fetchUniswapPoolData
};
