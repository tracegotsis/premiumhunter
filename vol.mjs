// GET /api/vol?symbol=RKLB
// The real volatility engine for one ticker:
//   1. Current price (quote)
//   2. Options expirations -> pick the one nearest 35 DTE (the 30-45 DTE sweet spot)
//   3. Option chain with greeks -> ATM implied volatility (mid_iv)
//   4. 60 days of price history -> 30-day historical volatility (HV)
//   5. Netlify Blobs -> stores today's IV per symbol; once ~20+ days accumulate,
//      IV Rank switches from estimate to REAL (computed from your own history)
// Also returns options liquidity stats (volume / open interest / spread width).

import { getStore } from "@netlify/blobs";

const BASE = process.env.TRADIER_BASE || "https://sandbox.tradier.com/v1";
const HEADERS = () => ({
  Authorization: `Bearer ${process.env.TRADIER_TOKEN}`,
  Accept: "application/json",
});

const tget = async (path) => {
  const r = await fetch(`${BASE}${path}`, { headers: HEADERS() });
  if (!r.ok) throw new Error(`tradier ${r.status} on ${path}`);
  return r.json();
};

export default async (req) => {
  try {
    const url = new URL(req.url);
    const symbol = (url.searchParams.get("symbol") || "").toUpperCase().slice(0, 8);
    if (!symbol) return Response.json({ error: "symbol required" }, { status: 400 });

    // 1. Underlying price
    const qj = await tget(`/markets/quotes?symbols=${symbol}`);
    const q = [].concat(qj?.quotes?.quote || [])[0];
    const price = q?.last ?? q?.close;
    if (!price) return Response.json({ error: "no quote" }, { status: 404 });

    // 2. Expiration nearest 35 DTE
    const ej = await tget(`/markets/options/expirations?symbol=${symbol}`);
    const exps = [].concat(ej?.expirations?.date || []);
    if (!exps.length) return Response.json({ error: "no options listed" }, { status: 404 });
    const now = Date.now();
    const withDte = exps
      .map((d) => ({ d, dte: Math.round((new Date(d) - now) / 86400000) }))
      .filter((x) => x.dte > 5);
    withDte.sort((a, b) => Math.abs(a.dte - 35) - Math.abs(b.dte - 35));
    const exp = withDte[0];

    // 3. Chain with greeks -> ATM IV + liquidity stats
    const cj = await tget(`/markets/options/chains?symbol=${symbol}&expiration=${exp.d}&greeks=true`);
    const chain = [].concat(cj?.options?.option || []);
    if (!chain.length) return Response.json({ error: "empty chain" }, { status: 404 });

    let atm = null, bestDist = Infinity;
    let totVol = 0, totOI = 0, spreadPcts = [];
    for (const o of chain) {
      totVol += o.volume || 0;
      totOI += o.open_interest || 0;
      if (o.bid > 0 && o.ask > 0) {
        const mid = (o.bid + o.ask) / 2;
        if (mid > 0.1) spreadPcts.push((o.ask - o.bid) / mid);
      }
      const dist = Math.abs(o.strike - price);
      if (dist < bestDist && o.greeks?.mid_iv) {
        bestDist = dist;
        atm = o;
      }
    }
    const iv = atm?.greeks?.mid_iv ? atm.greeks.mid_iv * 100 : null;
    const medSpread = spreadPcts.length
      ? spreadPcts.sort((a, b) => a - b)[Math.floor(spreadPcts.length / 2)]
      : null;

    // Liquidity tier from real stats: volume, OI, and median spread width
    let liqTier = 1;
    if (totOI > 50000 && medSpread !== null && medSpread < 0.05) liqTier = 3;
    else if (totOI > 5000 && medSpread !== null && medSpread < 0.15) liqTier = 2;

    // 4. Historical volatility (30-day, annualized) from daily closes
    let hv = null;
    try {
      const start = new Date(now - 70 * 86400000).toISOString().slice(0, 10);
      const hj = await tget(`/markets/history?symbol=${symbol}&interval=daily&start=${start}`);
      const days = [].concat(hj?.history?.day || []);
      const closes = days.map((d) => d.close).filter(Boolean).slice(-31);
      if (closes.length > 15) {
        const rets = [];
        for (let i = 1; i < closes.length; i++) rets.push(Math.log(closes[i] / closes[i - 1]));
        const mean = rets.reduce((a, b) => a + b, 0) / rets.length;
        const varr = rets.reduce((a, b) => a + (b - mean) ** 2, 0) / (rets.length - 1);
        hv = Math.sqrt(varr) * Math.sqrt(252) * 100;
      }
    } catch { /* HV optional */ }

    // 5. IV history in Blobs -> real IV Rank once enough days accumulate
    let ivr = null, points = 0;
    try {
      const store = getStore("iv-history");
      const key = symbol;
      const existing = (await store.get(key, { type: "json" })) || [];
      const today = new Date().toISOString().slice(0, 10);
      if (iv && !existing.some((x) => x.d === today)) {
        existing.push({ d: today, iv: Math.round(iv * 10) / 10 });
        while (existing.length > 260) existing.shift(); // keep ~52 weeks
        await store.setJSON(key, existing);
      }
      points = existing.length;
      if (iv && points >= 20) {
        const ivs = existing.map((x) => x.iv);
        const lo = Math.min(...ivs), hi = Math.max(...ivs);
        if (hi > lo) ivr = Math.round(((iv - lo) / (hi - lo)) * 100);
      }
    } catch { /* Blobs optional in local dev */ }

    return Response.json({
      symbol, price,
      iv: iv ? Math.round(iv * 10) / 10 : null,
      hv: hv ? Math.round(hv * 10) / 10 : null,
      ivr, historyDays: points,
      dte: exp.dte, expiration: exp.d,
      optVolume: totVol, openInterest: totOI,
      medianSpreadPct: medSpread !== null ? Math.round(medSpread * 1000) / 10 : null,
      liqTier,
    });
  } catch (e) {
    return Response.json({ error: String(e) }, { status: 500 });
  }
};
