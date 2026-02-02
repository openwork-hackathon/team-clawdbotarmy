/**
 * AryaOpenWorkStaking Deployment Script
 * 
 * Usage:
 *   node scripts/deploy.js
 * 
 * Environment variables required in .env:
 *   PRIVATE_KEY=0x... (your wallet private key)
 *   BASE_RPC_URL=https://mainnet.base.org
 */

const { createWalletClient, http, parseEther } = require('viem');
const { privateKeyToAccount } = require('viem/accounts');
require('dotenv').config();

// Contract ABIs (minimal for deployment)
const STAKING_ABI = [
  {
    "inputs": [
      { "internalType": "address", "name": "_aryaToken", "type": "address" },
      { "internalType": "address", "name": "_openworkToken", "type": "address" },
      { "internalType": "address", "name": "_rewardToken", "type": "address" }
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  }
];

// Contract bytecode (this will be filled when compiling)
const STAKING_BYTECODE = "0x..."; // Replace with actual bytecode

// Configuration
const ARYA_TOKEN = "0xcc78a1F8eCE2ce5ff78d2C0D0c8268ddDa5B6B07";
const OPENWORK_TOKEN = "0x299c30dd5974bf4d5bfe42c340ca40462816ab07";

async function main() {
  console.log("🚀 AryaOpenWorkStaking Deployment\n");
  
  // Check environment
  if (!process.env.PRIVATE_KEY) {
    console.log("❌ Error: PRIVATE_KEY not set in .env");
    console.log("\n📝 Setup:");
    console.log("1. Copy .env.example to .env");
    console.log("2. Add your PRIVATE_KEY to .env");
    console.log("3. Run: node scripts/deploy.js\n");
    process.exit(1);
  }

  const RPC_URL = process.env.BASE_RPC_URL || "https://mainnet.base.org";
  const PRIVATE_KEY = process.env.PRIVATE_KEY;

  // Create wallet client
  const account = privateKeyToAccount(PRIVATE_KEY);
  const client = createWalletClient({
    account,
    transport: http(RPC_URL),
  });

  console.log(`👤 Deployer: ${account.address}`);
  
  // Get balance
  const balance = await client.getBalance({ address: account.address });
  console.log(`💰 Balance: ${parseEther(balance.toString()).toString()} ETH\n`);

  console.log("📋 Configuration:");
  console.log(`   ARYA Token: ${ARYA_TOKEN}`);
  console.log(`   OPENWORK Token: ${OPENWORK_TOKEN}`);
  console.log(`   Reward Token: ${ARYA_TOKEN}\n`);

  console.log("⚠️  IMPORTANT:");
  console.log("   This script requires the contract bytecode.");
  console.log("   Please compile the contract first using Foundry:");
  console.log("   ");
  console.log("   1. Install Foundry: curl -L https://foundry.paradigm.xyz | bash");
  console.log("   2. forge build");
  console.log("   3. forge create --rpc-url base --private-key $PRIVATE_KEY \\");
  console.log("      --constructor-args $ARYA_TOKEN $OPENWORK_TOKEN $ARYA_TOKEN \\");
  console.log("      src/AryaOpenWorkStaking.sol:AryaOpenWorkStaking");
  console.log("");

  // Simulate deployment check
  console.log("✅ Deployment script ready!");
  console.log("\n📖 After deployment, update contracts/README.md with:");
  console.log("   - Staking contract address");
  console.log("   - Deployment transaction hash");

  process.exit(0);
}

main().catch(console.error);
