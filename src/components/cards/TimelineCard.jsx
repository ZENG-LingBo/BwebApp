import { useState } from 'react'
import './TimelineCard.css'

const items = [
  { year: '2015', title: 'Iran nuclear deal signed', isNow: false },
  { year: '2018', title: 'US withdraws', isNow: false },
  { year: '2023–2025', title: 'enrichment tensions rise', isNow: false },
  { year: null, title: 'US conducts strikes', isNow: true },
]

function ChevronIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M6 8l4 4 4-4" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

export default function TimelineCard() {
  const [expanded, setExpanded] = useState(null)

  return (
    <div className="card timeline-card" data-card-index="3">
      <div className="section-title">HOW IT UNFOLDED</div>

      <div className="timeline-list">
        {items.map((item, i) => (
          <div key={i}>
            <div className="timeline-item" onClick={() => setExpanded(expanded === i ? null : i)}>
              <div className="timeline-item-top">
                <div className="timeline-year-row">
                  {item.isNow ? (
                    <div className="timeline-now">
                      <div className="timeline-now-dot" />
                      <span className="timeline-now-label">NOW</span>
                    </div>
                  ) : (
                    <span className="timeline-year">{item.year}</span>
                  )}
                </div>
                <ChevronIcon />
              </div>
              <div className="timeline-title">{item.title}</div>
            </div>
            {i < items.length - 1 && <hr className="separator" />}
          </div>
        ))}
      </div>
    </div>
  )
}
