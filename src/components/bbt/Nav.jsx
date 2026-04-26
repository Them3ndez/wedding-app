import { useState, useRef, useCallback } from 'react'
import { useBBTTransition } from './EquationTransition'

const LINKS = [
  { id: 'details', label: 'The Apartment' },
  { id: 'rsvp',    label: 'RSVP Protocol' },
  { id: 'gallery', label: 'Holorecords' },
  { id: 'faq',     label: 'The Roommate Agreement' },
]

export default function Nav({ active }) {
  const { navigate } = useBBTTransition()
  const [menuOpen, setMenuOpen] = useState(false)
  const [showKnock, setShowKnock] = useState(false)
  const clickCount = useRef(0)
  const resetTimer = useRef(null)

  const handleLogoClick = useCallback(() => {
    navigate('/bbt')
    clickCount.current += 1
    clearTimeout(resetTimer.current)
    if (clickCount.current >= 3) {
      clickCount.current = 0
      setShowKnock(true)
      setTimeout(() => setShowKnock(false), 2200)
    } else {
      resetTimer.current = setTimeout(() => { clickCount.current = 0 }, 1800)
    }
  }, [navigate])

  return (
    <>
      <nav className="bbt-nav">
        <button className="bbt-nav-brand" onClick={handleLogoClick}>W &amp; G</button>

        <ul className="bbt-nav-links">
          {LINKS.map(l => (
            <li key={l.id}>
              <button
                className={`bbt-nav-link ${active === l.id ? 'active' : ''}`}
                onClick={() => { navigate(`/bbt/${l.id}`); setMenuOpen(false) }}
              >
                {l.label}
              </button>
            </li>
          ))}
        </ul>

        <button
          className={`bbt-hamburger ${menuOpen ? 'open' : ''}`}
          onClick={e => { e.stopPropagation(); setMenuOpen(o => !o) }}
          aria-label="Menu"
        >
          <span /><span /><span />
        </button>
      </nav>

      {menuOpen && (
        <div className="bbt-mobile-backdrop" onClick={() => setMenuOpen(false)} />
      )}
      <div className={`bbt-mobile-menu ${menuOpen ? 'open' : ''}`} onClick={e => e.stopPropagation()}>
        {LINKS.map(l => (
          <button
            key={l.id}
            className={`bbt-mobile-link ${active === l.id ? 'active' : ''}`}
            onClick={() => { navigate(`/bbt/${l.id}`); setMenuOpen(false) }}
          >
            {l.label}
          </button>
        ))}
      </div>

      {/* Knock knock knock easter egg */}
      {showKnock && (
        <div className="bbt-knock-overlay">
          <div className="bbt-knock-text">
            Knock knock knock,<br />Wendy!
          </div>
        </div>
      )}
    </>
  )
}
