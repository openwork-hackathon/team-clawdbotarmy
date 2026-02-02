// All Tokens Price API - Returns prices for ARYA, OPENWORK, KROWNEPO

const TOKENS = {
  ARYA: '0xcc78a1F8eCE2ce5ff78d2C0D0c8268ddDa5B6B07',
  OPENWORK: '0x299c30dd5974bf4d5bfe42c340ca40462816ab07',
  KROWNEPO: '0xAFe8861b074B8C2551055a20A2a4f39E45037B07'
};

const UNISWAP_SUBGRAPH = 'https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v3';

export default async function handler(req, res) {
  const timestamp = Date.now();
  
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  
  try {
    // Fetch prices from CoinGecko (if listed)
    const coingeckoIds = ['arya'];
    const coingeckoResponse = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${coingeckoIds.join(',')}&vs_currencies=usd`,
      { signal: AbortSignal.timeout(5000) }
    );
    const coingeckoData = await coingeckoResponse.json();
    
    // Fetch Uniswap V3 pools data
    const poolQuery = `{
      pools(where: {
        token1_in: ["${Object.values(TOKENS).join('","')}"]
      }) {
        id
        token1Price
        token0 {
          id
          symbol
        }
        token1 {
          id
          symbol
        }
      }
    }`;
    
    const poolsResponse = await fetch(UNISWAP_SUBGRAPH, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: poolQuery }),
      signal: AbortSignal.timeout(10000)
    });
    
    const poolsData = await poolsResponse.json();
    
    // Build prices object
    const prices = {};
    
    for (const [symbol, address] of Object.entries(TOKENS)) {
      // Check CoinGecko first
      const cgPrice = coingeckoData[symbol.toLowerCase()]?.usd;
      
      if (cgPrice && cgPrice > 0) {
        prices[symbol] = {
          source: 'CoinGecko',
          priceUSD: cgPrice,
          priceETH: cgPrice / 3000,
          address
        };
        continue;
      }
      
      // Check Uniswap pool
      const pool = poolsData.data?.pools?.find(
        p => p.token1.id.toLowerCase() === address.toLowerCase()
      );
      
      if (pool && parseFloat(pool.token1Price) > 0) {
        const priceInETH = parseFloat(pool.token1Price);
        prices[symbol] = {
          source: 'Uniswap V3 (Base)',
          priceUSD: priceInETH * 3000,
          priceETH: priceInETH,
          address
        };
      } else {
        // Fallback price
        const fallbackPrice = symbol === 'ARYA' ? 0.00001 : 
                              symbol === 'OPENWORK' ? 0.0001 : 
                              symbol === 'KROWNEPO' ? 0.000001 : 0.00001;
        prices[symbol] = {
          source: 'Fallback',
          priceUSD: fallbackPrice * 3000,
          priceETH: fallbackPrice,
          address,
          note: 'Price not yet available'
        };
      }
    }
    
    res.status(200).json({
      prices,
      fetchedAt: timestamp
    });
    
  } catch (error) {
    console.error('All prices API error:', error);
    
    // Return fallback prices
    const fallbackPrices = {};
    for (const [symbol, address] of Object.entries(TOKENS)) {
      const fallbackPrice = symbol === 'ARYA' ? 0.00001 : 
                            symbol === 'OPENWORK' ? 0.0001 : 
                            symbol === 'KROWNEPO' ? 0.000001 : 0.00001;
      fallbackPrices[symbol] = {
        source: 'Fallback',
        priceUSD: fallbackPrice * 3000,
        priceETH: fallbackPrice,
        address
      };
    }
    
    res.status(200).json({
      prices: fallbackPrices,
      error: 'Could not fetch live prices',
      fetchedAt: timestamp
    });
  }
}
