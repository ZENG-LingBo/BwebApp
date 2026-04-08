import { useState, useRef, useEffect } from 'react'
import './App.css'
import StatusBar from './components/StatusBar'
import TopBar from './components/TopBar'
import Sidebar from './components/Sidebar'
import BottomBar from './components/BottomBar'
import {
  DynamicHeroCard,
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

  useEffect(() => {
    const container = scrollRef.current
    if (!container) return

    container.scrollTop = 0

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('card--visible')
            const idx = Number(entry.target.dataset.cardIndex)
            if (!isNaN(idx)) setActiveStep(idx)
          }
        })
      },
      { root: container, threshold: 0.15 }
    )

    const cards = container.querySelectorAll('.card')
    cards.forEach((card) => observer.observe(card))

    return () => observer.disconnect()
  }, [story, scrollRef])

  return (
    <>
      <div className="scroll-container" ref={scrollRef}>
        <div className="card-stack">
          <DynamicHeroCard story={story} />
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
      <div className="hero-bg" />
      <div className="shade-top" />
      <div className="shade-bottom" />

      <StatusBar />

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

      <div className="base-gradient" />

      <BottomBar
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
