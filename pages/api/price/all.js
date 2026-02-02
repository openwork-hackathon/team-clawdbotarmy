/**
 * All Tokens Price API
 * 
 * Fetches real-time prices for all supported tokens from multiple sources:
 * 1. CoinGecko (preferred for listed tokens)
 * 2. Uniswap V3 Subgraph (for DEX prices)
 * 3. Fallback to bonding curve estimates
 * 
 * Response format:
 * {
 *   prices: {
 *     TOKEN: {
 *       source: 'CoinGecko' | 'Uniswap V3 (Base)' | 'Bonding Curve (Est.)',
 *       priceUSD: number,
 *       priceETH: number,
 *       address: string,
 *       note?: string
 *     }
 *   },
 *   fetchedAt: number (timestamp)
 * }
 */

// Token configurations - UPDATE when deploying new tokens
const TOKENS = {
  ARYA: '0xcc78a1F8eCE2ce5ff78d2C0D0c8268ddDa5B6B07',
  OPENWORK: '0x299c30dd5974bf4d5bfe42c340ca40462816ab07',
  KROWNEPO: '0xAFe8861b074B8C2551055a20A2a4f39E45037B07',
  ETH: '0x4200000000000000000000000000000000000006',
  BRAUM: '0xefb28887A479029B065Cb931a973B97101209b07'
};

// External API endpoints
const COINGECKO_URL = 'https://api.coingecko.com/api/v3/simple/price';
const UNISWAP_SUBGRAPH = 'https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v3';

/**
 * Safely convert value to number
 * Prevents NaN in UI when API returns undefined/null
 */
const safeNum = (val, defaultVal = 0) => {
  const num = parseFloat(val);
  return isNaN(num) || !isFinite(num) ? defaultVal : num;
};

export default async function handler(req, res) {
  const timestamp = Date.now();
  
  // Prevent caching - prices change frequently
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  
  try {
    // Step 1: Fetch CoinGecko prices (ETH + ARYA)
    // Note: Add more token IDs here if listed on CoinGecko
    const coingeckoResponse = await fetch(
      `${COINGECKO_URL}?ids=ethereum,arya&vs_currencies=usd`,
      { signal: AbortSignal.timeout(5000) }
    );
    const coingeckoData = await coingeckoResponse.json();
    
    // Get ETH price (default to 3000 if fails)
    const ethPriceUSD = safeNum(coingeckoData.ethereum?.usd, 3000);
    
    // Get ARYA price from CoinGecko (0 if not listed)
    const aryaCGPrice = safeNum(coingeckoData.arya?.usd, 0);
    
    // Initialize prices object
    const prices = {};
    
    // Add ETH price
    prices['ETH'] = {
      source: 'CoinGecko',
      priceUSD: ethPriceUSD,
      priceETH: 1,
      address: TOKENS.ETH
    };
    
    // Add ARYA if we have CoinGecko price
    if (aryaCGPrice > 0) {
      prices['ARYA'] = {
        source: 'CoinGecko',
        priceUSD: aryaCGPrice,
        priceETH: safeNum(aryaCGPrice / ethPriceUSD),
        address: TOKENS.ARYA
      };
    }
    
    // Step 2: Fetch Uniswap V3 pool data for other tokens
    // Only fetches pools for OPENWORK, KROWNEPO, and BRAUM
    const poolQuery = `{
      pools(where: {
        token1_in: ["${TOKENS.OPENWORK}","${TOKENS.KROWNEPO}","${TOKENS.BRAUM}"]
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
      // Continue with fallback prices
    }
    
    // Step 3: Process remaining tokens
    for (const [symbol, address] of Object.entries(TOKENS)) {
      if (symbol === 'ETH') continue; // Already added
      
      // Skip ARYA if we already have CoinGecko price
      if (symbol === 'ARYA' && prices['ARYA']) continue;
      
      // Check if token has Uniswap V3 pool
      const pool = poolsData.data?.pools?.find(
        p => p.token1.id.toLowerCase() === address.toLowerCase()
      );
      
      const priceInETH = safeNum(pool?.token1Price);
      
      if (priceInETH > 0) {
        // Use Uniswap price
        prices[symbol] = {
          source: 'Uniswap V3 (Base)',
          priceUSD: priceInETH * ethPriceUSD,
          priceETH: priceInETH,
          address
        };
      } else {
        // Fallback to bonding curve estimate
        // UPDATE these values when deploying new tokens!
        const fallbackPrice = symbol === 'ARYA' ? 0.00001 : 
                              symbol === 'OPENWORK' ? 0.0001 : 
                              symbol === 'KROWNEPO' ? 0.000001 : 
                              symbol === 'BRAUM' ? 0.000001 : 0.00001;
        
        prices[symbol] = {
          source: 'Bonding Curve (Est.)',
          priceUSD: fallbackPrice * ethPriceUSD,
          priceETH: fallbackPrice,
          address,
          note: 'Estimated from bonding curve'
        };
      }
    }
    
    // Return combined prices
    res.status(200).json({ prices, fetchedAt: timestamp });
    
  } catch (error) {
    console.error('All prices API error:', error);
    
    // Return fallback prices on error
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
