import { getPortfolio } from '../../src/api/portfolio';

export default async function handler(req, res) {
  const { address } = req.query;
  if (!address) {
    return res.status(400).json({ error: 'Address required' });
  }
  const data = await getPortfolio(address);
  res.status(200).json(data);
}
