// Deploy Bonding Curve Token via Clanker SDK
// Cheapest option: ~0.0001 ETH (token + Uniswap V4 pool in 1 tx)

import { Clanker } from 'clanker-sdk';
import { createPublicClient, createWalletClient, http } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { base } from 'viem/chains';

const PRIVATE_KEY = process.env.PRIVATE_KEY; // Set this!
const RPC_URL = process.env.RPC_URL || 'https://base-mainnet.public.blastapi.io';

const account = privateKeyToAccount(PRIVATE_KEY);

const publicClient = createPublicClient({
  chain: base,
  transport: http(RPC_URL),
});

const wallet = createWalletClient({
  chain: base,
  transport: http(RPC_URL),
  account,
});

async function deployBondingCurveToken() {
  console.log('=== Deploying Bonding Curve Token via Clanker ===');
  console.log('Wallet:', account.address);

  try {
    // Deploy token with bonding curve (Uniswap V4 pool)
    const deployResult = await Clanker.deployToken({
      client: publicClient,
      wallet,
      token: {
        name: 'BondingCurve',
        symbol: 'BCV',
        description: 'Minimal bonding curve token',
        image: '', // Optional IPFS URL
        deployer: account.address,
      },
      // Initial liquidity
      initialEth: 0.01,  // 0.01 ETH initial reserve
      initialTokens: 1000000,  // 1M tokens
    });

    console.log('Deployment successful!');
    console.log('Token Address:', deployResult.tokenAddress);
    console.log('Pool Address:', deployResult.poolAddress);
    console.log('Clanker URL:', `https://www.clanker.world/trade/${deployResult.tokenAddress}`);

    return deployResult;
  } catch (error) {
    console.error('Deployment failed:', error.message);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  if (!PRIVATE_KEY) {
    console.error('Error: Set PRIVATE_KEY env variable');
    console.log('PRIVATE_KEY=0x... node deploy-clanker.js');
    process.exit(1);
  }
  deployBondingCurveToken()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

export { deployBondingCurveToken };
