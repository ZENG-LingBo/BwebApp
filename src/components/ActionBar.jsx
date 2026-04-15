import { useEffect, useRef, useState } from 'react'
import './ActionBar.css'

/**
 * ActionBar — implements Figma node 308:40189 "Action bar".
 *
 * Layout (343×40, positioned 16px from sides, bottom 34px above home indicator):
 *   [ Ask AI 💬 ]     [ Go to next story ↓ ]     [ 🔖 ] [ ⋯ ]
 *
 * "More" menu (kebab) contains Prev / Refresh / counter — things the Figma
 * action bar dropped from the original BottomBar but the app still needs.
 */
export default function ActionBar({
  onNext,
  onPrev,
  onRefresh,
  onAskAi,
  onBookmark,
  storyCount = 0,
  currentIdx = 0,
  hasStories = false,
  refreshing = false,
}) {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)

  // Close the menu on outside click.
  useEffect(() => {
    if (!menuOpen) return
    function handler(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [menuOpen])

  const canPrev = hasStories && currentIdx > 0
  const canNext = hasStories && currentIdx < storyCount - 1

  function handleAskAi() {
    if (onAskAi) onAskAi()
    else console.log('[Ask AI] not wired up yet')
  }

  function handleBookmark() {
    if (onBookmark) onBookmark()
    else console.log('[Bookmark] not wired up yet')
  }

  return (
    <div className="action-bar">
      {/* Ask AI (left) — Figma node 308:40190 */}
      <button
        className="action-ask-ai"
        onClick={handleAskAi}
        aria-label="Ask AI about this story"
      >
        <span className="action-ask-ai-label">Ask AI</span>
        {/* Icon / ai-chat-02 */}
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M4 4h16v12H8l-4 4V4z"
            stroke="#fff"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="9" cy="10" r="1" fill="#fff" />
          <circle cx="13" cy="10" r="1" fill="#fff" />
          <circle cx="17" cy="10" r="1" fill="#fff" />
        </svg>
      </button>

      {/* Go to next story (center primary button) — Figma node 308:40193 "Button_01" */}
      <button
        className="action-next-btn"
        onClick={onNext}
        disabled={!canNext}
      >
        <span>Go to next story</span>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
          <path
            d="M8 3v10M4 9l4 4 4-4"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {/* Bookmark + More (right) — Figma node 308:40194 */}
      <div className="action-right-group" ref={menuRef}>
        <button
          className="action-icon-btn"
          onClick={handleBookmark}
          aria-label="Bookmark story"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path
              d="M5 4h14v17l-7-4-7 4V4z"
              stroke="#fff"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        <button
          className="action-icon-btn"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="More options"
          aria-expanded={menuOpen}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <circle cx="5" cy="12" r="1.5" fill="#fff" />
            <circle cx="12" cy="12" r="1.5" fill="#fff" />
            <circle cx="19" cy="12" r="1.5" fill="#fff" />
          </svg>
        </button>

        {menuOpen && (
          <div className="action-menu" role="menu">
            <button
              className="action-menu-item"
              onClick={() => {
                setMenuOpen(false)
                onPrev && onPrev()
              }}
              disabled={!canPrev}
              role="menuitem"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
                <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Previous story
            </button>

            <button
              className="action-menu-item"
              onClick={() => {
                setMenuOpen(false)
                onRefresh && onRefresh()
              }}
              disabled={refreshing}
              role="menuitem"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden className={refreshing ? 'spin' : ''}>
                <path d="M2 8a6 6 0 0 1 11-3.2M14 8a6 6 0 0 1-11 3.2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M13 2v3h-3M3 14v-3h3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Refresh
            </button>

            <div className="action-menu-footer">
              {hasStories ? `Story ${currentIdx + 1} of ${storyCount}` : 'No stories'}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
