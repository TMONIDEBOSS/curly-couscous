import https from "node:https";

// The baseline headers we look for, and why each one matters.
const EXPECTED_HEADERS = [
  {
    key: "strict-transport-security",
    label: "Strict-Transport-Security",
    reason: "forces browsers to always use HTTPS on this site",
  },
  {
    key: "x-content-type-options",
    label: "X-Content-Type-Options",
    reason: "stops browsers from guessing file types in a way attackers can abuse",
  },
  {
    key: "x-frame-options",
    label: "X-Frame-Options",
    reason: "prevents the site from being embedded in a malicious clickjacking frame",
  },
  {
    key: "content-security-policy",
    label: "Content-Security-Policy",
    reason: "restricts which scripts and resources the page is allowed to load",
  },
];

/**
 * Fetches response headers for the given URL and checks which of the
 * baseline security headers are present.
 *
 * When resolvedIp is provided (see services/ssrfGuard.js), the TCP
 * connection is made directly to that address instead of passing the raw
 * href to Node (which would re-resolve the hostname itself). The Host
 * header and TLS servername still carry the real hostname so the target
 * server responds correctly for virtual-hosted sites.
 */
export function checkHeaders(href, hostname, resolvedIp) {
  return new Promise((resolve) => {
    const target = new URL(href);
    const options = {
      host: resolvedIp || target.hostname,
      servername: hostname || target.hostname,
      port: target.port || 443,
      path: `${target.pathname}${target.search}`,
      method: "GET",
      timeout: 6000,
      headers: { Host: hostname || target.hostname },
    };

    const req = https.request(options, (res) => {
      const headers = res.headers;
      const missing = EXPECTED_HEADERS.filter((h) => !headers[h.key]);
      res.destroy();

      if (missing.length === 0) {
        return resolve({
          status: "pass",
          detail: "All baseline security headers are present.",
        });
      }

      if (missing.length <= 2) {
        return resolve({
          status: "warn",
          detail: `Missing ${missing.length} header(s): ${missing.map((m) => m.label).join(", ")}.`,
          recommendation: `Add ${missing[0].label} — it ${missing[0].reason}.`,
        });
      }

      resolve({
        status: "fail",
        detail: `Missing ${missing.length} of ${EXPECTED_HEADERS.length} baseline security headers.`,
        recommendation: `Start with ${missing[0].label} — it ${missing[0].reason}.`,
      });
    });

    req.on("error", (err) => {
      resolve({ status: "fail", detail: `Could not fetch headers: ${err.message}` });
    });

    req.on("timeout", () => {
      req.destroy();
      resolve({ status: "fail", detail: "Header check timed out." });
    });

    req.end();
  });
}
