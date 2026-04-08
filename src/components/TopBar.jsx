import './TopBar.css'

export default function TopBar() {
  return (
    <div className="top-bar">
      <div className="top-bar-left">
        {/* App logo */}
        <div className="app-logo">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <rect x="4" y="6" width="16" height="1.5" rx="0.75" fill="#fff" />
            <rect x="4" y="11.25" width="16" height="1.5" rx="0.75" fill="#fff" />
            <rect x="4" y="16.5" width="16" height="1.5" rx="0.75" fill="#fff" />
          </svg>
        </div>

        {/* WORLD pill */}
        <div className="pill pill--purple">WORLD</div>

        {/* Date pill */}
        <div className="pill pill--dark">10 MAR 2026</div>
      </div>

      <div className="top-bar-right">
        {/* ESCALATING pill */}
        <div className="pill pill--brown">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M2 12L6 6L10 9L14 3" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          ESCALATING
        </div>

        {/* Close button */}
        <button className="close-btn">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M6 6L18 18M18 6L6 18" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      </div>
    </div>
  )
}
