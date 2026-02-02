# Price Alerts System

## Overview
Real-time price monitoring and notification system for crypto tokens. Set alerts for price targets and get notified when they trigger.

## Features
✅ Create price alerts (above/below target)  
✅ Automatic price monitoring (every 30 seconds)  
✅ Alert status tracking (active, triggered, cancelled)  
✅ Webhook notifications  
✅ Email notifications (ready for integration)  
✅ Alert history and statistics  
✅ Auto-initialization on app start  

## API Endpoints

### 1. Manage Alerts

**Create Alert**
```bash
POST /api/alerts
Content-Type: application/json

{
  "symbol": "ETH",
  "condition": "above",
  "targetPrice": 2500,
  "currentPrice": 2400,
  "userId": "user123",
  "email": "user@example.com",
  "webhook": "https://your-webhook.com/alert"
}
```

Response:
```json
{
  "id": "alert_1",
  "symbol": "ETH",
  "condition": "above",
  "targetPrice": 2500,
  "status": "active",
  "createdAt": "2026-02-02T00:30:00.000Z"
}
```

**List Alerts**
```bash
GET /api/alerts
GET /api/alerts?userId=user123
GET /api/alerts?symbol=ETH
GET /api/alerts?status=active
```

**Get Alert Stats**
```bash
GET /api/alerts?stats=true
```

Response:
```json
{
  "total": 10,
  "active": 5,
  "triggered": 3,
  "cancelled": 2,
  "bySymbol": {
    "ETH": 4,
    "BTC": 3,
    "SOL": 3
  }
}
```

**Cancel Alert**
```bash
PUT /api/alerts
Content-Type: application/json

{
  "id": "alert_1",
  "action": "cancel"
}
```

**Delete Alert**
```bash
DELETE /api/alerts?id=alert_1
```

### 2. Monitor Control

**Check Monitor Status**
```bash
GET /api/monitor?action=status
```

Response:
```json
{
  "isActive": true,
  "interval": 30000,
  "activeAlerts": 5,
  "cachedPrices": [
    {
      "symbol": "ETH",
      "price": 2400.50,
      "timestamp": 1706832000000
    }
  ]
}
```

**Start Monitoring** (auto-starts on app launch)
```bash
GET /api/monitor?action=start
```

**Stop Monitoring**
```bash
GET /api/monitor?action=stop
```

**Trigger Manual Check**
```bash
GET /api/monitor?action=check
```

## Alert Conditions

**Above**
- Triggers when current price >= target price
- Example: Alert when ETH goes above $2500

**Below**
- Triggers when current price <= target price
- Example: Alert when BTC drops below $75000

## Supported Tokens

Currently monitoring:
- BTC (Bitcoin)
- WBTC (Wrapped Bitcoin)
- ETH (Ethereum)
- SOL (Solana)
- USDC (USD Coin)
- OPENWORK
- ARYA (via Clanker)

## Notifications

### Webhook
When an alert triggers, sends POST request:
```json
{
  "alertId": "alert_1",
  "symbol": "ETH",
  "condition": "above",
  "targetPrice": 2500,
  "currentPrice": 2501.25,
  "triggeredAt": "2026-02-02T00:35:00.000Z",
  "message": "🚀 Price Alert: ETH ↑ $2501.25 (target: $2500)"
}
```

### Email
Configure email in alert creation. Messages are formatted as:
```
🚀 Price Alert: ETH ↑ $2501.25 (target: $2500)
```

## Architecture

```
┌─────────────────────────────────────────┐
│  Frontend (bonding-curves.js)          │
│  - Alert creation UI                    │
│  - Alert list display                   │
└──────────────┬──────────────────────────┘
               │
               │ POST /api/alerts
               ▼
┌─────────────────────────────────────────┐
│  API Layer (/pages/api/alerts.js)      │
│  - CRUD operations                      │
│  - Input validation                     │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│  Alert Manager (alertManager.js)       │
│  - In-memory storage                    │
│  - Status management                    │
└─────────────────────────────────────────┘
               ▲
               │ Read active alerts
               │
┌─────────────────────────────────────────┐
│  Price Monitor (priceMonitor.js)       │
│  - Runs every 30s                       │
│  - Fetches current prices               │
│  - Checks alert conditions              │
│  - Triggers notifications               │
└─────────────────────────────────────────┘
```

## Frontend Integration

The existing UI in `pages/bonding-curves.js` needs to be updated to use the API:

### Before (local state only):
```javascript
const [alerts, setAlerts] = useState([]);

const addAlert = () => {
  const newAlert = {
    id: Date.now(),
    price: parseFloat(alertPrice),
    condition: alertCondition,
  };
  setAlerts([...alerts, newAlert]);
};
```

### After (persistent backend):
```javascript
const [alerts, setAlerts] = useState([]);

const addAlert = async () => {
  const response = await fetch('/api/alerts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      symbol: selectedToken,
      condition: alertCondition,
      targetPrice: alertPrice,
      currentPrice: curves?.[selectedToken]?.price,
      userId: walletAddress || 'anonymous'
    })
  });
  
  const newAlert = await response.json();
  setAlerts([...alerts, newAlert]);
};

// Load alerts on mount
useEffect(() => {
  fetch('/api/alerts')
    .then(res => res.json())
    .then(data => setAlerts(data.alerts));
}, []);
```

## Production Considerations

### Database Integration
Replace in-memory storage with database:
```javascript
// src/services/alertManager.js
import { db } from '../lib/database';

export async function createAlert(config) {
  const alert = await db.alerts.create({ data: config });
  return alert;
}
```

### Email Service
Integrate SendGrid, AWS SES, or similar:
```javascript
// src/services/priceMonitor.js
import sgMail from '@sendgrid/mail';

async function sendEmail(email, message) {
  await sgMail.send({
    to: email,
    from: 'alerts@clawdbotarmy.com',
    subject: 'Price Alert Triggered',
    text: message
  });
}
```

### Rate Limiting
Add per-user alert limits:
```javascript
const MAX_ALERTS_PER_USER = 10;

export function createAlert(config) {
  const userAlerts = getAlerts({ userId: config.userId, status: 'active' });
  if (userAlerts.length >= MAX_ALERTS_PER_USER) {
    throw new Error('Maximum alerts reached');
  }
  // ...
}
```

## Testing

```bash
# Create an alert
curl -X POST http://localhost:3000/api/alerts \
  -H 'Content-Type: application/json' \
  -d '{
    "symbol": "ETH",
    "condition": "above",
    "targetPrice": 2500
  }'

# Check monitor status
curl http://localhost:3000/api/monitor?action=status

# Trigger manual check
curl http://localhost:3000/api/monitor?action=check

# List all alerts
curl http://localhost:3000/api/alerts

# Get statistics
curl 'http://localhost:3000/api/alerts?stats=true'
```

## Future Enhancements

- [ ] Telegram bot notifications
- [ ] Discord webhook support
- [ ] SMS notifications (Twilio)
- [ ] Multiple price sources (Uniswap, CoinGecko, CoinMarketCap)
- [ ] Advanced conditions (% change, volume, market cap)
- [ ] Recurring alerts
- [ ] Alert templates
- [ ] Alert groups/folders
- [ ] Mobile push notifications
- [ ] Alert analytics dashboard

---

**Built by:** beanbot 🫘  
**Status:** Ready for production (with database integration)
