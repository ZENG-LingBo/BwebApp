import { useState } from 'react'
import './SummaryCard.css'

const tooltips = {
  'nuclear-facilities': {
    status: 'CONFIRMED',
    statusColor: '#4CAF50',
    body: 'Iran operates facilities used to enrich uranium and support its nuclear program.',
    detail: 'These sites are central to global security concerns.',
    bullets: [
      'Natanz \u2014 main enrichment facility',
      'Fordow \u2014 underground, harder to strike',
      'Isfahan \u2014 uranium conversion site',
    ],
    footer: "Striking these sites directly targets Iran's nuclear capability \u2014 a major escalation.",
  },
  'wider-conflict': {
    status: 'DEVELOPING',
    statusColor: '#FF9800',
    body: 'A direct military strike on Iran risks drawing in regional allies and escalating beyond a contained conflict.',
    detail: 'Key risks include:',
    bullets: [
      'Hezbollah and proxy group responses',
      'Strait of Hormuz disruption',
      'Broader Middle East destabilization',
    ],
    footer: 'The scale of retaliation will shape whether this becomes a wider regional war.',
  },
  retaliation: {
    status: 'DEVELOPING',
    statusColor: '#FF9800',
    body: 'Iran is expected to respond, but the timing and scale remain unclear.',
    detail: 'Likely options include:',
    bullets: [
      'Direct military response',
      'Proxy attacks in the region',
      'Cyber or asymmetric operations',
    ],
    footer: "The nature of Iran's response will determine whether the situation escalates or stabilizes.",
  },
}

function Tooltip({ data, onClose }) {
  return (
    <div className="tooltip-card">
      <div className="tooltip-header">
        <div className="tooltip-status">
          <span className="tooltip-dot" style={{ background: data.statusColor }} />
          <span className="tooltip-status-text">{data.status}</span>
        </div>
        <button className="tooltip-close" onClick={onClose}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M4 4l8 8M12 4l-8 8" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      </div>
      <p className="tooltip-body">{data.body}</p>
      <p className="tooltip-detail">{data.detail}</p>
      <ul className="tooltip-bullets">
        {data.bullets.map((b, i) => (
          <li key={i} className="tooltip-bullet">{b}</li>
        ))}
      </ul>
      <p className="tooltip-footer">{data.footer}</p>
    </div>
  )
}

function HighlightWord({ id, children, activeTooltip, setActiveTooltip }) {
  const isActive = activeTooltip === id
  return (
    <span className="hl-peach-wrap">
      <span
        className="hl-peach hl-peach--tap"
        onClick={() => setActiveTooltip(isActive ? null : id)}
      >
        {children}
      </span>
      {isActive && tooltips[id] && (
        <Tooltip data={tooltips[id]} onClose={() => setActiveTooltip(null)} />
      )}
    </span>
  )
}

function Section({ label, children }) {
  return (
    <div className="summary-section">
      <div className="summary-section-label">{label}</div>
      <div className="summary-body-wrap">{children}</div>
    </div>
  )
}

export default function SummaryCard() {
  const [activeTooltip, setActiveTooltip] = useState(null)

  return (
    <div className="card summary-card" data-card-index="1">
      <Section label="WHAT HAPPENED">
        <div className="word-wrap">
          <span className="body-bold">US launched targeted strikes</span>{' '}
          <span className="body-bold">on three Iranian</span>{' '}
          <HighlightWord id="nuclear-facilities" activeTooltip={activeTooltip} setActiveTooltip={setActiveTooltip}>
            nuclear
          </HighlightWord>{' '}
          <HighlightWord id="nuclear-facilities" activeTooltip={activeTooltip} setActiveTooltip={setActiveTooltip}>
            facilities
          </HighlightWord>
        </div>
      </Section>

      <Section label="WHY IT MATTERS">
        <div className="word-wrap">
          <span className="body-bold">Major escalation between the</span>{' '}
          <span className="body-bold">US and Iran with risk of</span>{' '}
          <HighlightWord id="wider-conflict" activeTooltip={activeTooltip} setActiveTooltip={setActiveTooltip}>
            wider conflict
          </HighlightWord>
        </div>
      </Section>

      <Section label="WHAT'S NEXT">
        <div className="word-wrap">
          <span className="body-bold">Risk of</span>{' '}
          <HighlightWord id="retaliation" activeTooltip={activeTooltip} setActiveTooltip={setActiveTooltip}>
            retaliation
          </HighlightWord>
          <br />
          <span className="body-bold"> and broader regional conflict</span>
        </div>
      </Section>
    </div>
  )
}
