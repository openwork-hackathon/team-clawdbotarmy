import { getCurveState, executeTrade, getTokenPrice, getAllCurveStates, getTokenInfo, getAllTokens } from '../../src/utils/bondingCurve';

export default async function handler(req, res) {
  // GET /api/bonding-curve - Get all curve states or specific token
  if (req.method === 'GET') {
    const { token } = req.query;
    
    if (token) {
      const state = getCurveState(token);
      if (!state) {
        return res.status(404).json({ error: 'Token not found' });
      }
      return res.status(200).json(state);
    }
    
    // Return all tokens
    return res.status(200).json(getAllCurveStates());
  }
  
  // POST /api/bonding-curve - Execute a trade
  if (req.method === 'POST') {
    const { type, amount, token } = req.body;
    
    if (!type || !amount || !token) {
      return res.status(400).json({ error: 'Missing type, amount, or token' });
    }
    
    try {
      const result = executeTrade(type, amount, token);
      return res.status(200).json(result);
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  }
  
  // GET /api/bonding-curve/tokens - Get all supported tokens
  if (req.method === 'GET' && req.query.tokens !== undefined) {
    return res.status(200).json(getAllTokens());
  }
  
  return res.status(405).json({ error: 'Method not allowed' });
}
