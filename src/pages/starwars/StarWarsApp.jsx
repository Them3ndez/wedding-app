import { useState, useCallback, useEffect, useRef, createContext, useContext } from 'react'
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import { gsap } from 'gsap'
import Starfield from '../../components/starwars/Starfield'
import Nav from '../../components/starwars/Nav'
import OpeningCrawl from '../../components/starwars/OpeningCrawl'
import { HyperspaceProvider } from '../../components/starwars/Hyperspace'
import StarWarsMusic from '../../components/starwars/StarWarsMusic'
import Home from './Home'
import Details from './Details'
import RSVP from './RSVP'
import Gallery from './Gallery'
import FAQ from './FAQ'

const CRAWL_KEY = 'sw_crawl_shown'

const SWReplayCtx = createContext(null)
export const useSWReplay = () => useContext(SWReplayCtx)

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

export default function StarWarsApp() {
  const [crawlShowing, setCrawlShowing] = useState(() => !localStorage.getItem(CRAWL_KEY))
  const [isMuted,      setIsMuted]      = useState(false)

  const handleCrawlDone = useCallback(() => {
    localStorage.setItem(CRAWL_KEY, '1')
    setCrawlShowing(false)
  }, [])

  const replayCrawl = useCallback(() => setCrawlShowing(true), [])
  const toggleMute  = useCallback(() => setIsMuted(v => !v), [])

  return (
    <div className="sw-layout">
      <Starfield />

      {!crawlShowing && <StarWarsMusic isMuted={isMuted} />}

      {crawlShowing && <OpeningCrawl onComplete={handleCrawlDone} />}

      {!crawlShowing && (
        <SWReplayCtx.Provider value={{ replayCrawl }}>
          <HyperspaceProvider>
            <Nav isMuted={isMuted} onToggleMute={toggleMute} />
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
          </HyperspaceProvider>
        </SWReplayCtx.Provider>
      )}
    </div>
  )
}
