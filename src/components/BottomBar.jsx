import './BottomBar.css'

export default function BottomBar({
  onNext, onPrev, onRefresh,
  storyCount = 0, currentIdx = 0, hasStories = false, refreshing = false,
}) {
  return (
    <div className="bottom-bar">
      {/* Refresh */}
      <button className="bar-icon-btn" onClick={onRefresh} disabled={refreshing} title="Refresh stories">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className={refreshing ? 'spin' : ''}>
          <path d="M4 12a8 8 0 0 1 14.93-4M20 12a8 8 0 0 1-14.93 4" stroke="#fff" strokeWidth="1.5" strokeLinecap="round"/>
          <path d="M20 4v4h-4M4 20v-4h4" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {/* Prev */}
      <button className="bar-icon-btn" onClick={onPrev} disabled={!hasStories || currentIdx === 0}>
        <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
          <path d="M10 3L5 8l5 5" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {/* Counter */}
      <span className="bar-counter">
        {hasStories ? `${currentIdx + 1} / ${storyCount}` : '—'}
      </span>

      {/* Next */}
      <button className="bar-icon-btn" onClick={onNext} disabled={!hasStories || currentIdx >= storyCount - 1}>
        <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
          <path d="M6 3l5 5-5 5" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {/* Bookmark */}
      <button className="bar-icon-btn">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <path d="M5 4h14v17l-7-4-7 4V4z" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
    </div>
  )
}
