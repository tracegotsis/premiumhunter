import { useState, useMemo, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, Cell, ResponsiveContainer, ReferenceLine, Tooltip } from "recharts";

// ─────────────────────────────────────────────
// MARKET SNAPSHOT · Aug 5, 2026
// Prices anchored to real quotes where verified (RKLB, SPCX, SPY, QQQ, IWM, GLD, XLK, XLC);
// remaining prices are calibrated estimates. IV / HV / IV Rank remain SIMULATED teaching
// values until wired to a live options data feed.
// ─────────────────────────────────────────────
const UNIVERSE = [
  // ── Space & Trace's watchlist core
  { t: "RKLB", n: "Rocket Lab", etf: false, p: 74.75, chg: 6.1, iv: 94, hv: 72, ivr: 86, earn: "Aug 10", ed: 5 },
  { t: "SPCX", n: "SpaceX", etf: false, p: 125.33, chg: 9.4, iv: 88, hv: 81, ivr: 63, earn: "Dec 02", ed: 119 },
  { t: "ASTS", n: "AST SpaceMobile", etf: false, p: 58.4, chg: 3.2, iv: 102, hv: 90, ivr: 74, earn: "Aug 11", ed: 6 },
  { t: "LUNR", n: "Intuitive Machines", etf: false, p: 14.2, chg: -1.8, iv: 96, hv: 84, ivr: 68, earn: "Aug 12", ed: 7 },
  // ── Mega-cap tech
  { t: "NVDA", n: "NVIDIA", etf: false, p: 209.5, chg: 2.8, iv: 46, hv: 39, ivr: 58, earn: "Aug 26", ed: 21 },
  { t: "MSFT", n: "Microsoft", etf: false, p: 562.0, chg: 1.1, iv: 24, hv: 20, ivr: 34, earn: "Oct 28", ed: 84 },
  { t: "AAPL", n: "Apple", etf: false, p: 246.8, chg: 0.6, iv: 23, hv: 20, ivr: 27, earn: "Oct 29", ed: 85 },
  { t: "AMZN", n: "Amazon", etf: false, p: 267.3, chg: 1.4, iv: 31, hv: 26, ivr: 42, earn: "Oct 29", ed: 85 },
  { t: "GOOGL", n: "Alphabet", etf: false, p: 241.6, chg: 0.9, iv: 29, hv: 24, ivr: 38, earn: "Oct 27", ed: 83 },
  { t: "META", n: "Meta Platforms", etf: false, p: 828.4, chg: 1.7, iv: 33, hv: 28, ivr: 44, earn: "Oct 28", ed: 84 },
  { t: "NFLX", n: "Netflix", etf: false, p: 1342.0, chg: -0.4, iv: 34, hv: 30, ivr: 41, earn: "Oct 20", ed: 76 },
  { t: "AVGO", n: "Broadcom", etf: false, p: 342.1, chg: 3.1, iv: 42, hv: 35, ivr: 55, earn: "Sep 04", ed: 30 },
  // ── Semis & AI
  { t: "AMD", n: "Advanced Micro Devices", etf: false, p: 218.6, chg: 4.2, iv: 56, hv: 45, ivr: 67, earn: "Aug 06", ed: 1 },
  { t: "MU", n: "Micron", etf: false, p: 168.9, chg: 2.6, iv: 52, hv: 44, ivr: 60, earn: "Sep 24", ed: 50 },
  { t: "SMCI", n: "Super Micro", etf: false, p: 62.7, chg: -2.1, iv: 84, hv: 76, ivr: 72, earn: "Aug 06", ed: 1 },
  { t: "ARM", n: "Arm Holdings", etf: false, p: 172.4, chg: 1.8, iv: 58, hv: 49, ivr: 61, earn: "Aug 06", ed: 1 },
  { t: "CRWV", n: "CoreWeave", etf: false, p: 118.2, chg: 3.6, iv: 92, hv: 83, ivr: 76, earn: "Aug 13", ed: 8 },
  { t: "IONQ", n: "IonQ", etf: false, p: 44.6, chg: -3.4, iv: 108, hv: 95, ivr: 79, earn: "Aug 12", ed: 7 },
  { t: "PLTR", n: "Palantir", etf: false, p: 168.3, chg: -1.9, iv: 66, hv: 52, ivr: 73, earn: "Aug 11", ed: 6 },
  // ── High-vol favorites
  { t: "TSLA", n: "Tesla", etf: false, p: 302.8, chg: -2.6, iv: 59, hv: 56, ivr: 69, earn: "Oct 21", ed: 77 },
  { t: "COIN", n: "Coinbase", etf: false, p: 312.5, chg: -4.1, iv: 80, hv: 73, ivr: 78, earn: "Oct 30", ed: 86 },
  { t: "HOOD", n: "Robinhood", etf: false, p: 112.6, chg: 4.8, iv: 69, hv: 59, ivr: 77, earn: "Aug 12", ed: 7 },
  { t: "MARA", n: "MARA Holdings", etf: false, p: 17.4, chg: -2.9, iv: 95, hv: 87, ivr: 75, earn: "Aug 13", ed: 8 },
  { t: "GME", n: "GameStop", etf: false, p: 24.8, chg: 5.7, iv: 112, hv: 86, ivr: 85, earn: "Sep 09", ed: 35 },
  { t: "RDDT", n: "Reddit", etf: false, p: 188.6, chg: 2.2, iv: 72, hv: 61, ivr: 66, earn: "Aug 11", ed: 6 },
  { t: "HIMS", n: "Hims & Hers", etf: false, p: 52.3, chg: -1.4, iv: 88, hv: 79, ivr: 71, earn: "Aug 10", ed: 5 },
  { t: "RIVN", n: "Rivian", etf: false, p: 14.8, chg: 1.6, iv: 76, hv: 69, ivr: 62, earn: "Aug 12", ed: 7 },
  { t: "SOFI", n: "SoFi Technologies", etf: false, p: 24.6, chg: 2.3, iv: 62, hv: 54, ivr: 57, earn: "Oct 27", ed: 83 },
  { t: "DKNG", n: "DraftKings", etf: false, p: 46.8, chg: 1.0, iv: 51, hv: 43, ivr: 53, earn: "Aug 07", ed: 2 },
  { t: "SHOP", n: "Shopify", etf: false, p: 132.4, chg: 2.1, iv: 56, hv: 46, ivr: 61, earn: "Aug 07", ed: 2 },
  { t: "ROKU", n: "Roku", etf: false, p: 82.6, chg: -1.1, iv: 64, hv: 56, ivr: 66, earn: "Aug 14", ed: 9 },
  { t: "SNAP", n: "Snap", etf: false, p: 8.9, chg: -0.8, iv: 74, hv: 67, ivr: 56, earn: "Oct 28", ed: 84 },
  { t: "UBER", n: "Uber", etf: false, p: 98.2, chg: 0.8, iv: 33, hv: 29, ivr: 40, earn: "Aug 06", ed: 1 },
  // ── Blue chips & value
  { t: "JPM", n: "JPMorgan Chase", etf: false, p: 328.6, chg: 0.5, iv: 21, hv: 18, ivr: 26, earn: "Oct 13", ed: 69 },
  { t: "BAC", n: "Bank of America", etf: false, p: 54.2, chg: 0.4, iv: 22, hv: 19, ivr: 25, earn: "Oct 14", ed: 70 },
  { t: "XOM", n: "Exxon Mobil", etf: false, p: 112.8, chg: -1.9, iv: 26, hv: 23, ivr: 45, earn: "Oct 30", ed: 86 },
  { t: "CVX", n: "Chevron", etf: false, p: 158.4, chg: -1.6, iv: 24, hv: 21, ivr: 42, earn: "Oct 30", ed: 86 },
  { t: "WMT", n: "Walmart", etf: false, p: 118.6, chg: 0.2, iv: 20, hv: 17, ivr: 30, earn: "Aug 20", ed: 15 },
  { t: "KO", n: "Coca-Cola", etf: false, p: 74.2, chg: -0.3, iv: 15, hv: 13, ivr: 21, earn: "Oct 21", ed: 77 },
  { t: "MCD", n: "McDonald's", etf: false, p: 318.4, chg: 0.1, iv: 17, hv: 15, ivr: 24, earn: "Oct 27", ed: 83 },
  { t: "DIS", n: "Disney", etf: false, p: 116.2, chg: 0.7, iv: 29, hv: 25, ivr: 38, earn: "Aug 13", ed: 8 },
  { t: "BA", n: "Boeing", etf: false, p: 228.6, chg: 1.2, iv: 34, hv: 30, ivr: 43, earn: "Oct 28", ed: 84 },
  { t: "NKE", n: "Nike", etf: false, p: 84.2, chg: -1.2, iv: 32, hv: 28, ivr: 45, earn: "Sep 24", ed: 50 },
  { t: "PYPL", n: "PayPal", etf: false, p: 76.4, chg: 1.5, iv: 41, hv: 34, ivr: 47, earn: "Oct 28", ed: 84 },
  { t: "PFE", n: "Pfizer", etf: false, p: 28.6, chg: -0.2, iv: 25, hv: 22, ivr: 30, earn: "Nov 04", ed: 91 },
  { t: "F", n: "Ford Motor", etf: false, p: 12.6, chg: 0.3, iv: 37, hv: 32, ivr: 43, earn: "Oct 27", ed: 83 },
  { t: "INTC", n: "Intel", etf: false, p: 27.4, chg: -0.7, iv: 48, hv: 41, ivr: 51, earn: "Oct 23", ed: 79 },
  { t: "CCL", n: "Carnival", etf: false, p: 30.2, chg: 2.0, iv: 46, hv: 39, ivr: 50, earn: "Sep 29", ed: 55 },
  { t: "AAL", n: "American Airlines", etf: false, p: 14.8, chg: -0.8, iv: 50, hv: 45, ivr: 48, earn: "Oct 23", ed: 79 },
  // ── ETFs
  { t: "SPY", n: "S&P 500 ETF", etf: true, p: 771.5, chg: 0.6, iv: 13, hv: 11, ivr: 21, earn: null, ed: null },
  { t: "QQQ", n: "Nasdaq 100 ETF", etf: true, p: 723.9, chg: 1.2, iv: 17, hv: 14, ivr: 26, earn: null, ed: null },
  { t: "IWM", n: "Russell 2000 ETF", etf: true, p: 301.7, chg: 0.9, iv: 21, hv: 18, ivr: 40, earn: null, ed: null },
  { t: "TLT", n: "20+ Yr Treasury ETF", etf: true, p: 96.4, chg: 0.3, iv: 14, hv: 12, ivr: 33, earn: null, ed: null },
  { t: "GLD", n: "Gold ETF", etf: true, p: 374.2, chg: 0.7, iv: 17, hv: 14, ivr: 57, earn: null, ed: null },
  { t: "SLV", n: "Silver ETF", etf: true, p: 41.2, chg: 1.6, iv: 30, hv: 25, ivr: 62, earn: null, ed: null },
  { t: "USO", n: "US Oil Fund", etf: true, p: 68.4, chg: -3.8, iv: 38, hv: 31, ivr: 70, earn: null, ed: null },
  { t: "XLE", n: "Energy Sector ETF", etf: true, p: 94.6, chg: -1.8, iv: 22, hv: 19, ivr: 46, earn: null, ed: null },
  { t: "XLF", n: "Financials ETF", etf: true, p: 58.2, chg: 0.3, iv: 14, hv: 12, ivr: 19, earn: null, ed: null },
  { t: "XLK", n: "Technology ETF", etf: true, p: 182.0, chg: 2.2, iv: 19, hv: 16, ivr: 31, earn: null, ed: null },
  { t: "SMH", n: "Semiconductor ETF", etf: true, p: 388.5, chg: 3.4, iv: 30, hv: 25, ivr: 48, earn: null, ed: null },
  { t: "ARKK", n: "ARK Innovation ETF", etf: true, p: 84.6, chg: 2.4, iv: 42, hv: 35, ivr: 58, earn: null, ed: null },
  { t: "VXX", n: "VIX Short-Term ETN", etf: true, p: 38.2, chg: -2.4, iv: 82, hv: 74, ivr: 36, earn: null, ed: null },
];

