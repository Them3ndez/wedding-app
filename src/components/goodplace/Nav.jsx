import { useState, useRef } from 'react'
import { useGPTransition, useGPReplay } from '../../pages/goodplace/GoodPlaceApp'

const LINKS = [
  { label: 'The Plan',       path: '/goodplace/details' },
  { label: 'Your Spot',      path: '/goodplace/rsvp'    },
  { label: 'Memories',       path: '/goodplace/gallery' },
  { label: 'What the Fork?', path: '/goodplace/faq'     },
]

export default function Nav({ active, onChidiEgg }) {
  const { navigate } = useGPTransition()
  const { replayIntro } = useGPReplay()
  const [open, setOpen] = useState(false)
  const logoClickCount = useRef(0)
  const logoClickTimer = useRef(null)

  function handleNav(path) {
    setOpen(false)
    navigate(path)
  }

  function handleLogoClick() {
    logoClickCount.current += 1
    clearTimeout(logoClickTimer.current)
    if (logoClickCount.current >= 5) {
      logoClickCount.current = 0
      onChidiEgg?.()
    } else {
      logoClickTimer.current = setTimeout(() => {
        logoClickCount.current = 0
      }, 1800)
      navigate('/goodplace')
    }
  }

  return (
    <>
      <nav className="gp-nav">
        <button className="gp-nav-logo" onClick={handleLogoClick} aria-label="Home">
          W &amp; G
        </button>

        <ul className="gp-nav-links">
          {LINKS.map(l => (
            <li key={l.path}>
              <button
                className={`gp-nav-link${active === l.label ? ' active' : ''}`}
                onClick={() => handleNav(l.path)}
              >
                {l.label}
              </button>
            </li>
          ))}
        </ul>

        <button
          className="gp-hamburger"
          onClick={() => setOpen(o => !o)}
          aria-label="Menu"
        >
          <span /><span /><span />
        </button>
      </nav>

      {open && <div className="gp-mobile-backdrop" onClick={() => setOpen(false)} />}

      <div className={`gp-mobile-menu${open ? ' open' : ''}`}>
        <button
          className={`gp-mobile-link${active === null ? ' active' : ''}`}
          onClick={() => { setOpen(false); navigate('/goodplace') }}
        >
          Home
        </button>
        {LINKS.map(l => (
          <button
            key={l.path}
            className={`gp-mobile-link${active === l.label ? ' active' : ''}`}
            onClick={() => handleNav(l.path)}
          >
            {l.label}
          </button>
        ))}
        <button className="gp-mobile-link" onClick={() => { setOpen(false); replayIntro() }}>
          ⟳ Replay Intro
        </button>
      </div>
    </>
  )
}
