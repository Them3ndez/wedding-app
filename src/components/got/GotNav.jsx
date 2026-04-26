import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useGotTransition } from './GotTransition'

const links = [
  { label: 'The Proclamation', path: '/got/details' },
  { label: 'Send a Raven',     path: '/got/rsvp'    },
  { label: 'The Gallery',      path: '/got/gallery'  },
  { label: "Maester's Scroll", path: '/got/faq'      },
]

export default function GotNav({ isMuted, onToggleMute }) {
  const [open, setOpen] = useState(false)
  const { navigate } = useGotTransition()
  const location = useLocation()

  const go = (path) => {
    setOpen(false)
    if (location.pathname !== path) navigate(path)
  }

  const goHome = () => {
    setOpen(false)
    if (location.pathname !== '/got') navigate('/got')
  }

  return (
    <>
      <nav className="got-nav">
        <button className="got-nav-brand" onClick={goHome} aria-label="Home">
          W &amp; G
        </button>

        <ul className="got-nav-links">
          {links.map(l => (
            <li key={l.path}>
              <button
                className={`got-nav-link ${location.pathname === l.path ? 'active' : ''}`}
                onClick={() => go(l.path)}
              >
                {l.label}
              </button>
            </li>
          ))}
        </ul>

        <button
          onClick={onToggleMute}
          aria-label={isMuted ? 'Unmute music' : 'Mute music'}
          style={{
            background: 'none',
            border: 'none',
            color: 'rgba(255,255,255,.45)',
            fontSize: '1rem',
            padding: '4px 8px',
            cursor: 'pointer',
            lineHeight: 1,
            transition: 'color .2s',
          }}
          onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,1)'}
          onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,.45)'}
        >
          {isMuted ? '🔇' : '🔊'}
        </button>

        <button
          className={`got-hamburger ${open ? 'open' : ''}`}
          onClick={() => setOpen(v => !v)}
          aria-label="Menu"
        >
          <span /><span /><span />
        </button>
      </nav>

      {open && (
        <div
          className="sw-mobile-backdrop"
          onClick={() => setOpen(false)}
          style={{ background: 'rgba(6,6,10,.7)' }}
        />
      )}

      <div className={`got-mobile-menu ${open ? 'open' : ''}`}>
        <button
          className={`got-mobile-link ${location.pathname === '/got' ? 'active' : ''}`}
          onClick={goHome}
        >
          Home
        </button>
        {links.map(l => (
          <button
            key={l.path}
            className={`got-mobile-link ${location.pathname === l.path ? 'active' : ''}`}
            onClick={() => go(l.path)}
          >
            {l.label}
          </button>
        ))}
      </div>
    </>
  )
}
