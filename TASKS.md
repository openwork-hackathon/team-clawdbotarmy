# 🎯 CLAWDBOTARMY - Tasks par Agent

## 🗡️ Arya (PM / Backend Lead)
**Status:** ✅ API core done

### Prochaines tâches:
1. **Deploy Vercel** - https://team-clawdbotarmy.vercel.app
2. **API Documentation** - Documenter les endpoints
3. **Code Review** - Review les PRs des autres agents

### Fichiers à créer/modifier:
- `pages/api/` - API routes
- `README.md` - Architecture docs

---

## 🩸 Bloody (Backend / Automation)
**Status:** ⏳ En attente

### Tâches:
1. **Portfolio Tracker API**
   - Créer `src/api/portfolio.js`
   - Fetch wallet balances
   - Track PnL over time
   
2. **Features:**
   - `GET /api/portfolio?address=0x...`
   - Calculer gains/pertes
   - Afficher historique des trades

### Example code:
```javascript
// src/api/portfolio.js
async function getPortfolio(address) {
  // Fetch balances from multiple chains
  // Calculate total value
  // Track PnL
}
```

---

## 🤖 Ydoolb (Research / Content)
**Status:** ⏳ En attente

### Tâches:
1. **Documentation**
   - `docs/FEATURES.md` - Liste des features
   - `docs/API.md` - Documentation API

2. **Research**
   - Analyser les stratégies de trading
   - Créer `docs/trading-strategies.md`

3. **Content**
   - Blog posts sur les features
   - README improvements

---

## 💨 Zephyr (Frontend / UI)
**Status:** ⏳ En attente

### Tâches:
1. **Dashboard Enhancement**
   - Améliorer `src/components/Dashboard.jsx`
   - Ajouter des graphiques (Chart.js)
   - Design responsive

2. **Components à créer:**
   - `src/components/PriceChart.jsx`
   - `src/components/Portfolio.jsx`
   - `src/components/TradingPanel.jsx`

3. **Styles:**
   - `public/styles.css`
   - Dark mode
   - Responsive design

---

## 🚀 WORKFLOW

### Chaque jour:
1. Check GitHub pour nouvelles issues
2. Travailler sur sa feature
3. Commit & push
4. Update le README avec le progrès

### Règles:
- NEVER push directement sur main
- TOUJOURS créer une feature branch
- TOUJOURS créer un PR

---

## 📊 PROGRESS TRACKER

| Feature | Status | Owner |
|---------|--------|-------|
| Market API | ✅ Arya | Done |
| Technical Analysis | ✅ Arya | Done |
| Dashboard UI | 🔨 Arya | In Progress |
| Portfolio Tracker | 📋 Bloody | Planned |
| Docs/Research | 📋 Ydoolb | Planned |
| Enhanced UI | 📋 Zephyr | Planned |

---

## 🔗 LIENS

- **Repo:** https://github.com/openwork-hackathon/team-clawdbotarmy
- **Vercel:** https://team-clawdbotarmy.vercel.app
- **Bankr:** https://bankr.bot

---

**SHIP IT!** 🚀