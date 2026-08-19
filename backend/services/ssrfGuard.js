import dns from "node:dns/promises";

// Private, loopback, link-local, and other reserved IPv4 ranges that must
// never be reachable from a user-supplied scan target. Includes
// 169.254.0.0/16, which covers cloud metadata endpoints such as
// 169.254.169.254 (AWS/GCP/Azure instance credentials) — a classic SSRF
// target.
const BLOCKED_IPV4_RANGES = [
  ["0.0.0.0", 8],
  ["10.0.0.0", 8],
  ["100.64.0.0", 10], // carrier-grade NAT
  ["127.0.0.0", 8], // loopback
  ["169.254.0.0", 16], // link-local, incl. cloud metadata
  ["172.16.0.0", 12],
  ["192.0.0.0", 24],
  ["192.168.0.0", 16],
  ["198.18.0.0", 15],
  ["224.0.0.0", 4], // multicast
];

function ipv4ToInt(ip) {
  return ip.split(".").reduce((acc, part) => (acc << 8) + Number(part), 0) >>> 0;
}

function isBlockedIpv4(ip) {
  const ipInt = ipv4ToInt(ip);
  return BLOCKED_IPV4_RANGES.some(([base, bits]) => {
    const mask = bits === 0 ? 0 : (~0 << (32 - bits)) >>> 0;
    return (ipInt & mask) === (ipv4ToInt(base) & mask);
  });
}

// IPv6 coverage is pattern-based (loopback, link-local, unique-local, and
// IPv4-mapped equivalents of the above) rather than exhaustive CIDR math.
// It catches the common cases but isn't a complete IPv6 reserved-range
// implementation — see README's security section for the caveat.
function isBlockedIpv6(ip) {
  const lower = ip.toLowerCase();
  return (
    lower === "::1" ||
    lower.startsWith("fe80:") ||
    lower.startsWith("fc") ||
    lower.startsWith("fd") ||
    lower.startsWith("::ffff:127.") ||
    lower.startsWith("::ffff:169.254.")
  );
}

/**
 * Resolves a hostname and rejects it if it points at a private, loopback,
 * link-local, or otherwise reserved address — preventing KindGuard's own
 * scanner from being used as an SSRF vector into internal networks or
 * cloud metadata endpoints.
 *
 * Returns the resolved address so the caller can connect directly to it
 * (see sslCheck.js / headersCheck.js), rather than validating a hostname
 * here and letting a second, separate DNS lookup happen later at connect
 * time. Two lookups would leave a DNS-rebinding gap: an attacker-controlled
 * DNS server could return a safe IP for this check and a private IP a
 * moment later for the real connection. Pinning to the address we already
 * validated closes that gap.
 */
export async function resolvePublicHost(hostname) {
  let addresses;
  try {
    addresses = await dns.lookup(hostname, { all: true });
  } catch {
    throw new Error("Could not resolve that domain.");
  }

  if (!addresses || addresses.length === 0) {
    throw new Error("Could not resolve that domain.");
  }

  for (const { address, family } of addresses) {
    const blocked = family === 4 ? isBlockedIpv4(address) : isBlockedIpv6(address);
    if (blocked) {
      throw new Error("That address points to a private or reserved network and can't be scanned.");
    }
  }

  return addresses[0];
}

// Exported for testing.
export { isBlockedIpv4, isBlockedIpv6 };
