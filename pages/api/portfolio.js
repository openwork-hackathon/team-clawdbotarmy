import { createPublicClient, http, formatEther, erc20Abi } from 'viem';
import { mainnet, base } from 'viem/chains';

const TOKENS = {
  1: {
    '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599': { symbol: 'WBTC', decimals: 8 },
    '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2': { symbol: 'WETH', decimals: 18 },
    '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48': { symbol: 'USDC', decimals: 6 },
    '0x6B175474E89094C44Da98b954EedeAC495271d0F': { symbol: 'DAI', decimals: 18 },
  },
  8453: {
    '0xcbB7e0000d1F07089cEe3faDcDa0eD23B11dB3A4': { symbol: 'WBTC', decimals: 8 },
    '0x4200000000000000000000000000000000000006': { symbol: 'WETH', decimals: 18 },
    '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913': { symbol: 'USDC', decimals: 6 },
    '0x299c30DD5974BF4D5bFE42C340CA40462816AB07': { symbol: 'OPENWORK', decimals: 18 },
  }
};

async function getTokenBalance(client, tokenAddress, address, decimals) {
  try {
    const balance = await client.readContract({
      address: tokenAddress,
      abi: erc20Abi,
      functionName: 'balanceOf',
      args: [address]
    });
    return parseFloat(formatEther(balance, decimals));
  } catch (e) {
    return 0;
  }
}

async function getNativeBalance(client, address) {
  try {
    const balance = await client.getBalance({ address });
    return parseFloat(formatEther(balance));
  } catch (e) {
    return 0;
  }
}

export default async function handler(req, res) {
  const { address, chainId = 1 } = req.query;
  
  if (!address || !address.startsWith('0x')) {
    return res.status(400).json({ error: 'Invalid wallet address' });
  }

  try {
    const chain = chainId == 8453 ? base : mainnet;
    const client = createPublicClient({
      chain,
      transport: http()
    });

    const nativeBalance = await getNativeBalance(client, address);
    const chainTokens = TOKENS[chainId] || TOKENS[1];
    const holdings = [];
    
    for (const [tokenAddr, tokenInfo] of Object.entries(chainTokens)) {
      const balance = await getTokenBalance(client, tokenAddr, address, tokenInfo.decimals);
      
      if (balance > 0) {
        const price = await getTokenPrice(tokenInfo.symbol.toLowerCase());
        
        holdings.push({
          symbol: tokenInfo.symbol,
          amount: balance,
          price,
          value: balance * price
        });
      }
    }

    if (nativeBalance > 0) {
      const ethPrice = await getTokenPrice('ethereum');
      holdings.push({
        symbol: chainId == 8453 ? 'ETH' : 'ETH',
        amount: nativeBalance,
        price: ethPrice,
        value: nativeBalance * ethPrice
      });
    }

    const totalValue = holdings.reduce((sum, h) => sum + h.value, 0);

    res.status(200).json({
      address,
      chainId: parseInt(chainId),
      holdings,
      totalValue,
      lastUpdated: new Date().toISOString()
    });
  } catch (error) {
    console.error('Portfolio error:', error);
    res.status(500).json({ error: 'Failed to fetch portfolio' });
  }
}

async function getTokenPrice(tokenId) {
  try {
    const response = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${tokenId}&vs_currencies=usd`
    );
    const data = await response.json();
    return data[tokenId]?.usd || 0;
  } catch (e) {
    return 0;
  }
}
