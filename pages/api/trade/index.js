// Mock trade execution - in production, connect to Bankr or exchange API

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { symbol, side, amount } = req.body;
  
  if (!symbol || !side || !amount) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Mock order response
  const orderId = Math.random().toString(36).substring(2, 10).toUpperCase();
  const prices = { BTC: 78000, ETH: 2400, SOL: 105 };
  
  res.status(200).json({
    orderId,
    symbol,
    side,
    amount: parseFloat(amount),
    price: prices[symbol] || 0,
    timestamp: new Date().toISOString(),
    status: 'submitted'
  });
}
