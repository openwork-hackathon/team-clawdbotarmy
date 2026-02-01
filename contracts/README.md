# ClawdbotArmy Bonding Curve Contracts

Smart contracts for AI agent token bonding curves on Base.

## Contracts

### 1. AryaBondingCurve.sol
**ARYA Token:** `0xcc78a1F8eCE2ce5ff78d2C0D0c8268ddDa5B6B07`

| Parameter | Value |
|-----------|-------|
| Formula | `price = a × supply + b` |
| Slope (a) | 0.00001 ETH |
| Base (b) | 0.0001 ETH |
| Max Supply | 10M ARYA |
| Initial Supply | 1M ARYA |
| Migration Threshold | 75 ETH |

### 2. OpenWorkBondingCurve.sol
**OPENWORK Token:** `0x...` (deploy to set)

| Parameter | Value |
|-----------|-------|
| Formula | `price = a × supply + b` |
| Slope (a) | 0.000001 ETH (gentler) |
| Base (b) | 0.0001 ETH |
| Max Supply | 50M OPENWORK |
| Initial Supply | 5M OPENWORK |
| Migration Threshold | 50 ETH |

### 3. MultiTokenBondingCurve.sol
Unified contract supporting multiple tokens with configurable parameters.

## Contract Address

| Network | AryaBondingCurve | OpenWorkBondingCurve | MultiTokenBondingCurve |
|---------|------------------|----------------------|------------------------|
| Base Mainnet | `0x...` | `0x...` | `0x...` |
| Base Sepolia | `0x...` | `0x...` | `0x...` |

## Deployment

### Prerequisites
- Foundry installed: `curl -L https://foundry.paradigm.xyz | bash`
- Private key in `.env` or `PRIVATE_KEY` env var

### Deploy to Base Mainnet
```bash
# Set private key
export PRIVATE_KEY=your_private_key

# Deploy using Foundry
forge script script/DeployAryaBondingCurve.s.sol \
  --rpc-url base \
  --private-key $PRIVATE_KEY \
  --broadcast
```

### Deploy to Base Sepolia (Testnet)
```bash
forge script script/DeployAryaBondingCurve.s.sol \
  --rpc-url base_sepolia \
  --private-key $PRIVATE_KEY \
  --broadcast
```

### Verify on Basescan
```bash
npx hardhat verify --network base CONTRACT_ADDRESS ARYA_TOKEN_ADDRESS
```

## Contract Functions

### View Functions
- `getPrice(supply)` - Get price for given supply
- `getTokensForEth(ethAmount)` - Calculate tokens for ETH
- `getEthForTokens(tokenAmount)` - Calculate ETH for tokens
- `getInfo()` - Get all contract state

### Write Functions
- `buy(minTokens)` - Buy ARYA with ETH
- `sell(tokenAmount, minEth)` - Sell ARYA for ETH
- `enableMigration(uniswapPool)` - Enable migration (owner)
- `migrate()` - Migrate to Uniswap V4 (owner)

## Integration

### Frontend Usage
```javascript
const contractAddress = "0x..."; // Deployed contract
const aryaAddress = "0xcc78a1F8eCE2ce5ff78d2C0D0c8268ddDa5B6B07";

const contract = new ethers.Contract(contractAddress, abi, wallet);

// Buy ARYA
const tokens = await contract.buy(0, { value: ethers.parseEther("0.1") });

// Sell ARYA
await aryaToken.approve(contractAddress, amount);
const eth = await contract.sell(amount, 0);

// Get price
const info = await contract.getInfo();
console.log(`Price: ${ethers.formatEther(info.currentPrice)} ETH`);
```

## Liquidity Migration

When market cap reaches threshold (75 ETH), the contract can migrate to Uniswap V4:

1. Create Uniswap V4 pool with ARYA/ETH
2. Call `enableMigration(poolAddress)` as owner
3. Call `migrate()` to transfer reserves to pool

## Security

- ReentrancyGuard on all external functions
- Ownable for admin functions
- Slippage protection with min/max parameters
- Reserve checks to prevent insolvency

## License

MIT
