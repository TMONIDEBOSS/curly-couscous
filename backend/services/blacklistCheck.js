/**
 * Checks domain reputation via VirusTotal's free API tier. Requires
 * VIRUSTOTAL_API_KEY. If no key is configured, returns a "warn" result
 * so the rest of the scan still runs.
 */
export async function checkBlacklist(hostname) {
  const apiKey = process.env.VIRUSTOTAL_API_KEY;

  if (!apiKey) {
    return {
      status: "warn",
      detail: "Domain reputation check skipped — no API key configured.",
      recommendation: "Add a free VirusTotal API key to enable this check.",
    };
  }

  try {
    const res = await fetch(
      `https://www.virustotal.com/api/v3/domains/${hostname}`,
      {
        headers: { "x-apikey": apiKey },
        signal: AbortSignal.timeout(6000),
      }
    );

    if (!res.ok) {
      return {
        status: "warn",
        detail: `VirusTotal lookup returned status ${res.status}.`,
      };
    }

    const data = await res.json();
    const stats = data?.data?.attributes?.last_analysis_stats;

    if (!stats) {
      return { status: "warn", detail: "No reputation data available yet for this domain." };
    }

    const flagged = (stats.malicious || 0) + (stats.suspicious || 0);

    if (flagged === 0) {
      return { status: "pass", detail: "Not flagged by any reputation vendor." };
    }

    return {
      status: "fail",
      detail: `Flagged as malicious/suspicious by ${flagged} vendor(s).`,
      recommendation: "Investigate recent changes to your site and request re-review from affected vendors.",
    };
  } catch (err) {
    return { status: "warn", detail: `Could not complete reputation check: ${err.message}` };
  }
}
