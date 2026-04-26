import { useState, useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import TyrionChat from '../../components/got/TyrionChat'
import { useGotReplay } from '../../components/got/GotReplayCtx'
import { useGotTransition } from '../../components/got/GotTransition'

gsap.registerPlugin(ScrollTrigger)

const TARGET = new Date('2027-02-07T16:00:00')

function useCountdown() {
  const [t, setT] = useState(() => Math.max(0, TARGET - Date.now()))
  useEffect(() => {
    const id = setInterval(() => setT(Math.max(0, TARGET - Date.now())), 1000)
    return () => clearInterval(id)
  }, [])
  const s = Math.floor(t / 1000)
  return {
    days:    Math.floor(s / 86400),
    hours:   Math.floor((s % 86400) / 3600),
    minutes: Math.floor((s % 3600) / 60),
    seconds: s % 60,
  }
}

function Pad({ n }) { return String(n).padStart(2, '0') }

export default function Home() {
  const cd = useCountdown()
  const { replayIntro } = useGotReplay()
  const { navigate } = useGotTransition()

  const eyebrowRef    = useRef(null)
  const namesRef      = useRef(null)
  const dividerRef    = useRef(null)
  const dateRef       = useRef(null)
  const venueRef      = useRef(null)
  const countdownRef  = useRef(null)

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
    ).fromTo(dateRef.current,
      { opacity: 0, y: 50 },
      { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out' },
      '-=0.2'
    ).fromTo(venueRef.current,
      { opacity: 0, y: 50 },
      { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out' },
      '-=0.5'
    ).fromTo(countdownRef.current,
      { opacity: 0, y: 50 },
      { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out' },
      '-=0.4'
    )

    return () => { tl.kill(); ScrollTrigger.getAll().forEach(t => t.kill()) }
  }, [])

  return (
    <>
    <div className="home-hero">
      <p ref={eyebrowRef} className="home-eyebrow">A Royal Celebration in the Seven Kingdoms</p>

      <h1 ref={namesRef} className="home-names">
        Wendy
        <span className="home-amp">&amp;</span>
        Guillermo
      </h1>

      <div ref={dividerRef} className="home-divider" />

      <p ref={dateRef} className="home-date">February 7, 2027</p>
      <p ref={venueRef} className="home-venue">
        Quinta el Pedregal
        <span>·</span>
        Mascota, Jalisco, México
      </p>

      <div ref={countdownRef} className="countdown">
        <div className="cd-unit">
          <span className="cd-num"><Pad n={cd.days} /></span>
          <span className="cd-label">Days</span>
        </div>
        <span className="cd-sep">:</span>
        <div className="cd-unit">
          <span className="cd-num"><Pad n={cd.hours} /></span>
          <span className="cd-label">Hours</span>
        </div>
        <span className="cd-sep">:</span>
        <div className="cd-unit">
          <span className="cd-num"><Pad n={cd.minutes} /></span>
          <span className="cd-label">Minutes</span>
        </div>
        <span className="cd-sep">:</span>
        <div className="cd-unit">
          <span className="cd-num"><Pad n={cd.seconds} /></span>
          <span className="cd-label">Seconds</span>
        </div>
      </div>


    </div>
    <button
      onClick={() => navigate('/got/details')}
      className="home-scroll-hint"
      style={{ position: 'fixed', background: 'none', border: 'none', padding: 0, cursor: 'pointer', zIndex: 1000 }}
    >
      ↓ &nbsp; Ride South &nbsp; ↓
    </button>

    <button onClick={replayIntro} className="got-replay-btn">
      ⟳ Replay Intro
    </button>
    <TyrionChat />
    </>
  )
}
