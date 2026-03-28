# 🌍 RemitMap — Global MNO & Remittance Explorer

**[remitmap.com](https://remitmap.com)** — Interactive globe showing the leading mobile network operator, live remittance flows, and the top 3 cheapest money transfer providers for every country in the world.

---

## 📁 Files

```
remitmap/
├── index.html   — Globe app (globe rendering, tabs, live data fetching)
└── data.js      — All editable data: MNOs, providers, currencies
```

**Only ever edit `data.js`** for data updates. `index.html` only needs touching if you want to change layout or design.

---

## 🔄 How Live Data Works

### Layer 1 — Remittance volumes (World Bank API, auto-fetched)
Fetches inflows, outflows, and % of GDP for every country on every page load.
- Cached **7 days** in `localStorage` — fast for repeat visitors
- Falls back silently to 2024 baseline if API unreachable
- Status badge top-right shows: 🟢 LIVE / 🟡 CACHED / 🔴 OFFLINE

**Indicators used:**
| Data | World Bank Code |
|------|----------------|
| Inflows received (USD) | `BX.TRF.PWKR.CD.DT` |
| Outflows sent (USD) | `BM.TRF.PWKR.CD.DT` |
| Inflows as % of GDP | `BX.TRF.PWKR.DT.GD.ZS` |

### Layer 2 — Live exchange rates (ExchangeRate-API, auto-fetched)
Fetches live USD → local currency mid-market rates on every page load.
- Cached **1 hour** in `sessionStorage`
- Used in the **Send Money** tab to calculate exactly what $200 becomes at each provider
- If unavailable, provider cards still show fee/margin data

### Layer 3 — MNO & Provider data (`data.js` on GitHub)
No real-time API exists for MNO subscriber counts or provider fee schedules.
These live in `data.js` — edit on GitHub and Netlify auto-redeploys in ~30 seconds.

---

## ✏️ Updating Data (GitHub Web Editor)

### Update an MNO operator
1. Go to your GitHub repo → click `data.js` → click ✏️ (pencil icon)
2. Find the country and edit the values
3. Click **Commit changes** → live in ~30 seconds

### Update a provider's rates
```js
'India': [
  {
    name: 'Wise',
    fee_usd: 1.14,      // flat fee in USD for a $200 transfer
    fx_pct: 0.41,       // FX margin above mid-market rate (%)
    delivery: 'Instant',
    type: 'digital',    // 'digital' | 'bank' | 'agent'
    url: 'https://wise.com',
    color: '#00B9FF',
    note: 'Best USD→INR rate'
  },
],
```

---

## 📊 Data Sources

| Data | Source | Frequency |
|------|--------|-----------|
| Remittance inflows/outflows | World Bank KNOMAD | Annual |
| Live exchange rates | ExchangeRate-API | Live (1-hr cache) |
| MNO subscriber counts | GSMA Intelligence, TeleGeography | Quarterly |
| Provider fees | World Bank RPW, Monito.com | As they change |
| Country flags | flagcdn.com | Stable |

---

*Built with D3.js · TopoJSON · World Bank Open Data · ExchangeRate-API · Flagcdn*
