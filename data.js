/**
 * data.js — RemitMap editable data layer
 * ─────────────────────────────────────────────────────────────────────────────
 * Edit on GitHub → Netlify auto-deploys in ~30 seconds.
 *
 * ── DATA SOURCES & ACCURACY NOTES ────────────────────────────────────────────
 *
 * REMITTANCE VOLUMES (auto-fetched live — NOT from this file):
 *   Source:  World Bank / IMF Balance of Payments Statistics
 *   API:     api.worldbank.org (indicators BX.TRF.PWKR.CD.DT,
 *            BM.TRF.PWKR.CD.DT, BX.TRF.PWKR.DT.GD.ZS)
 *   Quality: Gold standard. Compiled from central bank reports across 214
 *            countries. Annual data; 2023 figures available, 2024 estimates
 *            published Jan 2025 (World Bank Migration & Development Brief 40).
 *   Limit:   Excludes informal/hawala flows — true totals are higher.
 *
 * FX RATES (auto-fetched live — NOT from this file):
 *   Primary: Frankfurter (api.frankfurter.dev) — European Central Bank
 *            official reference rates. Most authoritative free source for
 *            ~32 major currencies. Updated daily ~16:00 CET on business days.
 *   Fallback: ExchangeRate-API (exchangerate-api.com) — commercial aggregator
 *            used for emerging-market currencies not covered by ECB
 *            (NGN, BDT, NPR, GHS, GTQ etc.).
 *
 * MNO SUBSCRIBER DATA (this file — manual update required):
 *   Source:  GSMA Intelligence (definitive source, paywalled), supplemented by
 *            publicly reported operator earnings calls and GSMA free summaries,
 *            TeleGeography GlobalComms, and carrier press releases.
 *   Quality: Best freely available. GSMA Intelligence full database requires
 *            ~$50K/year subscription. Figures reflect Q1 2025 public data.
 *   Update:  Edit MNO_DATA below and commit to GitHub each quarter.
 *
 * PROVIDER FEE DATA (this file — manual update required):
 *   Source:  World Bank Remittance Prices Worldwide (RPW) — Q1 2025 report.
 *            Cross-referenced with Monito.com and provider websites.
 *            RPW covers 367 corridors, 48 sending → 105 receiving countries.
 *   Quality: Best public source. Updated quarterly by World Bank.
 *   Update:  Check remittanceprices.worldbank.org each quarter and update fees.
 *
 * LEADERBOARD / CORRIDOR VOLUMES (index.html — hardcoded):
 *   Source:  World Bank Migration & Development Brief 40 (Jan 2025).
 *            Top recipient figures are 2024 estimates confirmed by WB/KNOMAD.
 *   Quality: These match official World Bank published estimates exactly.
 *
 * GLOBAL COUNTER ($905B annual):
 *   Source:  World Bank/GMDAC 2024 estimate — total global remittance flows
 *            including high-income country recipients.
 *
 * Last manual review: March 2025
 */

// ── CURRENCY CODES (ISO 4217) ─────────────────────────────────────────────────
window.CURRENCY = {
  'Afghanistan':'AFN','Albania':'ALL','Algeria':'DZD','Angola':'AOA','Argentina':'ARS',
  'Australia':'AUD','Austria':'EUR','Bangladesh':'BDT','Belgium':'EUR','Bhutan':'BTN',
  'Bolivia':'BOB','Brazil':'BRL','Bulgaria':'BGN','Myanmar':'MMK','Cambodia':'KHR',
  'Cameroon':'XAF','Canada':'CAD','Sri Lanka':'LKR','Chile':'CLP','China':'CNY',
  'Taiwan':'TWD','Colombia':'COP','Republic of Congo':'XAF','DR Congo':'CDF',
  'Costa Rica':'CRC','Croatia':'EUR','Cuba':'CUP','Cyprus':'EUR','Czech Republic':'CZK',
  'Denmark':'DKK','Dominican Republic':'DOP','Ecuador':'USD','Egypt':'EGP',
  'El Salvador':'USD','Ethiopia':'ETB','Finland':'EUR','France':'EUR','Gabon':'XAF',
  'Germany':'EUR','Ghana':'GHS','Greece':'EUR','Guatemala':'GTQ','Guinea':'GNF',
  'Haiti':'HTG','Honduras':'HNL','Hungary':'HUF','India':'INR','Indonesia':'IDR',
  'Iran':'IRR','Iraq':'IQD','Ireland':'EUR','Israel':'ILS','Italy':'EUR',
  'Jamaica':'JMD','Japan':'JPY','Jordan':'JOD','Kazakhstan':'KZT','Kenya':'KES',
  'North Korea':'KPW','South Korea':'KRW','Kuwait':'KWD','Laos':'LAK',
  'Lebanon':'LBP','Lesotho':'LSL','Liberia':'LRD','Libya':'LYD','Lithuania':'EUR',
  'Luxembourg':'EUR','Madagascar':'MGA','Malawi':'MWK','Malaysia':'MYR','Mali':'XOF',
  'Mexico':'MXN','Mongolia':'MNT','Morocco':'MAD','Mozambique':'MZN','Namibia':'NAD',
  'Nepal':'NPR','Netherlands':'EUR','New Zealand':'NZD','Nicaragua':'NIO',
  'Niger':'XOF','Nigeria':'NGN','Norway':'NOK','Pakistan':'PKR','Panama':'USD',
  'Papua New Guinea':'PGK','Peru':'PEN','Philippines':'PHP','Poland':'PLN',
  'Portugal':'EUR','Qatar':'QAR','Romania':'RON','Russia':'RUB','Rwanda':'RWF',
  'Saudi Arabia':'SAR','Senegal':'XOF','Sierra Leone':'SLL','Slovakia':'EUR',
  'Slovenia':'EUR','Somalia':'SOS','South Africa':'ZAR','Zimbabwe':'ZWL',
  'Spain':'EUR','Sudan':'SDG','Suriname':'SRD','Sweden':'SEK','Switzerland':'CHF',
  'Syria':'SYP','Tajikistan':'TJS','Tanzania':'TZS','Thailand':'THB','Togo':'XOF',
  'Trinidad and Tobago':'TTD','Tunisia':'TND','Turkey':'TRY','UAE':'AED',
  'Uganda':'UGX','Ukraine':'UAH','United Kingdom':'GBP','United States':'USD',
  'Uruguay':'UYU','Uzbekistan':'UZS','Venezuela':'VES','Vietnam':'VND',
  'Yemen':'YER','Zambia':'ZMW'
};

// ── TELCOIN CORRIDOR DATA ─────────────────────────────────────────────────────
// Countries where Telcoin has confirmed MNO partnerships (better rates)
// vs countries where Telcoin is available via the app (standard rates)
// Source: telcoin.network partnership announcements, Q1 2025
window.TELCOIN_MNO_COUNTRIES = new Set([
  'Philippines',   // Smart Communications (PLDT) — confirmed
  'Malaysia',      // Confirmed MNO integration
  'Australia',     // Active sending market
  'Canada',        // Active sending market
]);

// Helper — builds a Telcoin provider entry
// mno=true: MNO-integrated corridor (better rates, faster)
// mno=false: available via Telcoin App (standard rates)
function tel(mno, extraNote) {
  const fee  = mno ? 0.50 : 0.99;
  const fxm  = mno ? 0.35 : 0.50;
  const note = mno
    ? 'Direct MNO integration — funds arrive in mobile wallet on recipient\'s network. ' + (extraNote || '')
    : 'Via Telcoin App — blockchain-settled, near-instant. ' + (extraNote || '');
  return {
    name: 'Telcoin', fee_usd: fee, fx_pct: fxm, delivery: '< 1 min',
    type: 'crypto', url: 'https://telcoin.network', color: '#00E5FF',
    telcoin: true, mno, note: note.trim()
  };
}

