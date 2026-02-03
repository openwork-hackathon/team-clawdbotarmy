// ETH Price API

export default async function handler(req, res) {
  const timestamp = Date.now();
  
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  
  try {
    // Fetch ETH price from CoinGecko
    const response = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd',
      { signal: AbortSignal.timeout(5000) }
    );
    const data = await response.json();
    
    const priceUSD = data.ethereum?.usd || 3000;
    
    res.status(200).json({
      source: 'CoinGecko',
      priceUSD,
      priceETH: 1,
      fetchedAt: timestamp
    });
    
  } catch (error) {
    console.error('ETH price error:', error);
    
    res.status(200).json({
      source: 'Fallback',
      priceUSD: 3000,
      priceETH: 1,
      fetchedAt: timestamp
    });
  }
}
