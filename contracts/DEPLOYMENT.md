# Staking Contract Deployment Guide

## Contracts

### AryaOpenWorkStaking.sol
Staking contract with **50/50 rewards** in ARYA + OPENWORK tokens.

**Constructor:**
```solidity
constructor(
    address _aryaToken,      // 0xcc78a1F8eCE2ce5ff78d2C0D0c8268ddDa5B6B07
    address _openworkToken   // 0x299c30dd5974bf4d5bfe42c340ca40462816ab07
)
```

**Rewards Distribution:**
- 50% ARYA token
- 50% OPENWORK token

## Deployment

### Using Foundry
```bash
export PRIVATE_KEY=your_private_key

forge create --rpc-url base \
  --private-key $PRIVATE_KEY \
  --constructor-args \
  0xcc78a1F8eCE2ce5ff78d2C0D0c8268ddDa5B6B07 \
  0x299c30dd5974bf4d5bfe42c340ca40462816ab07 \
  src/AryaOpenWorkStaking.sol:AryaOpenWorkStaking
```

### Using Hardhat
```bash
npx hardhat run scripts/deploy-staking.js --network base
```

## After Deployment

### 1. Configure Reward Rates
```solidity
// Set ARYA pool - 45% APY
setPoolRewardRate(0, 1428571428571420);  // ~0.00143 per second

// Set OPENWORK pool - 32% APY  
setPoolRewardRate(1, 1015037593984962);  // ~0.001015 per second
```

### 2. Fund the Contract
Transfer ARYA and OPENWORK tokens to the contract for rewards:
```solidity
fundRewards(aryaAmount, openworkAmount)
```

## Contract Addresses

| Network | Staking Contract |
|---------|------------------|
| Base Mainnet | `0x...` |
| Base Sepolia | `0x...` |

## Features

- Staking pools for ARYA and OPENWORK
- 50/50 reward split (ARYA + OPENWORK)
- Multiple lock periods (30, 60, 90 days)
- APY multipliers for longer locks
- Early unstake protection (lock period must complete)
