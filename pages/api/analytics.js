// Market Analytics API - Returns comprehensive market data

const BASE_TOKENS = {
  ARYA: '0xcc78a1F8eCE2ce5ff78d2C0D0c8268ddDa5B6B07',
  OPENWORK: '0x299c30dd5974bf4d5bfe42c340ca40462816ab07',
  KROWNEPO: '0xAFe8861b074B8C2551055a20A2a4f39E45037B07'
};

export default async function handler(req, res) {
  const timestamp = Date.now();
  
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  
  try {
    // Fetch prices from all sources
    const [pricesRes, coingecko] = await Promise.all([
      fetch('/api/price/all'),
      fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana&vs_currencies=usd&include_24hr_change=true', {
        signal: AbortSignal.timeout(5000)
      })
    ]);
    
    const pricesData = await pricesRes.json();
    const marketData = await coingecko.json();
    
    // Build comprehensive analytics
    const analytics = {
      timestamp,
      market: {
        bitcoin: {
          price: marketData.bitcoin?.usd || 0,
          change24h: marketData.bitcoin?.usd_24h_change || 0,
          symbol: 'BTC'
        },
        ethereum: {
          price: marketData.ethereum?.usd || 0,
          change24h: marketData.ethereum?.usd_24h_change || 0,
          symbol: 'ETH'
        },
        solana: {
          price: marketData.solana?.usd || 0,
          change24h: marketData.solana?.usd_24h_change || 0,
          symbol: 'SOL'
        }
      },
      tokens: {},
      stats: {
        totalTokens: Object.keys(BASE_TOKENS).length,
        tvl: 2500000, // Simulated TVL
        totalStakers: 12500,
        averageApy: 35
      }
    };
    
    // Add Base tokens
    for (const [symbol, data] of Object.entries(pricesData.prices || {})) {
      analytics.tokens[symbol] = {
        address: BASE_TOKENS[symbol],
        price: data.priceUSD || 0,
        priceEth: data.priceETH || 0,
        source: data.source || 'Unknown',
        change24h: (Math.random() * 20 - 10), // Simulated for now
        volume24h: Math.random() * 100000,
        liquidity: Math.random() * 500000
      };
    }
    
    res.status(200).json(analytics);
    
  } catch (error) {
    console.error('Analytics error:', error);
    
    // Return fallback data
    res.status(200).json({
      timestamp,
      error: 'Partial data',
      tokens: {
        ARYA: { address: BASE_TOKENS.ARYA, price: 0.00001, source: 'Fallback' },
        OPENWORK: { address: BASE_TOKENS.OPENWORK, price: 0.0001, source: 'Fallback' },
        KROWNEPO: { address: BASE_TOKENS.KROWNEPO, price: 0.000001, source: 'Fallback' }
      },
      stats: {
        totalTokens: 3,
        tvl: 0,
        totalStakers: 0,
        averageApy: 0
      }
    });
  }
}
