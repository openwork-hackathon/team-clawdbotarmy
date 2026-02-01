import { getCurveState, executeTrade, getTokenPrice } from '../../utils/bondingCurve';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    // Return current bonding curve state
    const state = getCurveState();
    const price = getTokenPrice(state.supply);
    
    return res.status(200).json({
      ...state,
      currentPrice: price,
      token: 'ARYA',
      curveType: 'linear',
      formula: 'price = 0.00001 * supply + 0.5 ETH'
    });
  }
  
  if (req.method === 'POST') {
    const { type, amount, token } = req.body;
    
    if (!type || !amount) {
      return res.status(400).json({ error: 'Missing type or amount' });
    }
    
    try {
      const result = executeTrade(type, amount, token || 'ARYA');
      return res.status(200).json(result);
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  }
  
  return res.status(405).json({ error: 'Method not allowed' });
}
