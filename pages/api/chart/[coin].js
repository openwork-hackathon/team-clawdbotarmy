import { getMarketChart } from '../../../../src/api/market';

export default async function handler(req, res) {
  const { coin } = req.query;
  const prices = await getMarketChart(coin, parseInt(req.query.days) || 7);
  res.status(200).json({ coin, prices });
}
