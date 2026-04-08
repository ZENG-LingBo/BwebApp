import './QuotesCard.css'

function QuoteItem({ emoji, children }) {
  return (
    <div className="quote-item">
      <span className="quote-emoji">{emoji}</span>
      <div className="quote-content word-wrap">{children}</div>
    </div>
  )
}

export default function QuotesCard() {
  return (
    <div className="card quotes-card" data-card-index="9">
      <div className="section-title">WHAT PEOPLE ARE SAYING</div>

      <QuoteItem emoji="💬">
        <span className="body-bold">"Iran was close to develop a</span>{' '}
        <span className="hl-purple">nuclear bomb</span>{' '}
        <span className="body-bold">and had to</span>{' '}
        <span className="body-bold">stopped."</span>
      </QuoteItem>

      <QuoteItem emoji="💬">
        <span className="body-bold">"The US is basically doing</span>{' '}
        <span className="body-bold">what</span>{' '}
        <span className="hl-purple">Israel</span>{' '}
        <span className="body-bold">wants."</span>
      </QuoteItem>

      <QuoteItem emoji="💬">
        <span className="body-bold">"This is really about</span>{' '}
        <span className="hl-purple">oil</span>{' '}
        <span className="body-bold">and</span>{' '}
        <span className="hl-purple">power."</span>
      </QuoteItem>
    </div>
  )
}
