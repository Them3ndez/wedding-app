import { useState, useCallback, useEffect, useRef, createContext, useContext } from 'react'
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import { gsap } from 'gsap'
import CloudBackground from '../../components/goodplace/CloudBackground'
import Nav from '../../components/goodplace/Nav'
import OpeningSequence from '../../components/goodplace/OpeningSequence'
import Home from './Home'
import Details from './Details'
import RSVP from './RSVP'
import Gallery from './Gallery'
import FAQ from './FAQ'
import Janet from './Janet'
import '../../styles/goodplace.css'

const INTRO_KEY = 'gp_intro_shown'

// ── Contexts ──────────────────────────────────────────────────────────────────
const GPTransCtx  = createContext(null)
const GPReplayCtx = createContext(null)

export const useGPTransition = () => useContext(GPTransCtx)
export const useGPReplay     = () => useContext(GPReplayCtx)

// ── Active route helper ───────────────────────────────────────────────────────
function ActiveRoute({ children }) {
  const loc = useLocation()
  const seg = loc.pathname.split('/').filter(Boolean).pop()
  const labelMap = {
    details: 'The Plan',
    rsvp:    'Your Spot',
    gallery: 'Memories',
    faq:     'What the Fork?',
    janet:   'Ask Janet ✨',
  }
  const active = labelMap[seg] ?? ''
  return children(active)
}

// ── Galaxies tab ──────────────────────────────────────────────────────────────
function GalaxiesTab() {
  const rawNav = useNavigate()
  return (
    <button
      className="gp-galaxies-tab"
      onClick={() => rawNav('/')}
      aria-label="Choose another universe"
    >
      <span className="gp-galaxies-tab-arrow">←</span>
      <span className="gp-galaxies-tab-label">Normal Mode</span>
    </button>
  )
}

// ── Animated page content ─────────────────────────────────────────────────────
function AnimatedContent({ children }) {
  const location   = useLocation()
  const contentRef = useRef(null)

  useEffect(() => {
    if (!contentRef.current) return
    gsap.fromTo(contentRef.current,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out', clearProps: 'transform' }
    )
  }, [location.key])

  return (
    <div ref={contentRef} className="gp-content">
      {children}
    </div>
  )
}

// ── Main app ──────────────────────────────────────────────────────────────────
export default function GoodPlaceApp() {
  const rawNav = useNavigate()
  const [showIntro, setShowIntro] = useState(() => !localStorage.getItem(INTRO_KEY))
  const [chidiToast, setChidiToast] = useState(false)

  const handleIntroDone = useCallback(() => {
    localStorage.setItem(INTRO_KEY, '1')
    setShowIntro(false)
  }, [])

  const replayIntro = useCallback(() => setShowIntro(true), [])

  const navigate = useCallback(
    (to) => {
      const overlay = document.createElement('div')
      overlay.style.cssText = 'position:fixed;inset:0;background:rgba(255,248,240,0.85);z-index:9999;pointer-events:none;opacity:0'
      document.body.appendChild(overlay)
      const tl = gsap.timeline({
        onComplete: () => overlay.remove(),
      })
      tl.to(overlay, { opacity: 1, duration: 0.38, ease: 'power2.in' })
        .call(() => rawNav(to))
        .to(overlay, { opacity: 0, duration: 0.38, ease: 'power2.out' })
    },
    [rawNav],
  )

  function showChidiEgg() {
    setChidiToast(true)
    setTimeout(() => setChidiToast(false), 4500)
  }

  return (
    <div className="gp-layout">
      <CloudBackground />

      {showIntro && <OpeningSequence onComplete={handleIntroDone} />}

      {!showIntro && (
        <GPTransCtx.Provider value={{ navigate }}>
          <GPReplayCtx.Provider value={{ replayIntro }}>
            <ActiveRoute>
              {active => <Nav active={active} onChidiEgg={showChidiEgg} />}
            </ActiveRoute>
            <GalaxiesTab />

            <AnimatedContent>
              <Routes>
                <Route index           element={<Home />}    />
                <Route path="details"  element={<Details />} />
                <Route path="rsvp"     element={<RSVP />}    />
                <Route path="gallery"  element={<Gallery />} />
                <Route path="faq"      element={<FAQ />}     />
                <Route path="janet"    element={<Janet />}   />
              </Routes>
            </AnimatedContent>

            <button className="gp-replay-btn" onClick={replayIntro}>
              ⟳ Replay Intro
            </button>

            {chidiToast && (
              <div className="gp-chidi-toast">
                Chidi has been notified of your indecision. He is also indecisive about what to do about it.
              </div>
            )}
          </GPReplayCtx.Provider>
        </GPTransCtx.Provider>
      )}
    </div>
  )
}
