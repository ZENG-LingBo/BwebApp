import { useState, useRef, useEffect } from 'react'
import './App.css'
import StatusBar from './components/StatusBar'
import TopBar from './components/TopBar'
import Sidebar from './components/Sidebar'
import BottomBar from './components/BottomBar'
import HeroCard from './components/cards/HeroCard'
import SummaryCard from './components/cards/SummaryCard'
import KnownFactsCard from './components/cards/KnownFactsCard'
import TimelineCard from './components/cards/TimelineCard'
import WhyCard from './components/cards/WhyCard'
import MapCard from './components/cards/MapCard'
import ImpactCard from './components/cards/ImpactCard'
import MattersToYouCard from './components/cards/MattersToYouCard'
import EvidenceCard from './components/cards/EvidenceCard'
import QuotesCard from './components/cards/QuotesCard'
import UnknownsCard from './components/cards/UnknownsCard'
import LeadersCard from './components/cards/LeadersCard'
import ExpertsCard from './components/cards/ExpertsCard'
import VoicesCard from './components/cards/VoicesCard'
import ReactionsCard from './components/cards/ReactionsCard'
import NarrativePulseCard from './components/cards/NarrativePulseCard'

function App() {
  const [activeStep, setActiveStep] = useState(0)
  const scrollRef = useRef(null)
  const cardRefs = useRef([])

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
  }, [])

  return (
    <div className="app-frame">
      {/* Background image */}
      <div className="hero-bg" />

      {/* Shade overlays */}
      <div className="shade-top" />
      <div className="shade-bottom" />

      <StatusBar />
      <TopBar />

      <div className="scroll-container" ref={scrollRef}>
        <div className="card-stack">
          <HeroCard />
          <SummaryCard />
          <KnownFactsCard />
          <TimelineCard />
          <WhyCard />
          <MapCard />
          <ImpactCard />
          <MattersToYouCard />
          <EvidenceCard />
          <QuotesCard />
          <UnknownsCard />
          <LeadersCard />
          <ExpertsCard />
          <VoicesCard />
          <ReactionsCard />
          <NarrativePulseCard />
        </div>
      </div>

      <Sidebar activeStep={activeStep} />

      {/* Base gradient over content bottom */}
      <div className="base-gradient" />

      <BottomBar />

      {/* Home indicator */}
      <div className="home-indicator">
        <div className="home-indicator-bar" />
      </div>
    </div>
  )
}

export default App
