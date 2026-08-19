import "./PulseScan.css";

const CHECKPOINTS = [
  { key: "ssl", label: "SSL/TLS" },
  { key: "headers", label: "HEADERS" },
  { key: "malware", label: "MALWARE" },
  { key: "blacklist", label: "BLACKLIST" },
  { key: "eu", label: "EU CHECK" },
];

/**
 * PulseScan
 * The signature visual: a scanline sweeps across a row of checkpoints,
 * lighting each one up as it passes. When `results` is provided (a map of
 * key -> "pass" | "fail" | "warn"), nodes hold that status color instead
 * of looping the idle animation.
 */
export default function PulseScan({ url = "yourbusiness.com", results = null, elapsed = null }) {
  const isLive = !results;

  return (
    <div className="pulse-panel">
      <div className="pulse-head">
        <span>
          {isLive ? "SCANNING " : "SCAN COMPLETE "}
          <span className="pulse-url">{url}</span>
        </span>
        <span>{elapsed ? `${elapsed}s` : ""}</span>
      </div>

      <div className="pulse-track">
        <div className="track-line" />
        {isLive && <div className="sweep" />}
        <div className="nodes">
          {CHECKPOINTS.map((c, i) => {
            const status = results ? results[c.key] : null;
            const className = [
              "node-dot",
              isLive ? "node-dot-live" : "",
              status ? `node-dot-${status}` : "",
            ].join(" ");
            return (
              <div className="node" key={c.key} style={{ animationDelay: `${i * 0.55}s` }}>
                <div className={className} style={isLive ? { animationDelay: `${i * 0.55}s` } : undefined} />
                <div className="node-label">{c.label}</div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="pulse-readout">
        <span>{CHECKPOINTS.length} checkpoints</span>
        <span>
          {results ? (
            <>
              <b className="ok">{Object.values(results).filter((r) => r === "pass").length} passed</b>
              {"  ·  "}
              <b className="warn">
                {Object.values(results).filter((r) => r !== "pass").length} to review
              </b>
            </>
          ) : (
            <b className="ok">0 threats</b>
          )}
        </span>
      </div>
    </div>
  );
}
