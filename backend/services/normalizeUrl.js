/**
 * Accepts whatever a user types ("example.com", "www.example.com",
 * "https://example.com/path") and returns a clean https URL plus the bare
 * hostname, or throws if it isn't a plausible domain.
 */
export function normalizeUrl(input) {
  let candidate = input.trim();

  if (!/^https?:\/\//i.test(candidate)) {
    candidate = `https://${candidate}`;
  }

  let parsed;
  try {
    parsed = new URL(candidate);
  } catch {
    throw new Error("That doesn't look like a valid website address.");
  }

  if (!parsed.hostname.includes(".")) {
    throw new Error("That doesn't look like a valid website address.");
  }

  return {
    href: parsed.href,
    hostname: parsed.hostname,
  };
}
