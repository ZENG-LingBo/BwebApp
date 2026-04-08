import './MattersToYouCard.css'

function Item({ emoji, children }) {
  return (
    <div className="matters-item">
      <span className="matters-emoji">{emoji}</span>
      <div className="matters-content word-wrap">{children}</div>
    </div>
  )
}

export default function MattersToYouCard() {
  return (
    <div className="card matters-card" data-card-index="7">
      <div className="section-title">WHY THIS MATTERS TO YOU</div>

      <Item emoji="⛽">
        <span className="body-bold">Fuel prices may</span>{' '}
        <span className="hl-peach">rise</span>{' '}
        <span className="body-bold">globally</span>
      </Item>

      <Item emoji="✈️">
        <span className="body-bold">Flights and travel costs</span>{' '}
        <span className="body-bold">could</span>{' '}
        <span className="hl-peach">increase</span>
      </Item>

      <Item emoji="📉">
        <span className="body-bold">Stock markets may</span>{' '}
        <span className="body-bold">become</span>{' '}
        <span className="hl-peach">volatile</span>
      </Item>

      <Item emoji="🌍">
        <span className="body-bold">Geopolitical tensions may</span>{' '}
        <span className="hl-peach">affect</span>{' '}
        <span className="body-bold">global stability</span>
      </Item>
    </div>
  )
}
