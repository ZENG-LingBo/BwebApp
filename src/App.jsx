import { useState, useRef, useEffect } from 'react'
import './App.css'
import StatusBar from './components/StatusBar'
import TopBar from './components/TopBar'
import Sidebar from './components/Sidebar'
import BottomBar from './components/BottomBar'
import {
  DynamicHeroCard,
  VideoCard,
  DynamicSummaryCard,
  DynamicKnownFactsCard,
  DynamicTimelineCard,
  DynamicWhyCard,
  DynamicImpactCard,
  DynamicMattersCard,
  DynamicQuotesCard,
} from './components/cards/DynamicCards'
import { useStories } from './hooks/useStories'

function StoryView({ story }) {
  const [activeStep, setActiveStep] = useState(0)
  const scrollRef = useRef(null)

  useEffect(() => {
    const container = scrollRef.current
    if (!container) return

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
  }, [story])

  return (
    <>
      <div className="scroll-container" ref={scrollRef}>
        <div className="card-stack">
          <DynamicHeroCard story={story} />
          <VideoCard story={story} />
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

function LoadingScreen({ onFetch }) {
  return (
    <div className="loading-screen">
      <div className="loading-content">
        <div className="loading-spinner" />
        <p className="loading-text">No stories yet</p>
        <button className="fetch-btn" onClick={onFetch}>
          Fetch Today's Stories
        </button>
        <p className="loading-hint">
          This will fetch RSS feeds, generate summaries with AI, and find related videos.
          Takes ~2 minutes.
        </p>
      </div>
    </div>
  )
}

function FetchingScreen() {
  return (
    <div className="loading-screen">
      <div className="loading-content">
        <div className="loading-spinner loading-spinner--active" />
        <p className="loading-text">Generating stories...</p>
        <p className="loading-hint">
          Fetching RSS feeds, ranking stories, generating AI summaries, finding videos...
        </p>
      </div>
    </div>
  )
}

function App() {
  const { stories, loading, error, triggerFetch } = useStories()
  const [currentStoryIdx, setCurrentStoryIdx] = useState(0)
  const [fetching, setFetching] = useState(false)

  const story = stories[currentStoryIdx]

  async function handleFetch() {
    setFetching(true)
    await triggerFetch(10)
    setFetching(false)
  }

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
          <StoryView story={story} />
        </>
      ) : fetching ? (
        <FetchingScreen />
      ) : (
        <LoadingScreen onFetch={handleFetch} />
      )}

      <div className="base-gradient" />

      <BottomBar
        onNext={handleNextStory}
        storyCount={stories.length}
        currentIdx={currentStoryIdx}
        hasStories={stories.length > 0}
      />

      {/* Story counter */}
      {stories.length > 1 && (
        <div className="story-counter">
          <button
            className="story-nav-btn"
            onClick={handlePrevStory}
            disabled={currentStoryIdx === 0}
          >
            &lsaquo;
          </button>
          <span className="story-counter-text">
            {currentStoryIdx + 1} / {stories.length}
          </span>
          <button
            className="story-nav-btn"
            onClick={handleNextStory}
            disabled={currentStoryIdx === stories.length - 1}
          >
            &rsaquo;
          </button>
        </div>
      )}

      <div className="home-indicator">
        <div className="home-indicator-bar" />
      </div>
    </div>
  )
}

export default App
