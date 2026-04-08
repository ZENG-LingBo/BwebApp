import { useState } from 'react'
import './DynamicCards.css'

/* ─── Shared helpers ─── */

function parseHighlights(text) {
  if (!text) return null
  const parts = []
  const regex = /<hl-(peach|green|purple)>(.*?)<\/hl-\1>/g
  let lastIndex = 0
  let match

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ type: 'text', content: text.slice(lastIndex, match.index) })
    }
    parts.push({ type: match[1], content: match[2] })
    lastIndex = regex.lastIndex
  }

  if (lastIndex < text.length) {
    parts.push({ type: 'text', content: text.slice(lastIndex) })
  }

  return parts.map((p, i) => {
    if (p.type === 'text') return <span key={i} className="body-bold">{p.content}</span>
    return <span key={i} className={`hl-${p.type}`}>{p.content}</span>
  })
}

function SectionTitle({ children }) {
  return <div className="section-title">{children}</div>
}

/* ─── Hero Card ─── */

export function DynamicHeroCard({ story }) {
  return (
    <div className="card hero-card" data-card-index="0">
      <div className="hero-content">
        <div className="hero-text-group">
          <h1 className="hero-headline">{story.headline}</h1>
          <p className="hero-subtitle">{story.subtitle}</p>
        </div>
        <div className="hero-cta-wrap">
          <div className="hero-cta">
            <span className="hero-cta-text">Swipe up to read more</span>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M10 16V6M10 6l3 3M10 6L7 9" stroke="#fff" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ─── Video Card ─── */

export function VideoCard({ story }) {
  if (!story.video_embed_url && !story.video_filename) return null

  return (
    <div className="card video-card" data-card-index="1">
      <SectionTitle>WATCH</SectionTitle>
      <div className="video-container">
        {story.video_embed_url ? (
          <iframe
            src={story.video_embed_url}
            title={story.video_title || 'Related video'}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="video-iframe"
          />
        ) : story.video_filename ? (
          <video
            controls
            className="video-player"
            poster={story.video_thumbnail}
          >
            <source src={`/api/videos/${story.video_filename}`} type="video/mp4" />
          </video>
        ) : null}
      </div>
      {story.video_title && (
        <p className="video-title-text">{story.video_title}</p>
      )}
    </div>
  )
}

/* ─── Summary Card ─── */

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
        {data.bullets?.map((b, i) => <li key={i} className="tooltip-bullet">{b}</li>)}
      </ul>
      <p className="tooltip-footer">{data.footer}</p>
    </div>
  )
}

export function DynamicSummaryCard({ story }) {
  const [activeTooltip, setActiveTooltip] = useState(null)
  const tooltips = story.tooltips || {}

  function renderWithTooltips(text, sectionType) {
    if (!text) return null
    const parts = []
    const regex = /<hl-(peach|green|purple)>(.*?)<\/hl-\1>/g
    let lastIndex = 0
    let match

    while ((match = regex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push({ type: 'text', content: text.slice(lastIndex, match.index) })
      }
      parts.push({ type: match[1], content: match[2] })
      lastIndex = regex.lastIndex
    }
    if (lastIndex < text.length) {
      parts.push({ type: 'text', content: text.slice(lastIndex) })
    }

    return parts.map((p, i) => {
      if (p.type === 'text') return <span key={i} className="body-bold">{p.content}</span>

      // Check if this highlighted text has a tooltip
      const slug = p.content.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
      const tooltipData = tooltips[slug]

      if (tooltipData) {
        const isActive = activeTooltip === slug
        return (
          <span key={i} className="hl-peach-wrap">
            <span
              className={`hl-${p.type} hl-${p.type}--tap`}
              onClick={() => setActiveTooltip(isActive ? null : slug)}
            >
              {p.content}
            </span>
            {isActive && <Tooltip data={tooltipData} onClose={() => setActiveTooltip(null)} />}
          </span>
        )
      }

      return <span key={i} className={`hl-${p.type}`}>{p.content}</span>
    })
  }

  return (
    <div className="card summary-card" data-card-index="2">
      <div className="summary-section">
        <div className="summary-section-label">WHAT HAPPENED</div>
        <div className="summary-body-wrap">
          <div className="word-wrap">{renderWithTooltips(story.what_happened, 'peach')}</div>
        </div>
      </div>
      <div className="summary-section">
        <div className="summary-section-label">WHY IT MATTERS</div>
        <div className="summary-body-wrap">
          <div className="word-wrap">{renderWithTooltips(story.why_it_matters, 'green')}</div>
        </div>
      </div>
      <div className="summary-section">
        <div className="summary-section-label">WHAT'S NEXT</div>
        <div className="summary-body-wrap">
          <div className="word-wrap">{renderWithTooltips(story.whats_next, 'purple')}</div>
        </div>
      </div>
    </div>
  )
}

