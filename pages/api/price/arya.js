// ARYA Price API - Fetches real price from Uniswap V3 on Base
// Returns price in USD and ETH from the actual trading pair

const UNISWAP_GRAPHQL_URL = 'https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v3';
const ARYA_TOKEN_ADDRESS = '0xcc78a1F8eCE2ce5ff78d2C0D0c8268ddDa5B6B07';
const WETH_ADDRESS = '0x4200000000000000000000000000000000000006';

export default async function handler(req, res) {
  const timestamp = Date.now();
  const nonce = Math.random().toString(36).substring(7);
  
  // Set no-cache headers
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  
  try {
    // Fetch ARYA-WETH pool data from Uniswap V3 subgraph
    const query = `
      {
        pool(id: "0x290f7f6d239c7fadfcba4b5d9d8c770f4b8e93a6") {
          token0Price
          token1Price
          volumeToken0
          volumeToken1
          feeTier
        }
        token(id: "${ARYA_TOKEN_ADDRESS.toLowerCase()}") {
          symbol
          name
          decimals
          derivedETH
        }
      }
    `;
    
    const response = await fetch(UNISWAP_GRAPHQL_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query }),
    });
    
    const data = await response.json();
    
    if (data.data?.pool) {
      const pool = data.data.pool;
      const priceInETH = parseFloat(pool.token1Price) || 0;
      const priceInUSD = priceInETH * 3000; // Approximate USD from ETH price
      
      res.status(200).json({
        source: 'Uniswap V3 (Base)',
        priceETH: priceInETH,
        priceUSD: priceInUSD,
        volume24h: parseFloat(pool.volumeToken1) || 0,
        feeTier: pool.feeTier,
        fetchedAt: timestamp
      });
    } else {
      // Pool not found or not yet on subgraph
      res.status(200).json({
        source: 'Uniswap V3 (Base)',
        priceETH: null,
        priceUSD: null,
        note: 'Token not yet indexed on Uniswap subgraph',
        addTokenUrl: `https://app.uniswap.org/#/add/v3/ETH/${ARYA_TOKEN_ADDRESS}`,
        tradeUrl: `https://app.uniswap.org/swap?chain=base&inputCurrency=ETH&outputCurrency=${ARYA_TOKEN_ADDRESS}`,
        fetchedAt: timestamp
      });
    }
  } catch (error) {
    console.error('Price API error:', error);
    
    // Fallback - return empty with trade links
    res.status(200).json({
      source: 'Uniswap V3 (Base)',
      priceETH: null,
      priceUSD: null,
      error: 'Unable to fetch price',
      tradeUrl: `https://app.uniswap.org/swap?chain=base&inputCurrency=ETH&outputCurrency=${ARYA_TOKEN_ADDRESS}`,
      fetchedAt: timestamp
    });
  }
}