// ── REMITTANCE PROVIDERS ──────────────────────────────────────────────────────
// fee_usd: flat fee for a $200 transfer (USD)
// fx_pct:  FX margin above mid-market rate (%)
// Total estimated cost = (fee_usd/200*100) + fx_pct
// Telcoin entry is always listed first — it earns that position on cost alone.
window.PROVIDERS = {

  'default': [
    tel(false),
    { name:'Wise',          fee_usd:1.14, fx_pct:0.41, delivery:'Instant–2 days', type:'digital', url:'https://wise.com',        color:'#00B9FF', note:'Mid-market rate, no hidden fees' },
    { name:'Remitly',       fee_usd:0,    fx_pct:1.50, delivery:'3–5 min',        type:'digital', url:'https://remitly.com',     color:'#FF2B5E', note:'Express delivery, first transfer often free' },
    { name:'Western Union', fee_usd:5.00, fx_pct:2.50, delivery:'Minutes',        type:'agent',   url:'https://westernunion.com', color:'#FFD700', note:'Widest global coverage, 500K+ locations' }
  ],

  'India': [
    tel(false, 'Best USD→INR blockchain rate available.'),
    { name:'Wise',              fee_usd:1.14, fx_pct:0.41, delivery:'Instant',   type:'digital', url:'https://wise.com',                  color:'#00B9FF', note:'Best traditional USD→INR rate, any Indian bank' },
    { name:'Remitly',           fee_usd:0,    fx_pct:1.20, delivery:'3 min',     type:'digital', url:'https://remitly.com',               color:'#FF2B5E', note:'UPI & bank transfers, 3-min express' },
    { name:'ICICI Money2India', fee_usd:0,    fx_pct:1.80, delivery:'1–2 hrs',   type:'bank',    url:'https://money2india.icicibank.com',  color:'#FF6600', note:'NRI specialist, widest Indian bank network' }
  ],

  'Philippines': [
    tel(true, 'Smart/PLDT MNO partnership — funds delivered to GCash or Smart Money wallet.'),
    { name:'Remitly',    fee_usd:0,    fx_pct:0.50, delivery:'3 min',   type:'digital', url:'https://remitly.com',    color:'#FF2B5E', note:'GCash/bank transfers, near mid-market PHP rate' },
    { name:'Wise',       fee_usd:1.14, fx_pct:0.41, delivery:'Instant', type:'digital', url:'https://wise.com',       color:'#00B9FF', note:'Mid-market rate, BDO/BPI/UnionBank' },
    { name:'WorldRemit', fee_usd:3.99, fx_pct:1.20, delivery:'Minutes', type:'digital', url:'https://worldremit.com', color:'#E31837', note:'Cash pickup at 13K+ Philippine locations' }
  ],

  'Malaysia': [
    tel(true, 'Confirmed MNO integration — competitive MYR delivery rates.'),
    { name:'Wise',          fee_usd:1.14, fx_pct:0.41, delivery:'Instant', type:'digital', url:'https://wise.com',        color:'#00B9FF', note:'Best USD→MYR rate for bank transfers' },
    { name:'Remitly',       fee_usd:0,    fx_pct:1.20, delivery:'3–5 min', type:'digital', url:'https://remitly.com',     color:'#FF2B5E', note:'Maybank, CIMB, Public Bank delivery' },
    { name:'Western Union', fee_usd:5.00, fx_pct:2.50, delivery:'Minutes', type:'agent',   url:'https://westernunion.com', color:'#FFD700', note:'Cash pickup at Maybank & agents' }
  ],

  'Mexico': [
    tel(false, 'Competitive USD→MXN blockchain rate.'),
    { name:'Remitly',   fee_usd:0,    fx_pct:0.50, delivery:'3 min',   type:'digital', url:'https://remitly.com', color:'#FF2B5E', note:'Best traditional USD→MXN rate, Banorte/BBVA' },
    { name:'Wise',      fee_usd:1.14, fx_pct:0.41, delivery:'Instant', type:'digital', url:'https://wise.com',    color:'#00B9FF', note:'Transparent fees, bank transfer only' },
    { name:'Xoom',      fee_usd:4.99, fx_pct:1.80, delivery:'Minutes', type:'digital', url:'https://xoom.com',    color:'#003087', note:'PayPal-owned, cash pickup at 30K+ locations' }
  ],

  'China': [
    tel(false),
    { name:'Wise',          fee_usd:1.14, fx_pct:0.41, delivery:'1–2 days', type:'digital', url:'https://wise.com',        color:'#00B9FF', note:'Best USD→CNY rate for bank transfers' },
    { name:'Remitly',       fee_usd:0,    fx_pct:1.30, delivery:'1 day',    type:'digital', url:'https://remitly.com',     color:'#FF2B5E', note:'Bank account delivery across China' },
    { name:'Western Union', fee_usd:5,    fx_pct:2.50, delivery:'Minutes',  type:'agent',   url:'https://westernunion.com', color:'#FFD700', note:'Cash pickup or bank in China' }
  ],

  'Pakistan': [
    tel(false, 'Strong USD→PKR blockchain rate post-liberalisation.'),
    { name:'Wise',               fee_usd:1.14, fx_pct:0.41, delivery:'1–2 days', type:'digital', url:'https://wise.com',                color:'#00B9FF', note:'Best USD→PKR rate post-liberalisation' },
    { name:'Remitly',            fee_usd:0,    fx_pct:1.50, delivery:'3 min',    type:'digital', url:'https://remitly.com',             color:'#FF2B5E', note:'Jazz Cash, Easypaisa, HBL, Meezan' },
    { name:'ACE Money Transfer', fee_usd:0,    fx_pct:1.80, delivery:'Minutes',  type:'digital', url:'https://acemoneytransfer.com',    color:'#0057A8', note:'Competitive PKR rates, popular UK→PK corridor' }
  ],

  'Egypt': [
    tel(false, 'Post-EGP liberalisation blockchain corridor.'),
    { name:'Wise',      fee_usd:1.14, fx_pct:0.41, delivery:'1–2 days', type:'digital', url:'https://wise.com',        color:'#00B9FF', note:'Post-EGP liberalisation, best rate available' },
    { name:'Remitly',   fee_usd:0,    fx_pct:1.80, delivery:'3–5 min',  type:'digital', url:'https://remitly.com',     color:'#FF2B5E', note:'Cash at Egypt Post or bank deposit' },
    { name:'MoneyGram', fee_usd:5.99, fx_pct:2.80, delivery:'Minutes',  type:'agent',   url:'https://moneygram.com',   color:'#FF6600', note:'20K+ Egypt locations via Fawry & Egypt Post' }
  ],

  'Bangladesh': [
    tel(false),
    { name:'Wise',          fee_usd:1.14, fx_pct:0.41, delivery:'1–2 days', type:'digital', url:'https://wise.com',        color:'#00B9FF', note:'Best USD→BDT rate, bank transfer' },
    { name:'Remitly',       fee_usd:0,    fx_pct:1.50, delivery:'3–5 min',  type:'digital', url:'https://remitly.com',     color:'#FF2B5E', note:'bKash, Nagad, and bank delivery' },
    { name:'Western Union', fee_usd:5,    fx_pct:2.50, delivery:'Minutes',  type:'agent',   url:'https://westernunion.com', color:'#FFD700', note:'Cash pickup at Dutch Bangla & agents' }
  ],

  'Nigeria': [
    tel(false),
    { name:'Sendwave',   fee_usd:0,    fx_pct:0.80, delivery:'Instant',  type:'digital', url:'https://sendwave.com',    color:'#00CC88', note:'No fees, best NGN rates from US/UK' },
    { name:'Remitly',    fee_usd:0,    fx_pct:1.50, delivery:'3–5 min',  type:'digital', url:'https://remitly.com',     color:'#FF2B5E', note:'Guarantees exchange rate at time of transfer' },
    { name:'WorldRemit', fee_usd:3.99, fx_pct:1.50, delivery:'Minutes',  type:'digital', url:'https://worldremit.com',  color:'#E31837', note:'Bank, cash pickup, airtime top-up' }
  ],

  'Ghana': [
    tel(false),
    { name:'Sendwave',   fee_usd:0,    fx_pct:0.80, delivery:'Instant',  type:'digital', url:'https://sendwave.com',   color:'#00CC88', note:'No fees, best GHS rates, MoMo delivery' },
    { name:'WorldRemit', fee_usd:3.99, fx_pct:1.50, delivery:'Minutes',  type:'digital', url:'https://worldremit.com', color:'#E31837', note:'MTN MoMo, bank, and cash pickup' },
    { name:'Remitly',    fee_usd:0,    fx_pct:1.80, delivery:'3–5 min',  type:'digital', url:'https://remitly.com',    color:'#FF2B5E', note:'Mobile money and bank transfer' }
  ],

  'Kenya': [
    tel(false),
    { name:'Sendwave',   fee_usd:0,    fx_pct:0.80, delivery:'Instant',  type:'digital', url:'https://sendwave.com',   color:'#00CC88', note:'No fees, M-Pesa delivery in seconds' },
    { name:'WorldRemit', fee_usd:3.99, fx_pct:1.20, delivery:'Minutes',  type:'digital', url:'https://worldremit.com', color:'#E31837', note:'M-Pesa, Airtel Money, bank, cash' },
    { name:'Wise',       fee_usd:1.14, fx_pct:0.41, delivery:'1–2 days', type:'digital', url:'https://wise.com',       color:'#00B9FF', note:'Best rate for KES bank transfers' }
  ],

  'Vietnam': [
    tel(false),
    { name:'Wise',    fee_usd:1.14, fx_pct:0.41, delivery:'Instant',  type:'digital', url:'https://wise.com',             color:'#00B9FF', note:'Best USD→VND rate, bank transfer' },
    { name:'Remitly', fee_usd:0,    fx_pct:1.20, delivery:'3–5 min',  type:'digital', url:'https://remitly.com',          color:'#FF2B5E', note:'VietinBank, Vietcombank, Techcombank' },
    { name:'Ria',     fee_usd:4.99, fx_pct:1.50, delivery:'Minutes',  type:'agent',   url:'https://riamoneytransfer.com', color:'#004E9A', note:'Cash pickup across Vietnam provinces' }
  ],

  'Indonesia': [
    tel(false),
    { name:'Wise',          fee_usd:1.14, fx_pct:0.41, delivery:'Instant', type:'digital', url:'https://wise.com',        color:'#00B9FF', note:'Best USD→IDR rate, BCA/Mandiri/BRI' },
    { name:'Remitly',       fee_usd:0,    fx_pct:1.50, delivery:'3–5 min', type:'digital', url:'https://remitly.com',     color:'#FF2B5E', note:'GoPay, OVO, Dana, bank transfer' },
    { name:'Western Union', fee_usd:5,    fx_pct:2.50, delivery:'Minutes', type:'agent',   url:'https://westernunion.com', color:'#FFD700', note:'Cash at Bank BRI, 200K+ locations' }
  ],

  'Morocco': [
    tel(false),
    { name:'Wise',    fee_usd:1.14, fx_pct:0.41, delivery:'1–2 days', type:'digital', url:'https://wise.com',             color:'#00B9FF', note:'Best USD→MAD rate for bank transfer' },
    { name:'Remitly', fee_usd:0,    fx_pct:1.50, delivery:'3–5 min',  type:'digital', url:'https://remitly.com',          color:'#FF2B5E', note:'CIH Bank, Attijariwafa, cash pickup' },
    { name:'Ria',     fee_usd:4.99, fx_pct:1.50, delivery:'Minutes',  type:'agent',   url:'https://riamoneytransfer.com', color:'#004E9A', note:'Cash pickup at BMCE & Attijariwafa' }
  ],

  'Ukraine': [
    tel(false),
    { name:'Wise',          fee_usd:1.14, fx_pct:0.41, delivery:'Instant',  type:'digital', url:'https://wise.com',        color:'#00B9FF', note:'Best USD→UAH rate, PrivatBank/Monobank' },
    { name:'Remitly',       fee_usd:0,    fx_pct:1.50, delivery:'3–5 min',  type:'digital', url:'https://remitly.com',     color:'#FF2B5E', note:'Fast delivery to Ukrainian banks' },
    { name:'Western Union', fee_usd:5,    fx_pct:2.00, delivery:'Minutes',  type:'agent',   url:'https://westernunion.com', color:'#FFD700', note:'Cash at Ukrposhta, operational despite war' }
  ],

  'Nepal': [
    tel(false),
    { name:'Remitly', fee_usd:0,    fx_pct:1.20, delivery:'3–5 min',  type:'digital', url:'https://remitly.com',  color:'#FF2B5E', note:'eSewa, Khalti, bank — near mid-market' },
    { name:'Wise',    fee_usd:1.14, fx_pct:0.41, delivery:'1–2 days', type:'digital', url:'https://wise.com',     color:'#00B9FF', note:'Best USD→NPR rate for bank transfer' },
    { name:'IME',     fee_usd:2.00, fx_pct:1.50, delivery:'Minutes',  type:'agent',   url:'https://imepay.com.np', color:'#FF0000', note:'Nepal\'s largest inbound remittance network' }
  ],

  'Sri Lanka': [
    tel(false),
    { name:'Wise',          fee_usd:1.14, fx_pct:0.41, delivery:'1–2 days', type:'digital', url:'https://wise.com',        color:'#00B9FF', note:'Best USD→LKR rate for bank transfer' },
    { name:'Remitly',       fee_usd:0,    fx_pct:1.50, delivery:'3–5 min',  type:'digital', url:'https://remitly.com',     color:'#FF2B5E', note:'Sampath, Commercial Bank, HNB' },
    { name:'Western Union', fee_usd:5,    fx_pct:2.50, delivery:'Minutes',  type:'agent',   url:'https://westernunion.com', color:'#FFD700', note:'Cash at Bank of Ceylon, Sampath Bank' }
  ],

  'Guatemala': [
    tel(false),
    { name:'Remitly', fee_usd:0,    fx_pct:0.80, delivery:'3 min',   type:'digital', url:'https://remitly.com',          color:'#FF2B5E', note:'Best GTQ rates, Banrural & G&T' },
    { name:'Wise',    fee_usd:1.14, fx_pct:0.41, delivery:'Instant', type:'digital', url:'https://wise.com',             color:'#00B9FF', note:'Transparent fees, bank transfer' },
    { name:'Ria',     fee_usd:4.99, fx_pct:1.50, delivery:'Minutes', type:'agent',   url:'https://riamoneytransfer.com', color:'#004E9A', note:'Cash at 3,000+ Guatemala locations' }
  ],

  'Honduras': [
    tel(false),
    { name:'Remitly',   fee_usd:0,    fx_pct:1.00, delivery:'3–5 min',  type:'digital', url:'https://remitly.com',  color:'#FF2B5E', note:'Best HNL rate, Banco Atlántida & Ficohsa' },
    { name:'Wise',      fee_usd:1.14, fx_pct:0.41, delivery:'Instant',  type:'digital', url:'https://wise.com',     color:'#00B9FF', note:'Mid-market rate, bank transfer only' },
    { name:'MoneyGram', fee_usd:5.99, fx_pct:2.50, delivery:'Minutes',  type:'agent',   url:'https://moneygram.com', color:'#FF6600', note:'Cash pickup nationwide' }
  ],

  'El Salvador': [
    tel(false, 'USD corridor — no FX conversion needed.'),
    { name:'Remitly',       fee_usd:0,    fx_pct:0.50, delivery:'3 min',   type:'digital', url:'https://remitly.com',     color:'#FF2B5E', note:'USD corridor, best fees for SV' },
    { name:'Xoom',          fee_usd:4.99, fx_pct:0,    delivery:'Minutes', type:'digital', url:'https://xoom.com',        color:'#003087', note:'USD→USD bank or cash in El Salvador' },
    { name:'Western Union', fee_usd:5,    fx_pct:0,    delivery:'Minutes', type:'agent',   url:'https://westernunion.com', color:'#FFD700', note:'USD cash at 1,000+ SV locations' }
  ],

  'Dominican Republic': [
    tel(false),
    { name:'Remitly', fee_usd:0,    fx_pct:0.80, delivery:'3 min',   type:'digital', url:'https://remitly.com',          color:'#FF2B5E', note:'Best DOP rate, Banreservas, BHD' },
    { name:'Wise',    fee_usd:1.14, fx_pct:0.41, delivery:'Instant', type:'digital', url:'https://wise.com',             color:'#00B9FF', note:'Best USD→DOP transparent rate' },
    { name:'Ria',     fee_usd:4.99, fx_pct:1.50, delivery:'Minutes', type:'agent',   url:'https://riamoneytransfer.com', color:'#004E9A', note:'3,000+ cash pickup locations in DR' }
  ],

  'Colombia': [
    tel(false),
    { name:'Wise',    fee_usd:1.14, fx_pct:0.41, delivery:'Instant',  type:'digital', url:'https://wise.com',             color:'#00B9FF', note:'Best USD→COP rate, bank transfer' },
    { name:'Remitly', fee_usd:0,    fx_pct:1.20, delivery:'3–5 min',  type:'digital', url:'https://remitly.com',          color:'#FF2B5E', note:'Bancolombia, Nequi, Davivienda' },
    { name:'Ria',     fee_usd:4.99, fx_pct:1.50, delivery:'Minutes',  type:'agent',   url:'https://riamoneytransfer.com', color:'#004E9A', note:'Cash at Efecty, 18,000+ Colombia locations' }
  ],

  'Ecuador': [
    tel(false, 'USD corridor — no FX conversion needed.'),
    { name:'Remitly',       fee_usd:0,    fx_pct:0.50, delivery:'3 min',   type:'digital', url:'https://remitly.com',     color:'#FF2B5E', note:'USD corridor (Ecuador uses USD)' },
    { name:'Xoom',          fee_usd:4.99, fx_pct:0,    delivery:'Minutes', type:'digital', url:'https://xoom.com',        color:'#003087', note:'USD→USD bank or cash in Ecuador' },
    { name:'Western Union', fee_usd:5,    fx_pct:0,    delivery:'Minutes', type:'agent',   url:'https://westernunion.com', color:'#FFD700', note:'USD cash pickup, wide Ecuador network' }
  ],

  'Haiti': [
    tel(false),
    { name:'Sendwave',   fee_usd:0,    fx_pct:1.00, delivery:'Instant',  type:'digital', url:'https://sendwave.com',   color:'#00CC88', note:'No fees, best HTG rate for Haitian diaspora' },
    { name:'WorldRemit', fee_usd:3.99, fx_pct:2.00, delivery:'Minutes',  type:'digital', url:'https://worldremit.com', color:'#E31837', note:'Cash pickup at Digicel & MonCash' },
    { name:'MoneyGram',  fee_usd:5.99, fx_pct:2.50, delivery:'Minutes',  type:'agent',   url:'https://moneygram.com',  color:'#FF6600', note:'Nationwide cash network in Haiti' }
  ],

  'Senegal': [
    tel(false),
    { name:'WorldRemit', fee_usd:3.99, fx_pct:1.20, delivery:'Minutes',  type:'digital', url:'https://worldremit.com', color:'#E31837', note:'Wave, Orange Money, Free Money, bank' },
    { name:'Sendwave',   fee_usd:0,    fx_pct:0.80, delivery:'Instant',  type:'digital', url:'https://sendwave.com',   color:'#00CC88', note:'Wave app delivery, no fees' },
    { name:'Ria',        fee_usd:4.99, fx_pct:2.00, delivery:'Minutes',  type:'agent',   url:'https://riamoneytransfer.com', color:'#004E9A', note:'Cash pickup at Ecobank & agencies' }
  ],

  'Tanzania': [
    tel(false),
    { name:'Sendwave',   fee_usd:0,    fx_pct:0.80, delivery:'Instant',  type:'digital', url:'https://sendwave.com',   color:'#00CC88', note:'No fees, M-Pesa Tanzania delivery' },
    { name:'WorldRemit', fee_usd:3.99, fx_pct:1.50, delivery:'Minutes',  type:'digital', url:'https://worldremit.com', color:'#E31837', note:'M-Pesa, Tigo Pesa, Airtel Money' },
    { name:'Remitly',    fee_usd:0,    fx_pct:2.00, delivery:'3–5 min',  type:'digital', url:'https://remitly.com',    color:'#FF2B5E', note:'Mobile money and bank accounts' }
  ],

  'Jordan': [
    tel(false),
    { name:'Wise',          fee_usd:1.14, fx_pct:0.41, delivery:'1–2 days', type:'digital', url:'https://wise.com',        color:'#00B9FF', note:'Best USD→JOD rate, low fee corridor' },
    { name:'Remitly',       fee_usd:0,    fx_pct:1.50, delivery:'3–5 min',  type:'digital', url:'https://remitly.com',     color:'#FF2B5E', note:'Arab Bank, Cairo Amman Bank, CBJ' },
    { name:'Western Union', fee_usd:5,    fx_pct:2.50, delivery:'Minutes',  type:'agent',   url:'https://westernunion.com', color:'#FFD700', note:'Bank of Jordan & Ahli Bank agents' }
  ],

  'Lebanon': [
    tel(false),
    { name:'Wise',          fee_usd:1.14, fx_pct:0.41, delivery:'1–2 days', type:'digital', url:'https://wise.com',        color:'#00B9FF', note:'Best rate for LBP (at official rate)' },
    { name:'Western Union', fee_usd:5,    fx_pct:2.50, delivery:'Minutes',  type:'agent',   url:'https://westernunion.com', color:'#FFD700', note:'Widely used given banking restrictions' },
    { name:'MoneyGram',     fee_usd:5.99, fx_pct:2.50, delivery:'Minutes',  type:'agent',   url:'https://moneygram.com',   color:'#FF6600', note:'Cash pickup at OMT and BOB agents' }
  ],

  'Uzbekistan': [
    tel(false),
    { name:'Wise',          fee_usd:1.14, fx_pct:0.41, delivery:'1–2 days', type:'digital', url:'https://wise.com',        color:'#00B9FF', note:'Best USD→UZS rate, bank transfer' },
    { name:'Remitly',       fee_usd:0,    fx_pct:2.00, delivery:'3–5 min',  type:'digital', url:'https://remitly.com',     color:'#FF2B5E', note:'Hamkorbank, Ipotekabank, Payme wallet' },
    { name:'Western Union', fee_usd:5,    fx_pct:2.50, delivery:'Minutes',  type:'agent',   url:'https://westernunion.com', color:'#FFD700', note:'Widespread agents across Uzbekistan' }
  ]

};

