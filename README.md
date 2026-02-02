# 🦞 ClawdbotArmy - AI Agent Trading Platform

A Next.js-based trading platform for AI agent tokens with bonding curves, staking, and portfolio tracking.

## 🚀 Quick Start

### Development
```bash
cd team-clawdbotarmy
npm run dev
# Open http://localhost:3000
```

### Deployment
Push to GitHub - Vercel auto-deploys from `main` branch.

## 📁 Project Structure

```
team-clawdbotarmy/
├── pages/
│   ├── _app.js          # Global layout with navigation
│   ├── index.js         # Home page with market overview
│   ├── arya.js          # ARYA token page
│   ├── bonding-curves.js # Trading interface
│   ├── staking.js       # Staking dashboard
│   ├── portfolio.js     # Portfolio tracker
│   └── api/
│       ├── price/
│       │   ├── all.js   # All tokens price API
│       │   ├── arya.js  # ARYA price API
│       │   └── eth.js   # ETH price API
│       ├── staking.js   # Staking API
│       └── portfolio.js # Portfolio API
└── public/
    └── styles.css       # Global styles
```

## 🔗 Token Addresses (Base Network)

| Token | Address | Description |
|-------|---------|-------------|
| ARYA | `0xcc78a1F8eCE2ce5ff78d2C0D0c8268ddDa5B6B07` | AI Agent Token |
| OPENWORK | `0x299c30dd5974bf4d5bfe42c340ca40462816ab07` | OpenWork Token |
| KROWNEPO | `0xAFe8861b074B8C2551055a20A2a4f39E45037B07` | KROWNEPO Token |
| ETH | `0x4200000000000000000000000000000000000006` | Wrapped ETH |

## 🎨 Styling

Variables defined in `public/styles.css`:
- `--accent`: Primary color (#00d4ff)
- `--accent-green`: Success color (#00ff88)
- `--accent-red`: Error color (#ff4757)
- `--bg-primary`: Background (#0a0a0f)
- `--bg-card`: Card background (#1a1a24)

## 🔧 Adding New Features

### 1. Add a New Page
Create `pages/new-page.js`:
```javascript
import Head from 'next/head';

export default function NewPage() {
  return (
    <>
      <Head>
        <title>Page Title</title>
      </Head>
      <div className="container">
        {/* Your content */}
      </div>
    </>
  );
}
```

### 2. Add a New API Endpoint
Create `pages/api/your-endpoint.js`:
```javascript
export default async function handler(req, res) {
  try {
    // Your logic
    const data = await fetchData();
    res.status(200).json(data);
  } catch (error) {
    console.error('API error:', error);
    res.status(500).json({ error: 'Failed to fetch data' });
  }
}
```

### 3. Add Navigation Link
Edit `pages/_app.js` - add to `NAV_ITEMS` array.

## 🧪 Testing

```bash
# Test API locally
curl http://localhost:3000/api/price/all

# Test deployed API
curl https://team-clawdbotarmy.vercel.app/api/price/all
```

## 📡 External APIs Used

| API | Purpose | Rate Limits |
|-----|---------|-------------|
| CoinGecko | Token prices | 10-50 calls/min |
| Uniswap V3 Subgraph | DEX liquidity | 100 calls/sec |
| Base RPC | On-chain data | 100 calls/sec |

## 🐛 Common Issues

### NaN in Prices
Use `safeNum()` helper in price APIs:
```javascript
const safeNum = (val, defaultVal = 0) => {
  const num = parseFloat(val);
  return isNaN(num) || !isFinite(num) ? defaultVal : num;
};
```

### API Returns 404
- Check file is in `pages/api/` not subdirectory
- Filename must match route (e.g., `all.js` → `/api/price/all`)

### Styles Not Loading
- Check `/styles.css` is imported in `_app.js`
- CSS file must be in `public/` directory

## 🤝 Contributing

1. Create feature branch
2. Make changes
3. Test locally
4. Push and create PR

## 📄 License

MIT - OpenWork Clawathon 2026
