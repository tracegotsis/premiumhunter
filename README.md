# Premium Hunter — Options Screener (Netlify + Tradier)

Your options screener, ready to deploy with live market data. Prices load for
all tickers on page open (one batched Tradier call); tap the ↻ on any card to
pull that ticker's real ATM implied volatility, 30-day historical volatility,
and a liquidity score computed from actual option volume, open interest, and
bid-ask spread width. Every IV fetch also snapshots into storage, so IV Rank
automatically upgrades from EST to REAL per ticker once ~20 days of history
accumulate. If no API key is configured, the app runs in Snapshot Mode with
the built-in teaching data — it never breaks.

## What you need (all free)
1. A GitHub account (github.com)
2. A Netlify account (netlify.com — sign up with GitHub)
3. A Tradier developer account (developer.tradier.com) → create a
   **Sandbox Access Token** in your dashboard

## Deploy — no terminal path (~15 minutes)
1. On GitHub: New repository → name it `premium-hunter` → Create.
2. Click "uploading an existing file" and drag ALL files/folders from this
   project in (index.html, package.json, netlify.toml, vite.config.js,
   .gitignore, README.md, and the `src` and `netlify` folders). Commit.
3. On Netlify: Add new site → Import an existing project → GitHub →
   pick `premium-hunter`. Build settings auto-detect from netlify.toml.
4. Before deploying: Site configuration → Environment variables → add
   `TRADIER_TOKEN` = your sandbox token. (Optional: `TRADIER_BASE` =
   `https://api.tradier.com/v1` later if you upgrade to production data.)
5. Deploy. Open your site URL. The pill in the header should read
   **● LIVE · TRADIER**. Done.

## Deploy — Claude Code path (even easier if it's installed)
Open this folder in a terminal, run `claude`, and say:
"Deploy this to Netlify. My Tradier sandbox token is in my clipboard —
set it as the TRADIER_TOKEN environment variable. Test that /api/quotes
returns live data before finishing."

## Local testing (optional)
- `npm install`
- `npm install -g netlify-cli`
- `netlify dev`  (put `TRADIER_TOKEN=...` in a `.env` file first)
- Open http://localhost:8888

## Good to know
- **Sandbox data is 15-minute delayed** — perfect for 30–45 DTE premium
  selling, not for day trading.
- **Rate limits**: the sandbox allows ~60 requests/min. Quotes are 1 batched
  call for all 62 tickers. Each ↻ tap = 4 calls, so pace vol refreshes
  (roughly 10–12 tickers per minute max).
- **IV Rank history** lives in Netlify Blobs, keyed per ticker, capped at
  52 weeks. It builds automatically as you use the app.
- **Liquidity tiers** (once fetched live): ●●● ELITE = OI > 50k and median
  spread < 5% · ●●○ GOOD = OI > 5k and spread < 15% · ●○○ THIN = avoid.
- Educational tool. Not financial advice. Verify in thinkorswim before
  trading, even on paper.
