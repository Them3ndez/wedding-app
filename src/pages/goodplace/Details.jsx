import { useState, useRef, useEffect } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import JanetBubble from '../../components/goodplace/JanetBubble'
import CloudLayer from '../../components/goodplace/CloudLayer'
import GoodPlaceChaos from '../../components/goodplace/GoodPlaceChaos'

gsap.registerPlugin(ScrollTrigger)

const INFO_CARDS = [
  {
    title: 'The Date',
    lines: ['February 7, 2027', 'Ceremony commences at 16:00 hrs'],
  },
  {
    title: 'The Neighborhood',
    lines: ['Quinta el Pedregal', 'Mascota, Jalisco, México'],
  },
  {
    title: 'Your Quarters',
    lines: ['Accommodations TBD', 'Janet will send coordinates'],
  },
  {
    title: 'The Portal',
    lines: ['Shuttle service available', 'Schedule transmitted closer to event'],
  },
]

const TIMELINE = [
  {
    time: '1:30 PM',
    event: 'The Arrival',
    note: 'Your Points Have Been Verified',
  },
  {
    time: '2:45 PM',
    event: 'The Ceremony',
    note: 'The Vow Clause, Section 1',
  },
  {
    time: '3:00 PM',
    event: 'Cocktail Hour',
    note: 'The Frozen Yogurt Approximation 🍦',
    isFroyo: true,
  },
  {
    time: '5:00 PM',
    event: 'Dinner Reception',
    note: 'Janet has prepared the menu',
  },
  {
    time: '8:00 PM',
    event: 'Dance Party',
    note: 'Everything is Still Fine',
  },
]

export default function Details() {
  const froyoClicks = useRef(0)
  const froyoTimer  = useRef(null)
  const [froyoToast, setFroyoToast] = useState(false)
  const containerRef = useRef(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.utils.toArray('.gp-section-title').forEach(el => {
        gsap.fromTo(el,
          { opacity: 0, x: -40 },
          {
            opacity: 1, x: 0, duration: 0.8, ease: 'power2.out',
            scrollTrigger: { trigger: el, start: 'top 85%', toggleActions: 'play none none reverse' },
          }
        )
      })

      gsap.utils.toArray('.gp-tl-item').forEach((el, i) => {
        gsap.fromTo(el,
          { opacity: 0, x: -40 },
          {
            opacity: 1, x: 0, duration: 0.8, ease: 'power2.out', delay: i * 0.1,
            scrollTrigger: { trigger: el, start: 'top 85%', toggleActions: 'play none none reverse' },
          }
        )
      })

      gsap.utils.toArray('.gp-info-card').forEach((el, i) => {
        gsap.fromTo(el,
          { opacity: 0, y: 50 },
          {
            opacity: 1, y: 0, duration: 0.7, ease: 'power2.out', delay: i * 0.1,
            scrollTrigger: { trigger: el, start: 'top 85%', toggleActions: 'play none none reverse' },
          }
        )
      })
    }, containerRef)

    return () => { ctx.revert(); ScrollTrigger.getAll().forEach(t => t.kill()) }
  }, [])

  function handleFroyoClick() {
    froyoClicks.current += 1
    clearTimeout(froyoTimer.current)
    if (froyoClicks.current >= 3) {
      froyoClicks.current = 0
      setFroyoToast(true)
      setTimeout(() => setFroyoToast(false), 3200)
    } else {
      froyoTimer.current = setTimeout(() => { froyoClicks.current = 0 }, 1600)
    }
  }

  return (
    <div ref={containerRef} className="gp-container">
      <CloudLayer />
      <GoodPlaceChaos />
      <div className="gp-page-header">
        <p className="gp-page-label">The Schedule has been Approved by the Committee</p>
        <h1 className="gp-page-heading">The Plan</h1>
        <p className="gp-page-sub">Everything you need to know — Janet has verified all details</p>
      </div>

      <div className="gp-section-title">Operational Briefing</div>
      <div className="gp-info-grid" style={{ marginBottom: '3.5rem' }}>
        {INFO_CARDS.map(c => (
          <div key={c.title} className="gp-info-card">
            <p className="gp-info-card-title">{c.title}</p>
            {c.lines.map(l => <p key={l} className="gp-info-card-text">{l}</p>)}
          </div>
        ))}
      </div>

      <div className="gp-section-title">Day-of Timeline</div>
      <div className="gp-timeline">
        {TIMELINE.map((t, i) => (
          <div key={t.time} className="gp-tl-item" style={{ animationDelay: `${i * 0.08}s` }}>
            <p className="gp-tl-time">{t.time}</p>
            <div>
              <p className="gp-tl-event">{t.event}</p>
              <p className="gp-tl-note">
                {t.isFroyo ? (
                  <>
                    The Frozen Yogurt Approximation{' '}
                    <span
                      className="gp-tl-froyo"
                      onClick={handleFroyoClick}
                      title="🍦"
                    >
                      🍦
                    </span>
                  </>
                ) : (
                  t.note
                )}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="gp-divider" />

      <div className="gp-dresscode">
        <p className="gp-dresscode-title">Dress Code Directive</p>
        <p className="gp-dresscode-text">
          Business Casual — attire befitting a resident of The Good Place. Smart, tasteful, and free of bad place energy. Sashes optional but encouraged.
          <br />
          <em style={{ color: 'rgba(26,26,26,.32)', fontSize: '.82rem' }}>
            (Eleanor has been informed. She is wearing jeans anyway.)
          </em>
        </p>
      </div>

      {froyoToast && (
        <div className="gp-froyo-toast">
          🍦 You found the frozen yogurt! +150 Good Place Points.
        </div>
      )}

      <JanetBubble />
    </div>
  )
}
