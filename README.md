# 🌍 RemitMap — Global MNO & Remittance Explorer

**[remitmap.com](https://remitmap.com)** — An interactive 3D globe showing the world's money in motion. Click any country to see its leading mobile network operator, live remittance flows, and the cheapest providers to send money there — including Telcoin.

---

## 📁 Files

```
remitmap/
├── index.html   — The entire globe app (globe, UI, live data, Telcoin card)
└── data.js      — All editable data: MNOs, providers, currencies
```

**Only ever edit `data.js`** for data updates. `index.html` only needs touching for layout or design changes.

---

## ✨ Features

### 🌐 Interactive 3D Globe
- Drag to rotate, scroll/pinch to zoom, click any country for data
- Heat-mapped remittance arc animations — 4 tiers by corridor volume:
  - **MEGA** (>$30B) — thick bright white arcs with glow (US→Mexico, UAE→India, etc.)
  - **MAJOR** ($10–30B) — orange arcs
  - **MID** ($2–10B) — cyan arcs
  - **MINOR** (<$2B) — faint thin lines
- 70+ active remittance corridors animated simultaneously

### 📡 Global Remittances Counter
- Live ticker in the top bar counting estimated remittances sent today
- Based on $905B annual (World Bank 2024) ÷ seconds elapsed since midnight
- Updates every second

### 💱 Live FX Ticker (desktop left panel / mobile sheet)
- 41 currency pairs with live mid-market rates
- **Base currency switcher** — change from USD to AED, GBP, EUR, SAR, CAD, AUD, SGD, and more
- Rates refresh every hour from ExchangeRate-API
- Click any currency row to fly the globe to that country
- Collapsible on desktop; slides up as a sheet on mobile

### 🏆 Leaderboard (bottom strip)
- **Top Receivers** and **Top Senders** tabs, 15 countries each
- Fully scrollable with proportional volume bars
- Click any country row to fly the globe there and open its panel
- Collapses when not in use

### 🗂️ Country Info Panel (click any country)
**Overview tab:**
- Leading Mobile Network Operator — name, subscriber count, market share
- Live remittance inflows, outflows, and % of GDP (World Bank API)
- Data year label and source badge (LIVE vs CACHED vs BASELINE)

**Send Money tab:**
- Live USD mid-market rate for the destination currency
- **Telcoin Featured Card** — lowest cost provider, always shown first:
  - Real Telcoin logo, fee/margin/total cost stats
  - Exact amount recipient gets in local currency at Telcoin's rate
  - Savings comparison bar vs traditional provider average
  - MNO PARTNER badge for Philippines and Malaysia (direct wallet delivery)
  - Referral CTA linking to `telco.in/en/referral?invitedby=6ce29b6420a`
  - Collapsible **About Telcoin** section with links to app, website, X, Telegram, CoinGecko
- Top 3 traditional providers (Wise, Remitly, WorldRemit, etc.) ranked by total cost
- Country-specific providers for 30+ major corridors; global defaults for all others

### 📱 Mobile Friendly
- Bottom navigation bar with FX Rates, Leaderboard, and Zoom buttons
- FX sheet slides up full-width on mobile
- Pinch-to-zoom on the globe
- Country panel anchors to bottom of screen above nav bar
- Full responsive layout for all screen sizes

---

## 🔄 How Live Data Works

### Layer 1 — Remittance Volumes (World Bank API, auto-fetched)
Fetches inflows, outflows, and % of GDP for every country on page load.
- Cached **7 days** in `localStorage`
- Status badge shows: 🟢 LIVE / 🟡 CACHED / 🔴 OFFLINE
- Falls back to 2024 baseline data silently if API unreachable

| Indicator | World Bank Code |
|-----------|----------------|
| Inflows received (USD) | `BX.TRF.PWKR.CD.DT` |
| Outflows sent (USD) | `BM.TRF.PWKR.CD.DT` |
| Inflows as % of GDP | `BX.TRF.PWKR.DT.GD.ZS` |

### Layer 2 — Live Exchange Rates (ExchangeRate-API, auto-fetched)
- Fetches rates for the selected base currency on every page load
- Cached **1 hour** in `sessionStorage` per base currency
- Used across the FX ticker, Send Money tab, and Telcoin savings calculator

### Layer 3 — MNO & Provider Data (`data.js`, manually maintained)
- Edit on GitHub → Netlify redeploys in ~30 seconds
- No real-time API exists for MNO subscriber counts or provider fee schedules

---

## ✏️ Updating Data on GitHub

### Update an MNO entry
```js
// In data.js → window.MNO_DATA
'Algeria': {
  mno: 'Mobilis (ATM)',     // operator name
  subs: '21.5 million',     // subscriber count
  share: '35%',             // market share
  outflow: '$1.3B',         // sent (WB API fallback)
  note: 'Context note...'   // shown in panel
},
```

### Update a provider's rates
```js
// In data.js → window.PROVIDERS
'India': [
  {
    name: 'Wise',
    fee_usd: 1.14,      // flat fee in USD for a $200 transfer
    fx_pct: 0.41,       // FX margin above mid-market (%)
    delivery: 'Instant',
    type: 'digital',    // 'digital' | 'bank' | 'agent'
    url: 'https://wise.com',
    color: '#00B9FF',
    note: 'Best USD→INR rate'
  },
  // Telcoin is added via the tel() helper function — see top of data.js
],
```

**Total estimated cost** = (fee_usd ÷ 200 × 100) + fx_pct

### Update Telcoin's MNO partner countries
```js
// In data.js
window.TELCOIN_MNO_COUNTRIES = new Set([
  'Philippines',   // Smart/PLDT confirmed
  'Malaysia',      // confirmed
  // Add new MNO markets here as partnerships expand
]);
```

### Force-refresh all user caches
Bump the cache key in `index.html` to make all users re-fetch fresh data:
```js
const WB_KEY = 'wb_rem_v5';           // increment from v4
const FX_CACHE_PREFIX = 'fx_v5_';     // increment from v4_
```

---

## 📊 Data Sources

| Data | Source | Frequency |
|------|--------|-----------|
| Remittance inflows/outflows | [World Bank KNOMAD](https://data.worldbank.org/indicator/BX.TRF.PWKR.CD.DT) | Annual (Jun–Oct) |
| Remittances as % of GDP | [World Bank WDI](https://data.worldbank.org/indicator/BX.TRF.PWKR.DT.GD.ZS) | Annual |
| Live exchange rates | [ExchangeRate-API](https://exchangerate-api.com) | Live (1-hr cache) |
| MNO subscriber counts | GSMA Intelligence, TeleGeography | Quarterly — update `data.js` |
| Provider fees & FX margins | World Bank RPW, Monito.com | As they change — update `data.js` |
| Telcoin rates & partnerships | [telco.in](https://www.telco.in/en), telcoin.network | As they change — update `data.js` |
| World map topology | [world-atlas@2](https://github.com/topojson/world-atlas) (50m resolution) | Stable |
| Country flags | [flagcdn / lipis flag-icons](https://github.com/lipis/flag-icons) | Stable |

---

## 🔗 Telcoin Links

| Resource | URL |
|----------|-----|
| App (with referral) | [telco.in/en/referral?invitedby=6ce29b6420a](https://www.telco.in/en/referral?invitedby=6ce29b6420a) |
| Official Website | [telco.in/en](https://www.telco.in/en) |
| X — Telcoin | [@telcoin](https://x.com/telcoin) |
| X — Telcoin Association | [@TelcoinTAO](https://x.com/TelcoinTAO) |
| Telegram Announcements | [t.me/Telcoin_Announcements](https://t.me/Telcoin_Announcements) |
| TEL Token (CoinGecko) | [coingecko.com/en/coins/telcoin](https://www.coingecko.com/en/coins/telcoin) |

---

## 📝 Useful Links for Manual Data Updates

- **World Bank RPW** (provider costs): [remittanceprices.worldbank.org](https://remittanceprices.worldbank.org)
- **Monito** (live provider comparisons): [monito.com](https://monito.com)
- **GSMA Intelligence** (MNO data): [gsma.com/intelligence](https://www.gsma.com/solutions-and-impact/gsma-intelligence/)
- **TeleGeography** (MNO data): [telegeography.com](https://telegeography.com)
- **World Bank KNOMAD**: [knomad.org/data/remittances](https://www.knomad.org/data/remittances)

---

*Built with D3.js · TopoJSON · World Bank Open Data · ExchangeRate-API · lipis/flag-icons · Powered by Telcoin*
