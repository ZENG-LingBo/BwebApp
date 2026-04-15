import { useState, useRef, useEffect } from 'react'
import './App.css'
import TopBar from './components/TopBar'
import Sidebar from './components/Sidebar'
import ActionBar from './components/ActionBar'
import HeroBackdrop from './components/HeroBackdrop'
import {
  DynamicSummaryCard,
  DynamicKnownFactsCard,
  DynamicTimelineCard,
  DynamicWhyCard,
  DynamicImpactCard,
  DynamicMattersCard,
  DynamicQuotesCard,
} from './components/cards/DynamicCards'
import { useStories } from './hooks/useStories'

function StoryView({ story, scrollRef }) {
  const [activeStep, setActiveStep] = useState(0)
  const [focusedCardIdx, setFocusedCardIdx] = useState(null)

  // Scroll handler — fades out hero content once the user scrolls past Card 1.
  // The HeroBackdrop stays mounted (so the video keeps playing and can serve as
  // a subtle backdrop), but its text/CTA block animates away so it doesn't
  // bleed through between scrolled card gaps.
  useEffect(() => {
    const container = scrollRef.current
    if (!container) return
    const backdrop = document.querySelector('.hero-backdrop')
    if (!backdrop) return

    function handleScroll() {
      const st = container.scrollTop
      backdrop.classList.toggle('hero-backdrop--faded', st > 120)
    }
    container.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => container.removeEventListener('scroll', handleScroll)
  }, [story?.id, scrollRef])

  useEffect(() => {
    const container = scrollRef.current
    if (!container) return

    container.scrollTop = 0
    setFocusedCardIdx(null)

    // Track which card currently has the largest intersection with the viewport.
    // That card gets `.card--focused`; all others get `.card--unfocused`, which
    // in CSS maps to reduced opacity + blur (reading-focus pattern).
    const ratios = new Map()

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          ratios.set(entry.target, entry.intersectionRatio)
          if (entry.isIntersecting) {
            const idx = Number(entry.target.dataset.cardIndex)
            if (!isNaN(idx)) setActiveStep(idx)
          }
        })

        // Pick the card with highest current intersection ratio as "focused".
        let best = null
        let bestRatio = 0
        ratios.forEach((r, el) => {
          if (r > bestRatio) {
            bestRatio = r
            best = el
          }
        })
        const focusedIdx = best ? Number(best.dataset.cardIndex) : null
        setFocusedCardIdx(isNaN(focusedIdx) ? null : focusedIdx)
      },
      {
        root: container,
        // Many thresholds → frequent ratio updates as the card crosses the viewport,
        // so the focus switch feels smooth.
        threshold: [0, 0.15, 0.3, 0.5, 0.7, 0.9, 1],
      }
    )

    const cards = container.querySelectorAll('.card')
    cards.forEach((card) => observer.observe(card))

    return () => observer.disconnect()
  }, [story?.id, scrollRef])

  // Apply focused/unfocused classes imperatively — avoids re-rendering each card
  // on every scroll tick just to toggle a class.
  useEffect(() => {
    const container = scrollRef.current
    if (!container) return
    const cards = container.querySelectorAll('.card')
    cards.forEach((card) => {
      const idx = Number(card.dataset.cardIndex)
      const isFocused = idx === focusedCardIdx
      card.classList.toggle('card--focused', isFocused)
      card.classList.toggle('card--unfocused', focusedCardIdx !== null && !isFocused)
    })
  }, [focusedCardIdx, scrollRef])

  return (
    <>
      <div className="scroll-container" ref={scrollRef}>
        {/* Spacer: lets the hero backdrop show through at scroll=0.
            Matches the vertical position where Figma's "Base" panel begins (y≈553). */}
        <div className="scroll-hero-spacer" aria-hidden />

        <div className="card-stack">
          <DynamicSummaryCard story={story} />
          <DynamicKnownFactsCard story={story} />
          <DynamicTimelineCard story={story} />
          <DynamicWhyCard story={story} />
          <DynamicImpactCard story={story} />
          <DynamicMattersCard story={story} />
          <DynamicQuotesCard story={story} />
        </div>
      </div>
      <Sidebar activeStep={activeStep} />
    </>
  )
}

function WaitingScreen({ loading }) {
  return (
    <div className="loading-screen">
      <div className="loading-content">
        <div className={`loading-spinner ${loading ? 'loading-spinner--active' : ''}`} />
        <p className="loading-text">
          {loading ? 'Loading stories...' : 'Stories update daily at 6 AM HKT'}
        </p>
        <p className="loading-hint">
          {loading
            ? 'Fetching the latest stories...'
            : 'The server automatically fetches 10 top stories from world news every morning. Check back soon.'}
        </p>
      </div>
    </div>
  )
}

function App() {
  const { stories, loading, refreshing, refresh } = useStories()
  const [currentStoryIdx, setCurrentStoryIdx] = useState(0)
  const scrollRef = useRef(null)

  const story = stories[currentStoryIdx]

  function handleNextStory() {
    if (currentStoryIdx < stories.length - 1) {
      setCurrentStoryIdx(currentStoryIdx + 1)
    }
  }

  function handlePrevStory() {
    if (currentStoryIdx > 0) {
      setCurrentStoryIdx(currentStoryIdx - 1)
    }
  }

  return (
    <div className="app-frame">
      {/* Hero video/gradient backdrop — persistent behind the scroll content. */}
      <HeroBackdrop story={story} />

      {/* Frosted-glass fog behind the top chrome so scrolled text doesn't clash
          with TopBar pills. */}
      <div className="top-chrome-fog" aria-hidden />

      {story ? (
        <>
          <TopBar
            category={story.category}
            date={story.story_date}
            statusLabel={story.status_label}
          />
          <StoryView story={story} scrollRef={scrollRef} />
        </>
      ) : (
        <WaitingScreen loading={loading} />
      )}

      {/* Bottom fog behind the ActionBar */}
      <div className="bottom-chrome-fog" aria-hidden />

      <ActionBar
        onNext={handleNextStory}
        onPrev={handlePrevStory}
        onRefresh={refresh}
        storyCount={stories.length}
        currentIdx={currentStoryIdx}
        hasStories={stories.length > 0}
        refreshing={refreshing}
      />

      <div className="home-indicator">
        <div className="home-indicator-bar" />
      </div>
    </div>
  )
}

export default App
