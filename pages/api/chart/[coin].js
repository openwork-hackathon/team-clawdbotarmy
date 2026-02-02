import { getMarketChart } from '../../../src/api/market';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  const { coin, days = 7, timeframe = '1d' } = req.body;
  
  if (!coin) {
    return res.status(400).json({ error: 'Missing coin parameter' });
  }
  
  try {
    const prices = await getMarketChart(coin, days, timeframe);
    
    res.setHeader('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    
    res.status(200).json({ 
      coin, 
      prices: prices || [], 
      timeframe,
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('Chart API error:', error);
    res.status(500).json({ error: 'Failed to fetch chart data' });
  }
}
