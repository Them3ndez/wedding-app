import { useState, useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useBBTTransition } from '../../components/bbt/EquationTransition'
import { useBBTReplay } from './BBTApp'
import HawkingBubble from '../../components/bbt/HawkingBubble'

gsap.registerPlugin(ScrollTrigger)

const QUOTES = [
  '"In the words of Sheldon Cooper: I\'m not crazy, my mother had me tested. But this wedding? Highly logical."',
  '"Bazinga! You thought you weren\'t invited. You were."',
  '"This event has been scheduled, rescheduled, and formally approved by the Roommate Agreement."',
]

const BAZINGA_STATES = {
  error: {
    title: '⚠ Critical Error Detected',
    body: 'Wedding.exe has encountered an unexpected exception: TooMuchLoveException. Stack trace: happiness.overflow() at ceremony.vow() line 2027. Please consult your nearest theoretical physicist.',
    btn: 'Acknowledge Error',
  },
  success: {
    title: '✦ Bazinga!',
    body: 'Everything is perfectly fine. The wedding is proceeding as scheduled. This was a social experiment. You passed.',
    btn: 'Close',
  },
}

export default function Home() {
  const { navigate } = useBBTTransition()
  const { replayIntro } = useBBTReplay()
  const [quoteIdx, setQuoteIdx] = useState(0)
  const [quoteVisible, setQuoteVisible] = useState(true)
  const [bazinga, setBazinga] = useState(null)

  const eyebrowRef    = useRef(null)
  const namesRef      = useRef(null)
  const dividerRef    = useRef(null)
  const epRef         = useRef(null)
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
    ).fromTo(dividerRef.current,
      { opacity: 0, scaleX: 0 },
      { opacity: 1, scaleX: 1, duration: 0.6, ease: 'power2.out' },
      '-=0.4'
    ).fromTo(epRef.current,
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' },
      '-=0.2'
    ).fromTo(dateRef.current,
      { opacity: 0, y: 50 },
      { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out' },
      '-=0.3'
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
    const interval = setInterval(() => {
      setQuoteVisible(false)
      setTimeout(() => {
        setQuoteIdx(i => (i + 1) % QUOTES.length)
        setQuoteVisible(true)
      }, 500)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  const handleBazingaBtn = () => {
    if (!bazinga) setBazinga('error')
    else if (bazinga === 'error') setBazinga('success')
    else setBazinga(null)
  }

  return (
    <>
      <div className="bbt-home">
        <p ref={eyebrowRef} className="bbt-home-eyebrow">The Relationship Agreement: Final Form</p>
        <h1 ref={namesRef} className="bbt-home-names">
          Wendy
          <span className="bbt-home-amp">&amp;</span>
          Guillermo
        </h1>
        <div ref={dividerRef} className="bbt-home-divider" />
        <p ref={epRef} className="bbt-home-ep">Episode 1 · The Wedding Iteration</p>
        <p ref={dateRef} className="bbt-home-date">February 7, 2027 · Quinta el Pedregal</p>
        <p ref={venueRef} className="bbt-home-venue">Mascota, Jalisco, México</p>
        <div ref={btnsRef} className="bbt-home-btns">
          <button className="bbt-btn bbt-btn--primary" onClick={() => navigate('/bbt/rsvp')}>
            Confirm Attendance
          </button>
          <button className="bbt-btn bbt-btn--outline" onClick={() => navigate('/bbt/details')}>
            View The Agenda
          </button>
        </div>
        <p className="bbt-home-quote" style={{ opacity: quoteVisible ? 1 : 0 }}>
          {QUOTES[quoteIdx]}
        </p>
        <button ref={scrollHintRef} className="bbt-scroll-hint" onClick={() => navigate('/bbt/details')}>
          ↓ Engage social protocol
        </button>
      </div>

      <button onClick={replayIntro} className="bbt-replay-btn">
        ⟳ Replay Intro
      </button>

      {bazinga && (
        <div className="bbt-bazinga-overlay" onClick={() => setBazinga(null)}>
          <div className="bbt-bazinga-modal" onClick={e => e.stopPropagation()}>
            <h3>{BAZINGA_STATES[bazinga].title}</h3>
            <p>{BAZINGA_STATES[bazinga].body}</p>
            <button className="bbt-btn bbt-btn--primary" style={{ width: '100%' }} onClick={handleBazingaBtn}>
              {BAZINGA_STATES[bazinga].btn}
            </button>
          </div>
        </div>
      )}

      <HawkingBubble />
    </>
  )
}
