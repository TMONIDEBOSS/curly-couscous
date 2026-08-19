const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

/**
 * Calls the backend to scan a URL and returns the parsed result (including
 * its persisted `id`, used to revisit the report later from history).
 * Throws on network failure or non-2xx responses. When the free monthly
 * limit has been hit, the thrown error carries `upgradeRequired: true`.
 */
export async function runScan(url) {
  const res = await fetch(`${API_BASE}/api/scan`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url }),
  });

  const body = await res.json().catch(() => ({}));

  if (!res.ok) {
    const err = new Error(body.error || `Scan failed with status ${res.status}`);
    if (body.upgradeRequired) err.upgradeRequired = true;
    throw err;
  }

  return body;
}
