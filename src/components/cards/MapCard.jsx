import './MapCard.css'

export default function MapCard() {
  return (
    <div className="card map-card" data-card-index="5">
      <div className="section-title">WHERE IT'S HAPPENING</div>

      <div className="map-container">
        {/* Simplified SVG map of Iran region */}
        <svg className="map-svg" viewBox="0 0 295 220" fill="none">
          {/* Simplified Iran border */}
          <path d="M80 30 L130 20 L170 35 L210 25 L240 50 L260 80 L250 120 L230 150 L200 180 L170 200 L140 195 L110 180 L80 160 L60 130 L50 100 L55 70 L65 50 Z"
            fill="rgba(255,255,255,0.1)" stroke="rgba(255,255,255,0.15)" strokeWidth="0.5" />
          {/* Surrounding countries outlines */}
          <path d="M30 10 L80 30 L65 50 L55 70 L30 60 L20 35 Z" fill="rgba(255,255,255,0.05)" />
          <path d="M130 20 L170 35 L210 25 L200 10 L160 5 Z" fill="rgba(255,255,255,0.05)" />
          <path d="M250 120 L280 130 L275 170 L260 190 L230 150 Z" fill="rgba(255,255,255,0.05)" />
          <path d="M80 160 L110 180 L100 210 L70 200 L60 180 Z" fill="rgba(255,255,255,0.05)" />
        </svg>

        {/* Fordow pin */}
        <div className="map-pin map-pin--sm" style={{ left: 57, top: 72 }}>
          <span className="map-pin-label-left">Fordow</span>
          <div className="map-pin-icon-sm">
            <svg width="8" height="8" viewBox="0 0 16 16" fill="none">
              <path d="M2 14V8l4-2v8M6 14V6l5-4v12M11 14V4l3 2v8" fill="var(--hl-peach)" />
            </svg>
          </div>
        </div>

        {/* Natanz pin (large/primary) */}
        <div className="map-pin map-pin--lg" style={{ left: 115, top: 101 }}>
          <div className="map-pin-icon-lg">
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
              <path d="M2 14V8l4-2v8M6 14V6l5-4v12M11 14V4l3 2v8" fill="var(--hl-peach)" />
            </svg>
          </div>
          <span className="map-pin-label-right">Natanz</span>
        </div>

        {/* Isfahan pin */}
        <div className="map-pin map-pin--sm" style={{ left: 67, top: 115 }}>
          <span className="map-pin-label-left">Isfahan</span>
          <div className="map-pin-icon-sm">
            <svg width="8" height="8" viewBox="0 0 16 16" fill="none">
              <path d="M2 14V8l4-2v8M6 14V6l5-4v12M11 14V4l3 2v8" fill="var(--hl-peach)" />
            </svg>
          </div>
        </div>
      </div>

      {/* Bottom row */}
      <div className="map-footer">
        <div className="map-country-pill">
          <span className="map-flag">&#x1F1EE;&#x1F1F7;</span>
          <span className="map-country-name">Iran</span>
        </div>
        <span className="map-hint">Tap locations to explore</span>
      </div>
    </div>
  )
}