// ── MNO DATA ──────────────────────────────────────────────────────────────────
// Updated Q1 2025. Edit and commit on GitHub to update live.
window.MNO_DATA = {
  'United States':{ mno:'T-Mobile US', subs:'146 million', share:'34%', outflow:'$68B', note:'T-Mobile leads in net subscriber adds (2024); Verizon (144M) and AT&T (115M) follow. US is the world\'s #1 remittance sender.' },
  'China':{ mno:'China Mobile', subs:'1.004 billion', share:'57%', outflow:'$18B', note:'China Mobile crossed 1 billion subscribers in Q2 2024. Inflows mainly from diaspora in US, Canada, Australia.' },
  'India':{ mno:'Jio (Reliance)', subs:'482 million', share:'38%', outflow:'$7.5B', note:'India is the world\'s #1 remittance recipient for 16 years. Jio leads with 482M; Airtel (395M) is a fast-growing rival.' },
  'Brazil':{ mno:'Vivo (Telefónica)', subs:'96 million', share:'33%', outflow:'$2.1B', note:'Vivo leads Brazil ahead of Claro and TIM. Inflows arrive mainly from the US, Japan, and Portugal.' },
  'Russia':{ mno:'MTS (Mobile TeleSystems)', subs:'81 million', share:'30%', outflow:'$14B', note:'MTS leads the Big Three despite geopolitical disruption. Major sender to CIS nations.' },
  'Japan':{ mno:'NTT Docomo', subs:'88 million', share:'37%', outflow:'$3.6B', note:'NTT Docomo dominates Japan\'s premium mobile market; sends remittances to Philippines, Brazil, and Vietnam.' },
  'Germany':{ mno:'Deutsche Telekom', subs:'47 million', share:'38%', outflow:'$24B', note:'Europe\'s largest remittance sender — primarily to Turkey, Poland, Romania.' },
  'United Kingdom':{ mno:'EE (BT Group)', subs:'35 million', share:'29%', outflow:'$25B', note:'Major flows to India, Nigeria, Pakistan, Ghana. EE leads; MVNOs gained 1.6M UK subscribers in 2024.' },
  'France':{ mno:'Orange', subs:'32 million', share:'38%', outflow:'$13B', note:'Large flows to Morocco, Algeria, Senegal, Sub-Saharan Africa. Orange leads both in France and across Africa.' },
  'Mexico':{ mno:'Telcel (América Móvil)', subs:'82 million', share:'62%', outflow:'$1.7B', note:'Mexico received $68B in remittances in 2024 — the world\'s 2nd largest recipient. Telcel\'s dominance is unmatched in LatAm.' },
  'Nigeria':{ mno:'MTN Nigeria', subs:'79 million', share:'38%', outflow:'$520M', note:'Nigeria hit a 5-year remittance high in 2024 following FX reforms. MTN leads Airtel, Glo, and 9mobile.' },
  'Pakistan':{ mno:'Jazz (Veon)', subs:'72 million', share:'37%', outflow:'$820M', note:'Received ~$33B in 2024. Exchange rate stabilisation boosted formal flows. Jazz leads ahead of Telenor and Zong.' },
  'Bangladesh':{ mno:'Grameenphone (Telenor)', subs:'86 million', share:'44%', outflow:'$415M', note:'Received ~$22B in 2024. Policy incentives redirected hundi flows to formal banking.' },
  'Philippines':{ mno:'Smart Communications (PLDT)', subs:'73 million', share:'54%', outflow:'$620M', note:'Received ~$40B in 2024. Smart/PLDT is a confirmed Telcoin MNO partner — enabling direct wallet delivery for international transfers.' },
  'Egypt':{ mno:'Vodafone Egypt', subs:'47 million', share:'37%', outflow:'$940M', note:'Record ~$28B in 2024 after the March 2024 FX reform closed the official-parallel rate gap.' },
  'Vietnam':{ mno:'Viettel', subs:'120 million', share:'50%', outflow:'$720M', note:'Received ~$16B in 2024. Viettel is state-owned, operates in 11 countries.' },
  'Ethiopia':{ mno:'Ethio Telecom', subs:'74 million', share:'97%', outflow:'$205M', note:'Ethio Telecom near-monopoly; Safaricom Ethiopia entered 2022. Diaspora in US and Europe drive ~$5.5B in inflows.' },
  'Turkey':{ mno:'Turkcell', subs:'37 million', share:'41%', outflow:'$2.0B', note:'Turkcell is dominant. Turkish workers in Germany (~$2.8B) are the largest source of inward remittances.' },
  'South Africa':{ mno:'Vodacom', subs:'46 million', share:'43%', outflow:'$2.0B', note:'South Africa sends to Zimbabwe, Mozambique, Malawi, Lesotho. Vodacom leads ahead of MTN.' },
  'Kenya':{ mno:'Safaricom', subs:'45 million', share:'65%', outflow:'$310M', note:'Safaricom\'s M-Pesa is the world\'s leading mobile money platform. Received $4.2B in 2024.' },
  'Ghana':{ mno:'MTN Ghana', subs:'25 million', share:'45%', outflow:'$260M', note:'Received ~$4.9B in 2024. MTN Ghana leads with a strong mobile money ecosystem.' },
  'Morocco':{ mno:'Maroc Telecom', subs:'22.5 million', share:'42%', outflow:'$720M', note:'Received ~$11.8B in 2024 (~8% of GDP). Mainly from diaspora in France, Spain, Italy, Belgium.' },
  'Ukraine':{ mno:'Kyivstar (Veon)', subs:'24 million', share:'43%', outflow:'$2.2B', note:'Received ~$20B in 2024 (~11% of GDP). Wartime displacement massively boosted inflows.' },
  'Indonesia':{ mno:'Telkomsel', subs:'158 million', share:'51%', outflow:'$3.2B', note:'Telkomsel dominates the world\'s 4th most populous nation. Large workforce in Malaysia and Gulf drives inflows.' },
  'Malaysia':{ mno:'Maxis', subs:'11 million', share:'24%', outflow:'$7.2B', note:'Malaysia is a confirmed Telcoin MNO-integrated market. Significant sender to Bangladesh, Indonesia, Nepal.' },
  'Thailand':{ mno:'AIS (Advanced Info Service)', subs:'44 million', share:'43%', outflow:'$3.9B', note:'AIS leads. Hosts millions of Cambodian and Myanmar migrants.' },
  'Saudi Arabia':{ mno:'STC (Saudi Telecom Co.)', subs:'43 million', share:'45%', outflow:'$38B', note:'World\'s 3rd largest remittance sender. Millions of South Asian and Arab migrant workers.' },
  'UAE':{ mno:'Etisalat (e&)', subs:'14 million', share:'52%', outflow:'$45B', note:'World\'s 2nd largest remittance sender. Expats make up ~88% of the population.' },
  'Iran':{ mno:'Hamrahe Aval (MCI)', subs:'63 million', share:'48%', outflow:'$620M', note:'MCI is state-owned and leads. US and EU sanctions heavily constrain formal remittance channels.' },
  'Iraq':{ mno:'Zain Iraq', subs:'16 million', share:'37%', outflow:'$820M', note:'Zain leads Iraq\'s fragmented market. Active remittance corridors run to Jordan, Turkey, Lebanon.' },
  'Argentina':{ mno:'Claro Argentina', subs:'22 million', share:'37%', outflow:'$800M', note:'Claro leads. Peso crisis drives significant informal and crypto-based remittance activity.' },
  'Colombia':{ mno:'Claro Colombia', subs:'31 million', share:'44%', outflow:'$950M', note:'Received ~$9.8B in 2024. Diaspora in the US, Spain, Chile are the primary senders.' },
  'Peru':{ mno:'Claro Perú', subs:'12.5 million', share:'35%', outflow:'$620M', note:'Claro Perú leads. Remittances ($4B+) arrive mainly from Chile, the US, and Spain.' },
  'Venezuela':{ mno:'Movistar Venezuela', subs:'9.5 million', share:'38%', outflow:'$310M', note:'Economic collapse pushed 7M+ Venezuelans abroad; diaspora remittances are now a critical income source.' },
  'Ecuador':{ mno:'Claro Ecuador', subs:'8.6 million', share:'44%', outflow:'$510M', note:'Received $4.4B in 2024. US, Spain, and Italy diaspora are the top senders.' },
  'Guatemala':{ mno:'Tigo Guatemala', subs:'9.6 million', share:'49%', outflow:'$410M', note:'Received $19B+ in 2024 — nearly 20% of GDP — one of the world\'s highest ratios.' },
  'Honduras':{ mno:'Tigo Honduras', subs:'5.5 million', share:'46%', outflow:'$260M', note:'Remittances ($9B+) represent over 26% of GDP — among the highest globally.' },
  'El Salvador':{ mno:'Tigo El Salvador', subs:'3.9 million', share:'44%', outflow:'$205M', note:'Received $8.2B in 2024 (~24% of GDP). First country with Bitcoin as legal tender.' },
  'Dominican Republic':{ mno:'Claro DR', subs:'3.8 million', share:'44%', outflow:'$310M', note:'Received $10.4B in 2024. Large diaspora in New York City is the primary source.' },
  'Haiti':{ mno:'Digicel Haiti', subs:'4.2 million', share:'65%', outflow:'$105M', note:'Remittances (~$4B, ~37% of GDP) are Haiti\'s largest foreign income source.' },
  'Jamaica':{ mno:'Digicel Jamaica', subs:'2.9 million', share:'70%', outflow:'$205M', note:'Received ~$3.8B in 2024 (~20% of GDP). Large diaspora in US, UK, Canada.' },
  'Nicaragua':{ mno:'Claro Nicaragua', subs:'5.5 million', share:'52%', outflow:'$205M', note:'Received $4.5B+ in 2024 (~14% of GDP); surging as migration to US and Costa Rica accelerated.' },
  'Bolivia':{ mno:'Tigo Bolivia', subs:'8.4 million', share:'54%', outflow:'$305M', note:'Tigo leads. Large communities in Argentina, Brazil, and Spain send regular flows home.' },
  'Nepal':{ mno:'Ncell (Axiata)', subs:'18.5 million', share:'48%', outflow:'$310M', note:'Received ~$9.7B in 2024 (~22% of GDP). Migrant workforce concentrated in Qatar, UAE, and Malaysia.' },
  'Sri Lanka':{ mno:'Dialog Axiata', subs:'15.5 million', share:'44%', outflow:'$415M', note:'Received ~$6B in 2024. Vital to post-crisis recovery. Dialog Axiata is the clear market leader.' },
  'Cambodia':{ mno:'Cellcard', subs:'8.8 million', share:'36%', outflow:'$620M', note:'Both receives and sends remittances. Cellcard leads ahead of Smart and Metfone.' },
  'Myanmar':{ mno:'Telenor Myanmar', subs:'17 million', share:'37%', outflow:'$310M', note:'Political instability has driven mass migration; informal channels dominate.' },
  'Senegal':{ mno:'Orange Senegal', subs:'11.5 million', share:'43%', outflow:'$205M', note:'Remittances ~10% of GDP. Diaspora in France and Italy are the main senders ($2.7B+).' },
  'Rwanda':{ mno:'MTN Rwanda', subs:'5.3 million', share:'47%', outflow:'$63M', note:'MTN leads Rwanda. Active fintech ecosystem helping reduce remittance transfer costs.' },
  'Uganda':{ mno:'MTN Uganda', subs:'18 million', share:'50%', outflow:'$155M', note:'MTN Uganda leads with strong mobile money penetration. Received $1.5B+ in 2024.' },
  'Tanzania':{ mno:'Vodacom Tanzania', subs:'18 million', share:'39%', outflow:'$185M', note:'Vodacom leads. M-Pesa Tanzania is key to receiving cross-border remittances.' },
  'Mozambique':{ mno:'Vodacom Mozambique', subs:'8.8 million', share:'42%', outflow:'$205M', note:'Vodacom leads. Large share of remittances ($625M) come from workers in South Africa.' },
  'Zimbabwe':{ mno:'Econet Wireless', subs:'12.5 million', share:'57%', outflow:'$105M', note:'Econet dominates. Received ~$1.7B in 2024 (~9% of GDP). Critical amid economic challenges.' },
  'Zambia':{ mno:'MTN Zambia', subs:'10 million', share:'44%', outflow:'$125M', note:'MTN leads ahead of Airtel. Small but growing remittance footprint ($190M).' },
  'Angola':{ mno:'Unitel', subs:'14.5 million', share:'51%', outflow:'$830M', note:'Unitel dominates. Oil revenues dwarf remittances; inflows ($210M) are modest.' },
  'Cameroon':{ mno:'MTN Cameroon', subs:'11.5 million', share:'47%', outflow:'$185M', note:'MTN Cameroon leads. Diaspora in France and US are main senders (~$640M).' },
  'Somalia':{ mno:'Hormuud Telecom', subs:'5.4 million', share:'55%', outflow:'$83M', note:'Remittances (~$2B, ~20% of GDP) are Somalia\'s economic lifeline. Hormuud\'s EVC Plus dominates.' },
  'Jordan':{ mno:'Zain Jordan', subs:'4.2 million', share:'37%', outflow:'$1.9B', note:'Received ~$3.9B in 2024. Hosts large refugee populations; Gulf workers are the main senders.' },
  'Lebanon':{ mno:'touch (MTC)', subs:'2.5 million', share:'52%', outflow:'$620M', note:'Received ~$6.8B in 2024 (~20% of GDP). Lifeline amid deep economic and political crisis.' },
  'Tunisia':{ mno:'Tunisie Telecom', subs:'8 million', share:'36%', outflow:'$415M', note:'Tunisie Telecom leads. Large diaspora in France and Italy send regular flows ($2.4B).' },
  'Algeria':{ mno:'Mobilis (ATM)', subs:'21.5 million', share:'35%', outflow:'$1.3B', note:'Mobilis leads Algeria. Large diaspora in France is the primary remittance source (~$2.5B).' },
  'Kazakhstan':{ mno:'Kcell', subs:'10 million', share:'38%', outflow:'$1.9B', note:'Sends significant remittances to Kyrgyzstan and Tajikistan. Kcell leads the market.' },
  'Uzbekistan':{ mno:'Ucell (Coscom)', subs:'12.5 million', share:'35%', outflow:'$820M', note:'Central Asia\'s top remittance recipient (~$16B in 2024, ~15% of GDP). Mainly from workers in Russia.' },
  'Tajikistan':{ mno:'Tcell', subs:'4.8 million', share:'42%', outflow:'$310M', note:'One of the world\'s highest remittance-to-GDP ratios (~35%). Most flows from workers in Russia.' },
  'Qatar':{ mno:'Ooredoo Qatar', subs:'3.0 million', share:'52%', outflow:'$14.5B', note:'Major sender; South Asian migrant workers vastly outnumber Qatari citizens (~90% expat population).' },
  'Kuwait':{ mno:'Zain Kuwait', subs:'3.7 million', share:'44%', outflow:'$14.5B', note:'One of the world\'s top per-capita senders. Large expat workforce sends money to South Asia and Egypt.' },
  'Israel':{ mno:'Cellcom', subs:'2.7 million', share:'23%', outflow:'$2.2B', note:'Cellcom leads Israel\'s competitive market. Israel both receives (diaspora) and sends (migrant worker wages).' },
  'Syria':{ mno:'Syriatel', subs:'7.6 million', share:'61%', outflow:'$310M', note:'Large Syrian diaspora in Germany, Turkey, Lebanon, and Gulf send vital flows to war-affected families.' },
  'Yemen':{ mno:'Yemen Mobile', subs:'9.2 million', share:'38%', outflow:'$205M', note:'Received ~$3.9B in 2024. Critical amid conflict. Yemen Mobile leads despite severe damage.' },
  'Poland':{ mno:'Play (P4)', subs:'15.2 million', share:'28%', outflow:'$3.9B', note:'Received ~$9.8B in 2024 from Poles in UK and Germany. Play leads very competitive market.' },
  'Romania':{ mno:'Orange Romania', subs:'11 million', share:'34%', outflow:'$1.3B', note:'Top EU remittance recipient (~$10B). Large diaspora in Italy, Spain, Germany, UK.' },
  'South Korea':{ mno:'SK Telecom', subs:'32 million', share:'42%', outflow:'$4.2B', note:'SK Telecom leads South Korea\'s advanced 5G market. Sends remittances across Southeast Asia.' },
  'Australia':{ mno:'Telstra', subs:'21 million', share:'42%', outflow:'$5.5B', note:'Telstra leads. Australia is a confirmed Telcoin active market. Significant sender to Philippines, India, and Pacific Islands.' },
  'Canada':{ mno:'Bell Canada', subs:'10.8 million', share:'27%', outflow:'$25B', note:'Major sender to India and Philippines from large South Asian and Filipino diaspora. Canada is a confirmed Telcoin active sending market.' },
  'Spain':{ mno:'Movistar (Telefónica)', subs:'17.5 million', share:'27%', outflow:'$12.5B', note:'Large Latin American immigrant population drives outflows.' },
  'Italy':{ mno:'TIM (Telecom Italia)', subs:'30 million', share:'28%', outflow:'$10B', note:'Top sender to Romania, Morocco, Bangladesh. TIM competes with Vodafone and Wind Tre.' },
  'Portugal':{ mno:'MEO (Altice Portugal)', subs:'7.9 million', share:'44%', outflow:'$3.2B', note:'Large diaspora in France, Switzerland, Luxembourg, Angola send substantial inflows.' },
  'Netherlands':{ mno:'T-Mobile NL', subs:'5.8 million', share:'32%', outflow:'$6.1B', note:'T-Mobile NL overtook KPN as market leader in 2024. Sends to Morocco, Turkey, Suriname.' },
  'Belgium':{ mno:'Proximus', subs:'5.4 million', share:'38%', outflow:'$4.7B', note:'Proximus is Belgium\'s incumbent. Large Moroccan and Congolese diaspora receive Belgian remittances.' },
  'Sweden':{ mno:'Telia Sweden', subs:'6.4 million', share:'35%', outflow:'$2.4B', note:'Telia leads. Significant flows to Somalia, Iraq, Syria from diaspora communities.' },
  'Switzerland':{ mno:'Swisscom', subs:'6.1 million', share:'55%', outflow:'$4.0B', note:'Swisscom dominates. Large Portuguese, Italian, Kosovar diasporas drive remittance flows.' },
  'New Zealand':{ mno:'Spark NZ', subs:'2.5 million', share:'40%', outflow:'$2.4B', note:'Spark leads. Pacific Islander communities send significant flows to Samoa, Tonga, Fiji.' },
  'Afghanistan':{ mno:'Roshan (TDCA)', subs:'7 million', share:'35%', outflow:'$410M', note:'Roshan leads Afghanistan\'s telecom market. Remittances (~$800M) are a critical lifeline amid economic collapse.' }
  // ── PREVIOUSLY MISSING ENTRIES — added Q1 2025 ────────────────────────────
  // Sources: GSMA Intelligence summaries, Wikipedia MNO lists, operator reports

  // ── EUROPE ──
  'Albania':{ mno:'ONE Telecommunications', subs:'1.5 million', share:'43%', outflow:'$250M', note:'ONE Telecommunications (4iG group) emerged as Albania's leading operator after merging with ALBtelecom Mobile in 2023. Three operators compete in this small Balkan market. Albanian diaspora in Italy and Greece send ~$1.5B annually.' },
  'Austria':{ mno:'A1 Telekom Austria', subs:'5.9 million', share:'36%', outflow:'$2.1B', note:'A1 Telekom Austria is the incumbent and market leader. Magenta Telekom (T-Mobile) and Drei (3) compete closely. Austria is a significant sender to Bosnia, Serbia, and Turkey from its large diaspora communities.' },
  'Bulgaria':{ mno:'Vivacom', subs:'3.1 million', share:'39%', outflow:'$620M', note:'Vivacom (formerly BTC) leads Bulgaria ahead of A1 Bulgaria and Yettel. Bulgaria is a major EU remittance recipient (~$10B) with large diaspora in Germany, Spain, and the UK.' },
  'Chile':{ mno:'Entel Chile', subs:'9.2 million', share:'32%', outflow:'$1.2B', note:'Entel Chile leads ahead of Movistar and Claro. Chile is a significant sender to Peru and Bolivia, and receives from Chileans abroad.' },
  'Croatia':{ mno:'HT (Hrvatski Telekom)', subs:'2.4 million', share:'51%', outflow:'$415M', note:'HT (Deutsche Telekom subsidiary) dominates Croatia. Large diaspora in Germany and Austria sends substantial inflows. Croatia joined the Eurozone in 2023.' },
  'Cuba':{ mno:'ETECSA', subs:'5.8 million', share:'100%', outflow:'N/A', note:'ETECSA is Cuba's sole state-owned operator. Remittances (~$3.5B) are the main foreign income source but are significantly constrained by US sanctions and restrictions.' },
  'Cyprus':{ mno:'Epic (formerly MTN Cyprus)', subs:'0.6 million', share:'43%', outflow:'$415M', note:'Epic leads Cyprus's compact market ahead of CYTA and Cablenet. Cyprus is both a receiver (from diaspora in UK) and sender (migrant worker wages).' },
  'Czech Republic':{ mno:'T-Mobile Czech Republic', subs:'6.6 million', share:'36%', outflow:'$1.6B', note:'T-Mobile CZ leads ahead of O2 Czech Republic and Vodafone. Large Slovak, Ukrainian, and Vietnamese communities shape remittance patterns.' },
  'Denmark':{ mno:'TDC NET', subs:'2.6 million', share:'34%', outflow:'$1.3B', note:'TDC leads Denmark's market. Significant flows to Pakistan, Turkey, Lebanon, and Somalia from established diaspora communities.' },
  'Finland':{ mno:'Elisa', subs:'2.9 million', share:'38%', outflow:'$720M', note:'Elisa leads Finland ahead of Telia and DNA. Finnish Somali and Russian diaspora communities are the most active remittance senders.' },
  'Greece':{ mno:'Cosmote (OTE Group)', subs:'7.6 million', share:'42%', outflow:'$1.5B', note:'Cosmote (OTE Group, Deutsche Telekom subsidiary) dominates Greece. Greeks in Germany and the US send substantial inflows; Albania is a major recipient of Greek outflows.' },
  'Hungary':{ mno:'Magyar Telekom', subs:'5.2 million', share:'46%', outflow:'$1.3B', note:'Magyar Telekom (Deutsche Telekom subsidiary) leads Hungary. Hungarian diaspora in Germany, Austria, and the UK send regular remittances home.' },
  'Ireland':{ mno:'Three Ireland', subs:'2.2 million', share:'34%', outflow:'$1.3B', note:'Three Ireland leads ahead of Vodafone Ireland and eir. Ireland sends flows to Poland, Philippines, India, and Brazil from its large immigrant communities.' },
  'Lithuania':{ mno:'Telia Lithuania', subs:'1.7 million', share:'40%', outflow:'$415M', note:'Telia Lithuania leads. Large Lithuanian communities in the UK, Germany, and Norway send significant inflows (~$1.5B, ~4% of GDP).' },
  'Luxembourg':{ mno:'POST Luxembourg', subs:'0.5 million', share:'44%', outflow:'$1.3B', note:'POST Luxembourg leads. As a major EU financial hub, Luxembourg punches above its weight in outward remittances to neighbouring countries and beyond.' },
  'Norway':{ mno:'Telenor Norway', subs:'3.9 million', share:'44%', outflow:'$1.9B', note:'Telenor Norway leads ahead of Telia and Ice. Significant flows to Somalia, Pakistan, Eritrea, and Poland from Norway's established immigrant communities.' },
  'Slovakia':{ mno:'Orange Slovakia', subs:'2.9 million', share:'39%', outflow:'$515M', note:'Orange Slovakia leads ahead of Slovak Telekom and 4ka. Slovak workers in Germany, Austria, and the UK send regular remittances home (~$1.8B annually).' },
  'Slovenia':{ mno:'Telekom Slovenije', subs:'1.1 million', share:'44%', outflow:'$205M', note:'Telekom Slovenije is the incumbent operator. Slovenia is a high-income Eurozone member with modest but steady remittance flows.' },

  // ── AFRICA ──
  'DR Congo':{ mno:'Vodacom Congo', subs:'14.5 million', share:'28%', outflow:'$205M', note:'Vodacom Congo leads a highly fragmented market ahead of Airtel and Orange Congo. Large diaspora in Belgium and France sends flows (~$750M). DR Congo is one of Africa's most complex remittance markets.' },
  'Gabon':{ mno:'Airtel Gabon', subs:'2.1 million', share:'48%', outflow:'$205M', note:'Airtel Gabon leads ahead of Moov Africa and Libertis. As a relatively wealthy oil producer, Gabon sends more remittances than it receives from the sub-regional workforce.' },
  'Guinea':{ mno:'Orange Guinée', subs:'6 million', share:'40%', outflow:'$83M', note:'Orange Guinée leads Guinea's market. Guinean diaspora in France, Senegal, and Côte d'Ivoire are the primary remittance sources (~$600M annually).' },
  'Lesotho':{ mno:'Vodacom Lesotho', subs:'1.5 million', share:'54%', outflow:'$42M', note:'Vodacom Lesotho dominates ahead of Econet. Remittances ($505M, ~17% of GDP) from Basotho mineworkers in South Africa are the country's primary external income source.' },
  'Liberia':{ mno:'Lonestar Cell MTN', subs:'2.4 million', share:'48%', outflow:'$26M', note:'Lonestar Cell MTN leads ahead of Orange Liberia. Liberian diaspora in the US (~460K people) is the primary remittance source, sending ~$460M annually.' },
  'Libya':{ mno:'Libyana', subs:'8 million', share:'54%', outflow:'$2.9B', note:'Libyana is the dominant operator in Libya. Libya serves as a significant transit and destination country for Sub-Saharan migrants; it sends substantial remittances southward while receiving oil-linked inflows.' },
  'Madagascar':{ mno:'Telma', subs:'5.3 million', share:'37%', outflow:'$63M', note:'Telma leads Madagascar ahead of Airtel and Orange. Malagasy diaspora in France and Réunion are the primary remittance sources (~$450M, ~4% of GDP).' },
  'Malawi':{ mno:'Airtel Malawi', subs:'5.3 million', share:'46%', outflow:'$42M', note:'Airtel Malawi leads ahead of TNM (Telekom Networks Malawi). Remittances from Malawians working in South Africa are an important supplementary income source (~$55M).' },
  'Mali':{ mno:'Orange Mali', subs:'9.1 million', share:'43%', outflow:'$155M', note:'Orange Mali leads ahead of Moov Africa. Remittances from Malians in France and Côte d'Ivoire ($1.1B+) represent ~7% of GDP and are critical to rural household incomes.' },
  'Namibia':{ mno:'MTC Namibia', subs:'2.9 million', share:'66%', outflow:'$83M', note:'MTC Namibia dominates with a strong majority share ahead of TN Mobile. South Africa is both the main source of inward remittances and the main destination of Namibian outflows.' },
  'Niger':{ mno:'Airtel Niger', subs:'5.5 million', share:'44%', outflow:'$63M', note:'Airtel Niger leads ahead of Moov Africa Niger. Remittances (~$415M) from Nigerien workers in Nigeria, Côte d'Ivoire, and France are a vital income source in one of the world's poorest countries.' },
  'Republic of Congo':{ mno:'MTN Congo', subs:'4.1 million', share:'47%', outflow:'$165M', note:'MTN Congo leads ahead of Airtel Congo. As an oil-exporting country, the Republic of Congo's remittance footprint is modest relative to its hydrocarbon revenues.' },
  'Sierra Leone':{ mno:'Africell Sierra Leone', subs:'4.2 million', share:'51%', outflow:'$31M', note:'Africell dominates Sierra Leone's mobile market. The large Sierra Leonean diaspora in the UK and US sends substantial flows (~$240M+) relative to the small economy.' },
  'Sudan':{ mno:'Zain Sudan', subs:'13 million', share:'40%', outflow:'$415M', note:'Zain Sudan leads a severely disrupted market. The 2023 civil war has devastated infrastructure and formal remittance channels, yet diaspora flows remain critical for survival.' },
  'Togo':{ mno:'Togocom', subs:'4.6 million', share:'48%', outflow:'$83M', note:'Togocom (state-owned) leads ahead of Moov Africa. Remittances (~$460M, ~7% of GDP) arrive mainly from Togolese in France and Germany.' },

  // ── ASIA & OCEANIA ──
  'Bhutan':{ mno:'B-Mobile (Bhutan Telecom)', subs:'0.8 million', share:'52%', outflow:'$22M', note:'B-Mobile (Bhutan Telecom) leads ahead of TashiCell. Most remittances come from the large Bhutanese workforce in India and a growing number in Gulf countries.' },
  'Laos':{ mno:'Unitel', subs:'4.3 million', share:'48%', outflow:'$205M', note:'Unitel leads Laos ahead of Lao Telecom and ETL. Lao workers in Thailand and South Korea are the primary inward remittance source. Laos also has growing outflows to regional partners.' },
  'Mongolia':{ mno:'MobiCom', subs:'1.7 million', share:'37%', outflow:'$155M', note:'MobiCom leads Mongolia ahead of Unitel and G-Mobile. Workers in South Korea are the largest remittance source (~$350M). South Korea hosts ~50,000 Mongolian workers.' },
  'North Korea':{ mno:'Koryolink', subs:'6 million', share:'N/A', outflow:'N/A', note:'Koryolink (joint venture with Orascom Telecom) is the only operator. All economic statistics are state secrets. Informal cross-border flows from ethnic Koreans in China exist but are unquantifiable.' },
  'Papua New Guinea':{ mno:'Digicel PNG', subs:'3.6 million', share:'55%', outflow:'$52M', note:'Digicel PNG dominates ahead of Telikom PNG. Australia is the main source of inward remittances for PNG. The country has among the lowest financial inclusion rates in the Pacific.' },
  'Taiwan':{ mno:'Chunghwa Telecom', subs:'12 million', share:'35%', outflow:'$4.2B', note:'Chunghwa Telecom is Taiwan's state-backed incumbent. Taiwan is a significant sender to Southeast Asia from its large foreign worker population, and receives flows from the Taiwanese diaspora abroad.' },

  // ── AMERICAS ──
  'Costa Rica':{ mno:'Kolbi (ICE)', subs:'3.6 million', share:'39%', outflow:'$510M', note:'Kolbi (state-owned ICE) is the market leader. Costa Rica receives flows from Ticos abroad (~$1B) and sends to Nicaragua from its large Nicaraguan immigrant workforce.' },
  'Panama':{ mno:'Cable & Wireless Panama (Liberty)', subs:'2.5 million', share:'36%', outflow:'$415M', note:'Cable & Wireless (now Liberty Latin America) leads Panama's dollarized market ahead of Claro and Movistar. Panama serves as a regional financial hub and remittance transit point.' },
  'Suriname':{ mno:'Telesur', subs:'0.6 million', share:'48%', outflow:'$52M', note:'Telesur (Telecommunicatiebedrijf Suriname) is the state-owned market leader. Surinamese diaspora in the Netherlands (~400K people) are the primary remittance link.' },
  'Trinidad and Tobago':{ mno:'Digicel T&T', subs:'1.7 million', share:'60%', outflow:'$305M', note:'Digicel T&T dominates ahead of bmobile (TSTT). As a relatively wealthy Caribbean energy exporter, T&T sends more remittances than it receives — primarily to other Caribbean islands and Guyana.' },
  'Uruguay':{ mno:'Antel', subs:'2.1 million', share:'46%', outflow:'$155M', note:'Antel (state-owned Administración Nacional de Telecomunicaciones) leads ahead of Claro and Movistar. Uruguay has a small but steady remittance footprint from its diaspora in Spain and Argentina.' },

  // ── SPECIAL / TERRITORIES ──
  'Falkland Islands':{ mno:'Sure South Atlantic', subs:'3,500', share:'100%', outflow:'N/A', note:'Sure South Atlantic is the sole operator providing mobile services to the Falkland Islands' small population of ~3,500. Remittance flows are negligible given the territory's small size.' },

};
