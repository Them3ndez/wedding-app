import { useState, useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import HawkingBubble from '../../components/bbt/HawkingBubble'

gsap.registerPlugin(ScrollTrigger)

const INFO_CARDS = [
  { title: 'Stardate', lines: ['February 7, 2027', 'Ceremony commences at 16:00 hrs'] },
  { title: 'Geographical Coordinates', lines: ['Quinta el Pedregal', 'Mascota, Jalisco, México', '20.5281° N, 104.7561° W'] },
  { title: 'Base Camp', lines: ['Accommodations TBD', 'Further intel to follow'] },
  { title: 'Transport Protocol', lines: ['Shuttle service available', 'Schedule transmitted closer to event'] },
]

const TIMELINE = [
  { time: '1:30 PM', event: 'Guests Arrive', note: 'Knock knock knock, Wendy!' },
  { time: '2:45 PM', event: 'The Ceremony Commences', note: 'The Vow Iteration' },
  { time: '3:00 PM', event: 'Cocktail Hour', note: 'The Social Interaction Protocol' },
  { time: '5:00 PM', event: 'Dinner Reception', note: 'The Cheesecake Factory Approximation' },
  { time: '8:00 PM', event: 'Dance Party', note: 'The Farewell Theorem' },
]

export default function Details() {
  const [spotOpen, setSpotOpen] = useState(false)
  const containerRef = useRef(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.utils.toArray('.bbt-section-title').forEach(el => {
        gsap.fromTo(el,
          { opacity: 0, x: -40 },
          {
            opacity: 1, x: 0, duration: 0.8, ease: 'power2.out',
            scrollTrigger: { trigger: el, start: 'top 85%', toggleActions: 'play none none reverse' },
          }
        )
      })

      gsap.utils.toArray('.bbt-tl-item').forEach((el, i) => {
        gsap.fromTo(el,
          { opacity: 0, x: -40 },
          {
            opacity: 1, x: 0, duration: 0.8, ease: 'power2.out', delay: i * 0.1,
            scrollTrigger: { trigger: el, start: 'top 85%', toggleActions: 'play none none reverse' },
          }
        )
      })

      gsap.utils.toArray('.bbt-info-card').forEach((el, i) => {
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

  return (
    <div ref={containerRef} className="bbt-container bbt-section">
      <div className="bbt-page-header">
        <p className="bbt-section-label">Stardate: February 7, 2027</p>
        <h1 className="bbt-page-heading">The Apartment</h1>
        <p className="bbt-page-sub">Everything you need to know about the event</p>
      </div>

      <div className="bbt-section-title">Operational Briefing</div>
      <div className="bbt-info-grid" style={{ marginBottom: '3.5rem' }}>
        {INFO_CARDS.map(c => (
          <div key={c.title} className="bbt-info-card">
            <p className="bbt-info-card-title">{c.title}</p>
            {c.lines.map(l => <p key={l} className="bbt-info-card-text">{l}</p>)}
          </div>
        ))}
      </div>

      <div className="bbt-section-title">Day-of Timeline</div>
      <div className="bbt-timeline">
        {TIMELINE.map((t, i) => (
          <div key={t.time} className="bbt-tl-item" style={{ animationDelay: `${i * 0.08}s` }}>
            <p className="bbt-tl-time">{t.time}</p>
            <p className="bbt-tl-event">{t.event}</p>
            <p className="bbt-tl-note">"{t.note}"</p>
          </div>
        ))}
      </div>

      <div className="bbt-divider" />

      <div className="bbt-dresscode">
        <p className="bbt-dresscode-title">Dress Code Directive</p>
        <p className="bbt-dresscode-text">
          Business Casual — The dress code has been peer-reviewed and approved. Blazers encouraged. Bowties are statistically optimal. Superhero t-shirts are not.
          <br />
          <em style={{ color: 'rgba(232,232,240,.35)', fontSize: '.8rem' }}>
            (Sheldon has been informed. He is wearing a Flash t-shirt anyway.)
          </em>
        </p>
        <button className="bbt-sheldons-spot" onClick={() => setSpotOpen(true)}>
          🪑 Reserve Sheldon's Spot
        </button>
      </div>

      {spotOpen && (
        <div className="bbt-spot-overlay" onClick={() => setSpotOpen(false)}>
          <div className="bbt-spot-modal" onClick={e => e.stopPropagation()}>
            <h3>🪑 Sheldon's Spot</h3>
            <p>
              In the living room, it's the corner seat on the sofa to the right of the lamp, facing the television.
              This seat is taken. It has the right amount of afternoon sun, evening breeze, and optimal sightlines to both
              the TV and the front door.
              <br /><br />
              <em style={{ color: 'rgba(34,68,170,.7)' }}>
                "That's my spot." — Sheldon Cooper, always.
              </em>
            </p>
            <button className="bbt-btn bbt-btn--outline" style={{ width: '100%' }} onClick={() => setSpotOpen(false)}>
              Understood
            </button>
          </div>
        </div>
      )}

      <HawkingBubble />
    </div>
  )
}
