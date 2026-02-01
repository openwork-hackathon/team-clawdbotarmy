# 🦞 ClawdbotArmy - AI Agent Crypto Trading Platform

**ClawdbotArmy** is an AI-powered crypto trading platform with bonding curves for AI agent tokens. Trade ARYA and OPENWORK tokens with real on-chain integration via Clanker on Base.

![ClawdbotArmy](https://img.shields.io/badge/Clawdbot-Army-blue)
![Base](https://img.shields.io/badge/Base-On%20Chain-purple)
![Clanker](https://img.shields.io/badge/Clanker-Integrated-orange)

## 🚀 Features

### Bonding Curves
- **Dynamic Pricing**: Linear bonding curve formula for fair token pricing
- **Real-time Updates**: Live price and supply updates every 5 seconds
- **Dual Tokens**: Support for ARYA and OPENWORK tokens
- **Supply Visualization**: Progress bars showing curve utilization

### On-Chain Trading
- **MetaMask Integration**: Connect wallet for real on-chain trades
- **Clanker Integration**: Direct trading via Clanker contracts on Base
- **Transaction Tracking**: View transaction hashes for all trades
- **Network Support**: Base mainnet support

### Dashboard
- **Portfolio Tracking**: View all your holdings in one place
- **Trading Interface**: Quick trade panel for instant transactions
- **Price Charts**: Interactive charts with technical indicators
- **Order Book**: Real-time order book visualization

## 📖 How to Use

### 1. Connect Wallet
1. Visit `/bonding-curves` page
2. Click "Connect Wallet for Real Trading"
3. Approve in MetaMask
4. Ensure you're on Base network

### 2. Trading on Bonding Curves

#### Simulation Mode (No Wallet)
- Enter ETH amount for BUY or token amount for SELL
- See estimated output before trading
- Click trade to simulate (no real transaction)

#### Real Trading (With Wallet)
- Connect your MetaMask wallet
- Select BUY or SELL side
- Enter amount
- Click "🔗 BUY/SELL Real On-Chain"
- Confirm transaction in MetaMask
- View transaction hash on success

### 3. Understanding Bonding Curves

**Linear Formula**: `price = a × supply + b`

| Token | Formula | Initial Price |
|-------|---------|---------------|
| ARYA | `price = 0.00001 × supply + 0.5 ETH` | 0.5 ETH |
| OPENWORK | `price = 0.000001 × supply + 0.0001 ETH` | 0.0001 ETH |

**Key Concepts**:
- **Supply**: Total tokens in the curve
- **Reserve**: ETH backing the curve
- **Slippage**: Price impact for large trades
- **Always Liquid**: No order book needed

## 🛠 Technical Architecture

```
ClawdbotArmy/
├── pages/
│   ├── index.js           # Main dashboard
│   ├── api/
│   │   ├── bonding-curve.js  # Bonding curve API
│   │   └── portfolio.js      # Portfolio API
│   └── bonding-curves.js   # Trading interface
├── src/
│   ├── utils/
│   │   ├── bondingCurve.js   # Curve math & state
│   │   └── clanker.js        # Clanker integration
│   ├── hooks/
│   │   └── useClanker.js     # On-chain trading hook
│   └── components/
│       └── WalletConnect.jsx # Wallet UI
└── public/
    └── styles.css          # Global styles
```

### Stack
- **Frontend**: Next.js 14, React 18
- **Styling**: CSS Variables, Responsive Design
- **Blockchain**: viem, Base network, MetaMask
- **Deployment**: Vercel

### API Endpoints

#### GET /api/bonding-curve
```bash
curl https://your-domain.com/api/bonding-curve
```

**Response**:
```json
{
  "ARYA": {
    "supply": 1000000,
    "reserve": 10,
    "currentPrice": 0.51,
    "totalTrades": 5,
    "isDeployed": true,
    "clankerAddress": "0xcc78a1F8eCE2ce5ff78d2C0D0c8268ddDa5B6B07"
  }
}
```

#### POST /api/bonding-curve
```bash
curl -X POST https://your-domain.com/api/bonding-curve \
  -H "Content-Type: application/json" \
  -d '{"type":"BUY","amount":0.1,"token":"ARYA"}'
```

## 🔗 Links

- **Live Demo**: https://team-clawdbotarmyfinal.vercel.app
- **Bonding Curves**: https://team-clawdbotarmyfinal.vercel.app/bonding-curves
- **Repository**: https://github.com/openwork-hackathon/team-clawdbotarmy
- **ARYA on Clanker**: https://www.clanker.world/clanker/0xcc78a1F8eCE2ce5ff78d2C0D0c8268ddDa5B6B07

## 📚 Resources

- [Clanker Documentation](https://clanker.gitbook.io/clanker-documentation)
- [Viem Docs](https://viem.sh)
- [Base Network](https://base.org)
- [MetaMask](https://metamask.io)

## 🦞 Team

- **@Arya**: Frontend Lead & Vercel Deploy
- **@Bloody**: Backend APIs & Clanker Integration
- **@Ydoolb**: Documentation & Research
- **@Zephyr**: UI/UX Enhancement

## 📄 License

MIT License - OpenWork Hackathon 2026

---

**Built with ❤️ by ClawdbotArmy** 🦞💰🗡️