// ─────────────────────────────────────────────
// SECTOR ROTATION · relative performance vs SPY (%)
// Regime snapshot: growth/tech leading, oil sliding on Hormuz-deal news, defensives lagging.
// ─────────────────────────────────────────────
const SECTORS = [
  { s: "XLK", n: "Technology", w1: 1.9, m1: 3.4 },
  { s: "XLI", n: "Industrials", w1: 1.2, m1: 1.0 },
  { s: "XLC", n: "Comm Services", w1: 0.8, m1: 0.8 },
  { s: "XLY", n: "Discretionary", w1: 0.5, m1: 1.2 },
  { s: "XLF", n: "Financials", w1: 0.1, m1: 1.6 },
  { s: "XLB", n: "Materials", w1: -0.2, m1: -0.3 },
  { s: "XLRE", n: "Real Estate", w1: -0.5, m1: -0.8 },
  { s: "XLV", n: "Healthcare", w1: -0.9, m1: -1.6 },
  { s: "XLU", n: "Utilities", w1: -1.1, m1: -1.0 },
  { s: "XLP", n: "Staples", w1: -1.4, m1: -2.1 },
  { s: "XLE", n: "Energy", w1: -2.3, m1: -2.6 },
];

// Ticker → sector ETF mapping (GICS-style). Broad/commodity ETFs are unmapped (null).
const TICKER_SECTOR = {
  RKLB: "XLI", SPCX: "XLI", LUNR: "XLI", BA: "XLI", AAL: "XLI", UBER: "XLI",
  ASTS: "XLC", GOOGL: "XLC", META: "XLC", NFLX: "XLC", DIS: "XLC", SNAP: "XLC", RDDT: "XLC", ROKU: "XLC",
  NVDA: "XLK", MSFT: "XLK", AAPL: "XLK", AVGO: "XLK", AMD: "XLK", MU: "XLK", SMCI: "XLK",
  ARM: "XLK", CRWV: "XLK", IONQ: "XLK", PLTR: "XLK", SHOP: "XLK", INTC: "XLK", SMH: "XLK", XLK: "XLK",
  AMZN: "XLY", TSLA: "XLY", NKE: "XLY", MCD: "XLY", F: "XLY", RIVN: "XLY", CCL: "XLY", DKNG: "XLY", GME: "XLY",
  JPM: "XLF", BAC: "XLF", COIN: "XLF", HOOD: "XLF", SOFI: "XLF", PYPL: "XLF", XLF: "XLF",
  XOM: "XLE", CVX: "XLE", USO: "XLE", XLE: "XLE",
  WMT: "XLP", KO: "XLP",
  PFE: "XLV", HIMS: "XLV",
};
const SECTOR_NAME = Object.fromEntries(SECTORS.map((x) => [x.s, x.n]));
const SECTOR_W1 = Object.fromEntries(SECTORS.map((x) => [x.s, x.w1]));

