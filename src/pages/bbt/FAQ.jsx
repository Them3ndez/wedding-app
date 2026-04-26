import { useState, useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import HawkingBubble from '../../components/bbt/HawkingBubble'

gsap.registerPlugin(ScrollTrigger)

const FAQS = [
  {
    q: 'Is this event child friendly?',
    a: 'As per the Roommate Agreement, Clause 12: Children are wonderful. However, this event has been classified as Adult Social Protocol. We recommend leaving the young humans with a trusted guardian unit. The celebration involves alcohol, dancing, and emotional displays — all of which are confusing to children and, frankly, to Sheldon as well.',
  },
  {
    q: 'Can I take photos during the ceremony?',
    a: 'We are implementing an Unplugged Ceremony Protocol. As Dr. Cooper would say: "Phones away, please. You people and your Instagrams." Post-ceremony, feel free to document the event for your social media archives. Our contracted photographer will distribute a digital gallery — no Instagram filters required.',
  },
  {
    q: "What's the weather like in Mascota in February?",
    a: 'According to our meteorological data: February in Mascota, Jalisco registers approximately 22–26°C (72–78°F) during the day. Evening temperatures drop to 12–16°C. Bring a light jacket. Or as Sheldon would say: "Statistically it will be perfect. I ran the numbers. Twice."',
  },
  {
    q: 'Is there an open bar? (The Alcohol Consumption Clause)',
    a: 'Affirmative. The Alcohol Consumption Clause has been approved and ratified. The cocktail hour features a full open bar, which remains operational through the reception. As Howard once said: "Cheers!" And as Raj would say... *gestures expressively because there is alcohol present and he can now speak.*',
  },
  {
    q: "What's on the registry? (The Gift Acquisition Protocol)",
    a: "We have already acquired sufficient material possessions — we're basically the couple that has everything. We request contributions to The Honeymoon Acquisition Fund instead. Details will be transmitted closer to the event date. Do not bring a robot. We're looking at you, Howard.",
  },
  {
    q: 'Still have questions? (The Communication Directive)',
    a: 'Activate the Communication Directive. Reach out to us directly and we will respond within 24 hours — faster if it is not a Saturday, which is reserved for Sheldon\'s Flash marathon and cannot be interrupted under any circumstances.',
  },
]

const SOFT_KITTY = ['Soft kitty, warm kitty', 'Little ball of fur', 'Happy kitty, sleepy kitty', 'Purr purr purr']

export default function FAQ() {
  const [openIdx, setOpenIdx] = useState(null)
  const [showKitty, setShowKitty] = useState(false)
  const [kittyLine, setKittyLine] = useState(0)
  const containerRef = useRef(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      const heading = containerRef.current.querySelector('.bbt-page-heading')
      if (heading) {
        gsap.fromTo(heading,
          { opacity: 0, x: -40 },
          { opacity: 1, x: 0, duration: 0.8, ease: 'power2.out' }
        )
      }

      gsap.utils.toArray('.bbt-faq-item').forEach((el, i) => {
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

  useEffect(() => {
    if (!showKitty) return
    setKittyLine(0)
    const timers = SOFT_KITTY.map((_, i) =>
      setTimeout(() => setKittyLine(i), i * 1400)
    )
    return () => timers.forEach(clearTimeout)
  }, [showKitty])

  return (
    <div ref={containerRef} className="bbt-container bbt-section">
      <div className="bbt-page-header">
        <p className="bbt-section-label">Clause 7, Section 4</p>
        <h1 className="bbt-page-heading">The Roommate Agreement</h1>
        <p className="bbt-page-sub">Frequently Asked Questions — please read before initiating contact</p>
      </div>

      <div className="bbt-faq-list">
        {FAQS.map((item, i) => (
          <div key={i} className="bbt-faq-item">
            <button
              className="bbt-faq-q"
              onClick={() => setOpenIdx(openIdx === i ? null : i)}
            >
              <span>{item.q}</span>
              <span className={`bbt-faq-icon ${openIdx === i ? 'open' : ''}`}>+</span>
            </button>
            <div className={`bbt-faq-a ${openIdx === i ? 'open' : ''}`}>{item.a}</div>
          </div>
        ))}
      </div>

      <button className="bbt-soft-kitty-btn" onClick={() => setShowKitty(true)}>
        ♪ soft kitty
      </button>

      {showKitty && (
        <div className="bbt-soft-kitty-overlay" onClick={() => setShowKitty(false)}>
          {SOFT_KITTY.map((line, i) => (
            <p
              key={i}
              className="bbt-soft-kitty-line"
              style={{
                opacity: kittyLine >= i ? 1 : 0,
                transform: kittyLine >= i ? 'translateY(0)' : 'translateY(12px)',
                transition: 'opacity 0.6s ease, transform 0.6s ease',
                color: i === SOFT_KITTY.length - 1 ? '#cc3333' : '#ffcc00',
              }}
            >
              {line}
            </p>
          ))}
          <button className="bbt-soft-kitty-close" onClick={() => setShowKitty(false)}>
            ♪ done
          </button>
        </div>
      )}

      <HawkingBubble />
    </div>
  )
}
