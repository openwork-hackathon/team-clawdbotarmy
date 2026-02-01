const axios = require('axios');

const COINGECKO_BASE = 'https://api.coingecko.com/api/v3';

// Mock holdings for demo (replace with real wallet fetch)
async function getMockHoldings(address) {
  return [
    { symbol: 'BTC', amount: 0.05, price: 78000, change24h: -2.5 },
    { symbol: 'ETH', amount: 0.5, price: 2400, change24h: -3.2 },
    { symbol: 'SOL', amount: 10, price: 105, change24h: -5.1 },
    { symbol: 'OPENWORK', amount: 100000, price: 0.00001, change24h: 0 }
  ];
}

async function getPortfolio(address) {
  try {
    // For demo, use mock data
    // In production, fetch from: https://api.coingecko.com/api/v3/coins/markets
    
    const holdings = await getMockHoldings(address);
    
    const totalValue = holdings.reduce((sum, h) => sum + (h.amount * h.price), 0);
    
    return {
      address,
      holdings,
      totalValue,
      lastUpdated: new Date().toISOString()
    };
  } catch (error) {
    console.error('Portfolio error:', error.message);
    return { error: 'Failed to fetch portfolio' };
  }
}

module.exports = { getPortfolio };
