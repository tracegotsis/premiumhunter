// GET /api/quotes?symbols=RKLB,SPCX,NVDA,...
// Batch-fetches real prices + day % change from Tradier in ONE API call.
// Your TRADIER_TOKEN lives in Netlify env vars and never reaches the browser.

const BASE = process.env.TRADIER_BASE || "https://sandbox.tradier.com/v1";

export default async (req) => {
  try {
    const url = new URL(req.url);
    const symbols = (url.searchParams.get("symbols") || "").slice(0, 2000);
    if (!symbols) return Response.json({ error: "symbols required" }, { status: 400 });

    const r = await fetch(`${BASE}/markets/quotes?symbols=${encodeURIComponent(symbols)}`, {
      headers: {
        Authorization: `Bearer ${process.env.TRADIER_TOKEN}`,
        Accept: "application/json",
      },
    });
    if (!r.ok) return Response.json({ error: `tradier ${r.status}` }, { status: 502 });

    const j = await r.json();
    const list = [].concat(j?.quotes?.quote || []);
    const out = {};
    for (const q of list) {
      if (q && q.symbol) {
        const last = q.last ?? q.close ?? null;
        // Sandbox often returns change_percentage as 0 — derive it from prevclose instead
        let chg = q.change_percentage;
        if ((chg == null || chg === 0) && last != null && q.prevclose) {
          chg = ((last - q.prevclose) / q.prevclose) * 100;
        }
        out[q.symbol] = {
          p: last,
          chg: chg != null ? Math.round(chg * 100) / 100 : null,
          vol: q.volume ?? null,
          avgVol: q.average_volume ?? null,
        };
      }
    }
    return Response.json(out, { headers: { "Cache-Control": "public, max-age=60" } });
  } catch (e) {
    return Response.json({ error: String(e) }, { status: 500 });
  }
};
