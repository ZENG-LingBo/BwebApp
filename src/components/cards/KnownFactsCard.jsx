import './KnownFactsCard.css'

function BulletItem({ children }) {
  return (
    <div className="known-bullet">
      <span className="known-dot">•</span>
      <div className="known-bullet-content word-wrap">{children}</div>
    </div>
  )
}

export default function KnownFactsCard() {
  return (
    <div className="card known-card" data-card-index="2">
      <div className="section-title">WHAT WE KNOW</div>

      <BulletItem>
        <span className="hl-green">3 nuclear facilities</span>{' '}
        <span className="body-bold">targeted</span>
      </BulletItem>

      <BulletItem>
        <span className="hl-green">Pentagon confirmed</span>{' '}
        <span className="body-bold">the operation</span>
      </BulletItem>

      <BulletItem>
        <span className="body-bold">Iran condemns strikes and</span>{' '}
        <span className="hl-green">signals response</span>
      </BulletItem>
    </div>
  )
}
