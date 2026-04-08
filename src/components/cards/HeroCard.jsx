import './HeroCard.css'

export default function HeroCard() {
  return (
    <div className="card hero-card" data-card-index="0">
      <div className="hero-content">
        <div className="hero-text-group">
          <h1 className="hero-headline">
            US STRIKES IRANIAN<br />NUCLEAR FACILITIES
          </h1>
          <p className="hero-subtitle">
            First direct strike on nuclear sites in years
          </p>
        </div>

        <div className="hero-cta-wrap">
          <div className="hero-cta">
            <span className="hero-cta-text">Swipe up to read more</span>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M10 16V6M10 6l3 3M10 6L7 9" stroke="#fff" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M6 3v0M10 2v0M14 3v0" stroke="#fff" strokeWidth="1.3" strokeLinecap="round"/>
            </svg>
          </div>
        </div>
      </div>
    </div>
  )
}
