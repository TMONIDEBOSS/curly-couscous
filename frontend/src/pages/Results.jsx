import { useEffect, useState } from "react";
import { useLocation, useNavigate, useSearchParams, Link } from "react-router-dom";
import SiteHeader from "../components/SiteHeader";
import SiteFooter from "../components/SiteFooter";
import PulseScan from "../components/PulseScan";
import { fetchHistoryItem } from "../api/history";
import "./Results.css";

const STATUS_LABEL = {
  pass: "Secure",
  warn: "Needs attention",
  fail: "At risk",
};

export default function Results() {
  const { state } = useLocation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [result, setResult] = useState(state?.result || null);
  const [loading, setLoading] = useState(!state?.result);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (state?.result) return;
    const id = searchParams.get("id");
    if (!id) {
      setLoading(false);
      return;
    }
    setLoading(true);
    fetchHistoryItem(id)
      .then((data) => setResult(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [searchParams, state]);

  if (loading) {
    return (
      <div className="wrap">
        <SiteHeader />
        <div className="results-empty">Loading scan report…</div>
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="wrap">
        <SiteHeader />
        <div className="results-empty">
          <p>{error || "No scan result to show yet."}</p>
          <button className="scan-btn" onClick={() => navigate("/")}>
            Run a scan →
          </button>
        </div>
      </div>
    );
  }

  const { url, score, grade, checks, elapsedSeconds } = result;
  const nodeResults = Object.fromEntries(
    Object.entries(checks).map(([key, c]) => [key, c.status])
  );

  return (
    <div className="wrap">
      <SiteHeader />

      <div className="results-actions">
        <Link className="ghost-btn" to="/">New scan</Link>
        <Link className="ghost-btn" to="/dashboard">View dashboard</Link>
      </div>

      <section className="results-top">
        <PulseScan url={url} results={nodeResults} elapsed={elapsedSeconds} />

        <div className="score-strip">
          <div className="score-left">
            <div
              className="score-ring"
              style={{
                background: `conic-gradient(var(--teal) 0deg ${score * 3.6}deg, var(--surface-alt) ${score * 3.6}deg 360deg)`,
              }}
            >
              <div className="score-ring-inner">
                <b>{score}</b>
                <span>{grade}</span>
              </div>
            </div>
            <div className="score-text">
              <b>{url}</b>
              <span>Scanned just now</span>
            </div>
          </div>
        </div>
      </section>

      <section className="checklist">
        <div className="section-tag">FULL REPORT</div>
        <h2>What we found</h2>

        <div className="check-list">
          {Object.entries(checks).map(([key, c]) => (
            <div className={`check-row check-row-${c.status}`} key={key}>
              <div className="check-status">{STATUS_LABEL[c.status]}</div>
              <div>
                <div className="check-title">{c.title}</div>
                <div className="check-detail">{c.detail}</div>
                {c.recommendation && (
                  <div className="check-fix">Fix: {c.recommendation}</div>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
