import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import SiteHeader from "../components/SiteHeader";
import SiteFooter from "../components/SiteFooter";
import { fetchHistory } from "../api/history";
import "./Dashboard.css";

const STATUS_LABEL = { pass: "Secure", warn: "At risk", fail: "Critical" };
const STATUS_BADGE = { pass: "ok", warn: "warn", fail: "fail" };

function timeAgo(isoString) {
  const diffMs = Date.now() - new Date(isoString).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} hr ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "yesterday";
  return `${days} days ago`;
}

function gradeToStatus(grade) {
  if (grade === "SECURE") return "pass";
  if (grade === "GOOD") return "pass";
  if (grade === "AT RISK") return "warn";
  return "fail";
}

export default function Dashboard() {
  const [items, setItems] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchHistory(50)
      .then((data) => {
        setItems(data.items);
        setStats(data.stats);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="wrap">
      <SiteHeader />

      <section className="dash-block">
        <div className="section-tag">DASHBOARD</div>
        <h2>Every scan, tracked in one place.</h2>

        {stats && (
          <div className="stats-grid">
            <div className="stat-card">
              <span className="stat-label">TOTAL SCANS</span>
              <span className="stat-value">{stats.totalScans}</span>
            </div>
            <div className="stat-card">
              <span className="stat-label">SITES TRACKED</span>
              <span className="stat-value">{stats.sites}</span>
            </div>
            <div className="stat-card">
              <span className="stat-label">AVERAGE SCORE</span>
              <span className="stat-value">{stats.avgScore}</span>
            </div>
            <div className="stat-card">
              <span className="stat-label">THREATS FLAGGED</span>
              <span className="stat-value stat-danger">{stats.threatsFlagged}</span>
            </div>
          </div>
        )}

        {loading && <div className="dash-empty">Loading scan history…</div>}
        {error && <div className="dash-empty">{error}</div>}

        {!loading && !error && items.length === 0 && (
          <div className="dash-empty">
            <p>No scans yet.</p>
            <Link className="scan-btn" to="/">Run your first scan →</Link>
          </div>
        )}

        {!loading && items.length > 0 && (
          <div className="history-table">
            <div className="history-row history-head">
              <span>SITE</span>
              <span>SCORE</span>
              <span>STATUS</span>
              <span>SCANNED</span>
            </div>
            {items.map((item) => {
              const status = gradeToStatus(item.grade);
              return (
                <Link
                  className="history-row history-row-link"
                  to={`/results?id=${item.id}`}
                  key={item.id}
                >
                  <span className="mono">{item.url}</span>
                  <span className="mono">{item.score}</span>
                  <span className={`badge ${STATUS_BADGE[status]}`}>
                    {STATUS_LABEL[status]}
                  </span>
                  <span className="mono">{timeAgo(item.scannedAt)}</span>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      <SiteFooter />
    </div>
  );
}
