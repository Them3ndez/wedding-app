import { useState, useCallback, useEffect, useRef } from 'react'
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import { gsap } from 'gsap'
import Snow from '../../components/got/Embers'
import GotNav from '../../components/got/GotNav'
import GotMusic from '../../components/got/GotMusic'
import RavenIntro from '../../components/got/RavenIntro'
import { GotTransitionProvider } from '../../components/got/GotTransition'
import { GotReplayCtx } from '../../components/got/GotReplayCtx'
import Home from './Home'
import Details from './Details'
import RSVP from './RSVP'
import Gallery from './Gallery'
import FAQ from './FAQ'

const INTRO_KEY = 'got_intro_shown'

function GalaxiesTab() {
  const nav = useNavigate()
  return (
    <button className="galaxies-tab" onClick={() => nav('/')} aria-label="Choose another universe">
      <span className="galaxies-tab-arrow">←</span>
      <span className="galaxies-tab-label">Normal Mode</span>
    </button>
  )
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
    <main ref={contentRef} className="sw-content">
      {children}
    </main>
  )
}

export default function GotApp() {
  const [showIntro, setShowIntro] = useState(() => !localStorage.getItem(INTRO_KEY))
  const [isMuted, setIsMuted] = useState(false)

  const handleIntroDone = useCallback(() => {
    localStorage.setItem(INTRO_KEY, '1')
    setShowIntro(false)
  }, [])

  const replayIntro = useCallback(() => setShowIntro(true), [])
  const toggleMute  = useCallback(() => setIsMuted(v => !v), [])

  return (
    <GotReplayCtx.Provider value={{ replayIntro }}>
      <div className="got-layout sw-layout">
        <Snow />

        {showIntro && <RavenIntro onComplete={handleIntroDone} />}

        {!showIntro && <GotMusic isMuted={isMuted} />}

        {!showIntro && (
          <GotTransitionProvider>
            <GotNav isMuted={isMuted} onToggleMute={toggleMute} />
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
          </GotTransitionProvider>
        )}
      </div>
    </GotReplayCtx.Provider>
  )
}
