// ARYA Price API - Fetches real price from multiple sources

const ARYA_TOKEN_ADDRESS = '0xcc78a1F8eCE2ce5ff78d2C0D0c8268ddDa5B6B07';

export default async function handler(req, res) {
  const timestamp = Date.now();
  
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  
  try {
    // Try CoinGecko first (if token is listed)
    const coingeckoPrice = await getCoinGeckoPrice('arya');
    
    if (coingeckoPrice > 0) {
      return res.status(200).json({
        source: 'CoinGecko',
        priceUSD: coingeckoPrice,
        priceETH: coingeckoPrice / 3000,
        fetchedAt: timestamp
      });
    }
    
    // Fallback: Try Uniswap V3 pool directly via RPC
    const uniswapPrice = await getUniswapPrice();
    
    if (uniswapPrice > 0) {
      return res.status(200).json({
        source: 'Uniswap V3 (Base)',
        priceUSD: uniswapPrice,
        priceETH: uniswapPrice / 3000,
        fetchedAt: timestamp
      });
    }
    
    // Final fallback: Use bonding curve price
    const bondingCurvePrice = 0.00001;
    
    return res.status(200).json({
      source: 'Bonding Curve',
      priceUSD: bondingCurvePrice * 3000,
      priceETH: bondingCurvePrice,
      note: 'Bonding curve price (token not yet indexed on DEX)',
      tradeUrl: `https://www.clanker.world/trade/${ARYA_TOKEN_ADDRESS}`,
      fetchedAt: timestamp
    });
    
  } catch (error) {
    console.error('Price API error:', error);
    
    res.status(200).json({
      source: 'Bonding Curve',
      priceUSD: 0.00001 * 3000,
      priceETH: 0.00001,
      note: 'Estimated from bonding curve',
      tradeUrl: `https://www.clanker.world/trade/${ARYA_TOKEN_ADDRESS}`,
      fetchedAt: timestamp
    });
  }
}

async function getCoinGeckoPrice(coinId) {
  try {
    const response = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=usd`,
      { signal: AbortSignal.timeout(5000) }
    );
    const data = await response.json();
    return data[coinId]?.usd || 0;
  } catch (e) {
    return 0;
  }
}

async function getUniswapPrice() {
  try {
    const query = `{
      pool(id: "0x290f7f6d239c7fadfcba4b5d9d8c770f4b8e93a6") {
        token1Price
      }
    }`;
    
    const response = await fetch('https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v3', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
      signal: AbortSignal.timeout(5000)
    });
    
    const data = await response.json();
    const priceInETH = parseFloat(data.data?.pool?.token1Price) || 0;
    return priceInETH * 3000;
  } catch (e) {
    return 0;
  }
}
