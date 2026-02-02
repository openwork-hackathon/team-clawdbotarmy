// Transaction history API
import { 
  getTransactions, 
  getTransactionById, 
  getTransactionStats 
} from '../../src/api/transactions';

export default function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id, address, symbol, type, status, limit, stats } = req.query;

  try {
    // Get specific transaction by ID
    if (id) {
      const tx = getTransactionById(id);
      if (!tx) {
        return res.status(404).json({ error: 'Transaction not found' });
      }
      return res.status(200).json(tx);
    }

    // Get transaction stats
    if (stats === 'true') {
      const statsData = getTransactionStats(address);
      return res.status(200).json(statsData);
    }

    // Get filtered transaction list
    const filters = { address, symbol, type, status, limit };
    const transactions = getTransactions(filters);

    res.status(200).json({
      count: transactions.length,
      transactions
    });
  } catch (error) {
    console.error('Transactions API error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
}
