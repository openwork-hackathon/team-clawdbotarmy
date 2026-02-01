const axios = require('axios');
const { createPublicClient, http } = require('viem');
const { base } = require('viem/chains');

const COINGECKO_BASE = 'https://api.coingecko.com/api/v3';

// Base chain public client
const publicClient = createPublicClient({
  chain: base,
  transport: http()
});

// Token addresses on Base
const BASE_TOKENS = {
  ETH: '0x4200000000000000000000000000000000000006',
  WBTC: '0xcbB7e0000d1F07089cEe3faDcDa0eD23B11dB3A4',
  USDC: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
  OPENWORK: '0x299c30DD5974BF4D5bFE42C340CA40462816AB07'
};

// Token coingecko IDs
const COINGECKO_IDS = {
  ETH: 'ethereum',
  WBTC: 'wrapped-bitcoin',
  USDC: 'usd-coin',
  OPENWORK: 'openwork-ai'
};

// Fetch current price from CoinGecko
async function getTokenPrice(tokenId) {
  try {
    const response = await axios.get(`${COINGECKO_BASE}/simple/price`, {
      params: { ids: tokenId, vs_currencies: 'usd' }
    });
    return response.data[tokenId]?.usd || 0;
  } catch (error) {
    console.error(`Error fetching ${tokenId} price:`, error.message);
    return 0;
  }
}

// Fetch multiple prices at once
async function getAllPrices() {
  const ids = Object.values(COINGECKO_IDS);
  try {
    const response = await axios.get(`${COINGECKO_BASE}/simple/price`, {
      params: { ids: ids.join(','), vs_currencies: 'usd' }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching prices:', error.message);
    return {};
  }
}

// Get wallet token balances (placeholder for real wallet connection)
async function getWalletBalances(address) {
  // In production: use viem's multicall to get real balances
  // For demo: return mock data with current prices
  
  const prices = await getAllPrices();
  
  return [
    { 
      symbol: 'BTC', 
      token: 'WBTC',
      amount: 0.05, 
      price: prices['wrapped-bitcoin']?.usd || 78000,
      value: 0.05 * (prices['wrapped-bitcoin']?.usd || 78000),
      change24h: -2.5 
    },
    { 
      symbol: 'ETH', 
      token: 'ETH',
      amount: 0.5, 
      price: prices['ethereum']?.usd || 2400,
      value: 0.5 * (prices['ethereum']?.usd || 2400),
      change24h: -3.2 
    },
    { 
      symbol: 'SOL', 
      token: 'SOL',
      amount: 10, 
      price: 105,
      value: 1050,
      change24h: -5.1 
    },
    { 
      symbol: 'OPENWORK', 
      token: 'OPENWORK',
      amount: 100000, 
      price: 0.00001,
      value: 1,
      change24h: 0 
    }
  ];
}

// Get portfolio summary
async function getPortfolio(address) {
  try {
    const holdings = await getWalletBalances(address);
    
    const totalValue = holdings.reduce((sum, h) => sum + h.value, 0);
    const totalChange = holdings.reduce((sum, h) => sum + (h.value * h.change24h / 100), 0);
    
    // Calculate allocation percentages
    const holdingsWithAllocation = holdings.map(h => ({
      ...h,
      allocation: totalValue > 0 ? (h.value / totalValue * 100).toFixed(2) : 0
    }));

    return {
      address,
      totalValue: totalValue.toFixed(2),
      totalChange24h: totalChange.toFixed(2),
      holdings: holdingsWithAllocation,
      lastUpdated: new Date().toISOString()
    };
  } catch (error) {
    console.error('Portfolio error:', error.message);
    return { error: 'Failed to fetch portfolio', message: error.message };
  }
}

// Get PnL history (mock data - would need real transaction history)
async function getPnLHistory(address, days = 7) {
  const history = [];
  const baseValue = 5000;
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    
    // Generate semi-random but realistic-looking PnL data
    const variation = (Math.random() - 0.5) * 200;
    const value = baseValue + variation + (days - i) * 50;
    
    history.push({
      date: date.toISOString().split('T')[0],
      value: value.toFixed(2),
      change: ((value - baseValue) / baseValue * 100).toFixed(2)
    });
  }
  
  return history;
}

// Get portfolio analytics
async function getPortfolioAnalytics(address) {
  const portfolio = await getPortfolio(address);
  
  if (portfolio.error) return portfolio;
  
  // Top performers
  const topPerformers = [...portfolio.holdings]
    .sort((a, b) => b.change24h - a.change24h)
    .slice(0, 3);
  
  // Largest holdings
  const largestHoldings = [...portfolio.holdings]
    .sort((a, b) => b.value - a.value)
    .slice(0, 3);
  
  return {
    address,
    totalValue: portfolio.totalValue,
    totalChange24h: portfolio.totalChange24h,
    topPerformers,
    largestHoldings,
    lastUpdated: portfolio.lastUpdated
  };
}

module.exports = { 
  getPortfolio, 
  getWalletBalances, 
  getPnLHistory,
  getPortfolioAnalytics,
  getAllPrices,
  BASE_TOKENS
};
