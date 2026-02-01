// Deployment script for OpenWorkBondingCurve on Base
// Using Foundry: forge create --rpc-url base --private-key $PRIVATE_KEY

const { ethers } = require("ethers");

// Configuration for OPENWORK
const OPENWORK_TOKEN = process.env.OPENWORK_TOKEN || "0x0000000000000000000000000000000000000000"; // Set when deployed
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const RPC_URL = process.env.RPC_URL || "https://mainnet.base.org";

async function main() {
  console.log("🚀 Deploying OpenWorkBondingCurve to Base...");
  
  if (!PRIVATE_KEY) {
    console.error("❌ Error: PRIVATE_KEY not set");
    console.log("Run: export PRIVATE_KEY=your_private_key");
    process.exit(1);
  }
  
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
  console.log(`📝 Deployer: ${wallet.address}`);
  
  const balance = await provider.getBalance(wallet.address);
  console.log(`💰 Balance: ${ethers.formatEther(balance)} ETH`);
  
  console.log("📦 Compiling contract...");
  
  const OpenWorkBondingCurve = await ethers.getContractFactory("OpenWorkBondingCurve");
  
  console.log("⏳ Deploying...");
  const contract = await OpenWorkBondingCurve.deploy(OPENWORK_TOKEN);
  
  await contract.waitForDeployment();
  const contractAddress = await contract.getAddress();
  
  console.log(`
✅ OpenWorkBondingCurve deployed successfully!

Contract: ${contractAddress}
Token:    ${OPENWORK_TOKEN}
Network:  Base Mainnet

Token Parameters:
- Initial Supply: 5M OPENWORK
- Max Supply: 50M OPENWORK
- Slope (a): 0.000001 ETH
- Base Price (b): 0.0001 ETH
- Migration Threshold: 50 ETH

Next steps:
1. Set OPENWORK token address when deploying
2. Verify on Basescan
3. Add initial liquidity
4. Update frontend config

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
