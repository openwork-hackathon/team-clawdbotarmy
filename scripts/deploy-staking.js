#!/usr/bin/env node
/**
 * Deploy Staking Contract to Base using ethers.js
 * 
 * Usage:
 *   node deploy-staking.js --private-key <key> --openwork-token <addr> --reward-token <addr>
 * 
 * Or set environment variables:
 *   export PRIVATE_KEY=...
 *   export OPENWORK_TOKEN=...
 *   export REWARD_TOKEN=...
 *   node deploy-staking.js
 */

const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');

// Configuration
const ARYA_TOKEN = '0xcc78a1F8eCE2ce5ff78d2C0D0c8268ddDa5B6B07';
const BASE_RPC = 'https://mainnet.base.org';

// Get command line args or env vars
const args = process.argv.slice(2);
const privateKey = args.find(a => a.startsWith('--private-key='))?.split('=')[1] || process.env.PRIVATE_KEY;
const openworkToken = args.find(a => a.startsWith('--openwork-token='))?.split('=')[1] || process.env.OPENWORK_TOKEN || ARYA_TOKEN;
const rewardToken = args.find(a => a.startsWith('--reward-token='))?.split('=')[1] || process.env.REWARD_TOKEN || ARYA_TOKEN;

async function main() {
  console.log('🚀 Deploying AryaOpenWorkStaking to Base...\n');
  
  if (!privateKey) {
    console.error('❌ Error: PRIVATE_KEY required');
    console.log('Usage:');
    console.log('  node deploy-staking.js --private-key <key>');
    console.log('  Or set PRIVATE_KEY environment variable');
    process.exit(1);
  }
  
  // Connect to Base
  const provider = new ethers.JsonRpcProvider(BASE_RPC);
  const wallet = new ethers.Wallet(privateKey, provider);
  
  console.log('📝 Deployer:', wallet.address);
  
  // Check balance
  const balance = await provider.getBalance(wallet.address);
  console.log('💰 Balance:', ethers.formatEther(balance), 'ETH\n');
  
  if (balance < ethers.parseEther('0.01')) {
    console.warn('⚠️  Warning: Low balance! Need at least 0.01 ETH for deployment');
  }
  
  // Load contract bytecode (simplified - in production, compile first)
  console.log('📦 Preparing contract deployment...');
  
  // For now, this is a placeholder. In production:
  // 1. Compile contracts with solc or forge
  // 2. Load ABI and bytecode
  // 3. Deploy using ethers.ContractFactory
  
  console.log('');
  console.log('✅ Deployment prepared!');
  console.log('');
  console.log('To deploy, you need:');
  console.log('1. Foundry installed: curl -L https://foundry.paradigm.xyz | bash');
  console.log('2. Run: forge script script/DeployStakingContract.s.sol --rpc-url base --broadcast');
  console.log('');
  console.log('Or use Remix IDE:');
  console.log('1. Go to https://remix.ethereum.org');
  console.log('2. Load contracts/AryaOpenWorkStaking.sol');
  console.log('3. Compile and deploy to Base network');
  console.log('');
  console.log('Token Configuration:');
  console.log('  ARYA Token:', ARYA_TOKEN);
  console.log('  OPENWORK Token:', openworkToken);
  console.log('  Reward Token:', rewardToken);
}

main().catch(console.error);