// ─────────────────────────────────────────────
// OPTIONS LIQUIDITY TIERS (simulated — live version will score from real
// option volume, open interest, and bid-ask spread width)
// 3 = ELITE: penny-wide spreads, massive volume/OI — trade freely
// 2 = GOOD: tradeable, use limit orders, mind the spread
// 1 = THIN: wide spreads, hard fills — small accounts should avoid
// ─────────────────────────────────────────────
const TICKER_LIQ = {
  SPY: 3, QQQ: 3, IWM: 3, TLT: 3, GLD: 3, SLV: 3, XLE: 3, XLF: 3, XLK: 3, SMH: 3,
  NVDA: 3, TSLA: 3, AAPL: 3, AMD: 3, META: 3, AMZN: 3, MSFT: 3, GOOGL: 3,
  PLTR: 3, COIN: 3, HOOD: 3, SOFI: 3, F: 3, INTC: 3, RIVN: 3, MARA: 3, GME: 3,
  SNAP: 3, BAC: 3, RKLB: 3, SPCX: 3, ARKK: 2, USO: 2, VXX: 2,
  AVGO: 2, MU: 2, NFLX: 2, SHOP: 2, UBER: 2, DKNG: 2, ARM: 2, SMCI: 2, CRWV: 2,
  IONQ: 2, RDDT: 2, HIMS: 2, ASTS: 2, XOM: 2, CVX: 2, JPM: 2, WMT: 2, KO: 2,
  MCD: 2, DIS: 2, BA: 2, NKE: 2, PYPL: 2, PFE: 2, CCL: 2, AAL: 2, ROKU: 2,
  LUNR: 1,
};
const liq = (t) => TICKER_LIQ[t] || 2;
const LIQ_LABEL = { 3: "ELITE", 2: "GOOD", 1: "THIN" };
const LIQ_DOTS = { 3: "●●●", 2: "●●○", 1: "●○○" };
const LIQ_COLOR = { 3: "#1E7A46", 2: "#8A8578", 1: "#B03E1E" };

