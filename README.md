# 🌍 RemitMap — Global MNO & Remittance Explorer

**[remitmap.com](https://remitmap.com)** — An interactive 3D globe showing the world's money in motion. Click any country to see its leading mobile network operator, live remittance flows, and the cheapest providers to send money there — including Telcoin.

---

## 📁 Files

```
remitmap/
├── index.html        — The entire app (globe, UI, live data, all logic inline)
├── data.js           — All editable data: MNOs, providers, currencies (169 countries)
├── sw.js             — Service worker (PWA offline support)
├── manifest.json     — PWA manifest (installable as home screen app)
└── icons/            — App icons (72, 96, 128, 144, 152, 192, 384, 512px)
```

**Only ever edit `data.js`** for data updates. `index.html` only needs touching for layout or design changes.

---

## ✨ Features

### 🌐 Interactive 3D Globe
- Drag to rotate, scroll/pinch to zoom, click any country for data
- Heat-mapped remittance arc animations — 4 tiers by corridor volume:
  - **MEGA** (>$30B) — thick bright white arcs with glow
  - **MAJOR** ($10–30B) — orange arcs
  - **MID** ($2–10B) — cyan arcs
  - **MINOR** (<$2B) — faint thin lines
- 70+ active remittance corridors animated simultaneously
- Adaptive FPS — arc count reduces automatically on slower devices

### 📡 Global Remittances Counter
- Live ticker counting estimated remittances sent today
- Based on $905B annual (World Bank 2024) ÷ seconds elapsed since midnight UTC
- Updates every second; resets at midnight
- Hover tooltip explains the calculation methodology

### 💱 Live FX Ticker (desktop left panel / mobile sheet)
- 41 currency pairs with live mid-market rates
- Base currency switcher — USD, AED, GBP, EUR, SAR, CAD, AUD, SGD, and more
- Rates refresh every hour from ECB (primary) with ExchangeRate-API fallback
- Click any currency row to fly the globe to that country

### 🔍 Search Bar
- Type any country name to fly to it and open its info panel
- Desktop: always visible below the FX panel
- Mobile: tap the search icon to expand; auto-hides when a panel opens

### 🏆 Leaderboard (bottom strip)
- Top Receivers and Top Senders tabs, 15 countries each
- Click any row to fly the globe there and open its panel

### 🟦 Telcoin Mode
Toggle in the top bar. When active:
- Globe recolors — cyan glow = Telcoin cheapest, dark = other provider wins
- MNO partner countries pulse with an animated ring
- Counter shows "TELCOIN CHEAPEST IN X COUNTRIES"
- Arc animations switch to savings-mode corridors only
- Click the TELCOIN MODE label for a tooltip explaining the methodology

### ⛓️ Telcoin Network Panel
Live stats from the Telcoin Network blockchain, polled every 15 seconds:
- Latest block, total transactions, gas price (Gwei), wallet count, smart contracts
- TESTNET / MAINNET badge; all stats link to telscan.io
- Desktop: bottom-right corner, slides left when Send Money is open
- Mobile: bottom of screen, hides when FX sheet or leaderboard opens

### 🗂️ Country Info Panel

**Overview tab:**
- Leading Mobile Network Operator — name, subscriber count, market share
- Live remittance inflows and outflows with ⓘ tooltips
- Data year label and source badge (LIVE / CACHED / BASELINE 2024)

**Send Money tab:**
- Live USD mid-market rate for the destination currency
- Telcoin card — ranked honestly by total cost, always shown:
  - Fee, FX margin, total cost, exact local currency amount
  - Savings comparison bar vs traditional provider average
  - MNO PARTNER badge for Philippines and Malaysia
  - Referral CTA → telco.in/en/referral?invitedby=6ce29b6420a
  - Collapsible About Telcoin section
- Top traditional providers ranked by cost (Wise, Remitly, WorldRemit, etc.)

### 📱 Mobile Layout
- Bottom nav: FX Rates, Leaderboard, Zoom +/−
- All panels use safe-area insets for notch/home-bar devices
- Telcoin Network panel hides when FX or leaderboard opens
- Telcoin Mode toggle hides when Send Money is open

### 📲 PWA
- Installable as a home screen app on iOS and Android
- Service worker caches static assets
- Manifest with full icon set (8 sizes)

### 🌙 Easter Egg
Click the small faint moon in the starfield:
- Spinning 3D Telcoin globe (Three.js) — drag to spin with inertia
- Synthwave perspective grid floor with scrolling cyan/magenta lines
- CRT scanlines overlay (pure CSS, zero JS cost)
- Glitch text effect on the CTA button
- Confetti burst on open
- Twinkling star field
- Segmented VISITORS counter (persists in localStorage)
- "SEND MONEY SMARTER TODAY ↗" → Telcoin referral link

---

## 🔄 How Live Data Works

### World Bank Remittance Volumes
- Auto-fetched on page load
- Cached 7 days in `localStorage` under key `wb_rem_v5`
- Falls back to 2024 baseline if API unreachable

| Indicator | World Bank Code |
|-----------|----------------|
| Inflows received (USD) | `BX.TRF.PWKR.CD.DT` |
| Outflows sent (USD) | `BM.TRF.PWKR.CD.DT` |
| Inflows as % of GDP | `BX.TRF.PWKR.DT.GD.ZS` |

### Exchange Rates
- ECB/Frankfurter primary, ExchangeRate-API fallback
- Cached 1 hour in `sessionStorage` under key `fx_v6_<base>`

### Telcoin Network Stats
- Polls `rpc.telcoin.network` every 15 seconds (Chain ID: 2017)
- Always live, no caching

### MNO & Provider Data
- Stored in `data.js`, deployed via GitHub → Cloudflare Pages (~30 sec)

---

## ✏️ Updating Data

### MNO entry
```js
// data.js → window.MNO_DATA
'Algeria': {
  mno: 'Mobilis (ATM)',
  subs: '21.5 million',
  share: '35%',
  outflow: '$1.3B',
  note: 'Context note...'
},
```

### Provider rates
```js
// data.js → window.PROVIDERS
'India': [
  {
    name: 'Wise',
    fee_usd: 1.14,       // flat fee for $200 transfer
    fx_pct: 0.41,        // FX margin above mid-market (%)
    delivery: 'Instant',
    type: 'digital',     // 'digital' | 'bank' | 'agent'
    url: 'https://wise.com',
    color: '#00B9FF',
    note: 'Best USD→INR rate'
  },
  // Telcoin added automatically via tel() helper — see top of data.js
],
```

**Total cost** = (fee_usd ÷ 200 × 100) + fx_pct

### Telcoin MNO partner countries
```js
// data.js
window.TELCOIN_MNO_COUNTRIES = new Set([
  'Philippines',
  'Malaysia',
  // Add new markets here
]);
```

### Force-refresh user caches
```js
// index.html — bump these to make all users re-fetch
const WB_KEY = 'wb_rem_v6';       // was v5
const FX_CACHE_PREFIX = 'fx_v7_'; // was fx_v6_
```

---

## 📊 Data Sources

| Data | Source | Frequency |
|------|--------|-----------|
| Remittance inflows/outflows | World Bank KNOMAD | Annual |
| Remittances % of GDP | World Bank WDI | Annual |
| Exchange rates | ECB + ExchangeRate-API | Live (1-hr cache) |
| Telcoin Network stats | rpc.telcoin.network | Live (15-sec poll) |
| MNO subscriber counts | GSMA Intelligence, TeleGeography | Quarterly — update data.js |
| Provider fees & margins | World Bank RPW Q1 2025 | As they change — update data.js |
| World map | world-atlas@2 (50m TopoJSON) | Stable |
| Country flags | lipis/flag-icons | Stable |

---

## 🔗 Telcoin Links

| Resource | URL |
|----------|-----|
| App (referral) | [telco.in/en/referral?invitedby=6ce29b6420a](https://www.telco.in/en/referral?invitedby=6ce29b6420a) |
| Website | [telco.in/en](https://www.telco.in/en) |
| Chain Explorer | [telscan.io](https://telscan.io) |
| X — Telcoin | [@telcoin](https://x.com/telcoin) |
| X — Telcoin Association | [@TelcoinTAO](https://x.com/TelcoinTAO) |
| Telegram | [t.me/Telcoin_Announcements](https://t.me/Telcoin_Announcements) |
| CoinGecko | [coingecko.com/en/coins/telcoin](https://www.coingecko.com/en/coins/telcoin) |

---

## 📝 Data Update Resources

- **World Bank RPW**: [remittanceprices.worldbank.org](https://remittanceprices.worldbank.org)
- **Monito**: [monito.com](https://monito.com)
- **GSMA Intelligence**: [gsma.com/intelligence](https://www.gsma.com/solutions-and-impact/gsma-intelligence/)
- **TeleGeography**: [telegeography.com](https://telegeography.com)
- **KNOMAD**: [knomad.org/data/remittances](https://www.knomad.org/data/remittances)

---

*Built with D3.js · TopoJSON · Three.js · World Bank Open Data · ECB/ExchangeRate-API · lipis/flag-icons · Powered by Telcoin*
