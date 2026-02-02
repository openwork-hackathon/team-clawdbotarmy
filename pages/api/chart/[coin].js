import { getMarketChart } from '../../../src/api/market';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function handler(req, res) {
  // Support both GET and POST
  let coin, days = 7, timeframe = '1d';
  
  if (req.method === 'POST') {
    const body = req.body || {};
    coin = body.coin;
    days = body.days || 7;
    timeframe = body.timeframe || '1d';
  } else {
    // GET with query params
    coin = req.query.coin;
    days = parseInt(req.query.days) || 7;
    timeframe = req.query.timeframe || '1d';
  }
  
  if (!coin) {
    return res.status(400).json({ error: 'Missing coin parameter' });
  }
  
  try {
    const prices = await getMarketChart(coin, days, timeframe);
    
    // Force no-cache
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.setHeader('Surrogate-Control', 'no-store');
    
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
