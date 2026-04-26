import { useState, useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGPTransition, useGPReplay } from './GoodPlaceApp'
import JanetBubble from '../../components/goodplace/JanetBubble'
import CloudLayer from '../../components/goodplace/CloudLayer'
import GoodPlaceChaos from '../../components/goodplace/GoodPlaceChaos'

gsap.registerPlugin(ScrollTrigger)

const QUOTES = [
  '"In the words of Michael: \'There is no cookbook. We\'re just going to figure this out together.\'"',
  '"As Eleanor would say: \'Holy shirtballs, they are actually getting married!\'"',
  '"Tahani would note this is the most exclusive event since the Met Gala. She attended that too."',
  '"Chidi has prepared a 94-page ethical analysis of why this wedding is the right choice. The conclusion is yes."',
]

function randomPoints() {
  return Math.floor(300000 + Math.random() * 900000)
}

export default function Home() {
  const { navigate }     = useGPTransition()
  const { replayIntro }  = useGPReplay()
  const [quoteIdx, setQuoteIdx]     = useState(0)
  const [quoteVisible, setVisible]  = useState(true)
  const [showPoints, setShowPoints] = useState(false)
  const [myPoints]                  = useState(randomPoints)
  const pointsTimer                 = useRef(null)

  const eyebrowRef    = useRef(null)
  const namesRef      = useRef(null)
  const epRef         = useRef(null)
  const dividerRef    = useRef(null)
  const dateRef       = useRef(null)
  const venueRef      = useRef(null)
  const btnsRef       = useRef(null)
  const scrollHintRef = useRef(null)

  useEffect(() => {
    const tl = gsap.timeline()
    tl.fromTo(eyebrowRef.current,
      { opacity: 0, y: 50 },
      { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out' }
    ).fromTo(namesRef.current,
      { opacity: 0, y: 80, scale: 0.95 },
      { opacity: 1, y: 0, scale: 1, duration: 1.2, ease: 'power3.out' },
      '-=0.3'
    ).fromTo(epRef.current,
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' },
      '-=0.4'
    ).fromTo(dividerRef.current,
      { opacity: 0, scaleX: 0 },
      { opacity: 1, scaleX: 1, duration: 0.6, ease: 'power2.out' },
      '-=0.3'
    ).fromTo(dateRef.current,
      { opacity: 0, y: 50 },
      { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out' },
      '-=0.2'
    ).fromTo(venueRef.current,
      { opacity: 0, y: 50 },
      { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out' },
      '-=0.5'
    ).fromTo(btnsRef.current,
      { opacity: 0, y: 50 },
      { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out' },
      '-=0.3'
    ).fromTo(scrollHintRef.current,
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' },
      '-=0.2'
    )

    return () => { tl.kill(); ScrollTrigger.getAll().forEach(t => t.kill()) }
  }, [])

  useEffect(() => {
    const id = setInterval(() => {
      setVisible(false)
      setTimeout(() => {
        setQuoteIdx(i => (i + 1) % QUOTES.length)
        setVisible(true)
      }, 500)
    }, 5500)
    return () => clearInterval(id)
  }, [])

  function handlePointsEgg() {
    setShowPoints(true)
    clearTimeout(pointsTimer.current)
    pointsTimer.current = setTimeout(() => setShowPoints(false), 3500)
  }

  return (
    <>
      <CloudLayer />
      <GoodPlaceChaos />
      <div className="gp-home">
        <p ref={eyebrowRef} className="gp-home-eyebrow">You've been selected for something extraordinary</p>

        <h1
          ref={namesRef}
          className="gp-home-names"
          onClick={handlePointsEgg}
          style={{ cursor: 'default' }}
          title=""
        >
          Wendy
          <span className="gp-home-amp">&amp;</span>
          Guillermo
        </h1>

        <p ref={epRef} className="gp-home-ep">Season 1 · The Wedding Clause</p>
        <div ref={dividerRef} className="gp-home-divider" />
        <p ref={dateRef} className="gp-home-date">February 7, 2027 · Quinta el Pedregal</p>
        <p ref={venueRef} className="gp-home-venue">Mascota, Jalisco, México</p>

        <div ref={btnsRef} className="gp-home-btns">
          <button className="gp-btn gp-btn--primary" onClick={() => navigate('/goodplace/rsvp')}>
            Confirm Your Spot
          </button>
          <button className="gp-btn gp-btn--outline" onClick={() => navigate('/goodplace/details')}>
            View The Plan
          </button>
        </div>

        <p className="gp-home-quote" style={{ opacity: quoteVisible ? 1 : 0 }}>
          {QUOTES[quoteIdx]}
        </p>

        <button ref={scrollHintRef} className="gp-scroll-hint" onClick={() => navigate('/goodplace/details')}>
          ↓ Everything is fine
        </button>
      </div>

      {showPoints && (
        <div
          className="gp-points-overlay"
          onClick={() => setShowPoints(false)}
          style={{ cursor: 'pointer' }}
        >
          <p className="gp-points-overlay-count">{myPoints.toLocaleString()}</p>
          <p className="gp-points-overlay-label">Your Good Place Points</p>
          <p className="gp-points-overlay-note">
            "Not bad. Not great either, but let's be honest — who is?" — Michael
          </p>
        </div>
      )}

      <JanetBubble />
    </>
  )
}
