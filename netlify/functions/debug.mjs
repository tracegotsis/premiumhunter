// GET /api/debug
// Temporary diagnostic. Reports whether the function can see TRADIER_TOKEN and
// what Tradier actually replies. Never prints the token itself — only its length
// and a masked 4-character fingerprint, which is safe to share.
// Delete this file once the app is live.

const BASE = process.env.TRADIER_BASE || "https://sandbox.tradier.com/v1";

export default async () => {
  const raw = process.env.TRADIER_TOKEN;

  const report = {
    tokenFound: !!raw,
    tokenLength: raw ? raw.length : 0,
    tokenFingerprint: raw ? `${raw.slice(0, 4)}…${raw.slice(-2)}` : null,
    hasWhitespace: raw ? raw !== raw.trim() : null,
    baseUrl: BASE,
  };

  if (!raw) {
    report.diagnosis =
      "TOKEN NOT VISIBLE TO FUNCTION. The env var isn't reaching runtime — check that TRADIER_TOKEN is scoped to Functions (All scopes) in Netlify, spelled exactly, then redeploy.";
    return Response.json(report, { status: 200 });
  }

  try {
    const r = await fetch(`${BASE}/markets/quotes?symbols=SPY`, {
      headers: {
        Authorization: `Bearer ${raw.trim()}`,
        Accept: "application/json",
      },
    });
    report.tradierStatus = r.status;
    report.tradierBody = (await r.text()).slice(0, 400);

    if (r.status === 401) {
      report.diagnosis =
        "Token reached Tradier but was rejected. Likely a production token hitting the sandbox endpoint (or vice versa), or sandbox access not yet provisioned. Compare baseUrl above against where the token came from.";
    } else if (r.ok) {
      report.diagnosis =
        "SUCCESS — Tradier accepted the token. If the app still shows Snapshot Mode, hard-refresh the page (Cmd+Shift+R).";
    } else {
      report.diagnosis = `Unexpected status ${r.status}. See tradierBody above.`;
    }
  } catch (e) {
    report.diagnosis = `Network error contacting Tradier: ${String(e)}`;
  }

  return Response.json(report, { status: 200 });
};