/* ─── Known Facts Card ─── */

export function DynamicKnownFactsCard({ story }) {
  const facts = story.known_facts || []
  if (facts.length === 0) return null

  return (
    <div className="card known-card" data-card-index="3">
      <SectionTitle>WHAT WE KNOW</SectionTitle>
      {facts.map((fact, i) => (
        <div key={i} className="known-bullet">
          <span className="known-dot">&bull;</span>
          <div className="known-bullet-content word-wrap">{parseHighlights(fact)}</div>
        </div>
      ))}
    </div>
  )
}

/* ─── Timeline Card ─── */

export function DynamicTimelineCard({ story }) {
  const timeline = story.timeline || []
  const [expandedIdx, setExpandedIdx] = useState(null)
  if (timeline.length === 0) return null

  return (
    <div className="card timeline-card" data-card-index="4">
      <SectionTitle>HOW IT UNFOLDED</SectionTitle>
      <div className="tl-list">
        {timeline.map((item, i) => (
          <div
            key={i}
            className={`tl-item ${item.isCurrent ? 'tl-item--now' : ''} ${expandedIdx === i ? 'tl-item--expanded' : ''}`}
            onClick={() => setExpandedIdx(expandedIdx === i ? null : i)}
          >
            <div className="tl-dot-col">
              <span className={`tl-dot ${item.isCurrent ? 'tl-dot--active' : ''}`} />
              {i < timeline.length - 1 && <span className="tl-line" />}
            </div>
            <div className="tl-content">
              <span className="tl-date">{item.date}</span>
              <span className="tl-label">{item.label}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ─── Why Card ─── */

export function DynamicWhyCard({ story }) {
  if (!story.why_happening) return null

  return (
    <div className="card why-card" data-card-index="5">
      <SectionTitle>WHY THIS IS HAPPENING</SectionTitle>
      <div className="word-wrap">{parseHighlights(story.why_happening)}</div>
    </div>
  )
}

/* ─── Impact Card ─── */

export function DynamicImpactCard({ story }) {
  const layers = story.impact_layers || []
  if (layers.length === 0) return null

  return (
    <div className="card impact-card" data-card-index="6">
      <SectionTitle>IMPACT</SectionTitle>
      <div className="impact-nest">
        <div className="impact-layer impact-layer--outer">
          <span className="impact-layer-label">{layers[0]?.label}</span>
          <div className="impact-layer impact-layer--second">
            <span className="impact-layer-label">{layers[1]?.label}</span>
            <div className="impact-layer impact-layer--third">
              <span className="impact-layer-label">{layers[2]?.label}</span>
              <div className="impact-layer impact-layer--inner">
                <span className="impact-layer-label">{layers[3]?.label}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ─── Matters To You Card ─── */

export function DynamicMattersCard({ story }) {
  const items = story.matters_to_you || []
  if (items.length === 0) return null

  return (
    <div className="card matters-card" data-card-index="7">
      <SectionTitle>WHY THIS MATTERS TO YOU</SectionTitle>
      {items.map((item, i) => (
        <div key={i} className="matters-item">
          <span className="matters-emoji">{item.emoji}</span>
          <div className="matters-text word-wrap">{parseHighlights(item.text)}</div>
        </div>
      ))}
    </div>
  )
}

/* ─── Quotes Card ─── */

export function DynamicQuotesCard({ story }) {
  const quotes = story.quotes || []
  if (quotes.length === 0) return null

  return (
    <div className="card quotes-card" data-card-index="8">
      <SectionTitle>WHAT PEOPLE ARE SAYING</SectionTitle>
      {quotes.map((q, i) => (
        <div key={i} className="quote-item">
          <div className="quote-icon">&#x1F4AC;</div>
          <div className="quote-content">
            <div className="quote-text word-wrap">{parseHighlights(q.quote)}</div>
            <div className="quote-speaker">&mdash; {q.speaker}</div>
          </div>
        </div>
      ))}
    </div>
  )
}
