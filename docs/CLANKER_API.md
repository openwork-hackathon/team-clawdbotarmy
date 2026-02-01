# Clanker API Documentation

## Overview

The Clanker integration enables real on-chain trading for ARYA and OPENWORK tokens deployed on Base via Clanker.

## Token Contracts

### ARYA Token
- **Address:** `0xcc78a1F8eCE2ce5ff78d2C0D0c8268ddDa5B6B07`
- **Network:** Base (Chain ID: 8453)
- **Decimals:** 18
- **Clanker URL:** https://www.clanker.world/clanker/0xcc78a1F8eCE2ce5ff78d2C0D0c8268ddDa5B6B07

### OPENWORK Token
- **Address:** Not yet deployed
- **Status:** Simulation mode only

## API Endpoints

### GET /api/bonding-curve
Get bonding curve state for all tokens or a specific token.

**Parameters:**
- `token` (optional): Token symbol (ARYA or OPENWORK)

**Response:**
```json
{
  "ARYA": {
    "supply": 1000000,
    "reserve": 10,
    "currentPrice": 0.51,
    "totalTrades": 5,
    "totalVolume": 2.5,
    "isDeployed": true,
    "clankerAddress": "0xcc78a1F8eCE2ce5ff78d2C0D0c8268ddDa5B6B07",
    "clankerUrl": "https://www.clanker.world/clanker/...",
    "tradingUrl": "https://www.clanker.world/trade/..."
  }
}
```

### POST /api/bonding-curve
Execute a trade on the bonding curve (simulation mode).

**Body:**
```json
{
  "type": "BUY" | "SELL",
  "amount": 0.1,
  "token": "ARYA"
}
```

**Response:**
```json
{
  "type": "BUY",
  "inputAmount": 0.1,
  "outputAmount": 196,
  "price": 0.51,
  "newPrice": 0.52,
  "slippage": "0.12",
  "newSupply": 1000196,
  "isSimulated": true
}
```

## Frontend Integration

### useClanker Hook

```javascript
import { useClanker } from '@/hooks/useClanker';

function TradingComponent() {
  const { 
    account,           // Connected wallet address
    isConnected,       // Boolean connection status
    connect,           // Connect wallet function
    disconnect,        // Disconnect function
    executeTrade,      // Execute on-chain trade
    isPending,         // Transaction pending
    txHash,            // Transaction hash
    error              // Error message
  } = useClanker();

  // Connect wallet
  await connect();

  // Execute trade
  const result = await executeTrade('BUY', '0.1', 'ARYA');
}
```

## Bonding Curve Formula

Price is calculated using a linear bonding curve:

```
price = a × supply + b

ARYA:       price = 0.00001 × supply + 0.5 ETH
OPENWORK:   price = 0.000001 × supply + 0.0001 ETH
```

## Trading Flow

1. **Connect Wallet** - User connects MetaMask
2. **Simulation** - Shows estimated output
3. **Execute** - Signs transaction in MetaMask
4. **Confirm** - Waits for on-chain confirmation
5. **Result** - Displays transaction hash

## Clanker Contracts

- **Clanker Factory:** `0x00000000F9490004a96217b5dC12bD5dD7c52ba8`
- **WETH:** `0x4200000000000000000000000000000000000006`
- **Pool Manager:** Uniswap V4

## Resources

- [Clanker Documentation](https://clanker.gitbook.io/clanker-documentation)
- [ARYA on Clanker](https://www.clanker.world/clanker/0xcc78a1F8eCE2ce5ff78d2C0D0c8268ddDa5B6B07)
- [Viem Docs](https://viem.sh)
