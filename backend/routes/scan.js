import { Router } from "express";
import { normalizeUrl } from "../services/normalizeUrl.js";
import { resolvePublicHost } from "../services/ssrfGuard.js";
import { checkSsl } from "../services/sslCheck.js";
import { checkHeaders } from "../services/headersCheck.js";
import { checkMalware } from "../services/malwareCheck.js";
import { checkBlacklist } from "../services/blacklistCheck.js";
import { buildEuChecklist } from "../services/euChecklist.js";
import { computeScore } from "../services/scoreEngine.js";
import { checkRateLimit, FREE_MONTHLY_LIMIT } from "../services/rateLimiter.js";
import { saveRecord } from "../services/historyStore.js";

const router = Router();

router.post("/scan", async (req, res) => {
  const startedAt = Date.now();
  const { url } = req.body || {};

  if (!url || typeof url !== "string") {
    return res.status(400).json({ error: "Provide a website URL to scan." });
  }

  const requesterKey = req.ip || req.socket.remoteAddress || "unknown";
  const rateLimit = checkRateLimit(requesterKey);
  if (!rateLimit.allowed) {
    return res.status(429).json({
      error: `You've used this month's ${FREE_MONTHLY_LIMIT} free scans. Upgrade to Premium for unlimited scans.`,
      upgradeRequired: true,
      resetAt: rateLimit.resetAt,
    });
  }

  let normalized;
  try {
    normalized = normalizeUrl(url);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }

  const { href, hostname } = normalized;

  // SSRF guard: resolve and validate the target before connecting to it.
  // See services/ssrfGuard.js for why this matters for a "scan any URL"
  // tool specifically.
  let resolved;
  try {
    resolved = await resolvePublicHost(hostname);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }

  const [sslResult, headersResult, malwareResult, blacklistResult] = await Promise.all([
    checkSsl(hostname, resolved.address),
    checkHeaders(href, hostname, resolved.address),
    checkMalware(href),
    checkBlacklist(hostname),
  ]);

  const euResult = buildEuChecklist({
    ssl: sslResult,
    headers: headersResult,
    malware: malwareResult,
    blacklist: blacklistResult,
  });

  const checks = {
    ssl: { title: "Encryption strength (SSL/TLS)", ...sslResult },
    headers: { title: "Security headers", ...headersResult },
    malware: { title: "Hack & malware detection", ...malwareResult },
    blacklist: { title: "Domain reputation", ...blacklistResult },
    eu: { title: "EU-aligned checklist", ...euResult },
  };

  const { score, grade } = computeScore(checks);
  const elapsedSeconds = Number(((Date.now() - startedAt) / 1000).toFixed(1));

  const saved = saveRecord({
    url: hostname,
    score,
    grade,
    checks,
    elapsedSeconds,
  });

  res.json(saved);
});

export default router;
