# Staking Contract Deployment Guide

## Prerequisites

### Option 1: Install Foundry (Recommended)
```bash
# Install Foundry
curl -L https://foundry.paradigm.xyz | bash
source ~/.bashrc  # or restart terminal

# Verify installation
forge --version
```

### Option 2: Use Hardhat
```bash
npm install
npx hardhat compile
npx hardhat run scripts/deploy-staking.js --network base
```

## Deployment Steps

### Step 1: Configure Environment
```bash
# Copy environment template
cp .env.example .env

# Edit .env and add your private key
nano .env
# Add: PRIVATE_KEY=0xyour_private_key_here
# Add: BASE_RPC_URL=https://mainnet.base.org
```

### Step 2: Compile Contract
```bash
# Using Foundry
forge build

# Using Hardhat
npx hardhat compile
```

### Step 3: Deploy to Base (Mainnet)

#### Using Foundry:
```bash
export PRIVATE_KEY=your_private_key

# Deploy ARYA OpenWork Staking
forge create --rpc-url base \
  --private-key $PRIVATE_KEY \
  --constructor-args \
  0xcc78a1F8eCE2ce5ff78d2C0D0c8268ddDa5B6B07 \
  0x299c30dd5974bf4d5bfe42c340ca40462816ab07 \
  0xcc78a1F8eCE2ce5ff78d2C0D0c8268ddDa5B6B07 \
  src/AryaOpenWorkStaking.sol:AryaOpenWorkStaking
```

#### Using Hardhat:
```bash
npx hardhat run scripts/deploy-staking.js --network base
```

### Step 4: Verify on Basescan
```bash
# Using Foundry
forge verify-contract --rpc-url base \
  YOUR_CONTRACT_ADDRESS \
  src/AryaOpenWorkStaking.sol:AryaOpenWorkStaking \
  --constructor-args 0xcc78a1F8eCE2ce5ff78d2C0D0c8268ddDa5B6B07 0x299c30dd5974bf4d5bfe42c340ca40462816ab07 0xcc78a1F8eCE2ce5ff78d2C0D0c8268ddDa5B6B07

# Or using Hardhat
npx hardhat verify --network base YOUR_CONTRACT_ADDRESS \
  0xcc78a1F8eCE2ce5ff78d2C0D0c8268ddDa5B6B07 \
  0x299c30dd5974bf4d5bfe42c340ca40462816ab07 \
  0xcc78a1F8eCE2ce5ff78d2C0D0c8268ddDa5B6B07
```

### Step 5: Configure Reward Rates
After deployment, call these functions to set APY:

```solidity
// Set ARYA pool APY (45% APY = ~0.000000001 per second)
setPoolRewardRate(0, 1000000000000000); // 0.001 per second ≈ 31.5M% APY (adjust as needed)

// Set OPENWORK pool APY
setPoolRewardRate(1, 1000000000000000);
```

### Step 6: Fund the Contract
Transfer ARYA tokens to the staking contract address to fund rewards.

## Contract Addresses (To be filled after deployment)

| Network | Staking Contract |
|---------|------------------|
| Base Mainnet | `0x...` |
| Base Sepolia | `0x...` |

## Post-Deployment Checklist

- [ ] Save contract address
- [ ] Verify contract on Basescan
- [ ] Fund contract with reward tokens
- [ ] Update frontend with new contract address
- [ ] Update contracts/README.md
- [ ] Test staking functionality

## Frontend Integration

After deployment, update the staking page with the contract address:

```javascript
// In pages/staking.js
const STAKING_CONTRACT = "0xDEPLOYED_CONTRACT_ADDRESS";
```
