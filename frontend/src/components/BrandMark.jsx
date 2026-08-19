import "./BrandMark.css";

const TICK_ANGLES = [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330];

/**
 * The KindGuard brand mark: a compass ring (rotates continuously) behind a
 * shield with a heartbeat pulse line (glows continuously). Respects
 * prefers-reduced-motion via CSS.
 */
export default function BrandMark({ size = 34 }) {
  return (
    <svg
      className="brandmark"
      width={size}
      height={size}
      viewBox="0 0 120 120"
      role="img"
      aria-label="KindGuard logo"
    >
      <g className="bm-compass">
        <circle cx="60" cy="60" r="52" className="bm-ring" />
        <g className="bm-ticks">
          {TICK_ANGLES.map((angle) => (
            <line
              key={angle}
              x1="60"
              y1="10"
              x2="60"
              y2="18"
              transform={`rotate(${angle} 60 60)`}
            />
          ))}
        </g>
        <polygon points="60,14 65,26 55,26" className="bm-needle" />
      </g>
      <g className="bm-shield">
        <path
          d="M60,28 L82,37 L82,58 C82,76 71,87 60,93 C49,87 38,76 38,58 L38,37 Z"
          className="bm-shield-fill"
        />
        <polyline
          points="42,63 50,63 54,53 60,72 66,58 71,63 78,63"
          className="bm-pulse-line"
        />
      </g>
    </svg>
  );
}
