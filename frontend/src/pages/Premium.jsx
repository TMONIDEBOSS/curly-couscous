import { Link } from "react-router-dom";
import SiteHeader from "../components/SiteHeader";
import SiteFooter from "../components/SiteFooter";
import BrandMark from "../components/BrandMark";
import "./Premium.css";

const FREE_FEATURES = ["3 scans per month", "Full security report", "EU-aligned checklist"];
const PREMIUM_FEATURES = [
  "Unlimited scans",
  "Scheduled monitoring + email alerts",
  "Downloadable PDF reports",
  "Priority security assistance",
];

export default function Premium() {
  return (
    <div className="wrap">
      <SiteHeader />

      <section className="premium-hero">
        <BrandMark size={72} />
        <h1>KindGuard Premium</h1>
        <p className="sub">
          For businesses that need more than a once-off check, ongoing monitoring,
          deeper reports, and a direct line to security help.
        </p>
      </section>

      <section className="pricing-block">
        <div className="pricing-grid">
          <div className="price-card">
            <div className="price-name">FREE</div>
            <div className="price-amount">₦0</div>
            <ul className="price-features">
              {FREE_FEATURES.map((f) => <li key={f}>{f}</li>)}
            </ul>
            <button className="ghost-btn" disabled>Current plan</button>
          </div>

          <div className="price-card price-card-featured">
            <div className="price-badge">MOST POPULAR</div>
            <div className="price-name">PREMIUM</div>
            <div className="price-amount">Custom<span> — talk to us</span></div>
            <ul className="price-features">
              {PREMIUM_FEATURES.map((f) => <li key={f}>{f}</li>)}
            </ul>
            <Link className="scan-btn premium-cta" to="/contact">Talk to us →</Link>
          </div>
        </div>

        <p className="pricing-note">
          Self-serve billing isn't wired up yet. Reach out on the contact page and
          we'll set your account up manually while we build that out.
        </p>
      </section>

      <SiteFooter />
    </div>
  );
}
