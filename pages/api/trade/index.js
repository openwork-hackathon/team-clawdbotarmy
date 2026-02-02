// Trade execution API with proper validation and error handling
import { getAllPrices } from '../../../src/api/portfolio';
import { recordTransaction } from '../../../src/api/transactions';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { symbol, side, amount } = req.body;
  
  // Input validation
  if (!symbol || typeof symbol !== 'string') {
    return res.status(400).json({ error: 'Invalid symbol' });
  }
  
  if (!side || !['BUY', 'SELL'].includes(side.toUpperCase())) {
    return res.status(400).json({ error: 'Invalid side. Must be BUY or SELL' });
  }
  
  if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
    return res.status(400).json({ error: 'Invalid amount. Must be a positive number' });
  }

  const parsedAmount = parseFloat(amount);
  const normalizedSide = side.toUpperCase();

  try {
    // Get real-time prices from CoinGecko
    const prices = await getAllPrices();
    
    // Map symbol to CoinGecko ID
    const priceMap = {
      'BTC': prices['bitcoin']?.usd,
      'WBTC': prices['wrapped-bitcoin']?.usd,
      'ETH': prices['ethereum']?.usd,
      'SOL': prices['solana']?.usd,
      'USDC': 1, // Stablecoin
      'OPENWORK': prices['openwork-ai']?.usd || 0.00001
    };

    const price = priceMap[symbol.toUpperCase()];
    
    if (!price) {
      return res.status(400).json({ error: `Unsupported symbol: ${symbol}` });
    }

    // Generate order ID
    const orderId = Math.random().toString(36).substring(2, 10).toUpperCase();
    
    // Calculate trade details
    const totalValue = parsedAmount * price;
    const estimatedFee = totalValue * 0.001; // 0.1% fee
    
    const timestamp = new Date().toISOString();

    // Record transaction
    const transaction = recordTransaction({
      id: orderId,
      type: 'trade',
      symbol: symbol.toUpperCase(),
      side: normalizedSide,
      amount: parsedAmount,
      price,
      totalValue,
      fee: estimatedFee,
      status: 'completed',
      timestamp,
      address: req.body.address || null
    });

    res.status(200).json({
      ...transaction,
      note: 'This is a simulated trade. Connect wallet for real execution.'
    });
  } catch (error) {
    console.error('Trade API error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
}
