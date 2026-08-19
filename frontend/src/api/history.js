const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

/**
 * Fetches recent scan history plus summary stats for the dashboard.
 */
export async function fetchHistory(limit = 50) {
  const res = await fetch(`${API_BASE}/api/history?limit=${limit}`);
  if (!res.ok) throw new Error("Could not load scan history.");
  return res.json();
}

/**
 * Fetches a single past scan report by its id (used when a results page
 * is opened directly via /results?id=... rather than right after a scan).
 */
export async function fetchHistoryItem(id) {
  const res = await fetch(`${API_BASE}/api/history/${id}`);
  if (!res.ok) throw new Error("That scan report could not be found.");
  return res.json();
}
