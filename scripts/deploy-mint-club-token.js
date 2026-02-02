// Deploy a new Mint Club V2 token with bonding curve
// Usage: node scripts/deploy-mint-club-token.js

const { ethers } = require("ethers");

// Mint Club V2 Contracts on Base
const MCV2_BOND = "0xc5a076cad94176c2996B32d8466Be1cE757FAa27";
const MCV2_TOKEN = "0xAa70bC79fD1cB4a6FBA717018351F0C3c64B79Df";
const MCV2_ZAP = "0x91523b39813F3F4E406ECe406D0bEAaA9dE251fa";
const OPENWORK = "0x299c30DD5974BF4D5bFE42C340CA40462816AB07";

// Token configuration
const TOKEN_NAME = process.env.TOKEN_NAME || "Bloody";
const TOKEN_SYMBOL = process.env.TOKEN_SYMBOL || "BLOODY";

// Bonding curve configuration
// Keep more supply for team by having favorable initial pricing
const BOND_PARAMS = {
  mintRoyalty: 200,      // 2% mint royalty
  burnRoyalty: 200,      // 2% burn royalty  
  reserveToken: OPENWORK, // Backed by $OPENWORK
  maxSupply: ethers.parseEther("10000000"), // 10M max supply
  // Step 1: 100K supply at 0.001 OPENWORK each
  // Step 2: 500K supply at 0.005 OPENWORK each
  // Step 3: 1M supply at 0.01 OPENWORK each
  // ... up to 10M
  stepRanges: [
    ethers.parseEther("100000"),
    ethers.parseEther("500000"),
    ethers.parseEther("1000000"),
    ethers.parseEther("2000000"),
    ethers.parseEther("5000000"),
    ethers.parseEther("10000000"),
  ],
  stepPrices: [
    ethers.parseEther("0.001"),  // Very cheap initially
    ethers.parseEther("0.002"),
    ethers.parseEther("0.005"),
    ethers.parseEther("0.01"),
    ethers.parseEther("0.02"),
    ethers.parseEther("0.05"),
  ],
};

async function main() {
  console.log(`🚀 Deploying ${TOKEN_NAME} (${TOKEN_SYMBOL}) on Base...`);
  
  const PRIVATE_KEY = process.env.PRIVATE_KEY;
  const RPC_URL = process.env.RPC_URL || "https://mainnet.base.org";
  
  if (!PRIVATE_KEY) {
    console.error("❌ Error: PRIVATE_KEY not set");
    console.log("Run: export PRIVATE_KEY=your_private_key");
    process.exit(1);
  }
  
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
  console.log(`📝 Deployer: ${wallet.address}`);
  
  // Check $OPENWORK balance
  const openworkabi = ["function balanceOf(address) view returns (uint256)"];
  const openwork = new ethers.Contract(OPENWORK, openworkabi, provider);
  const openworkBalance = await openwork.balanceOf(wallet.address);
  console.log(`💰 $OPENWORK Balance: ${ethers.formatEther(openworkBalance)}`);
  
  if (BigInt(openworkBalance) < BigInt(ethers.parseEther("10000"))) {
    console.warn("⚠️  Warning: Low $OPENWORK balance. Need at least 10K for deployment.");
  }
  
  // Check ETH balance for gas
  const balance = await provider.getBalance(wallet.address);
  console.log(`💰 ETH Balance: ${ethers.formatEther(balance)} ETH`);
  
  if (BigInt(balance) < BigInt(ethers.parseEther("0.01"))) {
    console.warn("⚠️  Warning: Low ETH balance. Need ~0.01 ETH for gas.");
  }
  
  // Get Bond contract
  const bondabi = [
    "function createToken((string,string) tokenParams, (uint16,uint16,address,uint128,uint128[],uint128[]) bondParams) returns (address)",
    "function creationFee() view returns (uint256)",
    "function tokens(address) view returns (bool exists, string name, string symbol, address reserveToken, uint128 maxSupply, uint128 currentSupply, uint16 mintRoyalty, uint16 burnRoyalty)",
  ];
  const bond = new ethers.Contract(MCV2_BOND, bondabi, wallet);
  
  // Check creation fee
  const fee = await bond.creationFee();
  console.log(`📊 Creation fee: ${ethers.formatEther(fee)} ETH`);
  
  // Prepare parameters
  const tokenParams = {
    name: TOKEN_NAME,
    symbol: TOKEN_SYMBOL,
  };
  
  console.log("\n📋 Token Parameters:");
  console.log(`   Name: ${TOKEN_NAME}`);
  console.log(`   Symbol: ${TOKEN_SYMBOL}`);
  
  console.log("\n📋 Bonding Curve Parameters:");
  console.log(`   Max Supply: ${ethers.formatEther(BOND_PARAMS.maxSupply)}`);
  console.log(`   Reserve: $OPENWORK`);
  console.log(`   Mint Royalty: ${BOND_PARAMS.mintRoyalty / 100}%`);
  console.log(`   Burn Royalty: ${BOND_PARAMS.burnRoyalty / 100}%`);
  console.log(`   Steps: ${BOND_PARAMS.stepRanges.length}`);
  
  console.log("\n⏳ Creating token...");
  
  try {
    const tx = await bond.createToken(tokenParams, BOND_PARAMS, {
      value: fee,
    });
    console.log(`📤 Transaction: ${tx.hash}`);
    
    const receipt = await tx.wait();
    console.log(`✅ Token created! Block: ${receipt.blockNumber}`);
    
    // Find the token address from logs
    const tokenCreatedLog = receipt.logs.find(log => {
      try {
        const parsed = bond.interface.parseLog(log);
        return parsed?.name === "TokenCreated";
      } catch {
        return false;
      }
    });
    
    if (tokenCreatedLog) {
      const parsed = bond.interface.parseLog(tokenCreatedLog);
      const tokenAddress = parsed.args[0];
      console.log(`\n🎉 ${TOKEN_NAME} deployed successfully!`);
      console.log(`   Token Address: ${tokenAddress}`);
      console.log(`   Basescan: https://basescan.org/token/${tokenAddress}`);
      console.log(`   Mint Club: https://mint.club/token/base/${TOKEN_SYMBOL}`);
      
      // Save to .env
      const envContent = `\n# ${TOKEN_NAME} Token\n${TOKEN_SYMBOL.toUpperCase()}_TOKEN=${tokenAddress}\n${TOKEN_SYMBOL.toUpperCase()}_BOND_URL=https://mint.club/token/base/${TOKEN_SYMBOL}\n`;
      
      console.log(`\n📝 Add to your .env.local:\n${envContent}`);
    }
    
  } catch (error) {
    console.error("❌ Deployment failed:", error.message);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
