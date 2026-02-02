const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Deploying AryaOpenWorkStaking to Base...\n");

  // Addresses
  const ARYA_TOKEN = "0xcc78a1F8eCE2ce5ff78d2C0D0c8268ddDa5B6B07";
  const OPENWORK_TOKEN = "0x299c30dd5974bf4d5bfe42c340ca40462816ab07";
  
  // For rewards, we'll use ARYA token (rewards paid in ARYA)
  const REWARD_TOKEN = ARYA_TOKEN;

  console.log("📋 Configuration:");
  console.log(`   ARYA Token: ${ARYA_TOKEN}`);
  console.log(`   OPENWORK Token: ${OPENWORK_TOKEN}`);
  console.log(`   Reward Token: ${REWARD_TOKEN}\n`);

  // Get deployer
  const [deployer] = await ethers.getSigners();
  console.log(`👤 Deployer: ${deployer.address}`);
  console.log(`💰 Balance: ${ethers.formatEther(await ethers.provider.getBalance(deployer.address))} ETH\n`);

  // Deploy Staking Contract
  const AryaOpenWorkStaking = await ethers.getContractFactory("AryaOpenWorkStaking");
  
  console.log("📦 Deploying AryaOpenWorkStaking...");
  const staking = await AryaOpenWorkStaking.deploy(ARYA_TOKEN, OPENWORK_TOKEN, REWARD_TOKEN);
  
  await staking.waitForDeployment();
  const stakingAddress = await staking.getAddress();
  
  console.log(`✅ Staking Contract Deployed: ${stakingAddress}\n`);

  // Configure pools with reward rates
  // APY = rewardRate * 365 days * multiplier / 1e18
  // For 45% APY with 1x multiplier: 0.45 = rewardRate * 365 * 1 / 1e18
  // rewardRate = 0.45 * 1e18 / 365 = ~1.23e15 per second
  
  const REWARD_RATE = ethers.parseEther("0.000000001"); // ~31.5% APY base
  
  console.log("⚙️ Configuring pools...");
  
  // ARYA Pool - 45% APY for holders, 25% for non-holders (handled in frontend)
  const aryaPoolTx = await staking.setPoolRewardRate(0, REWARD_RATE);
  await aryaPoolTx.wait();
  console.log("   ✅ ARYA Pool configured");

  // OPENWORK Pool - 32% APY
  const openworkPoolTx = await staking.setPoolRewardRate(1, REWARD_RATE);
  await openworkPoolTx.wait();
  console.log("   ✅ OPENWORK Pool configured\n");

  // Verify contract
  console.log("🔍 Verifying on Basescan...");
  try {
    await hre.run("verify:verify", {
      address: stakingAddress,
      constructorArguments: [ARYA_TOKEN, OPENWORK_TOKEN, REWARD_TOKEN],
    });
    console.log("   ✅ Contract verified on Basescan\n");
  } catch (error) {
    console.log("   ⚠️ Verification failed (may already be verified):", error.message.substring(0, 100));
  }

  // Summary
  console.log("=" .repeat(60));
  console.log("📊 DEPLOYMENT SUMMARY");
  console.log("=" .repeat(60));
  console.log(`Staking Contract: ${stakingAddress}`);
  console.log(`Basescan: https://basescan.org/address/${stakingAddress}`);
  console.log("=" .repeat(60));
  console.log("\n⚠️ NEXT STEPS:");
  console.log("1. Fund the contract with ARYA tokens for rewards");
  console.log("2. Test staking functionality");
  console.log("3. Update frontend with new contract address\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