// ─────────────────────────────────────────────
// LOGIC
// ─────────────────────────────────────────────
const EARNINGS_SOON_DAYS = 14;
const earningsSoon = (s) => s.ed !== null && s.ed <= EARNINGS_SOON_DAYS;

function expectedMove(price, iv, days) {
  return price * (iv / 100) * Math.sqrt(days / 365);
}

function getStrategies(s) {
  const e = earningsSoon(s);
  if (s.ivr >= 70) {
    return [
      { name: "Short Strangle", tag: e ? "IV crush play" : "premium selling", setup: "~16Δ shorts · 30–45 DTE" },
      { name: "Short Straddle", tag: "max premium · neutral", setup: "ATM 50Δ · 30–45 DTE" },
      { name: "Iron Condor", tag: "defined risk · high POP", setup: "~16Δ shorts · 30–45 DTE" },
    ];
  }
  if (s.ivr >= 50) {
    return [
      { name: "Short Strangle", tag: "premium selling", setup: "~16Δ shorts · 30–45 DTE" },
      { name: "Cash-Secured Put", tag: "bullish · get paid to wait", setup: "~30Δ put · 30–45 DTE" },
      { name: "Put Credit Spread", tag: "defined risk · bullish", setup: "sell ~25Δ · 30–45 DTE" },
    ];
  }
  if (s.ivr >= 30) {
    return [
      { name: "Cash-Secured Put", tag: "bullish income", setup: "~30Δ put · 30–45 DTE" },
      { name: "Covered Call / PMCC", tag: "income on shares", setup: "sell ~30Δ call · 30–45 DTE" },
      { name: "Iron Condor (wide)", tag: "defined risk · neutral", setup: "~10–16Δ shorts · 45 DTE" },
    ];
  }
  return [
    { name: "Long Call / LEAPS", tag: "cheap premium · directional", setup: "70–80Δ · 90+ DTE" },
    { name: "Calendar Spread", tag: "long vega · IV expansion", setup: "ATM · sell 30 / buy 60 DTE" },
    { name: "Call Debit Spread", tag: "defined risk · low cost", setup: "buy ~60Δ sell ~40Δ · 45 DTE" },
  ];
}

function ivColor(ivr) {
  if (ivr >= 70) return "#D34A24";
  if (ivr >= 50) return "#C77E14";
  if (ivr >= 30) return "#6E7E96";
  return "#4C79AC";
}
function ivLabel(ivr) {
  if (ivr >= 70) return "HOT";
  if (ivr >= 50) return "ELEVATED";
  if (ivr >= 30) return "NORMAL";
  return "LOW";
}

const fmt = (x) => x.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

