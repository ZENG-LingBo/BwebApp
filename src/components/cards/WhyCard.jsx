import './WhyCard.css'

function BulletItem({ children }) {
  return (
    <div className="why-bullet">
      <span className="why-dot">•</span>
      <div className="why-bullet-content word-wrap">{children}</div>
    </div>
  )
}

export default function WhyCard() {
  return (
    <div className="card why-card" data-card-index="4">
      <div className="section-title">WHY THIS IS HAPPENING</div>

      <BulletItem>
        <span className="body-bold">US and allies impose</span>{' '}
        <span className="hl-peach">sanctions</span>
      </BulletItem>

      <BulletItem>
        <span className="body-bold">Long-standing tensions</span>{' '}
        <span className="body-bold">over</span>{' '}
        <span className="hl-peach">nuclear development</span>
      </BulletItem>

      <BulletItem>
        <span className="body-bold">Diplomatic talks repeatedly</span>{' '}
        <span className="hl-peach">fail</span>
      </BulletItem>

      <BulletItem>
        <span className="body-bold">Iran increases uranium</span>{' '}
        <span className="hl-peach">enrichment</span>
      </BulletItem>
    </div>
  )
}
