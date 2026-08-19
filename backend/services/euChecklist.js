/**
 * This isn't a formal compliance certification — it's a plain-language
 * checklist inspired by baseline expectations common to EU digital-
 * resilience rules (encryption in transit, vulnerability handling,
 * basic data-protection hygiene). It's derived from the other checks
 * rather than calling any external service.
 */
export function buildEuChecklist({ ssl, headers, malware, blacklist }) {
  const failing = [ssl, headers, malware, blacklist].filter(
    (c) => c.status !== "pass"
  ).length;

  if (failing === 0) {
    return {
      status: "pass",
      detail: "Meets the baseline security checkpoints commonly expected under EU digital-resilience guidance.",
    };
  }

  if (failing <= 2) {
    return {
      status: "warn",
      detail: `${failing} checkpoint(s) fall short of the baseline expected under EU digital-resilience guidance.`,
      recommendation: "Resolve the flagged items above to move this site into good standing.",
    };
  }

  return {
    status: "fail",
    detail: `${failing} checkpoints fall short of the baseline expected under EU digital-resilience guidance.`,
    recommendation: "Prioritize the SSL and headers checks first, they carry the most weight.",
  };
}
