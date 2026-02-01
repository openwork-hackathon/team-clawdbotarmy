// Deployment script for AryaBondingCurve on Base
// Using Foundry: forge create --rpc-url base --private-key $PRIVATE_KEY

import { ethers } from "ethers";

// Configuration
const ARYA_TOKEN = "0xcc78a1F8eCE2ce5ff78d2C0D0c8268ddDa5B6B07"; // ARYA on Base
const PRIVATE_KEY = process.env.PRIVATE_KEY; // Deployer private key
const RPC_URL = process.env.RPC_URL || "https://mainnet.base.org";

async function main() {
  console.log("🚀 Deploying AryaBondingCurve to Base...");
  
  // Connect to provider
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
  console.log(`📝 Deployer: ${wallet.address}`);
  
  // Get current ETH balance
  const balance = await provider.getBalance(wallet.address);
  console.log(`💰 Balance: ${ethers.formatEther(balance)} ETH`);
  
  // Compile first (run `forge build` or `npm run compile`)
  console.log("📦 Compiling contract...");
  
  // Get contract factory
  const AryaBondingCurve = await ethers.getContractFactory("AryaBondingCurve");
  
  // Deploy
  console.log("⏳ Deploying...");
  const contract = await AryaBondingCurve.deploy(ARYA_TOKEN);
  
  await contract.waitForDeployment();
  const contractAddress = await contract.getAddress();
  
  console.log(`
✅ AryaBondingCurve deployed successfully!

Contract: ${contractAddress}
Token:    ${ARYA_TOKEN}
Network:  Base Mainnet

Next steps:
1. Verify on Basescan: npx hardhat verify --network base ${contractAddress} ${ARYA_TOKEN}
2. Add initial liquidity (optional)
3. Update frontend config with new contract address
4. Enable migration when ready

Explorer: https://basescan.org/address/${contractAddress}
  `);
  
  return contractAddress;
}

main()
  .then((address) => {
    console.log("🎉 Deployment complete!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
