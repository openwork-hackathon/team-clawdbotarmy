// Holdings API - Manage token holdings and transactions

const TOKENS = {
  ARYA: '0xcc78a1F8eCE2ce5ff78d2C0D0c8268ddDa5B6B07',
  OPENWORK: '0x299c30dd5974bf4d5bfe42c340ca40462816ab07',
  KROWNEPO: '0xAFe8861b074B8C2551055a20A2a4f39E45037B07',
  BRAUM: '0xefb28887A479029B065Cb931a973B97101209b07',
  ETH: '0x4200000000000000000000000000000000000006'
};

// In-memory holdings storage (would use database in production)
const holdingsDb = new Map();

function formatAddress(address) {
  return address.toLowerCase();
}

async function getHoldings(address) {
  const normalizedAddress = formatAddress(address);
  const holdings = holdingsDb.get(normalizedAddress) || {
    address: normalizedAddress,
    tokens: {},
    totalValueUSD: 0,
    lastUpdated: Date.now()
  };

  return holdings;
}

async function getTokenHoldings(address, symbol) {
  const holdings = await getHoldings(address);
  const normalizedSymbol = symbol.toUpperCase();
  
  return {
    symbol: normalizedSymbol,
    address: TOKENS[normalizedSymbol],
    balance: holdings.tokens[normalizedSymbol]?.balance || 0,
    valueUSD: holdings.tokens[normalizedSymbol]?.valueUSD || 0
  };
}

async function addHolding(address, symbol, amount, priceUSD) {
  const normalizedAddress = formatAddress(address);
  const normalizedSymbol = symbol.toUpperCase();
  
  let holdings = holdingsDb.get(normalizedAddress) || {
    address: normalizedAddress,
    tokens: {},
    totalValueUSD: 0,
    lastUpdated: Date.now()
  };

  const valueUSD = amount * priceUSD;
  
  if (!holdings.tokens[normalizedSymbol]) {
    holdings.tokens[normalizedSymbol] = {
      balance: 0,
      valueUSD: 0,
      transactions: []
    };
  }

  holdings.tokens[normalizedSymbol].balance += amount;
  holdings.tokens[normalizedSymbol].valueUSD += valueUSD;
  holdings.tokens[normalizedSymbol].transactions.push({
    type: 'buy',
    amount,
    priceUSD,
    valueUSD,
    timestamp: Date.now()
  });

  // Recalculate total
  holdings.totalValueUSD = Object.values(holdings.tokens)
    .reduce((sum, token) => sum + token.valueUSD, 0);
  
  holdings.lastUpdated = Date.now();
  holdingsDb.set(normalizedAddress, holdings);

  return holdings.tokens[normalizedSymbol];
}

async function removeHolding(address, symbol, amount, priceUSD) {
  const normalizedAddress = formatAddress(address);
  const normalizedSymbol = symbol.toUpperCase();
  
  const holdings = holdingsDb.get(normalizedAddress);
  if (!holdings || !holdings.tokens[normalizedSymbol]) {
    throw new Error(`No holdings found for ${symbol}`);
  }

  const valueUSD = amount * priceUSD;
  
  holdings.tokens[normalizedSymbol].balance -= amount;
  holdings.tokens[normalizedSymbol].valueUSD -= valueUSD;
  holdings.tokens[normalizedSymbol].transactions.push({
    type: 'sell',
    amount,
    priceUSD,
    valueUSD,
    timestamp: Date.now()
  });

  // Recalculate total
  holdings.totalValueUSD = Object.values(holdings.tokens)
    .reduce((sum, token) => sum + token.valueUSD, 0);
  
  holdings.lastUpdated = Date.now();
  holdingsDb.set(normalizedAddress, holdings);

  return holdings.tokens[normalizedSymbol];
}

async function getTransactionHistory(address, symbol = null) {
  const normalizedAddress = formatAddress(address);
  const holdings = holdingsDb.get(normalizedAddress);
  
  if (!holdings) {
    return [];
  }

  let allTransactions = [];
  
  for (const [tokenSymbol, tokenData] of Object.entries(holdings.tokens)) {
    if (symbol && tokenSymbol !== symbol.toUpperCase()) continue;
    
    allTransactions = allTransactions.concat(
      tokenData.transactions.map(tx => ({
        ...tx,
        symbol: tokenSymbol
      }))
    );
  }

  return allTransactions.sort((a, b) => b.timestamp - a.timestamp);
}

async function getPortfolioSummary(address) {
  const holdings = await getHoldings(address);
  
  const summary = {
    address: holdings.address,
    totalValueUSD: holdings.totalValueUSD,
    tokenCount: Object.keys(holdings.tokens).length,
    lastUpdated: holdings.lastUpdated,
    tokens: []
  };

  for (const [symbol, tokenData] of Object.entries(holdings.tokens)) {
    summary.tokens.push({
      symbol,
      balance: tokenData.balance,
      valueUSD: tokenData.valueUSD,
      transactionCount: tokenData.transactions.length
    });
  }

  // Calculate allocation percentages
  if (summary.totalValueUSD > 0) {
    summary.allocation = summary.tokens.map(token => ({
      symbol: token.symbol,
      percentage: (token.valueUSD / summary.totalValueUSD) * 100
    }));
  }

  return summary;
}

export {
  getHoldings,
  getTokenHoldings,
  addHolding,
  removeHolding,
  getTransactionHistory,
  getPortfolioSummary,
  TOKENS
};
