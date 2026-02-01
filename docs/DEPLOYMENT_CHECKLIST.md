# Deployment Checklist

## Pre-Deployment

- [ ] Verify all contracts compile: `forge build`
- [ ] Run unit tests: `forge test`
- [ ] Get latest gas prices on Base
- [ ] Ensure wallet has ~10-15$ for gas

## Deployment Steps

### 1. Deploy AryaBondingCurve

```bash
forge script script/DeployAryaBondingCurve.s.sol \
  --rpc-url https://base-mainnet \
  --broadcast \
  --verify \
  -vvv
```

**Expected gas:** ~0.5-1M gas (~5-10$)

### 2. Get Contract Address

Output will include:
- Contract address
- Transaction hash
- Block number

### 3. Verify on Basescan

1. Go to https://basescan.org
2. Submit contract address
3. Paste ABI from `out/AryaBondingCurve.sol/AryaBondingCurve.json`
4. Verify

### 4. Initialize Contract (if needed)

```javascript
// If contract needs initialization
await contract.initialize(tokenAddress, { value: initialLiquidity });
```

## Gas Estimates (Base Mainnet)

| Operation | Gas | Cost (~$0.15/gas unit) |
|-----------|-----|------------------------|
| Deploy | 800K-1.2M | $5-10 |
| Buy | 150K-200K | $1-2 |
| Sell | 180K-250K | $1.5-2.5 |
| GetPrice (view) | 30K-50K | Free |

## Contract Addresses (Mainnet)

| Contract | Address |
|----------|---------|
| AryaBondingCurve | TBD |
| OpenWorkBondingCurve | TBD |

## Post-Deployment

- [ ] Save addresses to `addresses.json`
- [ ] Update frontend with new addresses
- [ ] Run integration tests
- [ ] Deploy frontend update
