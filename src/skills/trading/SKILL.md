# Bankr Trading Skill - Real Crypto Trading

*Enable real trading on ClawdbotArmy via Bankr CLI*

## Overview

This skill enables real crypto trading on the ClawdbotArmy platform using Bankr, an AI-powered crypto trading agent. Bankr supports Base, Ethereum, Polygon, Solana, and Unichain.

## Wallet Configuration

**Bankr Base Wallet:**
```
Address: 0x7177d37a0c062b59d1a5ed65ab6016df8812be74
API Key: bk_EQGZGDDL3CTSRR28EPB46RU7XZWG5HJ7
```

**Ydoolb Wallet:**
```
Address: 0x483ec01a9e18bee496f605b884f3b0cde79260fa
OpenWork API: ow_12fb32585bb9c52c27bcd8f3404845d1cae5cb9d1f652809
```

## Available Commands

### Check Balance
```bash
bankr "What is my portfolio balance?"
```

### Get Token Price
```bash
bankr "What is the price of BTC?"
bankr "Get price of ARYA on Base"
```

### Buy Crypto
```bash
bankr "Buy 100 USDT of BTC"
bankr "Buy 50 USDC on Base"
bankr "Swap 10 ETH for USDC on Base"
```

### Sell Crypto
```bash
bankr "Sell 0.01 BTC"
bankr "Sell all my ARYA tokens"
```

### Transfer
```bash
bankr "Transfer 100 USDT to 0x483ec01a9e18bee496f605b884f3b0cde79260fa"
```

### Check Open Positions
```bash
bankr "Show my open positions"
```

### Deploy Token (like ARYA)
```bash
bankr "Create a new ERC-20 token named ARYA with symbol ARYA and supply 1000000000 on Base"
```

## Agent Instructions

When agents need to execute real trades:

1. **Always confirm before trading** - Ask user for explicit confirmation
2. **Check available balance** - `bankr "What is my portfolio balance?"`
3. **Get current prices** - Check prices before trading
4. **Execute trade** - Use clear instructions like "Buy X amount of Y"
5. **Report results** - Share transaction details with user

### Example Workflow
```
User: "Buy 100 USDT of ARYA"

Agent: "Checking balance..."
→ bankr "What is my portfolio balance?"
→ Bankr returns: 102,713 OPENWORK (~$0.56), 0.021 SOL (~$2.15)

Agent: "Not enough funds. I have only ~$2.71 available (OPENWORK + SOL). 
Would you like me to buy a small amount of ARYA with what's available, 
or do you need to add funds first?"

User: "Buy what I can"

Agent: "Buying ARYA with available funds..."
→ bankr "Buy 2 USDT of ARYA on Base"

Agent: "✅ Bought! Transaction details..."
```

## Human Instructions

### Quick Start for Humans

1. **Access Bankr via Clawdbot**
   - Message Arya or Bloody: "I want to trade crypto"
   - We'll execute trades on your behalf

2. **Supported Networks**
   - Base (recommended for low fees)
   - Ethereum
   - Polygon
   - Solana
   - Unichain

3. **Supported Actions**
   - Buy/Sell tokens
   - Swap tokens (e.g., ETH → USDC)
   - Transfer funds
   - Check portfolio
   - Deploy new tokens

4. **Security**
   - Never share private keys
   - Bankr handles transactions securely
   - Always confirm before executing

### Example Commands
Just tell us what you want:
- "Buy 100 USDT of BTC"
- "Sell my ARYA tokens"
- "Transfer 50 USDC to friend"
- "What's my portfolio worth?"
- "Create a new token called MYCOIN"

## ARYA Token on Base

| Property | Value |
|----------|-------|
| Name | ARYA |
| Symbol | ARYA |
| Supply | 100 Billion |
| Contract | `0xcc78a1F8eCE2ce5ff78d2C0D0c8268ddDa5B6B07` |
| Network | Base |

## Safety Guidelines

- ✅ Always confirm amounts before trading
- ✅ Check gas fees on Base (usually <$0.01)
- ✅ Start with small amounts when testing
- ✅ Keep records of all transactions

- ❌ Never trade more than you can afford to lose
- ❌ Don't execute trades during high volatility without warning
- ❌ Never share API keys or passwords

## Troubleshooting

**"Insufficient balance"**
→ Check portfolio: `bankr "What is my portfolio balance?"`
→ You may need to deposit funds first

**"Transaction failed"**
→ Usually due to low gas or network issues
→ Try again or use a different network

**"Token not found"**
→ Verify contract address
→ Check if token is on the correct network

## Files

- **Bankr CLI:** `/home/ubuntu/.clawdbot/skills/bankr/bankr.sh`
- **Config:** `/home/ubuntu/.clawdbot/skills/bankr/config.json`
- **Wallet:** `/home/ubuntu/.clawdbot/skills/bankr/references/wallet.json`

## Links

- **Bankr Docs:** Part of Clawdbot skills
- **Basescan:** https://basescan.org
- **Clanker:** https://www.clanker.world
