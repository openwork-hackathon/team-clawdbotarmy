// Transaction history management
// In-memory store for demo (would use database in production)

const transactions = [];

/**
 * Record a new transaction
 */
export function recordTransaction(tx) {
  const transaction = {
    id: tx.id || Math.random().toString(36).substring(2, 10).toUpperCase(),
    type: tx.type, // 'trade', 'swap', 'transfer'
    symbol: tx.symbol,
    side: tx.side, // 'BUY' or 'SELL'
    amount: parseFloat(tx.amount),
    price: parseFloat(tx.price),
    totalValue: parseFloat(tx.totalValue || tx.amount * tx.price),
    fee: parseFloat(tx.fee || 0),
    status: tx.status || 'pending',
    hash: tx.hash || null,
    timestamp: tx.timestamp || new Date().toISOString(),
    address: tx.address || null
  };
  
  transactions.unshift(transaction); // Add to beginning
  
  // Keep only last 100 transactions
  if (transactions.length > 100) {
    transactions.pop();
  }
  
  return transaction;
}

/**
 * Get transaction history
 */
export function getTransactions(filters = {}) {
  let results = [...transactions];
  
  // Filter by address
  if (filters.address) {
    results = results.filter(tx => 
      tx.address && tx.address.toLowerCase() === filters.address.toLowerCase()
    );
  }
  
  // Filter by symbol
  if (filters.symbol) {
    results = results.filter(tx => 
      tx.symbol && tx.symbol.toUpperCase() === filters.symbol.toUpperCase()
    );
  }
  
  // Filter by type
  if (filters.type) {
    results = results.filter(tx => tx.type === filters.type);
  }
  
  // Filter by status
  if (filters.status) {
    results = results.filter(tx => tx.status === filters.status);
  }
  
  // Limit results
  const limit = parseInt(filters.limit) || 20;
  return results.slice(0, limit);
}

/**
 * Get transaction by ID
 */
export function getTransactionById(id) {
  return transactions.find(tx => tx.id === id);
}

/**
 * Update transaction status
 */
export function updateTransaction(id, updates) {
  const tx = transactions.find(t => t.id === id);
  if (!tx) return null;
  
  Object.assign(tx, updates, {
    updatedAt: new Date().toISOString()
  });
  
  return tx;
}

/**
 * Get transaction stats
 */
export function getTransactionStats(address = null) {
  let txs = address 
    ? transactions.filter(tx => tx.address?.toLowerCase() === address.toLowerCase())
    : transactions;
  
  const totalTrades = txs.length;
  const totalVolume = txs.reduce((sum, tx) => sum + tx.totalValue, 0);
  const totalFees = txs.reduce((sum, tx) => sum + tx.fee, 0);
  
  const buyCount = txs.filter(tx => tx.side === 'BUY').length;
  const sellCount = txs.filter(tx => tx.side === 'SELL').length;
  
  return {
    totalTrades,
    buyCount,
    sellCount,
    totalVolume: totalVolume.toFixed(2),
    totalFees: totalFees.toFixed(2),
    avgTradeSize: totalTrades > 0 ? (totalVolume / totalTrades).toFixed(2) : 0
  };
}

/**
 * Clear all transactions (for testing)
 */
export function clearTransactions() {
  transactions.length = 0;
}
