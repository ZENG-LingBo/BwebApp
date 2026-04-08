import './BottomBar.css'

export default function BottomBar({ onNext, storyCount = 0, currentIdx = 0, hasStories = false }) {
  return (
    <div className="bottom-bar">
      {/* Ask AI */}
      <div className="bottom-bar-left">
        <span className="ask-ai-label">Ask AI</span>
        <div className="ask-ai-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M3 4h14v12H7l-4 3V4z" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <circle cx="19" cy="8" r="3" stroke="#fff" strokeWidth="1.5"/>
            <path d="M8 9h5M8 12h3" stroke="#fff" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </div>
      </div>

      {/* Go to next story */}
      <button className="next-story-btn" onClick={onNext} disabled={!hasStories || currentIdx >= storyCount - 1}>
        <span className="next-story-label">{hasStories ? `Next story (${currentIdx + 1}/${storyCount})` : 'Go to next story'}</span>
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M10 4v12M10 16l-4-4M10 16l4-4" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {/* Share & Bookmark */}
      <div className="bottom-bar-right">
        <button className="icon-btn">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M12 3v12M12 3l-4 4M12 3l4 4M4 17v2h16v-2" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <button className="icon-btn">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M5 4h14v17l-7-4-7 4V4z" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
    </div>
  )
}
