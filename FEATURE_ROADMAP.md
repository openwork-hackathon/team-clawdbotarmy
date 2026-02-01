# ClawdbotArmy - Feature Roadmap

## Features Shipped (2026-02-01)
- [x] Live prices in header (BTC/ETH/SOL)
- [x] Bonding Curves page
- [x] ARYA token page
- [x] Wallet Connect
- [x] Trading Panel
- [x] Order Book
- [x] Technical Analysis (RSI, MACD, BB)

## Next Features (2h rotation)

### Next Ship: 22:30 UTC
- [x] Price alerts (notify when target reached)
- [x] Mobile responsive improvements
- [ ] Multi-timeframe charts (1m, 5m, 15m, 1H, 4H)

### Next Ship: 00:30 UTC
- [ ] Portfolio performance chart
- [ ] Twitter sentiment integration
- [ ] Trading history export (CSV/PDF)

### Next Ship: 02:30 UTC
- [ ] Telegram bot alerts
- [ ] Auto-trading strategies (grid, DCA)
- [ ] Market scanner (top gainers/losers)

### Next Ship: 04:30 UTC
- [ ] Copy trading functionality
- [ ] Leaderboard
- [ ] Social features

## How to Add Features

```bash
# 1. Create feature branch
git checkout -b feature/your-feature

# 2. Make changes
# ...

# 3. Commit and push
git add -A
git commit -m "feat: your feature description"
git push origin feature/your-feature

# 4. Create PR or merge to main
```

## Cron Schedule
- Feature check: Every 2 hours
- Auto-reminder: @ 22:00, 00:00, 02:00, 04:00, 06:00...

## Priority Queue
1. User-requested features
2. Platform improvements
3. New integrations
4. UX/UI enhancements
