import { getDashboard } from '../../../src/api/analysis';

export default async function handler(req, res) {
  const data = await getDashboard();
  res.status(200).json(data);
}
