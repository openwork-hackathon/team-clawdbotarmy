import { getMarketChart } from '../../../src/api/market';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function handler(req, res) {
  const { coin } = req.query;
  const days = parseInt(req.query.days) || 7;
  const timeframe = req.query.timeframe || '1d';
  const _t = req.query._t || Date.now(); // Cache buster
  
  const prices = await getMarketChart(coin, days, timeframe);
  
  // Force no-cache headers
  res.setHeader('Cache-Control', 'private, no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.status(200).json({ coin, prices, timeframe });
}
