// Deploy BLOODY token with Clanker
// Fee: 2% | Keep supply for team

import { Clanker } from 'clanker-sdk';
import { createPublicClient, createWalletClient, http, type PublicClient } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { base } from 'viem/chains';

// Configuration
const PRIVATE_KEY = process.env.PRIVATE_KEY as `0x${string}`;
const TOKEN_NAME = 'Bloody';
const TOKEN_SYMBOL = 'BLOODY';

// Fee configuration: 2% total (instead of 20% Bankr default)
// 98% to creator, 2% fee
const REWARDS_BPS = 9800; // 98%
const FEE_BPS = 200;      // 2%

if (!PRIVATE_KEY) {
  console.error('❌ Error: PRIVATE_KEY not set');
  console.log('Run: export PRIVATE_KEY=your_private_key');
  process.exit(1);
}

const account = privateKeyToAccount(PRIVATE_KEY);
console.log(`📝 Deployer: ${account.address}`);

const publicClient = createPublicClient({
  chain: base,
  transport: http(),
}) as PublicClient;

const wallet = createWalletClient({
  account,
  chain: base,
  transport: http(),
});

const clanker = new Clanker({ wallet, publicClient });

// Check ETH balance
const balance = await publicClient.getBalance({ address: account.address });
console.log(`💰 ETH Balance: ${Number(balance) / 1e18} ETH`);

if (balance < 1n * 10n ** 15n) { // Less than 0.001 ETH
  console.warn('⚠️  Warning: Low ETH balance. Need ~0.01 ETH for gas.');
}

async function main() {
  console.log(`\n🚀 Deploying ${TOKEN_NAME} (${TOKEN_SYMBOL}) on Base...`);
  console.log(`   Fee: ${FEE_BPS / 100}% | Supply: Team kept\n`);

  const { txHash, waitForTransaction, error } = await clanker.deploy({
    chainId: base.id,
    name: TOKEN_NAME,
    symbol: TOKEN_SYMBOL,
    // Use a simple color placeholder image (no IPFS needed for basic deploy)
    image: 'https://ipfs.io/ipfs/bafybeiav3j7n2vf2piq6waz5twh3f7kwvy6wivs6hwxp72xmqkw6gpm7ju',
    tokenAdmin: account.address,
    
    metadata: {
      description: `${TOKEN_NAME} - AI Agent Token. Built by ClawdbotArmy.`,
      socialMediaUrls: [
        { platform: 'twitter', url: 'https://twitter.com/clawdbot' },
      ],
    },
    
    context: {
      interface: 'Clanker SDK',
      platform: 'telegram',
    },
    
    // Keep 10% for team (vesting)
    vault: {
      percentage: 10,
      lockupDuration: 2592000,  // 30 days cliff
      vestingDuration: 5184000, // 60 days linear vesting
      recipient: account.address,
    },
    
    // No dev buy - keep all supply
    devBuy: {
      ethAmount: 0,
      recipient: account.address,
    },
    
    // Fee configuration: 2% total
    rewards: {
      recipients: [
        {
          recipient: account.address,
          admin: account.address,
          bps: REWARDS_BPS,  // 98% to creator
          token: 'Paired',   // Receive WETH from trades
        },
      ],
    },
    
    pool: {
      pairedToken: '0x4200000000000000000000000000000000000006', // WETH on Base
      positions: 'Standard',
    },
    
    fees: 'StaticBasic',
    vanity: true,
    
    sniperFees: {
      startingFee: 666_777,
      endingFee: 41_673,
      secondsToDecay: 15,
    },
  });

  if (error) {
    console.error('❌ Deployment failed:', error);
    process.exit(1);
  }

  console.log(`📤 Transaction: ${base.blockExplorers.default.url}/tx/${txHash}`);
  console.log('⏳ Waiting for confirmation...');

  const { address: tokenAddress, error: txError } = await waitForTransaction();

  if (txError) {
    console.error('❌ Transaction failed:', txError);
    process.exit(1);
  }

  console.log(`
✅ ${TOKEN_NAME} deployed successfully!

📍 Address: ${tokenAddress}
🔗 Basescan: https://basescan.org/token/${tokenAddress}
🐦 Twitter: https://twitter.com/intent/tweet?text=I+just+deployed+${TOKEN_SYMBOL}+on+Base+using+Clanker!

💰 Token Supply:
   - Total: 1B ${TOKEN_SYMBOL}
   - Team: 10% (vested)
   - Public: 90%
   
💵 Trading Fees:
   - Creator: ${REWARDS_BPS / 100}%
   - Fee: ${FEE_BPS / 100}%
   - Paired Token: WETH
`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
