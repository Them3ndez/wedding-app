import { useState, useCallback, useEffect, useRef, createContext, useContext } from 'react'
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import { gsap } from 'gsap'
import AtomBackground from '../../components/bbt/AtomBackground'
import Nav from '../../components/bbt/Nav'
import OpeningSequence from '../../components/bbt/OpeningSequence'
import { EquationTransitionProvider } from '../../components/bbt/EquationTransition'
import Home from './Home'
import Details from './Details'
import RSVP from './RSVP'
import Gallery from './Gallery'
import FAQ from './FAQ'
import '../../styles/bbt.css'

const INTRO_KEY = 'bbt_intro_shown'

const BBTReplayCtx = createContext(null)
export const useBBTReplay = () => useContext(BBTReplayCtx)

function GalaxiesTab() {
  const nav = useNavigate()
  return (
    <button className="galaxies-tab" onClick={() => nav('/')} aria-label="Choose another universe">
      <span className="galaxies-tab-arrow">←</span>
      <span className="galaxies-tab-label">Normal Mode</span>
    </button>
  )
}

function ActiveRoute({ children }) {
  const loc = useLocation()
  const seg = loc.pathname.split('/').filter(Boolean).pop()
  const active = ['details','rsvp','gallery','faq'].includes(seg) ? seg : 'home'
  return children(active)
}

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
    <div ref={contentRef} className="bbt-content">
      {children}
    </div>
  )
}

export default function BBTApp() {
  const [showIntro, setShowIntro] = useState(() => !localStorage.getItem(INTRO_KEY))

  const handleIntroDone = useCallback(() => {
    localStorage.setItem(INTRO_KEY, '1')
    setShowIntro(false)
  }, [])

  const replayIntro = useCallback(() => setShowIntro(true), [])

  return (
    <div className="bbt-layout">
      <AtomBackground />

      {showIntro && <OpeningSequence onComplete={handleIntroDone} />}

      {!showIntro && (
        <BBTReplayCtx.Provider value={{ replayIntro }}>
        <EquationTransitionProvider>
          <ActiveRoute>
            {active => <Nav active={active} />}
          </ActiveRoute>
          <GalaxiesTab />
          <AnimatedContent>
            <Routes>
              <Route index element={<Home />} />
              <Route path="details"  element={<Details />} />
              <Route path="rsvp"     element={<RSVP />} />
              <Route path="gallery"  element={<Gallery />} />
              <Route path="faq"      element={<FAQ />} />
            </Routes>
          </AnimatedContent>
        </EquationTransitionProvider>
        </BBTReplayCtx.Provider>
      )}
    </div>
  )
}
