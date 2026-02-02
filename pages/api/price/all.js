// All Tokens Price API - Returns prices for ARYA, OPENWORK, KROWNEPO

const TOKENS = {
  ARYA: '0xcc78a1F8eCE2ce5ff78d2C0D0c8268ddDa5B6B07',
  OPENWORK: '0x299c30dd5974bf4d5bfe42c340ca40462816ab07',
  KROWNEPO: '0xAFe8861b074B8C2551055a20A2a4f39E45037B07',
  ETH: '0x4200000000000000000000000000000000000006'
};

const UNISWAP_SUBGRAPH = 'https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v3';

export default async function handler(req, res) {
  const timestamp = Date.now();
  
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  
  try {
    // Fetch prices from CoinGecko
    const coingeckoResponse = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=ethereum,arya&vs_currencies=usd',
      { signal: AbortSignal.timeout(5000) }
    );
    const coingeckoData = await coingeckoResponse.json();
    
    // Get ETH price from CoinGecko
    const ethPriceUSD = coingeckoData.ethereum?.usd || 3000;
    prices['ETH'] = {
      source: 'CoinGecko',
      priceUSD: ethPriceUSD,
      priceETH: 1,
      address: TOKENS.ETH
    };
    
    // Fetch ARYA from CoinGecko
    const aryaCGPrice = coingeckoData.arya?.usd;
    
    // Fetch Uniswap V3 pools data for other tokens
    const poolQuery = `{
      pools(where: {
        token1_in: ["${TOKENS.OPENWORK}","${TOKENS.KROWNEPO}"]
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
    
    // Build prices object - ETH already fetched
    const prices = {};
    prices['ETH'] = {
      source: 'CoinGecko',
      priceUSD: ethPriceUSD,
      priceETH: 1,
      address: TOKENS.ETH
    };
    
    // Check ARYA from CoinGecko first
    if (aryaCGPrice && aryaCGPrice > 0) {
      prices['ARYA'] = {
        source: 'CoinGecko',
        priceUSD: aryaCGPrice,
        priceETH: aryaCGPrice / ethPriceUSD,
        address: TOKENS.ARYA
      };
    }
    
    // Check other tokens from Uniswap pools
    for (const [symbol, address] of Object.entries(TOKENS)) {
      if (symbol === 'ETH') continue; // Already handled
      
      // Skip ARYA if we got CoinGecko price
      if (symbol === 'ARYA' && prices['ARYA']) continue;
      
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
    fallbackPrices['ETH'] = {
      source: 'Fallback',
      priceUSD: 3000,
      priceETH: 1,
      address: TOKENS.ETH
    };
    for (const [symbol, address] of Object.entries(TOKENS)) {
      if (symbol === 'ETH') continue;
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
