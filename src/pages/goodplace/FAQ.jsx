import { useState, useRef, useEffect } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import JanetBubble from '../../components/goodplace/JanetBubble'
import CloudLayer from '../../components/goodplace/CloudLayer'
import GoodPlaceChaos from '../../components/goodplace/GoodPlaceChaos'
import { askJanet } from '../../components/goodplace/Janet'

gsap.registerPlugin(ScrollTrigger)

const FAQS = [
  {
    q: 'Is this event child friendly? (The Youth Clause)',
    a: 'Yes. The committee has approved attendees of all ages. Children receive a special designation in the Book of Dougs: "Small Human, Innocent, Extra Points." Please note that Chidi has prepared a separate age-appropriate ethics workshop. Attendance is optional but he will know if you skip it.',
  },
  {
    q: 'Can I take photos during the ceremony?',
    a: 'We kindly ask that you put phones away during the ceremony — Janet is already recording everything across fourteen dimensions. After the ceremony, photograph freely and abundantly. Tag the happy couple and let the algorithm do its work.',
  },
  {
    q: 'What is the weather like in Mascota? (Janet has checked)',
    a: 'Janet reports February weather in Mascota is typically clear and mild — 18-24°C (65-75°F). Light layers recommended for the evening. Janet also notes there is a 0.3% chance of spontaneous golden light rays, which she may or may not have arranged.',
  },
  {
    q: 'Is there an open bar? (The Liquid Courage Amendment)',
    a: 'Yes. The Liquid Courage Amendment has been ratified by a unanimous committee vote. Drinks are included. Please hydrate accordingly. As Eleanor would say: "Drinks are free?! This IS the good place!"',
  },
  {
    q: 'What is on the registry? (The Gift Protocol)',
    a: 'Registry details to follow. In the meantime, the committee suggests: your presence, your joy, and if you must bring something — a heartfelt card. Tahani will be judging the handwriting. (She has excellent penmanship. It is fine. Everything is fine.)',
  },
  {
    q: 'What if I have more questions? (Contact Janet)',
    a: 'Simply say "Janet" out loud three times and she will appear. Alternatively, contact the couple directly — though Janet has asked us to remind you she is also available and quite knowledgeable about literally everything.',
  },
]

export default function FAQ() {
  const [open, setOpen] = useState(null)
  const [showBad, setShowBad] = useState(false)
  const [badResolved, setBadResolved] = useState(false)
  const badClicks = useRef(0)
  const badTimer  = useRef(null)
  const containerRef = useRef(null)

  const [janetQ, setJanetQ]   = useState('')
  const [janetR, setJanetR]   = useState(null)
  const [janetL, setJanetL]   = useState(false)
  const [janetE, setJanetE]   = useState(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      const heading = containerRef.current.querySelector('.gp-page-heading')
      if (heading) {
        gsap.fromTo(heading,
          { opacity: 0, x: -40 },
          { opacity: 1, x: 0, duration: 0.8, ease: 'power2.out' }
        )
      }

      gsap.utils.toArray('.gp-faq-item').forEach((el, i) => {
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

  async function handleJanetAsk(e) {
    e.preventDefault()
    const q = janetQ.trim()
    if (!q || janetL) return
    setJanetL(true)
    setJanetR(null)
    setJanetE(null)
    try {
      setJanetR(await askJanet(q))
    } catch (err) {
      console.log('Janet FAQ error:', err)
      setJanetE('Cannot compute.')
    } finally {
      setJanetL(false)
    }
  }

  function handleTitleClick() {
    badClicks.current += 1
    clearTimeout(badTimer.current)
    if (badClicks.current >= 3) {
      badClicks.current = 0
      setShowBad(true)
      setBadResolved(false)
      setTimeout(() => setBadResolved(true), 2200)
    } else {
      badTimer.current = setTimeout(() => { badClicks.current = 0 }, 1400)
    }
  }

  return (
    <div ref={containerRef} className="gp-container">
      <CloudLayer />
      <GoodPlaceChaos />
      <div className="gp-page-header">
        <p
          className="gp-page-label"
          onClick={handleTitleClick}
          style={{ cursor: 'default', userSelect: 'none' }}
        >
          Frequently Asked Questions — Answered by the Committee
        </p>
        <h1 className="gp-page-heading">What the Fork?</h1>
        <p className="gp-page-sub">
          All questions welcome. Chidi has pre-answered them ethically.
        </p>
      </div>

      <div className="gp-faq-list">
        {FAQS.map((f, i) => (
          <div
            key={f.q}
            className={`gp-faq-item${open === i ? ' open' : ''}`}
            style={{ animationDelay: `${i * 0.06}s` }}
          >
            <button className="gp-faq-q" onClick={() => setOpen(open === i ? null : i)}>
              <span className="gp-faq-q-text">{f.q}</span>
              <span className="gp-faq-icon">+</span>
            </button>
            {open === i && <p className="gp-faq-a">{f.a}</p>}
          </div>
        ))}
      </div>

      <div className="gp-divider" style={{ margin: '3rem 0 2.5rem' }} />
      <div className="gp-faq-janet-section">
        <p className="gp-section-title" style={{ marginBottom: '.4rem' }}>Still have questions?</p>
        <p style={{ fontFamily: "'Jost',sans-serif", fontSize: '.9rem', color: 'rgba(26,26,26,.55)', marginBottom: '1.4rem' }}>
          Ask Janet — she knows everything.
        </p>
        <form className="gp-janet-form" onSubmit={handleJanetAsk}>
          <div className="gp-janet-input-wrap">
            <input
              className="gp-janet-question"
              type="text"
              value={janetQ}
              onChange={e => setJanetQ(e.target.value)}
              placeholder="What would you like to know?"
              autoComplete="off"
              disabled={janetL}
            />
            <button className="gp-janet-ask" type="submit" disabled={janetL || !janetQ.trim()}>
              {janetL ? '...' : 'Ask Janet'}
            </button>
          </div>
        </form>
        {(janetR || janetE) && !janetL && (
          <div className="gp-janet-response-card" style={{ marginTop: '1.25rem' }}>
            <div className="gp-janet-response-name">Janet</div>
            <p className={`gp-janet-response-text${janetE ? ' gp-janet-error' : ''}`}>
              {janetR || janetE}
            </p>
          </div>
        )}
      </div>

      {showBad && (
        <div className="gp-bad-overlay" onClick={() => { setShowBad(false); setBadResolved(false) }}>
          <div className="gp-bad-modal" onClick={e => e.stopPropagation()}>
            <h3>⚠ REDIRECTING TO THE BAD PLACE</h3>
            {!badResolved ? (
              <p>You have been detected clicking suspiciously. Processing transfer to eternal mediocrity...</p>
            ) : (
              <p className="resolved">
                Just kidding. Everything is fine. 😇
                <br /><br />
                <em style={{ fontSize: '.75rem', opacity: .6 }}>
                  "The bad place is wherever you aren't having fun." — Michael, probably.
                </em>
              </p>
            )}
            {badResolved && (
              <button
                className="gp-btn gp-btn--outline"
                style={{ width: '100%', color: 'rgba(255,248,240,.7)', borderColor: 'rgba(192,80,74,.4)' }}
                onClick={() => setShowBad(false)}
              >
                Phew. Close one.
              </button>
            )}
          </div>
        </div>
      )}

      <JanetBubble />
    </div>
  )
}
