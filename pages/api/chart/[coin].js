import { getMarketChart } from '../../../src/api/market';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function handler(req, res) {
  const { coin } = req.query;
  const days = parseInt(req.query.days) || 7;
  const timeframe = req.query.timeframe || '1d';
  const nonce = req.query._ || Date.now(); // Unique per-request identifier
  
  if (!coin) {
    return res.status(400).json({ error: 'Missing coin parameter' });
  }
  
  try {
    const prices = await getMarketChart(coin, days, timeframe, nonce);
    
    // Force no-cache
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    
    res.status(200).json({ 
      coin, 
      prices: prices || [], 
      timeframe,
      fetchedAt: Date.now()
    });
  } catch (error) {
    console.error('Chart API error:', error);
    res.status(500).json({ error: 'Failed to fetch chart data' });
  }
}
