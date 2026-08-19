import { useState } from "react";
import { useNavigate } from "react-router-dom";
import SiteHeader from "../components/SiteHeader";
import SiteFooter from "../components/SiteFooter";
import PulseScan from "../components/PulseScan";
import { runScan } from "../api/scan";
import "./Home.css";

const FEATURES = [
  { n: "01", title: "Hack & malware detection", body: "Flags if your site is already compromised, defaced, or listed on a malware/blacklist database." },
  { n: "02", title: "Encryption strength", body: "Checks your SSL/TLS certificate setup and flags weak or expiring configurations." },
  { n: "03", title: "Security headers", body: "Verifies the browser-level protections that stop common attacks before they start." },
  { n: "04", title: "Domain reputation", body: "Looks up blacklist status and domain trust signals used by browsers and search engines." },
  { n: "05", title: "EU-aligned checklist", body: "Maps findings to the baseline expectations in EU digital-resilience regulation, in plain language." },
  { n: "06", title: "Fix-it action plan", body: "Every issue comes with a short, non-technical explanation and next step, no jargon." },
];

export default function Home() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [limitHit, setLimitHit] = useState(false);
  const navigate = useNavigate();

  async function handleScan(e) {
    e.preventDefault();
    if (!url.trim()) return;
    setLoading(true);
    setError(null);
    setLimitHit(false);
    try {
      const result = await runScan(url.trim());
      navigate(`/results?id=${result.id}`, { state: { result } });
    } catch (err) {
      if (err.upgradeRequired) {
        setLimitHit(true);
      } else {
        setError(err.message || "Something went wrong while scanning that site.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="wrap">
      <SiteHeader />

      <section className="hero">
        <div>
          <div className="eyebrow">
            <span className="dot" />
            LIVE SCAN ENGINE
          </div>
          <h1>
            Know your site's<br />
            <span className="accent">security pulse</span><br />
            before anyone else does.
          </h1>
          <p className="sub">
            Scan any website in seconds. See if it's been hacked, how strong its
            defenses are, and exactly what to fix to meet EU-grade security standards.
          </p>

          <form className="scan-box" onSubmit={handleScan}>
            <input
              type="text"
              placeholder="yourbusiness.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
            <button className="scan-btn" type="submit" disabled={loading}>
              {loading ? "Scanning…" : "Run scan →"}
            </button>
          </form>

          {error && <div className="scan-error">{error}</div>}

          {limitHit && (
            <div className="limit-banner">
              You've used this month's free scans. <a href="/premium">Upgrade to Premium</a> for
              unlimited scans, or check back next month.
            </div>
          )}

          <div className="fine">No signup required · 3 free scans a month</div>
        </div>

        <PulseScan url={url || "yourbusiness.com"} />
      </section>

      <section className="people-block">
        <div className="section-tag">WHO IT'S FOR</div>
        <div className="people-grid">
          <div className="people-photo">
            <img
              src="https://picsum.photos/seed/kindguard-owner/700/525"
              alt="Small business owner working on a laptop"
            />
          </div>
          <div className="people-copy">
            <h2>Built for the shop owner, not the IT department.</h2>
            <p>
              You don't need to know what SSL stands for. You just need to know if
              your site is safe, and what to do if it isn't. That's the whole job.
            </p>
            <div className="people-points">
              <div className="people-point"><span className="mark">✓</span> Plain-language reports, no jargon</div>
              <div className="people-point"><span className="mark">✓</span> Three free scans every month, no card required</div>
              <div className="people-point"><span className="mark">✓</span> A real person to talk to when you're stuck</div>
            </div>
          </div>
        </div>
      </section>

      <section className="features" id="how">
        <div className="section-tag">WHAT KINDGUARD CHECKS</div>
        <h2>Five checkpoints. One plain-language score.</h2>
        <div className="feat-grid">
          {FEATURES.map((f) => (
            <div className="feat-card" key={f.n}>
              <div className="feat-icon">{f.n}</div>
              <h3>{f.title}</h3>
              <p>{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
