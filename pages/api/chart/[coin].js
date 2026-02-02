import { getMarketChart } from '../../../src/api/market';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function handler(req, res) {
  const { coin } = req.query;
  const days = parseInt(req.query.days) || 7;
  const timeframe = req.query.timeframe || '1d';
  
  const prices = await getMarketChart(coin, days, timeframe);
  
  // Disable caching for development
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.status(200).json({ coin, prices, timeframe, fetchedAt: new Date().toISOString() });
}
