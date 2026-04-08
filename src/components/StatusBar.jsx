import './StatusBar.css'

export default function StatusBar() {
  return (
    <div className="status-bar">
      <span className="status-time">9:41</span>
      <div className="status-icons">
        {/* Cellular */}
        <svg width="19" height="12" viewBox="0 0 19 12" fill="none">
          <rect x="0" y="7.5" width="3.35" height="4.5" rx="0.5" fill="#fff" />
          <rect x="5.22" y="5.25" width="3.35" height="6.75" rx="0.5" fill="#fff" />
          <rect x="10.43" y="2.63" width="3.35" height="9.37" rx="0.5" fill="#fff" />
          <rect x="15.65" y="0" width="3.35" height="12" rx="0.5" fill="#fff" />
        </svg>
        {/* Wifi */}
        <svg width="16" height="12" viewBox="0 0 16 12" fill="none">
          <path d="M8 10.5a1.5 1.5 0 110 3 1.5 1.5 0 010-3z" fill="#fff" transform="translate(0,-2)" />
          <path d="M4.93 8.25A4.49 4.49 0 018 7a4.49 4.49 0 013.07 1.25" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" fill="none" transform="translate(0,-2)" />
          <path d="M1.86 5.18A8.48 8.48 0 018 3a8.48 8.48 0 016.14 2.18" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" fill="none" transform="translate(0,-2)" />
          <path d="M0 2.5C2.25.9 5 0 8 0s5.75.9 8 2.5" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" fill="none" transform="translate(0,-0.5)" />
        </svg>
        {/* Battery */}
        <svg width="27" height="12" viewBox="0 0 27 12" fill="none">
          <rect x="0.5" y="0.5" width="22" height="11" rx="2.17" stroke="rgba(255,255,255,0.35)" />
          <rect x="2" y="2" width="19" height="8" rx="1.33" fill="#fff" />
          <rect x="23.5" y="3.88" width="1.5" height="4.24" rx="0.5" fill="rgba(255,255,255,0.4)" />
        </svg>
      </div>
    </div>
  )
}