// ─────────────────────────────────────────────
// SECTOR ROTATION PANEL
// ─────────────────────────────────────────────
function SectorRotation({ active, onSelect }) {
  const [win, setWin] = useState("w1");
  const [open, setOpen] = useState(true);
  const data = [...SECTORS]
    .map((x) => ({ ...x, v: win === "w1" ? x.w1 : x.m1 }))
    .sort((a, b) => b.v - a.v);
  const inflows = data.filter((d) => d.v > 0).map((d) => d.n);
  const outflows = data.filter((d) => d.v < 0).slice(-3).map((d) => d.n);

  return (
    <div style={{ margin: "20px 24px 4px", background: "#FFFFFF", border: "1px solid #E7E4DC", borderRadius: 14, padding: 18 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 800, letterSpacing: "0.04em", color: "#22282F" }}>SECTOR ROTATION</div>
          <div style={{ fontSize: 11, color: "#8A8578", marginTop: 2 }}>
            Relative to SPY — bars right of zero = money rotating in · <span style={{ fontWeight: 700, color: "#DD8A17" }}>click a bar to filter the cards below</span>
          </div>
        </div>
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          {[{ id: "w1", label: "1 WEEK" }, { id: "m1", label: "1 MONTH" }].map((o) => (
            <button
              key={o.id}
              onClick={() => setWin(o.id)}
              style={{
                cursor: "pointer", fontSize: 10.5, fontWeight: 700, letterSpacing: "0.06em", padding: "6px 10px",
                borderRadius: 6,
                background: win === o.id ? "#22282F" : "#FFFFFF",
                color: win === o.id ? "#FFFFFF" : "#8A8578",
                border: win === o.id ? "1px solid #22282F" : "1px solid #DDD9CF",
              }}
            >
              {o.label}
            </button>
          ))}
          <button
            onClick={() => setOpen(!open)}
            style={{ cursor: "pointer", fontSize: 10.5, fontWeight: 700, padding: "6px 10px", borderRadius: 6, background: "#FFFFFF", color: "#8A8578", border: "1px solid #DDD9CF" }}
          >
            {open ? "HIDE" : "SHOW"}
          </button>
        </div>
      </div>

      {open && (
        <>
          <div style={{ height: 330, marginTop: 12 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data}
                layout="vertical"
                margin={{ top: 0, right: 40, left: 0, bottom: 0 }}
                style={{ cursor: "pointer" }}
                onClick={(state) => {
                  const p = state && state.activePayload && state.activePayload[0] && state.activePayload[0].payload;
                  if (p) onSelect(p.s === active ? null : p.s);
                }}
              >
                <XAxis type="number" domain={["auto", "auto"]} tick={{ fontSize: 10, fill: "#8A8578", fontFamily: "'IBM Plex Mono', monospace" }} tickFormatter={(v) => `${v > 0 ? "+" : ""}${v}%`} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="n" width={104} tick={{ fontSize: 11, fill: "#3A414C", fontWeight: 600 }} axisLine={false} tickLine={false} />
                <Tooltip
                  cursor={{ fill: "#F5F4F0" }}
                  formatter={(v, name, props) => [`${v > 0 ? "+" : ""}${v}% vs SPY`, props.payload.s]}
                  contentStyle={{ border: "1px solid #E7E4DC", borderRadius: 8, fontSize: 12, fontFamily: "'IBM Plex Mono', monospace" }}
                />
                <ReferenceLine x={0} stroke="#C9C4B8" />
                <Bar
                  dataKey="v"
                  radius={[0, 4, 4, 0]}
                  barSize={16}
                >
                  {data.map((d) => {
                    const base = d.v >= 0 ? "#1E8A4C" : "#D34A24";
                    const dim = d.v >= 0 ? "#BFDCCB" : "#EFC5B8";
                    return (
                      <Cell
                        key={d.s}
                        fill={active && d.s !== active ? dim : base}
                        stroke={d.s === active ? "#22282F" : "none"}
                        strokeWidth={d.s === active ? 1.5 : 0}
                      />
                    );
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div style={{ fontSize: 11.5, color: "#5B6472", borderTop: "1px solid #EFEDE7", paddingTop: 10, marginTop: 4 }}>
            <span style={{ fontWeight: 700, color: "#1E8A4C" }}>Money in:</span> {inflows.join(", ")}
            <span style={{ margin: "0 10px", color: "#C9C4B8" }}>|</span>
            <span style={{ fontWeight: 700, color: "#D34A24" }}>Money out:</span> {outflows.join(", ")}
            <span style={{ display: "block", marginTop: 4, color: "#A6A192", fontSize: 10.5 }}>
              Growth-led tape: tech, industrials & comm services leading while oil-driven energy and defensives (staples, healthcare, utilities) bleed — classic risk-on rotation.
            </span>
          </div>
        </>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// COMPONENTS
// ─────────────────────────────────────────────
function IVMeter({ ivr }) {
  return (
    <div style={{ position: "relative", height: 8, borderRadius: 4, background: "#EBE8E1", overflow: "hidden" }}>
      <div
        style={{
          position: "absolute", inset: 0, width: `${ivr}%`,
          background: "linear-gradient(90deg, #4C79AC 0%, #8FA0B8 35%, #E0A32E 60%, #E05A2B 100%)",
          backgroundSize: `${100 / (ivr / 100)}% 100%`,
          borderRadius: 4, transition: "width .4s ease",
        }}
      />
      <div style={{ position: "absolute", left: "50%", top: 0, bottom: 0, width: 1.5, background: "#C9C4B8" }} />
    </div>
  );
}

function RangeRow({ label, price, iv, days }) {
  const mv = expectedMove(price, iv, days);
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "5px 0", borderTop: "1px solid #EFEDE7" }}>
      <span style={{ fontSize: 11, letterSpacing: "0.08em", color: "#8A8578", fontFamily: "'IBM Plex Mono', monospace" }}>{label}</span>
      <span style={{ fontSize: 12, fontFamily: "'IBM Plex Mono', monospace", color: "#3A414C" }}>
        ±{fmt(mv)}
        <span style={{ color: "#A6A192", marginLeft: 8 }}>
          {fmt(price - mv)} – {fmt(price + mv)}
        </span>
      </span>
    </div>
  );
}

function StockCard({ s, watched, onStar, onSector, onVol, volLoading }) {
  const up = s.chg >= 0;
  const strats = getStrategies(s);
  const heat = ivColor(s.ivr);
  const erSoon = earningsSoon(s);
  const tier = s.liveLiq || liq(s.t); // real Tradier liquidity tier wins once fetched
  return (
    <div
      style={{
        background: "#FFFFFF", border: "1px solid #E7E4DC", borderRadius: 14, padding: 18,
        display: "flex", flexDirection: "column", gap: 12,
        boxShadow: s.ivr >= 70
          ? `0 0 0 1px ${heat}2E, 0 10px 26px -16px ${heat}55`
          : "0 8px 22px -18px rgba(60,55,40,.35)",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 12, color: "#8A8578", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{s.n}</div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 2, flexWrap: "wrap" }}>
            <span style={{ fontSize: 22, fontWeight: 800, letterSpacing: "0.02em", color: "#22282F", fontFamily: "'IBM Plex Mono', monospace" }}>{s.t}</span>
            <span
              title={s.liveLiq
                ? "Options liquidity: scored LIVE from Tradier option volume, open interest & spread width"
                : `Options liquidity: ${LIQ_LABEL[tier]} — tap ↻ to score from live Tradier data`}
              style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", color: LIQ_COLOR[tier], fontFamily: "'IBM Plex Mono', monospace" }}
            >
              {LIQ_DOTS[tier]} {LIQ_LABEL[tier]}{s.liveLiq ? "*" : ""}
            </span>
            {s.etf && (
              <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", color: "#5E6E86", border: "1px solid #D4DAE3", borderRadius: 4, padding: "2px 6px", background: "#F2F4F8" }}>ETF</span>
            )}
            {TICKER_SECTOR[s.t] && (
              <button
                onClick={() => onSector(TICKER_SECTOR[s.t])}
                title={`Filter to ${SECTOR_NAME[TICKER_SECTOR[s.t]]}`}
                style={{
                  cursor: "pointer", fontSize: 9, fontWeight: 700, letterSpacing: "0.06em", borderRadius: 4, padding: "2px 6px",
                  color: SECTOR_W1[TICKER_SECTOR[s.t]] >= 0 ? "#1E7A46" : "#B03E1E",
                  background: SECTOR_W1[TICKER_SECTOR[s.t]] >= 0 ? "#EDF7F0" : "#FBEEE8",
                  border: SECTOR_W1[TICKER_SECTOR[s.t]] >= 0 ? "1px solid #BFE0CB" : "1px solid #F0CDBD",
                }}
              >
                {SECTOR_NAME[TICKER_SECTOR[s.t]].toUpperCase()} {SECTOR_W1[TICKER_SECTOR[s.t]] >= 0 ? "▲" : "▼"}
              </button>
            )}
            {erSoon && (
              <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.08em", color: "#FFFFFF", background: "#DD8A17", borderRadius: 4, padding: "2px 6px" }}>
                ER {s.earn.toUpperCase()} · {s.ed}D
              </span>
            )}
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 20, fontWeight: 700, color: "#22282F", fontFamily: "'IBM Plex Mono', monospace" }}>${fmt(s.p)}</div>
            <div style={{ fontSize: 12, fontWeight: 600, fontFamily: "'IBM Plex Mono', monospace", color: up ? "#1E8A4C" : "#D34A24" }}>
              {up ? "▲" : "▼"} {up ? "+" : ""}{s.chg.toFixed(1)}%
            </div>
          </div>
          <button
            onClick={() => onStar(s.t)}
            aria-label={watched ? `Remove ${s.t} from watchlist` : `Add ${s.t} to watchlist`}
            style={{
              cursor: "pointer", background: "transparent", border: "none", padding: 2, lineHeight: 1,
              fontSize: 20, color: watched ? "#DD8A17" : "#CFCBC0",
              transition: "color .15s ease",
            }}
          >
            {watched ? "★" : "☆"}
          </button>
        </div>
      </div>

      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
          <span style={{ fontSize: 10, letterSpacing: "0.12em", color: "#8A8578", fontWeight: 700 }}>
            IV RANK
            {s.ivLive && !s.ivrReal && (
              <span title="IV is live; rank is estimated until ~20 days of IV history accumulate" style={{ marginLeft: 5, color: "#C77E14" }}>EST</span>
            )}
            {s.ivrReal && (
              <span title="Rank computed from your app's own accumulated IV history" style={{ marginLeft: 5, color: "#1E7A46" }}>REAL</span>
            )}
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 13, fontWeight: 700, color: heat }}>
              {s.ivr} <span style={{ fontSize: 9, letterSpacing: "0.1em" }}>{ivLabel(s.ivr)}</span>
            </span>
            {onVol && (
              <button
                onClick={() => onVol(s.t)}
                title="Fetch live ATM IV, HV & liquidity from Tradier for this ticker"
                style={{
                  cursor: "pointer", fontSize: 12, lineHeight: 1, padding: "3px 6px", borderRadius: 5,
                  background: s.ivLive ? "#EDF7F0" : "#F8F7F4",
                  color: s.ivLive ? "#1E7A46" : "#8A8578",
                  border: s.ivLive ? "1px solid #BFE0CB" : "1px solid #DDD9CF",
                }}
              >
                {volLoading ? "…" : "↻"}
              </button>
            )}
          </span>
        </div>
        <IVMeter ivr={s.ivr} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginTop: 7, fontFamily: "'IBM Plex Mono', monospace" }}>
          <span style={{ fontSize: 11, color: "#5B6472" }}>
            IV <span style={{ fontWeight: 700, color: "#22282F" }}>{s.iv}%</span>
            <span style={{ color: "#B5B0A3", margin: "0 5px" }}>·</span>
            HV <span style={{ fontWeight: 700, color: "#22282F" }}>{s.hv}%</span>
            {s.iv > s.hv && (
              <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.06em", color: "#1E7A46", marginLeft: 6 }}>
                +{s.iv - s.hv} RICH
              </span>
            )}
          </span>
          <span style={{ fontSize: 10.5, color: "#8A8578" }}>
            {s.etf ? "NO EARNINGS (ETF)" : `NEXT ER ${s.earn.toUpperCase()} (${s.ed}D)`}
          </span>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {strats.map((st, i) => {
          const isPick = i === 2;
          return (
            <div
              key={st.name}
              style={{
                display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8,
                padding: "7px 10px", borderRadius: 8,
                background: isPick ? "#EDF7F0" : "#F8F7F4",
                border: isPick ? "1px solid #BFE0CB" : "1px solid #EDEAE3",
              }}
            >
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 12.5, fontWeight: 700, color: isPick ? "#1E7A46" : "#333A44" }}>
                  {st.name}
                </div>
                <div style={{ fontSize: 10, color: isPick ? "#4E9A6E" : "#8A8578" }}>{st.tag}</div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 3, flexShrink: 0 }}>
                {isPick && (
                  <span style={{ fontSize: 8.5, fontWeight: 800, letterSpacing: "0.1em", color: "#FFFFFF", background: "#1E8A4C", borderRadius: 4, padding: "3px 6px", whiteSpace: "nowrap" }}>
                    SMALL ACCT PICK
                  </span>
                )}
                <span style={{ fontSize: 9.5, fontFamily: "'IBM Plex Mono', monospace", color: isPick ? "#4E9A6E" : "#8A8578", whiteSpace: "nowrap" }}>
                  {st.setup}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div>
        <div style={{ fontSize: 10, letterSpacing: "0.12em", color: "#8A8578", fontWeight: 700, marginBottom: 2 }}>
          EXPECTED RANGE <span style={{ color: "#B5B0A3" }}>(1σ · IV {s.iv}%)</span>
        </div>
        <RangeRow label="1 DAY" price={s.p} iv={s.iv} days={1} />
        <RangeRow label="1 WEEK" price={s.p} iv={s.iv} days={7} />
        <RangeRow label="1 MONTH" price={s.p} iv={s.iv} days={30} />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// APP
// ─────────────────────────────────────────────
export default function OptionsScanner() {
  const [etfOnly, setEtfOnly] = useState(false);
  const [highIVOnly, setHighIVOnly] = useState(false);
  const [earningsOnly, setEarningsOnly] = useState(false);
  const [watchOnly, setWatchOnly] = useState(false);
  const [liquidOnly, setLiquidOnly] = useState(false);
  const [watchlist, setWatchlist] = useState(() => new Set(["RKLB", "SPCX"]));
  const [sortKey, setSortKey] = useState("ivr");
  const [sortDir, setSortDir] = useState("desc");
  const [query, setQuery] = useState("");
  const [sectorFilter, setSectorFilter] = useState(null);

  // ── LIVE DATA LAYER ──────────────────────────
  // live: null = loading · true = Tradier connected · false = snapshot fallback
  const [live, setLive] = useState(null);
  const [quotes, setQuotes] = useState({});
  const [vol, setVol] = useState({});

  useEffect(() => {
    const syms = UNIVERSE.map((u) => u.t).join(",");
    fetch(`/api/quotes?symbols=${syms}`)
      .then((r) => { if (!r.ok) throw new Error("quotes failed"); return r.json(); })
      .then((q) => { if (q && !q.error) { setQuotes(q); setLive(true); } else setLive(false); })
      .catch(() => setLive(false));
  }, []);

  const refreshVol = (t) => {
    setVol((v) => ({ ...v, [t]: { ...(v[t] || {}), loading: true } }));
    fetch(`/api/vol?symbol=${t}`)
      .then((r) => r.json())
      .then((d) => setVol((v) => ({ ...v, [t]: d && !d.error ? d : { err: true } })))
      .catch(() => setVol((v) => ({ ...v, [t]: { err: true } })));
  };
  // ─────────────────────────────────────────────

  // First-click direction per sort key: numbers scan high→low, alphabet reads A→Z
  const FIRST_DIR = { ivr: "desc", chg: "desc", price: "desc", az: "asc" };

  const cycleSort = (id) => {
    if (sortKey !== id) {
      setSortKey(id);
      setSortDir(FIRST_DIR[id]);
    } else if (sortDir === FIRST_DIR[id]) {
      setSortDir(FIRST_DIR[id] === "desc" ? "asc" : "desc");
    } else {
      setSortKey(null);
      setSortDir(null);
    }
  };

  const toggleStar = (ticker) => {
    setWatchlist((prev) => {
      const next = new Set(prev);
      next.has(ticker) ? next.delete(ticker) : next.add(ticker);
      return next;
    });
  };

  const rows = useMemo(() => {
    // Merge live Tradier data over the snapshot baseline
    const merged = UNIVERSE.map((u) => {
      const q = quotes[u.t];
      const v = vol[u.t];
      return {
        ...u,
        ...(q && q.p != null ? { p: q.p, chg: q.chg != null ? q.chg : u.chg } : {}),
        ...(v && v.iv
          ? {
              iv: Math.round(v.iv),
              hv: v.hv ? Math.round(v.hv) : u.hv,
              ivr: v.ivr != null ? v.ivr : u.ivr,
              ivLive: true,
              ivrReal: v.ivr != null,
              liveLiq: v.liqTier || null,
              dte: v.dte,
            }
          : {}),
      };
    });
    let list = merged.filter((s) => {
      if (etfOnly && !s.etf) return false;
      if (highIVOnly && s.ivr < 50) return false;
      if (earningsOnly && !earningsSoon(s)) return false;
      if (watchOnly && !watchlist.has(s.t)) return false;
      if (liquidOnly && liq(s.t) < 3) return false;
      if (sectorFilter && TICKER_SECTOR[s.t] !== sectorFilter) return false;
      if (query && !(s.t.toLowerCase().includes(query.toLowerCase()) || s.n.toLowerCase().includes(query.toLowerCase()))) return false;
      return true;
    });
    const ascSorters = {
      az: (a, b) => a.t.localeCompare(b.t),
      chg: (a, b) => a.chg - b.chg,
      ivr: (a, b) => a.ivr - b.ivr,
      price: (a, b) => a.p - b.p,
    };
    // Sort off → liquidity-first: the most tradeable options markets float to the top
    if (!sortKey) return [...list].sort((a, b) => liq(b.t) - liq(a.t));
    const cmp = ascSorters[sortKey];
    // Liquidity is the tiebreaker on every sort
    return [...list].sort((a, b) => {
      const d = sortDir === "asc" ? cmp(a, b) : cmp(b, a);
      return d !== 0 ? d : liq(b.t) - liq(a.t);
    });
  }, [etfOnly, highIVOnly, earningsOnly, watchOnly, liquidOnly, watchlist, sortKey, sortDir, query, sectorFilter, quotes, vol]);

  const toggles = [
    { label: "ETFs only", on: etfOnly, set: setEtfOnly },
    { label: "High IV only", on: highIVOnly, set: setHighIVOnly },
    { label: "Earnings only", on: earningsOnly, set: setEarningsOnly },
    { label: "●●● Liquid only", on: liquidOnly, set: setLiquidOnly },
    { label: `★ Watchlist (${watchlist.size})`, on: watchOnly, set: setWatchOnly },
  ];

  const sorts = [
    { id: "ivr", label: "IV Rank" },
    { id: "chg", label: "% Change" },
    { id: "price", label: "Price" },
    { id: "az", label: "A–Z" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#F5F4F0", fontFamily: "'Inter', -apple-system, sans-serif", color: "#22282F" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;600;700&family=Inter:wght@400;600;700;800&display=swap');
        * { box-sizing: border-box; }
        ::selection { background: #DD8A1733; }
        button:focus-visible, input:focus-visible { outline: 2px solid #DD8A17; outline-offset: 2px; }
        input::placeholder { color: #A6A192; }
      `}</style>

      <div style={{ borderBottom: "1px solid #E7E4DC", padding: "20px 24px", display: "flex", flexWrap: "wrap", gap: 16, alignItems: "center", justifyContent: "space-between", background: "#FDFCFA" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#DD8A17", boxShadow: "0 0 0 4px #DD8A1722" }} />
            <h1 style={{ margin: 0, fontSize: 20, fontWeight: 800, letterSpacing: "-0.01em", color: "#22282F" }}>PREMIUM HUNTER</h1>
          </div>
          <div style={{ fontSize: 11.5, color: "#8A8578", marginTop: 3, display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <span
              style={{
                fontSize: 9.5, fontWeight: 800, letterSpacing: "0.08em", borderRadius: 4, padding: "2px 7px",
                color: "#FFFFFF",
                background: live === true ? "#1E8A4C" : live === false ? "#C77E14" : "#8A8578",
              }}
            >
              {live === true ? "● LIVE · TRADIER" : live === false ? "● SNAPSHOT MODE" : "● CONNECTING…"}
            </span>
            <span>
              {live === true
                ? "prices live (15-min delayed) · tap ↻ on a card for real IV/HV"
                : "educational snapshot · deploy with a Tradier key for live data"}
              {" · not financial advice"}
            </span>
          </div>
        </div>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search ticker or name…"
          style={{
            background: "#FFFFFF", border: "1px solid #DDD9CF", borderRadius: 8, padding: "9px 14px",
            fontSize: 13, color: "#22282F", width: 230, fontFamily: "'IBM Plex Mono', monospace",
          }}
        />
      </div>

      <SectorRotation active={sectorFilter} onSelect={setSectorFilter} />

      <div style={{ padding: "14px 24px", display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center", borderBottom: "1px solid #ECE9E1", background: "#FAF9F6", marginTop: 14 }}>
        {toggles.map((tg) => (
          <button
            key={tg.label}
            onClick={() => tg.set(!tg.on)}
            style={{
              cursor: "pointer", fontSize: 12, fontWeight: 700, letterSpacing: "0.03em",
              padding: "8px 14px", borderRadius: 999,
              background: tg.on ? "#DD8A17" : "#FFFFFF",
              color: tg.on ? "#FFFFFF" : "#5B5646",
              border: tg.on ? "1px solid #DD8A17" : "1px solid #DDD9CF",
              transition: "all .15s ease",
            }}
          >
            {tg.on ? "● " : "○ "}{tg.label}
          </button>
        ))}

        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <span style={{ fontSize: 10.5, letterSpacing: "0.1em", color: "#8A8578", fontWeight: 700 }}>SORT BY</span>
          {sorts.map((s) => {
            const on = sortKey === s.id;
            const arrow = on ? (sortDir === "desc" ? " ↓" : " ↑") : "";
            return (
              <button
                key={s.id}
                onClick={() => cycleSort(s.id)}
                title="Click: high→low · again: low→high · again: off"
                style={{
                  cursor: "pointer", fontSize: 12, fontWeight: 600, padding: "7px 12px", borderRadius: 8,
                  background: on ? "#EFEBE1" : "transparent",
                  color: on ? "#22282F" : "#8A8578",
                  border: on ? "1px solid #D8D2C2" : "1px solid transparent",
                }}
              >
                {s.label}{arrow}
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ padding: "14px 24px 0", fontSize: 12, color: "#8A8578", fontFamily: "'IBM Plex Mono', monospace" }}>
        {rows.length} {rows.length === 1 ? "name" : "names"} on screen
        {highIVOnly && " · IV Rank ≥ 50"}
        {earningsOnly && ` · earnings within ${EARNINGS_SOON_DAYS} days`}
        {watchOnly && " · watchlist"}
        {sectorFilter && (
          <>
            {" · "}
            <span style={{ color: "#22282F", fontWeight: 700 }}>
              {SECTOR_NAME[sectorFilter]} ({sectorFilter})
            </span>
            <button
              onClick={() => setSectorFilter(null)}
              style={{ cursor: "pointer", marginLeft: 8, fontSize: 11, fontWeight: 700, color: "#B03E1E", background: "#FBEEE8", border: "1px solid #F0CDBD", borderRadius: 6, padding: "2px 8px" }}
            >
              ✕ clear sector
            </button>
          </>
        )}
      </div>

      <div
        style={{
          padding: 24, display: "grid", gap: 16,
          gridTemplateColumns: "repeat(auto-fill, minmax(310px, 1fr))",
        }}
      >
        {rows.map((s) => (
          <StockCard
            key={s.t}
            s={s}
            watched={watchlist.has(s.t)}
            onStar={toggleStar}
            onSector={setSectorFilter}
            onVol={live === true ? refreshVol : null}
            volLoading={!!(vol[s.t] && vol[s.t].loading)}
          />
        ))}
      </div>

      {rows.length === 0 && (
        <div style={{ padding: "40px 24px", textAlign: "center", color: "#8A8578", fontSize: 14 }}>
          Nothing matches these filters. Turn one off to widen the screen.
        </div>
      )}

      <div style={{ padding: "0 24px 28px", fontSize: 11, color: "#A6A192", maxWidth: 760 }}>
        IV Rank = (current IV − 52-wk IV low) ÷ (52-wk IV high − 52-wk IV low) × 100. "RICH" flags IV above 30-day
        historical volatility. Expected ranges are 1σ moves: price × IV × √(days/365). Liquidity dots: ●●● ELITE
        (penny-wide spreads, deep volume/OI), ●●○ GOOD (tradeable with limit orders), ●○○ THIN (avoid in small
        accounts) — the live version will score this from real option volume, open interest, and bid-ask spread width.
        Prices are an Aug 5, 2026 snapshot (anchored tickers verified, others estimated); IV, HV, IV Rank, and sector
        rotation figures are illustrative until connected to a live data feed. Verify everything against thinkorswim
        before placing paper trades.
      </div>
    </div>
  );
}
