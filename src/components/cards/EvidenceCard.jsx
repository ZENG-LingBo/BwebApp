import { useState } from 'react'
import './EvidenceCard.css'

const claims = [
  { title: 'Strikes targeted key nuclear facilities' },
  { title: 'Iran threatens military response' },
]

const gallery = [
  {
    tag: 'Location map',
    desc: 'Shows Fordow, Natanz, and Isfahan as the reported strike targets.',
    source: 'Source: Reuters',
  },
  {
    tag: 'On the ground video',
    desc: 'Verified footage shows explosions near suspected strike locations.',
    source: 'Source: Maxar via Reuters',
  },
  {
    tag: 'Official statement',
    desc: 'Pentagon confirms strikes on multiple Iranian nuclear facilities.',
    source: 'Source: U.S. Department of Defense via Reuters',
  },
]

export default function EvidenceCard() {
  const [claimIdx, setClaimIdx] = useState(0)
  const [tab, setTab] = useState(0)

  return (
    <div className="card evidence-card" data-card-index="8">
      <div className="section-title">EVIDENCE BREAKDOWN</div>
      <hr className="separator" />

      {/* Claim navigator */}
      <div className="evidence-claims">
        <div className="evidence-nav">
          <button className="evidence-nav-btn" onClick={() => setClaimIdx(Math.max(0, claimIdx - 1))}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M15 6l-6 6 6 6" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <span className="evidence-nav-label">Claim {claimIdx + 1} / {claims.length}</span>
          <button className="evidence-nav-btn" onClick={() => setClaimIdx(Math.min(claims.length - 1, claimIdx + 1))}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M9 6l6 6-6 6" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        <h3 className="evidence-claim-title">{claims[claimIdx].title}</h3>

        {/* Segmented control */}
        <div className="evidence-tabs">
          <button className={`evidence-tab ${tab === 0 ? 'evidence-tab--active' : ''}`} onClick={() => setTab(0)}>
            Evidence
          </button>
          <button className={`evidence-tab ${tab === 1 ? 'evidence-tab--active' : ''}`} onClick={() => setTab(1)}>
            Context
          </button>
        </div>

        {/* Gallery */}
        <div className="evidence-gallery-wrap">
          <div className="evidence-gallery">
            {gallery.map((item, i) => (
              <div key={i} className="evidence-gallery-item">
                <div className="evidence-gallery-img" />
                <div className="evidence-gallery-info">
                  <div className="evidence-gallery-tag-row">
                    <span className="evidence-gallery-tag">{item.tag}</span>
                  </div>
                  <p className="evidence-gallery-desc">{item.desc}</p>
                  <span className="evidence-gallery-source">{item.source}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="evidence-gallery-shade" />
        </div>
      </div>
    </div>
  )
}
