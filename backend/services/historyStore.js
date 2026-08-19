import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "history.json");
const MAX_RECORDS = 500;

function ensureStore() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(DATA_FILE)) fs.writeFileSync(DATA_FILE, "[]", "utf-8");
}

/**
 * Returns every stored scan, newest first.
 */
export function readAll() {
  ensureStore();
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
  } catch {
    return [];
  }
}

/**
 * Persists a new scan report and returns it with its assigned id and
 * timestamp. Keeps only the most recent MAX_RECORDS entries.
 */
export function saveRecord(report) {
  ensureStore();
  const entry = {
    id: crypto.randomUUID(),
    scannedAt: new Date().toISOString(),
    ...report,
  };
  const all = [entry, ...readAll()].slice(0, MAX_RECORDS);
  fs.writeFileSync(DATA_FILE, JSON.stringify(all, null, 2));
  return entry;
}

/**
 * Looks up a single scan report by id. Returns null if not found.
 */
export function getById(id) {
  return readAll().find((r) => r.id === id) || null;
}

/**
 * Aggregate stats for the dashboard: total scans, unique sites tracked,
 * average score, and total failed checks across all scans.
 */
export function getStats() {
  const all = readAll();
  const totalScans = all.length;
  const sites = new Set(all.map((r) => r.url)).size;
  const avgScore = totalScans
    ? Math.round(all.reduce((sum, r) => sum + r.score, 0) / totalScans)
    : 0;
  const threatsFlagged = all.reduce((sum, r) => {
    const failed = Object.values(r.checks || {}).filter((c) => c.status === "fail").length;
    return sum + failed;
  }, 0);

  return { totalScans, sites, avgScore, threatsFlagged };
}
