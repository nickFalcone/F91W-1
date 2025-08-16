import { memo } from "react";

export const DomFallback = memo(function DomFallback() {
  return (
    <div style={{ textAlign: "center" }}>
      <svg
        width="280"
        height="360"
        viewBox="0 0 280 360"
        role="img"
        aria-label="Watch illustration"
      >
        <rect
          x="40"
          y="20"
          width="200"
          height="320"
          rx="24"
          fill="#111"
          stroke="#2a2f37"
          strokeWidth="4"
        />
        <rect
          x="60"
          y="80"
          width="160"
          height="120"
          rx="8"
          fill="#1a1f24"
          stroke="#0cf"
          strokeWidth="2"
        />
        <rect x="76" y="100" width="128" height="80" rx="4" fill="#d7e7d1" />
        <text
          x="140"
          y="150"
          textAnchor="middle"
          fontFamily="monospace"
          fontSize="28"
          fill="#212"
        >
          10:58
        </text>
        <text
          x="140"
          y="310"
          textAnchor="middle"
          fontFamily="sans-serif"
          fontSize="12"
          fill="#7aa"
        >
          WebGL unavailable. Static fallback shown.
        </text>
      </svg>
    </div>
  );
});
