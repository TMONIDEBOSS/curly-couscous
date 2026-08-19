import express from "express";
import cors from "cors";
import helmet from "helmet";
import { rateLimit } from "express-rate-limit";
import "dotenv/config";
import scanRouter from "./routes/scan.js";
import historyRouter from "./routes/history.js";
import contactRouter from "./routes/contact.js";

const app = express();
const PORT = process.env.PORT || 4000;
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || "http://localhost:5173";

// Only trust X-Forwarded-For (and therefore req.ip) when KindGuard is
// actually deployed behind a real reverse proxy/load balancer that sets
// it. Trusting it blindly would let anyone spoof their IP via that header
// and bypass the rate limiter below — so this defaults to off, and is an
// explicit opt-in via .env once you know your deployment sits behind one.
if (process.env.TRUST_PROXY === "true") {
  app.set("trust proxy", 1);
}

// Sets baseline security headers (CSP, HSTS, X-Content-Type-Options,
// X-Frame-Options, etc). This is a JSON API with no HTML views of its
// own, so the default Content-Security-Policy is intentionally minimal
// here rather than tuned for serving pages.
app.use(helmet());

app.use(cors({ origin: FRONTEND_ORIGIN }));

// Caps request body size so a huge payload can't be used to exhaust
// memory. 10kb is generous for this API's actual payloads (a URL, or a
// short contact message).
app.use(express.json({ limit: "10kb" }));

// General defense-in-depth request limiter across the whole API, on top
// of (not instead of) the scan-specific monthly quota in
// services/rateLimiter.js. This one just stops raw request-volume abuse.
app.use(
  "/api",
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 100,
    standardHeaders: "draft-8",
    legacyHeaders: false,
  })
);

// Contact form gets its own tighter rate limit, applied inside
// routes/contact.js directly on that route (see there for why it's not
// applied here at the mount point: mounting it under /api/contact would
// double up with the route's own "/contact" path).

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/api", scanRouter);
app.use("/api", historyRouter);
app.use("/api", contactRouter);

// Generic error handler — deliberately never forwards err.message or a
// stack trace to the client, so internal details can't leak through an
// unexpected failure.
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Something went wrong. Please try again." });
});

app.listen(PORT, () => {
  console.log(`KindGuard backend running on http://localhost:${PORT}`);
});
