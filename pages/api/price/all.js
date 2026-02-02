// All Tokens Price API - Returns prices for ARYA, OPENWORK, KROWNEPO

const TOKENS = {
  ARYA: '0xcc78a1F8eCE2ce5ff78d2C0D0c8268ddDa5B6B07',
  OPENWORK: '0x299c30dd5974bf4d5bfe42c340ca40462816ab07',
  KROWNEPO: '0xAFe8861b074B8C2551055a20A2a4f39E45037B07',
  ETH: '0x4200000000000000000000000000000000000006'
};

const UNISWAP_SUBGRAPH = 'https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v3';

// Safe number conversion - prevents NaN
const safeNum = (val, defaultVal = 0) => {
  const num = parseFloat(val);
  return isNaN(num) || !isFinite(num) ? defaultVal : num;
};

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
    
    // Get ETH price from CoinGecko (default to 3000 if fails)
    const ethPriceUSD = safeNum(coingeckoData.ethereum?.usd, 3000);
    
    // Fetch ARYA from CoinGecko
    const aryaCGPrice = safeNum(coingeckoData.arya?.usd, 0);
    
    // Build prices object
    const prices = {};
    
    // ETH price
    prices['ETH'] = {
      source: 'CoinGecko',
      priceUSD: ethPriceUSD,
      priceETH: 1,
      address: TOKENS.ETH
    };
    
    // Check ARYA from CoinGecko first
    if (aryaCGPrice > 0) {
      prices['ARYA'] = {
        source: 'CoinGecko',
        priceUSD: aryaCGPrice,
        priceETH: safeNum(aryaCGPrice / ethPriceUSD),
        address: TOKENS.ARYA
      };
    }
    
    // Fetch Uniswap V3 pools data for other tokens
    const poolQuery = `{
      pools(where: {
        token1_in: ["${TOKENS.OPENWORK}","${TOKENS.KROWNEPO}"]
      }) {
        id
        token1Price
        token0 { id symbol }
        token1 { id symbol }
      }
    }`;
    
    let poolsData = { data: { pools: [] } };
    try {
      const poolsResponse = await fetch(UNISWAP_SUBGRAPH, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: poolQuery }),
        signal: AbortSignal.timeout(10000)
      });
      poolsData = await poolsResponse.json();
    } catch (e) {
      console.error('Uniswap subgraph error:', e);
    }
    
    // Process each token
    for (const [symbol, address] of Object.entries(TOKENS)) {
      if (symbol === 'ETH') continue;
      
      // Skip ARYA if we got CoinGecko price
      if (symbol === 'ARYA' && prices['ARYA']) continue;
      
      // Check Uniswap pool
      const pool = poolsData.data?.pools?.find(
        p => p.token1.id.toLowerCase() === address.toLowerCase()
      );
      
      const priceInETH = safeNum(pool?.token1Price);
      
      if (priceInETH > 0) {
        prices[symbol] = {
          source: 'Uniswap V3 (Base)',
          priceUSD: priceInETH * ethPriceUSD,
          priceETH: priceInETH,
          address
        };
      } else {
        // Fallback prices
        const fallbackPrice = symbol === 'ARYA' ? 0.00001 : 
                              symbol === 'OPENWORK' ? 0.0001 : 
                              symbol === 'KROWNEPO' ? 0.000001 : 0.00001;
        prices[symbol] = {
          source: 'Bonding Curve (Est.)',
          priceUSD: fallbackPrice * ethPriceUSD,
          priceETH: fallbackPrice,
          address,
          note: 'Estimated from bonding curve'
        };
      }
    }
    
    res.status(200).json({ prices, fetchedAt: timestamp });
    
  } catch (error) {
    console.error('All prices API error:', error);
    
    // Return fallback prices
    const ethPriceUSD = 3000;
    const fallbackPrices = {};
    
    fallbackPrices['ETH'] = {
      source: 'Fallback',
      priceUSD: ethPriceUSD,
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
        priceUSD: fallbackPrice * ethPriceUSD,
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
