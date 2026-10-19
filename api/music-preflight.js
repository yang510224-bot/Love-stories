'use strict';

// Read-only startup check. No generation, uploads, or public HTTP endpoint.
async function preflight({ key = process.env.MUREKA_API_KEY, request = fetch, log = console.log } = {}) {
  const report = { event: 'music_preflight_v1', configured: Boolean(key), generationEnabled: false };
  if (!key) { log(JSON.stringify(report)); return report; }
  try {
    const response = await request('https://api.mureka.ai/v1/account/billing', {
      method: 'GET', headers: { Authorization: 'Bearer ' + key },
      signal: AbortSignal.timeout(15000), redirect: 'error'
    });
    report.httpStatus = response.status;
    report.authenticated = response.ok;
    if (response.ok) {
      const data = await response.json();
      // Explicit allowlist: never log key, account ID, raw response, or errors.
      for (const field of ['balance', 'total_recharge', 'total_spending', 'concurrent_request_limit']) {
        if (Number.isFinite(data[field])) report[field] = data[field];
      }
      report.currencyUnit = 'cents';
    }
  } catch { report.error = 'billing_check_failed'; }
  log(JSON.stringify(report));
  return report;
}
module.exports = { preflight };
