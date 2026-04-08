import './ImpactCard.css'

export default function ImpactCard() {
  return (
    <div className="card impact-card" data-card-index="6">
      <div className="section-title">IMPACT</div>

      <div className="impact-visual">
        {/* Outer rect */}
        <div className="impact-rect impact-rect-1">
          <span className="impact-label-outer">Regional instability</span>
        </div>
        {/* Second rect */}
        <div className="impact-rect impact-rect-2">
          <span className="impact-label-mid">EU emergency response</span>
        </div>
        {/* Third rect */}
        <div className="impact-rect impact-rect-3">
          <span className="impact-label-mid">Energy market volatility</span>
        </div>
        {/* Inner rect */}
        <div className="impact-rect impact-rect-4">
          <span className="impact-label-inner">Oil prices surge</span>
        </div>
        {/* Glow */}
        <div className="impact-glow" />
      </div>
    </div>
  )
}
