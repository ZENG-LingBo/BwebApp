import './TopBar.css'

// Maps the story's status_label to a 1–3 severity level for the 3-bar indicator.
// Figma node 254:3989 "Moderate" shows three ascending bars; we light a
// subset depending on level.
function severityFromStatus(statusLabel) {
  const s = (statusLabel || '').toUpperCase()
  if (s === 'DEVELOPING') return 1
  if (s === 'CRITICAL' || s === 'SEVERE') return 3
  // ESCALATING and anything else → default Moderate (2)
  return 2
}

function SeverityBars({ level }) {
  // 3 ascending bars: 16px / 14px / 12px tall at y=0 / y=1 / y=2
  // Lit bars use --text (white), dim bars fall back to --text-muted @ ~30%
  const litColor = '#fff'
  const dimColor = 'rgba(255, 255, 255, 0.3)'
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-label={`Severity ${level}/3`}>
      <rect x="0" y="0" width="4" height="16" rx="1" fill={level >= 1 ? litColor : dimColor} />
      <rect x="6" y="1" width="4" height="14" rx="1" fill={level >= 2 ? litColor : dimColor} />
      <rect x="12" y="2" width="4" height="12" rx="1" fill={level >= 3 ? litColor : dimColor} />
    </svg>
  )
}

export default function TopBar({ category = 'WORLD', date = '10 MAR 2026', statusLabel = 'ESCALATING' }) {
  const level = severityFromStatus(statusLabel)

  return (
    <div className="top-bar">
      <div className="top-bar-left">
        {/* Severity indicator (replaces app logo) */}
        <div className="severity-icon" title={`Severity ${level}/3`}>
          <SeverityBars level={level} />
        </div>

        {/* Category pill */}
        <div className="pill pill--purple">{category}</div>

        {/* Date pill */}
        <div className="pill pill--dark">{date}</div>
      </div>

      <div className="top-bar-right">
        {/* Status pill with trendline */}
        <div className="pill pill--brown">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M2 12L6 6L10 9L14 3" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {statusLabel}
        </div>

        {/* Bookmark button (replaces close X) */}
        <button className="topbar-bookmark-btn" aria-label="Bookmark story">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M5 4h14v17l-7-4-7 4V4z" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
    </div>
  )
}
