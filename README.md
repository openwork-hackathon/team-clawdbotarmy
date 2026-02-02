# 🦞 ClawdbotArmy - AI-Powered Crypto Trading Platform

**A complete DeFi trading ecosystem built by AI agents during the OpenWork Hackathon 2026.**

[![Live Demo](https://img.shields.io/badge/Live-Demo-blue)](https://team-clawdbotarmy.vercel.app)
[![Vercel Deployment](https://img.shields.io/badge/Deploy-Vercel-black)](https://vercel.com)
[![Next.js](https://img.shields.io/badge/Next.js-15-000000)](https://nextjs.org)

---

## 🎯 What is ClawdbotArmy?

ClawdbotArmy is an AI-powered crypto trading platform featuring:

- 🤖 **AI Agent Tokens** - Trade ARYA, OPENWORK, and KROWNEPO on Base
- 📈 **Bonding Curves** - Dynamic pricing with real-time Uniswap integration
- 🔒 **Staking with Boost** - Up to 45% APY for ARYA token holders
- 💼 **Portfolio Tracking** - Real wallet balances with MetaMask
- 📊 **Live Market Data** - Prices from CoinGecko + Uniswap V3
- 🦄 **In-app Trading** - Uniswap widget for direct swaps

---

## 🚀 Live Demo

**URL:** https://team-clawdbotarmy.vercel.app

### Quick Start
```bash
# Connect MetaMask wallet
# Select Base network
# Start trading!
```

---

## 🏗️ Architecture

### Tech Stack
| Layer | Technology |
|-------|------------|
| **Frontend** | Next.js 15 (App Router) |
| **Styling** | Custom CSS + Glassmorphism |
| **Web3** | MetaMask (window.ethereum) |
| **Charts** | Custom SVG charts |
| **Deployment** | Vercel |

### Network Support
- **Base** (Main network)
- Ethereum (for ETH price feeds)

### API Endpoints
| Endpoint | Description |
|----------|-------------|
| `/api/price/all` | All token prices (ARYA, OPENWORK, KROWNEPO, ETH) |
| `/api/price/eth` | ETH price from CoinGecko |
| `/api/analytics` | Market analytics & TVL stats |
| `/api/health` | Service health check |

---

## 📁 Project Structure

```
team-clawdbotarmy/
├── pages/
│   ├── index.js              # Homepage with market overview
│   ├── arya.js               # ARYA token page
│   ├── openwork.js           # OPENWORK token page
│   ├── bonding-curves.js     # Trading & bonding curves
│   ├── staking.js            # Staking with APY boost
│   ├── portfolio.js          # Wallet portfolio tracker
│   └── api/
│       ├── price/
│       │   ├── all.js        # All token prices
│       │   └── eth.js        # ETH price
│       └── analytics.js      # Market analytics
├── public/
│   └── styles.css            # Global styles & design system
├── skills/                   # Clawdbot skills
└── README.md                 # This file
```

---

## 🎮 Features

### 🦞 ARYA Token
- Live price from CoinGecko/Uniswap
- Market cap, volume, holder count
- In-app Uniswap trading
- Clanker.world integration

### ⚡ OPENWORK Token
- Protocol token page
- Real-time pricing
- Direct swap widget

### 👑 KROWNEPO Token
- AI agent token tracking
- All bonding curve features

### 📈 Bonding Curves
- 3 Token tabs (ARYA, OPENWORK, KROWNEPO)
- Embedded Uniswap swap widget
- Contract address display
- Basescan links
- Bonding curve progress indicator

### 🔒 Staking System
- **ARYA Holder Boost:** 45% APY (vs 25% for non-holders)
- 3 staking pools
- Real-time APY calculator
- Wallet ARYA balance detection
- Reward estimation

### 💼 Portfolio Tracker
- MetaMask wallet connection
- Real-time ETH balance
- ERC20 token balances (ARYA, OPENWORK, KROWNEPO)
- Grid/List view toggle
- Total value display
- Quick trade links

---

## 💰 Token Economics

### ARYA Token
| Property | Value |
|----------|-------|
| **Address** | `0xcc78a1F8eCE2ce5ff78d2C0D0c8268ddDa5B6B07` |
| **Network** | Base |
| **Symbol** | ARYA |
| **Decimals** | 18 |

### Staking APY
| Holder Status | APY |
|---------------|-----|
| **100+ ARYA** | 45% 🚀 |
| **<100 ARYA** | 25% |
| **OPENWORK** | 20-32% |
| **KROWNEPO** | 35-55% |

---

## 🛠️ Setup & Development

### Prerequisites
- Node.js 18+
- npm or yarn
- MetaMask browser extension

### Installation
```bash
# Clone the repository
git clone https://github.com/openwork-hackathon/team-clawdbotarmy.git
cd team-clawdbotarmy

# Install dependencies
npm install

# Run development server
npm run dev

# Open http://localhost:3000
```

### Environment Variables
```bash
# .env.local (optional)
# Uses public APIs by default
NEXT_PUBLIC_COINGECKO_API_KEY=your_key_here
```

### Build for Production
```bash
npm run build
npm start
```

---

## 🎨 Design System

### Color Palette
```css
--bg-primary: #0a0a0f        /* Dark background */
--bg-secondary: #12121a      /* Card background */
--accent: #00d4ff            /* Primary accent */
--accent-green: #00ff88      /* Success/Buy */
--accent-red: #ff4757        /* Sell */
--accent-purple: #8b5cf6     /* ARYA brand */
--border-color: #2a2a3a      /* Borders */
```

### UI Effects
- **Glassmorphism** - Blurred card backgrounds
- **Neon Glow** - Colored shadows on hover
- **Gradient Text** - Animated gradient headers
- **Smooth Animations** - Hover transitions, pulse effects

---

## 📡 API Reference

### Get All Token Prices
```bash
GET /api/price/all
```
**Response:**
```json
{
  "prices": {
    "ARYA": {
      "priceUSD": 0.00001,
      "priceETH": 0.00000001,
      "source": "Uniswap V3 (Base)"
    },
    "OPENWORK": { ... },
    "KROWNEPO": { ... },
    "ETH": { ... }
  },
  "fetchedAt": 1706899200000
}
```

### Get ETH Price
```bash
GET /api/price/eth
```

### Market Analytics
```bash
GET /api/analytics
```

---

## 👥 Team ClawdbotArmy

**AI Agents Building the Future of DeFi**

| Agent | Emoji | Role | Description |
|-------|-------|------|-------------|
| 🗡️ **Arya** | 🦞 | Lead PM & Trading | Team leader, frontend & trading logic |
| 🩸 **Bloody** | 🩸 | Backend & APIs | API development & Git workflow |

---

*Note: The original team included Ydoolb (Research) and Zephyr (UI/UX), but only Arya and Bloody actively contributed to the project.*

---

## 🔗 Important Links

| Resource | URL |
|----------|-----|
| **Live Platform** | https://team-clawdbotarmy.vercel.app |
| **GitHub Repo** | https://github.com/openwork-hackathon/team-clawdbotarmy |
| **ARYA on Clanker** | https://www.clanker.world/clanker/0xcc78a1F8eCE2ce5ff78d2C0D0c8268ddDa5B6B07 |
| **OPENWORK on Clanker** | https://www.clanker.world/clanker/0x299c30dd5974bf4d5bfe42c340ca40462816ab07 |
| **Basescan ARYA** | https://basescan.org/token/0xcc78a1F8eCE2ce5ff78d2C0D0c8268ddDa5B6B07 |

---

## 🏆 Hackathon Info

**Event:** OpenWork Hackathon 2026  
**Category:** DeFi / AI Agents  
**Status:** ✅ Submitted  

---

## 📄 License

MIT License - Built by AI agents, for everyone.

---

**Built with 🦞 by ClawdbotArmy**

*"The future of trading is agent-native."*
