import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useHyperspace } from './Hyperspace'

const links = [
  { label: 'Transmission',      path: '/starwars/details'  },
  { label: 'Confirm Attendance', path: '/starwars/rsvp'     },
  { label: 'Holorecords',        path: '/starwars/gallery'  },
  { label: 'Dispatches',         path: '/starwars/faq'      },
]

export default function Nav({ isMuted, onToggleMute }) {
  const [open, setOpen] = useState(false)
  const { navigate } = useHyperspace()
  const location = useLocation()

  const go = (path) => {
    setOpen(false)
    if (location.pathname !== path) navigate(path)
  }

  const goHome = () => {
    setOpen(false)
    if (location.pathname !== '/starwars') navigate('/starwars')
  }

  return (
    <>
      <nav className="sw-nav">
        <button className="sw-nav-brand" onClick={goHome} aria-label="Home">
          W &amp; G
        </button>

        <ul className="sw-nav-links">
          {links.map(l => (
            <li key={l.path}>
              <button
                className={`sw-nav-link ${location.pathname === l.path ? 'active' : ''}`}
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
            color: 'rgba(255,232,31,.55)',
            fontSize: '1rem',
            padding: '4px 8px',
            cursor: 'pointer',
            lineHeight: 1,
            transition: 'color .2s',
          }}
          onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,232,31,1)'}
          onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,232,31,.55)'}
        >
          {isMuted ? '🔇' : '🔊'}
        </button>

        <button
          className={`sw-hamburger ${open ? 'open' : ''}`}
          onClick={() => setOpen(v => !v)}
          aria-label="Menu"
        >
          <span /><span /><span />
        </button>
      </nav>

      {open && <div className="sw-mobile-backdrop" onClick={() => setOpen(false)} />}

      <div className={`sw-mobile-menu ${open ? 'open' : ''}`}>
        <button
          className={`sw-mobile-link ${location.pathname === '/starwars' ? 'active' : ''}`}
          onClick={goHome}
          style={{ borderBottom: '1px solid rgba(255,255,255,.06)' }}
        >
          Home
        </button>
        {links.map(l => (
          <button
            key={l.path}
            className={`sw-mobile-link ${location.pathname === l.path ? 'active' : ''}`}
            onClick={() => go(l.path)}
            style={{ borderBottom: '1px solid rgba(255,255,255,.06)' }}
          >
            {l.label}
          </button>
        ))}
      </div>
    </>
  )
}
