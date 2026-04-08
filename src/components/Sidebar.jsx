import './Sidebar.css'

const steps = [
  // news-01
  <svg key="0" width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 3h8v10H2V3zm8 2h4v8h-4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/><path d="M5 7h2m-2 2h4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>,
  // text-indent
  <svg key="1" width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 3h6M2 8h12M2 13h12M2 3l3 2.5L2 8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  // text-check
  <svg key="2" width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 3h6M2 8h6M2 13h4M2 3l1.5 1.5L6 2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  // route-01
  <svg key="3" width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="11" cy="4" r="2" stroke="currentColor" strokeWidth="1.3"/><circle cx="5" cy="12" r="2" stroke="currentColor" strokeWidth="1.3"/><path d="M5 10V7a3 3 0 013-3h1M11 6v3a3 3 0 01-3 3H7" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>,
  // chart-relationship
  <svg key="4" width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="4" cy="12" r="2" stroke="currentColor" strokeWidth="1.3"/><circle cx="12" cy="4" r="2" stroke="currentColor" strokeWidth="1.3"/><circle cx="12" cy="12" r="2" stroke="currentColor" strokeWidth="1.3"/><path d="M6 11l4-6M10 12H6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>,
  // global-search
  <svg key="5" width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.3"/><path d="M11 11l3 3M7 2v10M2 7h10" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>,
  // chart-breakout
  <svg key="6" width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.3"/><path d="M11 3l2-1M3 10l5-5 2 2 3-3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  // user-warning
  <svg key="7" width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="6" cy="5" r="2.5" stroke="currentColor" strokeWidth="1.3"/><path d="M2 14c0-2.5 2-4 4-4s4 1.5 4 4M13 4v3M13 9v0" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>,
  // anonymous
  <svg key="8" width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 8h12M4 8c0-3 2-5 4-5s4 2 4 5M4 10c0 2 1 3 2 3s1.5-1 2-1 1 1 2 1 2-1 2-3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  // text-vertical
  <svg key="9" width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 3h6M8 6h6M2 8h12M8 10h6M8 13h6M4 3v4M2 5l2 2 2-2M4 13V9M2 11l2-2 2 2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  // bubble-chat-question
  <svg key="10" width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 3h12v8H6l-4 3V3z" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/><path d="M7 6.5a1 1 0 112 0c0 .5-.5.8-1 1.2M8 10v0" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>,
  // comment-03
  <svg key="11" width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 3h12v8H6l-4 3V3z" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/><path d="M6 7h4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>,
]

export default function Sidebar({ activeStep }) {
  return (
    <div className="sidebar">
      <div className="sidebar-steps">
        {steps.map((icon, i) => (
          <div key={i} className="sidebar-step">
            <div className={`sidebar-icon ${i === activeStep ? 'sidebar-icon--active' : ''}`}>
              {icon}
            </div>
            {i < steps.length - 1 && <div className="sidebar-line" />}
          </div>
        ))}
      </div>
    </div>
  )
}
