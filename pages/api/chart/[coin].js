import { getMarketChart } from '../../../src/api/market';

export default async function handler(req, res) {
  const { coin } = req.query;
  const days = parseInt(req.query.days) || 7;
  const timeframe = req.query.timeframe || '1d';
  
  const prices = await getMarketChart(coin, days, timeframe);
  res.status(200).json({ coin, prices, timeframe });
}
