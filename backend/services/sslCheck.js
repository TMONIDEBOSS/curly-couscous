import tls from "node:tls";

/**
 * Opens a TLS connection to the hostname and inspects the certificate:
 * whether it's currently valid, and how close it is to expiring.
 * Resolves to a normalized check result, never rejects (connection
 * failures are reported as a "fail" status instead of throwing).
 *
 * When resolvedIp is provided (see services/ssrfGuard.js), the connection
 * is made directly to that address rather than re-resolving the hostname,
 * so the IP that was security-checked is the IP actually connected to.
 * `servername` still carries the original hostname so SNI and certificate
 * hostname validation work correctly even when connecting by IP.
 */
export function checkSsl(hostname, resolvedIp) {
  return new Promise((resolve) => {
    const socket = tls.connect(
      { host: resolvedIp || hostname, port: 443, servername: hostname, timeout: 6000 },
      () => {
        const cert = socket.getPeerCertificate();
        socket.end();

        if (!cert || Object.keys(cert).length === 0) {
          return resolve(fail("No certificate returned by the server."));
        }

        const now = Date.now();
        const validTo = new Date(cert.valid_to).getTime();
        const daysLeft = Math.round((validTo - now) / (1000 * 60 * 60 * 24));

        if (validTo < now) {
          return resolve(fail("The SSL certificate has expired."));
        }

        if (daysLeft <= 14) {
          return resolve(
            warn(`Certificate is valid but expires in ${daysLeft} day(s).`)
          );
        }

        resolve(
          pass(`Valid certificate issued by ${cert.issuer?.O || "unknown issuer"}, expires in ${daysLeft} days.`)
        );
      }
    );

    socket.on("error", (err) => {
      resolve(fail(`Could not establish a secure connection: ${err.message}`));
    });

    socket.on("timeout", () => {
      socket.destroy();
      resolve(fail("Connection to the server timed out."));
    });
  });
}

function pass(detail) {
  return { status: "pass", detail };
}
function warn(detail) {
  return { status: "warn", detail };
}
function fail(detail) {
  return { status: "fail", detail };
}
